import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { assetsApi } from "../api/assets";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { useDiscover } from "../query/useDiscover";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { ExhibitionSummaryDto, RegistrationCtaState } from "../types/api";
import type { GalleryStatus } from "../types/models";

type GalleryHomeScreenProps = Readonly<{
  onOpenGallery: (galleryId: string) => void;
}>;

const statusOptions: Array<{ key: GalleryStatus; label: string }> = [
  { key: "present", label: "Now On" },
  { key: "future", label: "Upcoming" },
  { key: "past", label: "Archive" },
];

const registrationLabel: Record<RegistrationCtaState, string> = {
  open: "Open registration",
  waitlist: "Waitlist open",
  closed: "Registration closed",
};

type FilterChipRowProps = Readonly<{
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}>;

type DiscoverResultsSectionProps = Readonly<{
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  filteredExhibitions: ExhibitionSummaryDto[];
  allExhibitionsCount: number;
  onRetry: () => void;
  onResetFilters: () => void;
  onOpenGallery: (galleryId: string) => void;
}>;

function FilterChipRow({ label, options, selectedValue, onSelect }: FilterChipRowProps) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterGroupLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStrip}>
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.filterChip, selectedValue === option && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedValue === option && styles.filterChipTextActive]}>{option}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function DiscoverCard({ exhibition, onOpenGallery }: Readonly<{ exhibition: ExhibitionSummaryDto; onOpenGallery: (galleryId: string) => void }>) {
  const heroImageUri = assetsApi.resolveAssetUrl(exhibition.heroImageUrl);

  return (
    <Pressable key={exhibition.id} onPress={() => onOpenGallery(exhibition.id)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {({ pressed }) => (
        <>
          <View style={[styles.accentBar, { backgroundColor: exhibition.accent ?? palette.accent }]} />
          <View style={styles.cardImageSlot}>
            {heroImageUri ? <Image source={{ uri: heroImageUri }} style={styles.cardImageBackground} /> : null}
            <View style={styles.cardImageOverlay} />
            <Text style={styles.cardImageLabel}>{exhibition.venueTitle ?? "Venue to be confirmed"}</Text>
            <View style={styles.cardImageEmpty}>
              {heroImageUri ? null : <Ionicons name="sparkles-outline" size={22} color={palette.textMuted} />}
              <Text style={styles.cardImageEmptyText}>{exhibition.capacityBadge}</Text>
            </View>
          </View>
          <View style={[styles.badgeRow, pressed && styles.badgeRowPressed]}>
            <Text style={[styles.typeBadge, pressed && styles.typeBadgePressed]}>{exhibition.exhibitionType}</Text>
            <Text style={[styles.statusText, pressed && styles.statusTextPressed]}>{registrationLabel[exhibition.registrationState]}</Text>
          </View>
          <Text style={styles.cardTitle}>{exhibition.title}</Text>
          <Text style={styles.cardMeta}>{exhibition.dateLabel} · {exhibition.timeLabel}</Text>
          <Text style={styles.cardMeta}>{exhibition.district} · {exhibition.organizerName}</Text>
          {exhibition.bio ? <Text style={styles.cardCopy}>{exhibition.bio}</Text> : null}
          <View style={styles.highlightRow}>
            <View style={styles.highlightChip}>
              <Text style={styles.highlightText}>{exhibition.capacityBadge}</Text>
            </View>
            {exhibition.venueTitle ? (
              <View style={styles.highlightChip}>
                <Text style={styles.highlightText}>{exhibition.venueTitle}</Text>
              </View>
            ) : null}
          </View>
        </>
      )}
    </Pressable>
  );
}

function DiscoverResultsSection({
  isLoading,
  isFetching,
  error,
  filteredExhibitions,
  allExhibitionsCount,
  onRetry,
  onResetFilters,
  onOpenGallery,
}: DiscoverResultsSectionProps) {
  if (isLoading) {
    return <StatusChip label="Loading filtered results" tone="neutral" />;
  }

  if (error) {
    return (
      <ErrorRecoveryPanel
        title="Discover filters need another try"
        description={error instanceof Error ? error.message : "Filtered discover query failed."}
        onRetry={onRetry}
      />
    );
  }

  if (filteredExhibitions.length === 0) {
    return (
      <EmptyStateBanner
        title={allExhibitionsCount === 0 ? "No exhibitions are published yet." : "No exhibition matches this filter mix yet."}
        description={
          allExhibitionsCount === 0
            ? "Publish the first exhibition or switch the API dataset to reopen the visitor browse path."
            : "Switch the district or type filter to reopen the timeline. The discover flow keeps empty states explicit instead of hiding results."
        }
        actionLabel="Reset filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <>
      {isFetching ? <StatusChip label="Refreshing results" tone="neutral" /> : null}
      {filteredExhibitions.map((exhibition) => (
        <DiscoverCard key={exhibition.id} exhibition={exhibition} onOpenGallery={onOpenGallery} />
      ))}
    </>
  );
}

export function GalleryHomeScreen({ onOpenGallery }: GalleryHomeScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<GalleryStatus>("present");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const catalogQuery = useDiscover();
  const filteredQuery = useDiscover({
    timeline: selectedStatus,
    district: selectedDistrict === "All" ? undefined : selectedDistrict,
    type: selectedType === "All" ? undefined : selectedType,
  });

  const allExhibitions = catalogQuery.data ?? [];
  const filteredExhibitions = filteredQuery.data ?? [];
  const districts = useMemo(() => ["All", ...new Set(allExhibitions.map((exhibition) => exhibition.district))], [allExhibitions]);
  const types = useMemo(() => ["All", ...new Set(allExhibitions.map((exhibition) => exhibition.exhibitionType))], [allExhibitions]);
  const handleCatalogRetry = () => {
    catalogQuery.refetch();
    filteredQuery.refetch();
  };
  const handleFilteredRetry = () => {
    filteredQuery.refetch();
  };
  const handleResetFilters = () => {
    setSelectedStatus("present");
    setSelectedDistrict("All");
    setSelectedType("All");
  };

  if (catalogQuery.isLoading && !catalogQuery.data) {
    return (
      <ScreenShell>
        <StatusChip label="Loading discover feed" tone="neutral" />
      </ScreenShell>
    );
  }

  if (catalogQuery.isError && !catalogQuery.data) {
    return (
      <ScreenShell>
        <ErrorRecoveryPanel description={catalogQuery.error instanceof Error ? catalogQuery.error.message : "Discover query failed."} onRetry={handleCatalogRetry} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
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
            <FilterChipRow
              label="Timeline"
              options={statusOptions.map((option) => option.key)}
              selectedValue={selectedStatus}
              onSelect={(value) => setSelectedStatus(value as GalleryStatus)}
            />
            <FilterChipRow label="District" options={districts} selectedValue={selectedDistrict} onSelect={setSelectedDistrict} />
            <FilterChipRow label="Type" options={types} selectedValue={selectedType} onSelect={setSelectedType} />
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <DiscoverResultsSection
          isLoading={filteredQuery.isLoading && !filteredQuery.data}
          isFetching={filteredQuery.isFetching}
          error={filteredQuery.isError ? filteredQuery.error : null}
          filteredExhibitions={filteredExhibitions}
          allExhibitionsCount={allExhibitions.length}
          onRetry={handleFilteredRetry}
          onResetFilters={handleResetFilters}
          onOpenGallery={onOpenGallery}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filterShell: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xs,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 52,
  },
  filterIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.text,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  filterToggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  filterToggleTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  filterToggleSubtitle: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
  },
  filterDrawer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  filterGroup: {
    gap: spacing.xs,
  },
  filterGroupLabel: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  filterStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingRight: spacing.sm,
    flexGrow: 1,
  },
  filterChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minHeight: 34,
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: palette.text,
  },
  filterChipText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: typography.body,
  },
  filterChipTextActive: {
    color: palette.background,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
    overflow: "hidden",
  },
  cardPressed: {
    borderColor: palette.accent,
    backgroundColor: palette.backgroundAlt,
    transform: [{ scale: 0.99 }],
  },
  cardImageSlot: {
    height: 160,
    borderRadius: radii.md,
    backgroundColor: palette.backgroundAlt,
    marginBottom: spacing.xs,
    overflow: "hidden",
    justifyContent: "space-between",
    paddingBottom: spacing.md,
  },
  cardImageBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(37, 23, 19, 0.08)",
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
    borderRadius: radii.pill,
  },
  cardImageEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  cardImageEmptyText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    alignItems: "center",
  },
  badgeRowPressed: {
    gap: spacing.xs,
  },
  typeBadge: {
    backgroundColor: palette.backgroundAlt,
    color: palette.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontWeight: "700",
    overflow: "hidden",
    fontFamily: typography.body,
  },
  typeBadgePressed: {
    backgroundColor: palette.text,
    color: palette.background,
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
    letterSpacing: 0.6,
  },
  statusTextPressed: {
    backgroundColor: palette.accent,
    color: palette.white,
    letterSpacing: 0.9,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    fontFamily: typography.display,
  },
  cardMeta: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.body,
  },
  cardCopy: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: typography.body,
  },
  highlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  highlightChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  highlightText: {
    color: palette.text,
    fontSize: 12,
    fontFamily: typography.body,
    fontWeight: "600",
  },
});
