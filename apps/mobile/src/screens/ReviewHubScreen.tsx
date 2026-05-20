import { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ApiError } from "../api/client";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { useReviewHub } from "../query/useReviewHub";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { ReviewHubDto, ReviewItemDto } from "../types/api";
import type { ReviewStatus } from "../types/models";

type ReviewHubScreenProps = Readonly<{
  exhibitionId: string;
}>;

function formatTimestamp(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return value;
  }
}

function getReviewStatusTone(status?: ReviewStatus): "neutral" | "success" | "warning" | "danger" {
  if (status === "PUBLISHED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  if (status === "FLAGGED" || status === "HIDDEN") {
    return "danger";
  }

  return "neutral";
}

function formatReviewStatus(status?: ReviewStatus) {
  return status ? status.toLowerCase() : "draft";
}

function getReviewErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "REVIEW_LOCKED") {
      return "Reviews unlock only after the organizer confirms your attendance at check-in.";
    }

    if (error.code === "REVIEW_TOO_SHORT") {
      return "Describe the on-site experience in one concrete sentence before saving.";
    }

    if (error.code === "INVALID_RATING") {
      return "Choose a rating between 1 and 5 before saving.";
    }
  }

  return error instanceof Error ? error.message : "Review save failed.";
}

function LoadingReviewHubScreen() {
  return (
    <ScreenShell eyebrow="Visitor flow" title="Review & comment" subtitle="Loading review eligibility, composer state, and public feedback.">
      <StatusChip label="Loading review hub" tone="neutral" />
    </ScreenShell>
  );
}

function ReviewHubErrorScreen({ description, onRetry }: Readonly<{ description: string; onRetry: () => void }>) {
  return (
    <ScreenShell eyebrow="Visitor flow" title="Review & comment" subtitle="The post-visit review surface could not be restored.">
      <ErrorRecoveryPanel description={description} onRetry={onRetry} />
    </ScreenShell>
  );
}

function getEligibilityCopy(hub: ReviewHubDto) {
  if (hub.eligibility.isEligible) {
    return hub.eligibility.rewardNotice ?? "Publishing one post-visit review can unlock the review milestone stamp.";
  }

  return hub.eligibility.reason ?? "Organizer check-in unlocks the review composer after your visit.";
}

function EligibleComposer({
  rating,
  comment,
  setRating,
  setComment,
  isPending,
  canSubmit,
  onSave,
}: Readonly<{
  rating: number;
  comment: string;
  setRating: (value: number) => void;
  setComment: (value: string) => void;
  isPending: boolean;
  canSubmit: boolean;
  onSave: () => void;
}>) {
  return (
    <>
      <Text style={styles.label}>Your rating</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable
            key={value}
            onPress={() => setRating(value)}
            style={[styles.ratingChip, rating === value && styles.ratingChipActive]}
          >
            <Text style={[styles.ratingText, rating === value && styles.ratingTextActive]}>{value}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Short comment</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        style={styles.input}
        editable={!isPending}
        placeholder="What actually stood out once the exhibition unfolded in person?"
        placeholderTextColor={palette.textMuted}
        multiline
      />
      <Text style={styles.metaText}>At least 24 characters. Links and contact details stay pending for moderation.</Text>
      <Pressable style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]} disabled={!canSubmit} onPress={onSave}>
        <Text style={styles.primaryButtonText}>{isPending ? "Saving review..." : "Save review"}</Text>
      </Pressable>
    </>
  );
}

function ReviewComposerPanel({
  hub,
  rating,
  comment,
  setRating,
  setComment,
  isPending,
  isError,
  error,
  onSave,
}: Readonly<{
  hub: ReviewHubDto;
  rating: number;
  comment: string;
  setRating: (value: number) => void;
  setComment: (value: string) => void;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onSave: () => void;
}>) {
  const canSubmit = hub.eligibility.isEligible && comment.trim().length >= 24 && !isPending;
  const composerStatusTimestamp = formatTimestamp(hub.composer.submittedAt);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.sectionTitle}>{hub.eligibility.isEligible ? "Your review" : "Review unlock"}</Text>
        {hub.composer.status ? <StatusChip label={formatReviewStatus(hub.composer.status)} tone={getReviewStatusTone(hub.composer.status)} /> : null}
      </View>
      <Text style={styles.helper}>{getEligibilityCopy(hub)}</Text>
      {hub.eligibility.checkedInAt ? <Text style={styles.metaText}>Checked in {formatTimestamp(hub.eligibility.checkedInAt)}</Text> : null}
      {composerStatusTimestamp ? <Text style={styles.metaText}>Last saved {composerStatusTimestamp}</Text> : null}

      {hub.eligibility.isEligible ? (
        <EligibleComposer
          rating={rating}
          comment={comment}
          setRating={setRating}
          setComment={setComment}
          isPending={isPending}
          canSubmit={canSubmit}
          onSave={onSave}
        />
      ) : (
        <EmptyStateBanner
          title="Attendance confirmation required"
          description="You can read public feedback now, but your own review opens only after the organizer confirms you attended."
        />
      )}

      {isError ? (
        <ErrorRecoveryPanel
          title="Review could not be saved"
          description={getReviewErrorMessage(error)}
          retryLabel="Try save again"
          onRetry={onSave}
        />
      ) : null}
    </View>
  );
}

