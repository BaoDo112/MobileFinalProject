import { Injectable } from "@nestjs/common";

import type { CommentPayload } from "../common/contracts";
import { AppStateService } from "../persistence/app-state.service";

@Injectable()
export class CommentsService {
  constructor(private readonly appState: AppStateService) {}

  async create(payload: CommentPayload) {
    const record = {
      ...payload,
      id: `comment-${this.comments.length + 1}`,
      createdAt: new Date().toISOString()
    };

    this.comments.push(record);
    await this.appState.persist();
    return record;
  }

  list(galleryId: string) {
    return this.comments.filter((comment) => comment.galleryId === galleryId);
  }

  private get comments() {
    return this.appState.getState().comments.records;
  }
}
