import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { Gallery, Review } from "../types/models";

type GalleryDetailScreenProps = Readonly<{
  gallery?: Gallery;
  reviews: Review[];
  onOpenRegistration: () => void;
  onOpenReview: () => void;
}>;

export function GalleryDetailScreen({ gallery, reviews, onOpenRegistration, onOpenReview }: GalleryDetailScreenProps) {
  if (!gallery) {
    return (
      <ScreenShell eyebrow="Visitor flow" title="Exhibition details" subtitle="Gallery was not found.">
        <Text style={styles.text}>Please return to Gallery Home and choose another exhibition.</Text>
      </ScreenShell>
    );
  }

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "New";

  const openMap = () => {
    const query = encodeURIComponent(gallery.address);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <ScreenShell eyebrow="Visitor flow" title={gallery.title} subtitle={gallery.bio}>
      <View style={styles.heroCard}>
        <View style={[styles.heroAccent, { backgroundColor: gallery.accent }]} />
        <View style={styles.badgeRow}>
          <Text style={styles.typeBadge}>{gallery.type}</Text>
          <Text style={styles.ratingBadge}>{averageRating}/5</Text>
        </View>
        <Text style={styles.heroTitle}>{gallery.entryMode}</Text>
        <Text style={styles.text}>{gallery.curatorNote}</Text>
        <View style={styles.actionRow}>
          <Pressable onPress={onOpenRegistration} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Reserve a slot</Text>
          </Pressable>
          <Pressable onPress={onOpenReview} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Rate & comment</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Visit blueprint</Text>
        <Text style={styles.text}>{gallery.dateLabel} · {gallery.timeLabel}</Text>
        <Text style={styles.text}>{gallery.capacityNote}</Text>
        <Text style={styles.text}>{gallery.district} · {gallery.organizer}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.text}>{gallery.address}</Text>
        <Pressable onPress={openMap} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Open in Google Maps</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Artists / Organizers</Text>
        <View style={styles.chipRow}>
          {gallery.artists.map((artist) => (
            <View key={artist} style={styles.personChip}>
              <Text style={styles.personChipText}>{artist}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Experience highlights</Text>
        <View style={styles.chipRow}>
          {gallery.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightChip}>
              <Text style={styles.highlightChipText}>{highlight}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Community preview</Text>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.reviewAuthor}>{review.author}</Text>
              <Text style={styles.statusText}>{review.rating}/5 · {review.postedAt}</Text>
            </View>
            <Text style={styles.reviewMeta}>{review.roleLabel} · {review.highlight}</Text>
            <Text style={styles.text}>{review.body}</Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: "hidden"
  },
  heroAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6
  },
  panel: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  typeBadge: {
    backgroundColor: palette.backgroundAlt,
    color: palette.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontWeight: "700",
    overflow: "hidden",
    fontFamily: typography.body
  },
  ratingBadge: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  },
  heroTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700"
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.body,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  text: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: typography.body
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  primaryButtonText: {
    color: palette.white,
    fontFamily: typography.body,
    fontWeight: "700"
  },
  secondaryButton: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  secondaryButtonText: {
    color: palette.text,
    fontFamily: typography.body,
    fontWeight: "700"
  },
  linkButton: {
    marginTop: spacing.xs,
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  linkButtonText: {
    color: palette.white,
    fontWeight: "700",
    fontFamily: typography.body
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  personChip: {
    backgroundColor: palette.backgroundAlt,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  personChipText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  },
  highlightChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  highlightChipText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "600"
  },
  reviewCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: spacing.xs
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
    fontSize: 12,
    fontWeight: "700",
    fontFamily: typography.body
  }
});