function RecentReviewsPanel({ reviews }: Readonly<{ reviews: ReviewItemDto[] }>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Recent comments</Text>
      {reviews.length === 0 ? (
        <EmptyStateBanner
          title="No public reviews yet"
          description="Once a checked-in visitor publishes feedback, the first review appears here and in the exhibition detail preview."
        />
      ) : null}
      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.reviewAuthor}>{review.authorName}</Text>
            <Text style={styles.statusText}>{review.rating}/5 · {formatTimestamp(review.createdAt)}</Text>
          </View>
          <Text style={styles.helper}>{review.content}</Text>
        </View>
      ))}
    </View>
  );
}

export function ReviewHubScreen({ exhibitionId }: ReviewHubScreenProps) {
  const { reviewQuery, saveReviewMutation } = useReviewHub(exhibitionId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!reviewQuery.data) {
      return;
    }

    setRating(reviewQuery.data.composer.rating);
    setComment(reviewQuery.data.composer.content);
  }, [reviewQuery.data?.composer.content, reviewQuery.data?.composer.rating, reviewQuery.data?.composer.reviewId, reviewQuery.data?.composer.status]);

  if (reviewQuery.isLoading && !reviewQuery.data) {
    return <LoadingReviewHubScreen />;
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <ReviewHubErrorScreen
        description={reviewQuery.error instanceof Error ? reviewQuery.error.message : "Review hub query failed."}
        onRetry={() => reviewQuery.refetch()}
      />
    );
  }

  const hub = reviewQuery.data;
  const handleSave = () => {
    saveReviewMutation.mutate({ rating, content: comment.trim() });
  };

  return (
    <ScreenShell
      eyebrow="Visitor flow"
      title="Review & comment"
      subtitle="Post-visit feedback now follows the same attendance truth as queue check-in and stamp rewards."
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>{hub.exhibitionTitle}</Text>
        <Text style={styles.heroTitle}>{hub.averageRatingLabel === "New" ? "New community rating" : `${hub.averageRatingLabel} community rating`}</Text>
        <Text style={styles.helper}>{hub.reviewCount} published review{hub.reviewCount === 1 ? "" : "s"} currently shape the public exhibition preview.</Text>
      </View>

      <ReviewComposerPanel
        hub={hub}
        rating={rating}
        comment={comment}
        setRating={setRating}
        setComment={setComment}
        isPending={saveReviewMutation.isPending}
        isError={saveReviewMutation.isError}
        error={saveReviewMutation.error}
        onSave={handleSave}
      />

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Publishing notes</Text>
        {hub.guidelines.map((guideline) => (
          <View key={guideline} style={styles.guidelineRow}>
            <View style={styles.guidelineDot} />
            <Text style={styles.helper}>{guideline}</Text>
          </View>
        ))}
      </View>

      {hub.composer.status === "PUBLISHED" ? (
        <View style={styles.successCard}>
          <Text style={styles.sectionTitle}>Public review live</Text>
          <Text style={styles.helper}>Your latest saved review is visible in the exhibition preview and can contribute to the community milestone stamp.</Text>
        </View>
      ) : null}

      <RecentReviewsPanel reviews={hub.recentReviews} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs
  },
  kicker: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  heroTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700"
  },
  panel: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.sm
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  ratingRow: {
    flexDirection: "row",
    gap: spacing.xs
  },
  ratingChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.muted,
    alignItems: "center",
    justifyContent: "center"
  },
  ratingChipActive: {
    backgroundColor: palette.accent
  },
  ratingText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700"
  },
  ratingTextActive: {
    color: palette.white
  },
  label: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  },
  metaText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: palette.white,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    minHeight: 120,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    textAlignVertical: "top",
    color: palette.text,
    fontFamily: typography.body
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center"
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: palette.white,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  },
  successCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs
  },
  guidelineRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  guidelineDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: palette.accent,
    marginTop: 6,
    flexShrink: 0,
  },
  reviewCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: spacing.xs
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  reviewAuthor: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700"
  },
  reviewMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13
  },
  statusText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700"
  },
  helper: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  }
});