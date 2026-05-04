import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { Gallery, Review } from "../types/models";

type ReviewHubScreenProps = Readonly<{
  gallery?: Gallery;
  reviews: Review[];
}>;

export function ReviewHubScreen({ gallery, reviews }: ReviewHubScreenProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!gallery) {
    return (
      <ScreenShell eyebrow="Visitor flow" title="Rate and comment" subtitle="Gallery was not found.">
        <Text style={styles.helper}>Return to the exhibition card and reopen the feedback route.</Text>
      </ScreenShell>
    );
  }

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "New";

  return (
    <ScreenShell
      eyebrow="Visitor flow"
      title="Rate and comment"
      subtitle="Feedback is separated into its own screen so the post-visit flow stays obvious and the stamp rule is easy to explain."
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>{gallery.title}</Text>
        <Text style={styles.heroTitle}>{averageRating}/5 community rating</Text>
        <Text style={styles.helper}>Leave one strong line of feedback, then the passport vault can explain why a comment unlocked a reward.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Your rating</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} onPress={() => setRating(value)} style={[styles.ratingChip, rating === value && styles.ratingChipActive]}>
              <Text style={[styles.ratingText, rating === value && styles.ratingTextActive]}>{value}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Short comment</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          placeholder="What stood out once the exhibition actually unfolded in person?"
          placeholderTextColor={palette.textMuted}
          multiline
        />
        <Pressable style={styles.primaryButton} onPress={() => setSubmitted(true)}>
          <Text style={styles.primaryButtonText}>Submit feedback</Text>
        </Pressable>
      </View>

      {submitted ? (
        <View style={styles.successCard}>
          <Text style={styles.sectionTitle}>Feedback staged</Text>
          <Text style={styles.helper}>Rating {rating}/5 saved with your comment preview. This is the state that will later trigger comment-gated stamp logic.</Text>
        </View>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Recent comments</Text>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.reviewAuthor}>{review.author}</Text>
              <Text style={styles.statusText}>{review.rating}/5 · {review.postedAt}</Text>
            </View>
            <Text style={styles.reviewMeta}>{review.roleLabel} · {review.highlight}</Text>
            <Text style={styles.helper}>{review.body}</Text>
          </View>
        ))}
      </View>
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