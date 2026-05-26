import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import type { AssetUploadResponseDto, AssetUploadScope } from "../common/contracts";

const CONTENT_TYPE_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type UploadImageInput = Readonly<{
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  ownerId: string;
  scope: AssetUploadScope;
}>;

@Injectable()
export class AssetsService {
  private readonly client?: S3Client;
  private readonly bucket?: string;
  private readonly enabled: boolean;

  constructor() {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const endpoint = process.env.R2_ENDPOINT?.trim();
    const bucket = process.env.R2_BUCKET?.trim();

    if (accessKeyId && secretAccessKey && endpoint && bucket) {
      this.bucket = bucket;
      this.enabled = true;
      this.client = new S3Client({
        region: process.env.R2_REGION?.trim() || "auto",
        endpoint,
        forcePathStyle: false,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      return;
    }

    this.enabled = false;
  }

  async uploadImage(input: UploadImageInput): Promise<AssetUploadResponseDto> {
    if (!this.client || !this.bucket || !this.enabled) {
      throw new ServiceUnavailableException("Cloudflare R2 is not configured.");
    }

    const contentType = this.normalizeContentType(input.mimeType, input.fileName);
    const key = this.buildObjectKey(input.scope, input.ownerId, contentType);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: input.buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
    } catch {
      throw new InternalServerErrorException("Image upload to Cloudflare R2 failed.");
    }

    return {
      key,
      url: this.toAssetUrl(key),
      fileName: this.sanitizeFileName(input.fileName) || "upload",
      contentType,
    };
  }

  async getObject(key: string) {
    if (!this.client || !this.bucket || !this.enabled) {
      throw new ServiceUnavailableException("Cloudflare R2 is not configured.");
    }

    const normalizedKey = key.trim();
    if (!normalizedKey) {
      throw new BadRequestException("Asset key is required.");
    }

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: normalizedKey,
        })
      );

      if (!response.Body) {
        throw new NotFoundException("Asset not found.");
      }

      const bytes = await response.Body.transformToByteArray();
      return {
        body: Buffer.from(bytes),
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        cacheControl: response.CacheControl ?? "public, max-age=3600",
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ServiceUnavailableException) {
        throw error;
      }

      if ((error as { name?: string }).name === "NoSuchKey") {
        throw new NotFoundException("Asset not found.");
      }

      throw new InternalServerErrorException("Asset could not be retrieved from Cloudflare R2.");
    }
  }

  async deleteManagedAsset(assetUrl: string | null | undefined): Promise<void> {
    const key = this.getManagedAssetKey(assetUrl);
    if (!key) {
      return;
    }

    try {
      await this.deleteObject(key);
    } catch (error) {
      console.warn("Cloudflare R2 cleanup skipped", error);
    }
  }

  getManagedAssetKey(assetUrl: string | null | undefined): string | undefined {
    if (!assetUrl) {
      return undefined;
    }

    const trimmedAssetUrl = assetUrl.trim();
    if (!trimmedAssetUrl) {
      return undefined;
    }

    try {
      const origin = process.env.API_PUBLIC_URL?.trim() || "http://localhost";
      const normalizedUrl = trimmedAssetUrl.startsWith("/") ? new URL(trimmedAssetUrl, origin) : new URL(trimmedAssetUrl);
      if (normalizedUrl.pathname !== "/api/assets/object") {
        return undefined;
      }

      return normalizedUrl.searchParams.get("key")?.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  private normalizeContentType(mimeType: string | undefined, fileName: string) {
    const normalizedMimeType = mimeType?.trim().toLowerCase();
    if (normalizedMimeType && CONTENT_TYPE_EXTENSION[normalizedMimeType]) {
      return normalizedMimeType;
    }

    const inferredFromFileName = EXTENSION_CONTENT_TYPE[extname(fileName).toLowerCase()];
    if (inferredFromFileName) {
      return inferredFromFileName;
    }

    throw new BadRequestException("Only JPEG, PNG, and WebP images are supported.");
  }

  private buildObjectKey(scope: AssetUploadScope, ownerId: string, contentType: string) {
    const extension = CONTENT_TYPE_EXTENSION[contentType] ?? ".bin";
    const scopeDirectory = scope === "profile-avatar" ? "profiles" : "exhibitions";
    const ownerSegment = this.sanitizePathSegment(ownerId);
    return `${scopeDirectory}/${ownerSegment}/${Date.now()}-${randomUUID()}${extension}`;
  }

  private sanitizeFileName(value: string) {
    return value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  }

  private sanitizePathSegment(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-") || "asset";
  }

  private toAssetUrl(key: string) {
    return `/api/assets/object?key=${encodeURIComponent(key)}`;
  }

  private async deleteObject(key: string) {
    if (!this.client || !this.bucket || !this.enabled) {
      return;
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}