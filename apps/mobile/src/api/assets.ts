import { apiClient, resolveApiAssetUrl } from "./client";
import type { AssetUploadResponseDto, AssetUploadScope } from "../types/api";

type UploadImageInput = Readonly<{
  uri: string;
  scope: AssetUploadScope;
  mimeType?: string | null;
  fileName?: string | null;
  targetId?: string;
}>;

function inferMimeType(fileName: string, mimeType?: string | null) {
  if (mimeType?.trim()) {
    return mimeType;
  }

  const normalized = fileName.toLowerCase();
  if (normalized.endsWith(".png")) {
    return "image/png";
  }

  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

function fallbackFileName(uri: string) {
  const lastSegment = uri.split("/").pop()?.split("?")[0]?.trim();
  return lastSegment && lastSegment.length > 0 ? lastSegment : `upload-${Date.now()}.jpg`;
}

export const assetsApi = {
  async uploadImage(input: UploadImageInput) {
    const fileName = input.fileName?.trim() || fallbackFileName(input.uri);
    const formData = new FormData();
    formData.append("scope", input.scope);
    if (input.targetId?.trim()) {
      formData.append("targetId", input.targetId.trim());
    }

    formData.append(
      "file",
      {
        uri: input.uri,
        name: fileName,
        type: inferMimeType(fileName, input.mimeType),
      } as any,
    );

    return apiClient.postForm<AssetUploadResponseDto>("/assets/images", formData);
  },

  resolveAssetUrl: resolveApiAssetUrl,
};