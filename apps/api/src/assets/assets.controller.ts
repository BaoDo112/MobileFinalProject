import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IsIn, IsOptional, IsString } from "class-validator";

import { AuthService } from "../auth/auth.service";
import { getBearerToken } from "../common/auth-header";
import type { AssetUploadScope } from "../common/contracts";
import { AssetsService } from "./assets.service";

type UploadedImageFile = Readonly<{
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}>;

type HeaderWritableResponse = Readonly<{
  setHeader: (name: string, value: string) => void;
}>;

class UploadImageRequestDto {
  @IsIn(["profile-avatar", "exhibition-media"])
  scope!: AssetUploadScope;

  @IsOptional()
  @IsString()
  targetId?: string;
}

@Controller("assets")
export class AssetsController {
  constructor(
    private readonly authService: AuthService,
    private readonly assetsService: AssetsService,
  ) {}

  @Post("images")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
    })
  )
  async uploadImage(
    @Headers("authorization") authorization: string | undefined,
    @Body() payload: UploadImageRequestDto,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException("Image file is required.");
    }

    const session = await this.authService.getSessionEnvelope(getBearerToken(authorization));
    return this.assetsService.uploadImage({
      buffer: file.buffer,
      fileName: file.originalname || "upload",
      mimeType: file.mimetype,
      ownerId: payload.targetId?.trim() || session.user.id,
      scope: payload.scope,
    });
  }

  @Get("object")
  async getObject(@Query("key") key: string | undefined, @Res({ passthrough: true }) response: HeaderWritableResponse) {
    const asset = await this.assetsService.getObject(key ?? "");
    response.setHeader("Content-Type", asset.contentType ?? "application/octet-stream");
    response.setHeader("Cache-Control", asset.cacheControl);
    if (typeof asset.contentLength === "number") {
      response.setHeader("Content-Length", String(asset.contentLength));
    }

    return new StreamableFile(asset.body);
  }
}