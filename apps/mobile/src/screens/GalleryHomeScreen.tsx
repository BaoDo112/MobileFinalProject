import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { Gallery, GalleryStatus } from "../types/models";

type GalleryHomeScreenProps = Readonly<{
  galleries: Gallery[];
  onOpenGallery: (galleryId: string) => void;
}>;

const statusOptions: Array<{ key: GalleryStatus; label: string }> = [
  { key: "present", label: "Now On" },
  { key: "future", label: "Upcoming" },
  { key: "past", label: "Archive" }
];

const registrationLabel = {
  open: "Open registration",
  waitlist: "Waitlist",
  closed: "Archive replay"
} as const;

export function GalleryHomeScreen({ galleries, onOpenGallery }: GalleryHomeScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<GalleryStatus>("present");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");

  const districts = ["All", ...new Set(galleries.map((gallery) => gallery.district))];
  const types = ["All", ...new Set(galleries.map((gallery) => gallery.type))];
  const filteredGalleries = galleries.filter(
    (gallery) =>
      gallery.status === selectedStatus &&
      (selectedDistrict === "All" || gallery.district === selectedDistrict) &&
      (selectedType === "All" || gallery.type === selectedType)
  );
  const featuredGallery = filteredGalleries[0] ?? galleries.find((gallery) => gallery.status === selectedStatus) ?? galleries[0];

  return (
    <ScreenShell
      eyebrow="Visitor flow"
      title="Browse exhibitions with enough context to commit in one pass."
      subtitle="Timeline tabs, district/type filters, and curated cards keep the decision path simple without flattening the gallery mood."
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>This week</Text>
        <Text style={styles.heroTitle}>Build a route around one live show, one preview, and one archive replay.</Text>
        <Text style={styles.heroCopy}>Every card below keeps the entry mode, capacity, and curator note visible so visitors do not need to guess before registering.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.chipRow}>
          {statusOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setSelectedStatus(option.key)}
              style={[styles.filterChip, selectedStatus === option.key && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedStatus === option.key && styles.filterChipTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>District</Text>
        <View style={styles.chipRow}>
          {districts.map((district) => (
            <Pressable
              key={district}
              onPress={() => setSelectedDistrict(district)}
              style={[styles.filterChip, selectedDistrict === district && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedDistrict === district && styles.filterChipTextActive]}>{district}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type</Text>
        <View style={styles.chipRow}>
          {types.map((type) => (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>{type}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {featuredGallery ? (
        <Pressable style={styles.featuredCard} onPress={() => onOpenGallery(featuredGallery.id)}>
          <View style={[styles.accentBar, { backgroundColor: featuredGallery.accent }]} />
          <Text style={styles.kicker}>{featuredGallery.organizer}</Text>
          <Text style={styles.featuredTitle}>{featuredGallery.title}</Text>
          <Text style={styles.featuredCopy}>{featuredGallery.curatorNote}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.typeBadge}>{featuredGallery.type}</Text>
            <Text style={styles.statusText}>{registrationLabel[featuredGallery.registrationStatus]}</Text>
          </View>
        </Pressable>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exhibition cards</Text>
        {filteredGalleries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No gallery matches this filter mix yet.</Text>
            <Text style={styles.emptyText}>Switch the district or type filter to reopen the timeline. The flow keeps empty states explicit instead of silently hiding results.</Text>
          </View>
        ) : (
          filteredGalleries.map((gallery) => (
            <Pressable key={gallery.id} onPress={() => onOpenGallery(gallery.id)} style={styles.card}>
              <View style={[styles.accentBar, { backgroundColor: gallery.accent }]} />
              <View style={styles.badgeRow}>
                <Text style={styles.typeBadge}>{gallery.type}</Text>
                <Text style={styles.statusText}>{registrationLabel[gallery.registrationStatus]}</Text>
              </View>
              <Text style={styles.cardTitle}>{gallery.title}</Text>
              <Text style={styles.cardMeta}>{gallery.dateLabel} · {gallery.timeLabel}</Text>
              <Text style={styles.cardMeta}>{gallery.district} · {gallery.organizer}</Text>
              <Text style={styles.cardCopy}>{gallery.bio}</Text>
              <View style={styles.highlightRow}>
                {gallery.highlights.slice(0, 2).map((highlight) => (
                  <View key={highlight} style={styles.highlightChip}>
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: palette.card,
    borderRadius: radii.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.muted,
  },
  heroCard: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: palette.cardStrong,
    gap: spacing.xs
  },
  kicker: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700"
  },
  heroCopy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  filterChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9
  },
  filterChipActive: {
    backgroundColor: palette.text
  },
  filterChipText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: typography.body
  },
  filterChipTextActive: {
    color: palette.background
  },
  featuredCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
    overflow: "hidden"
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6
  },
  featuredTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700"
  },
  featuredCopy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
    overflow: "hidden"
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    alignItems: "center"
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
  statusText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: typography.body,
    textTransform: "uppercase"
  },
  cardTitle: {
    color: palette.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    fontFamily: typography.display
  },
  cardMeta: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.body
  },
  cardCopy: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: typography.body
  },
  highlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  highlightChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  highlightText: {
    color: palette.text,
    fontSize: 12,
    fontFamily: typography.body,
    fontWeight: "600"
  },
  emptyCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs
  },
  emptyTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700"
  },
  emptyText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20
  }
});
