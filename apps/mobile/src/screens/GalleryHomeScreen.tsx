import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { Gallery, GalleryRegistrationStatus, GalleryStatus } from "../types/models";

type GalleryHomeScreenProps = Readonly<{
  galleries: Gallery[];
  onOpenGallery: (galleryId: string) => void;
}>;

const statusOptions: Array<{ key: GalleryStatus; label: string }> = [
  { key: "present", label: "Now On" },
  { key: "future", label: "Upcoming" },
  { key: "past", label: "Archive" }
];

const registrationLabel: Record<GalleryRegistrationStatus, string> = {
  open: "Open registration",
  waitlist: "Waitlist",
  closed: "Archive replay"
};

export function GalleryHomeScreen({ galleries, onOpenGallery }: GalleryHomeScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<GalleryStatus>("present");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const districts = ["All", ...new Set(galleries.map((gallery) => gallery.district))];
  const types = ["All", ...new Set(galleries.map((gallery) => gallery.type))];
  const filteredGalleries = galleries.filter(
    (gallery) =>
      gallery.status === selectedStatus &&
      (selectedDistrict === "All" || gallery.district === selectedDistrict) &&
      (selectedType === "All" || gallery.type === selectedType)
  );

  return (
    <ScreenShell
      title="Browse exhibition"
      subtitle="This week: build a route around one live show, one preview, and one archive replay. Timeline tabs, district/type filters, and curated cards keep the decision path simple without flattening the gallery mood."
      headerVariant="dark"
    >
      <View style={styles.filterShell}>
        <Pressable style={styles.filterToggle} onPress={() => setFiltersOpen((value) => !value)}>
          <View style={styles.filterIconWrap}>
            <Ionicons name="filter-outline" size={18} color={palette.background} />
          </View>
          <View style={styles.filterToggleTextWrap}>
            <Text style={styles.filterToggleTitle}>Filters</Text>
            <Text style={styles.filterToggleSubtitle}>
              {selectedStatus} · {selectedDistrict} · {selectedType}
            </Text>
          </View>
          <Ionicons name={filtersOpen ? "chevron-up" : "chevron-down"} size={18} color={palette.textMuted} />
        </Pressable>

        {filtersOpen ? (
          <View style={styles.filterDrawer}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Timeline</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStrip}>
                {statusOptions.map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => setSelectedStatus(option.key)}
                    style={[styles.filterChip, selectedStatus === option.key && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, selectedStatus === option.key && styles.filterChipTextActive]}>{option.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>District</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStrip}>
                {districts.map((district) => (
                  <Pressable
                    key={district}
                    onPress={() => setSelectedDistrict(district)}
                    style={[styles.filterChip, selectedDistrict === district && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, selectedDistrict === district && styles.filterChipTextActive]}>{district}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStrip}>
                {types.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setSelectedType(type)}
                    style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>{type}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        {filteredGalleries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No gallery matches this filter mix yet.</Text>
            <Text style={styles.emptyText}>Switch the district or type filter to reopen the timeline. The flow keeps empty states explicit instead of silently hiding results.</Text>
          </View>
        ) : (
          filteredGalleries.map((gallery) => (
            <Pressable key={gallery.id} onPress={() => onOpenGallery(gallery.id)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
              {({ pressed }) => (
                <>
                  <View style={[styles.accentBar, { backgroundColor: gallery.accent }]} />
                  <View style={styles.cardImageSlot}>
                    {gallery.images?.[0] ? (
                      <>
                        <View style={styles.cardImageOverlay} />
                        <Text style={styles.cardImageLabel}>{gallery.images[0]}</Text>
                      </>
                    ) : (
                      <View style={styles.cardImageEmpty}>
                        <Ionicons name="image-outline" size={22} color={palette.textMuted} />
                        <Text style={styles.cardImageEmptyText}>No image</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.badgeRow, pressed && styles.badgeRowPressed]}>
                    <Text style={[styles.typeBadge, pressed && styles.typeBadgePressed]}>{gallery.type}</Text>
                    <Text style={[styles.statusText, pressed && styles.statusTextPressed]}>{registrationLabel[gallery.registrationStatus]}</Text>
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
                </>
              )}
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
  filterShell: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xs
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 52
  },
  filterIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.text,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  filterToggleTextWrap: {
    flex: 1,
    gap: 2
  },
  filterToggleTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  },
  filterToggleSubtitle: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12
  },
  filterDrawer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm
  },
  section: {
    gap: spacing.md
  },
  filterGroup: {
    gap: spacing.xs
  },
  filterGroupLabel: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  filterStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingRight: spacing.sm,
    flexGrow: 1
  },
  filterChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minHeight: 34,
    justifyContent: "center"
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
  cardPressed: {
    borderColor: palette.accent,
    backgroundColor: palette.backgroundAlt,
    transform: [{ scale: 0.99 }]
  },
  cardImageSlot: {
    height: 160,
    borderRadius: radii.md,
    backgroundColor: palette.backgroundAlt,
    marginBottom: spacing.xs,
    overflow: "hidden",
    justifyContent: "flex-end"
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(37, 23, 19, 0.08)"
  },
  cardImageLabel: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    backgroundColor: "rgba(255, 248, 241, 0.82)",
    alignSelf: "flex-start",
    margin: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill
  },
  cardImageEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  cardImageEmptyText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    alignItems: "center"
  },
  badgeRowPressed: {
    gap: spacing.xs
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
  typeBadgePressed: {
    backgroundColor: palette.text,
    color: palette.background
  },
  statusText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: typography.body,
    textTransform: "uppercase",
    backgroundColor: palette.cardStrong,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.pill,
    overflow: "hidden",
    letterSpacing: 0.6
  },
  statusTextPressed: {
    backgroundColor: palette.accent,
    color: palette.white,
    letterSpacing: 0.9
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
