import { Body, Controller, Get, Post, Query } from "@nestjs/common";

import type { CommentPayload } from "../common/contracts";
import { CommentsService } from "./comments.service";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() payload: CommentPayload) {
    return this.commentsService.create(payload);
  }

  @Get()
  list(@Query("galleryId") galleryId: string) {
    return this.commentsService.list(galleryId);
  }
}
