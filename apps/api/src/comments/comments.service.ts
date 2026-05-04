import { Injectable } from "@nestjs/common";

import type { CommentPayload } from "../common/contracts";

interface CommentRecord extends CommentPayload {
  id: string;
  createdAt: string;
}

@Injectable()
export class CommentsService {
  private readonly comments: CommentRecord[] = [];

  create(payload: CommentPayload) {
    const record: CommentRecord = {
      ...payload,
      id: `comment-${this.comments.length + 1}`,
      createdAt: new Date().toISOString()
    };

    this.comments.push(record);
    return record;
  }

  list(galleryId: string) {
    return this.comments.filter((comment) => comment.galleryId === galleryId);
  }
}
