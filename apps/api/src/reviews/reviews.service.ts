import { BadRequestException, Injectable } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import type { ReviewHubDto, ReviewItemDto, ReviewStatus, SaveReviewDto } from "../common/contracts";
import { ExhibitionsService } from "../exhibitions/exhibitions.service";
import { AppStateService } from "../persistence/app-state.service";
import type { ReviewRecord } from "../persistence/app-state.types";
import { RegistrationsService } from "../registrations/registrations.service";
import { StampsService } from "../stamps/stamps.service";

const REVIEW_GUIDELINES = [
  "Reviews unlock only after organizer check-in confirms you attended the exhibition.",
  "Keep feedback concrete and visitor-facing so the next guest knows what the experience actually felt like.",
  "Links, contact details, or moderation triggers keep the review pending until staff approve it.",
];

const MODERATION_TRIGGERS = ["http://", "https://", "telegram", "refund", "dm me", "@"];

@Injectable()
export class ReviewsService {
  constructor(
    private readonly authService: AuthService,
    private readonly exhibitionsService: ExhibitionsService,
    private readonly registrationsService: RegistrationsService,
    private readonly stampsService: StampsService,
    private readonly appState: AppStateService,
  ) {}

  async getHub(token: string, exhibitionId: string): Promise<ReviewHubDto> {
    const session = await this.authService.getSessionEnvelope(token);
    const exhibition = this.exhibitionsService.getSummary(exhibitionId);
    const existingReview = this.findVisitorReview(session.user.id, exhibitionId);

    return this.buildHub(session.user.id, exhibitionId, exhibition.title, existingReview);
  }

  async saveReview(token: string, exhibitionId: string, payload: SaveReviewDto): Promise<ReviewHubDto> {
    const session = await this.authService.getSessionEnvelope(token);
    const exhibition = this.exhibitionsService.getSummary(exhibitionId);
    const visit = this.registrationsService.getVisitorExhibitionRecord(session.user.id, exhibitionId);

    if (visit?.status !== "CHECKED_IN") {
      throw new BadRequestException({
        message: "Reviews unlock after organizer check-in confirms your attendance.",
        code: "REVIEW_LOCKED",
      });
    }

    const rating = Number(payload.rating);
    const content = payload.content.trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException({
        message: "Rating must be an integer between 1 and 5.",
        code: "INVALID_RATING",
      });
    }

    if (content.length < 24) {
      throw new BadRequestException({
        message: "Review content must describe the on-site experience in at least 24 characters.",
        code: "REVIEW_TOO_SHORT",
      });
    }

    const existingReview = this.findVisitorReview(session.user.id, exhibitionId);
    const status = this.resolveStatus(content);
    const now = new Date().toISOString();
    const review: ReviewRecord = {
      id: existingReview?.id ?? `review-${this.records.length + 1}`,
      exhibitionId,
      visitorId: session.user.id,
      authorName: session.visitorProfile?.name ?? session.user.email,
      rating,
      content,
      status,
      createdAt: existingReview?.createdAt ?? now,
      updatedAt: existingReview ? now : undefined,
    };

    this.upsertReview(review);
    await this.appState.persist();
    await this.exhibitionsService.syncReviewPreview({ exhibitionId, ...this.toReviewItem(review) });

    if (status === "PUBLISHED") {
      const milestoneIssuance = Promise.resolve(
        this.stampsService.issueMilestoneStamp(session.user.id, exhibitionId, "published-review"),
      );
      await milestoneIssuance;
    }

    return this.buildHub(session.user.id, exhibitionId, exhibition.title, review);
  }

  private buildHub(userId: string, exhibitionId: string, exhibitionTitle: string, existingReview?: ReviewRecord): ReviewHubDto {
    const publishedReviews = this.records
      .filter((record) => record.exhibitionId === exhibitionId && record.status === "PUBLISHED")
      .sort((left, right) => Date.parse(right.updatedAt ?? right.createdAt) - Date.parse(left.updatedAt ?? left.createdAt));
    const averageRatingLabel = publishedReviews.length > 0
      ? `${(publishedReviews.reduce((sum, record) => sum + record.rating, 0) / publishedReviews.length).toFixed(1)}/5`
      : "New";

    return {
      exhibitionId,
      exhibitionTitle,
      averageRatingLabel,
      reviewCount: publishedReviews.length,
      eligibility: this.buildEligibility(userId, exhibitionId, existingReview),
      composer: {
        reviewId: existingReview?.id,
        rating: existingReview?.rating ?? 5,
        content: existingReview?.content ?? "",
        status: existingReview?.status,
        submittedAt: existingReview?.updatedAt ?? existingReview?.createdAt,
      },
      guidelines: [...REVIEW_GUIDELINES],
      recentReviews: publishedReviews.slice(0, 6).map((review) => this.toReviewItem(review)),
    };
  }

  private buildEligibility(userId: string, exhibitionId: string, existingReview?: ReviewRecord) {
    const visit = this.registrationsService.getVisitorExhibitionRecord(userId, exhibitionId);

    if (!visit) {
      return {
        isEligible: false,
        reason: "Register and complete the on-site check-in to unlock reviews.",
      };
    }

    if (visit.status !== "CHECKED_IN") {
      return {
        isEligible: false,
        reason: `Reviews unlock after staff check-in confirms your visit for ${visit.sessionLabel}.`,
      };
    }

    return {
      isEligible: true,
      checkedInAt: visit.checkedInAt,
      rewardNotice:
        existingReview?.status === "PUBLISHED"
          ? "Your public review keeps the community voice milestone unlocked."
          : "Publishing one post-visit review unlocks the community voice milestone stamp.",
    };
  }

  private findVisitorReview(visitorId: string, exhibitionId: string) {
    return this.records.find((record) => record.visitorId === visitorId && record.exhibitionId === exhibitionId);
  }

  private resolveStatus(content: string): ReviewStatus {
    const normalized = content.trim().toLowerCase();
    return MODERATION_TRIGGERS.some((trigger) => normalized.includes(trigger)) ? "PENDING" : "PUBLISHED";
  }

  private upsertReview(review: ReviewRecord) {
    const currentIndex = this.records.findIndex((candidate) => candidate.id === review.id);
    if (currentIndex >= 0) {
      this.records.splice(currentIndex, 1, review);
      return;
    }

    this.records.push(review);
  }

  private get records() {
    return this.appState.getState().reviews.records;
  }

  private toReviewItem(review: ReviewRecord): ReviewItemDto {
    return {
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      content: review.content,
      status: review.status,
      createdAt: review.updatedAt ?? review.createdAt,
    };
  }
}