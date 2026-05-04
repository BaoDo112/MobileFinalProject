import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { ExhibitionStatus, OrganizerExhibition } from "../types/models";

type OrganizerDashboardScreenProps = Readonly<{
  exhibitions: OrganizerExhibition[];
  onCreateExhibition: () => void;
  onEditExhibition: (exhibitionId: string) => void;
  onOpenFormBuilder: (exhibitionId: string) => void;
  onOpenSubmissions: (exhibitionId: string) => void;
}>;

const statusOptions: Array<{ key: ExhibitionStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "review", label: "Review" },
  { key: "draft", label: "Draft" }
];

export function OrganizerDashboardScreen({
  exhibitions,
  onCreateExhibition,
  onEditExhibition,
  onOpenFormBuilder,
  onOpenSubmissions
}: OrganizerDashboardScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<ExhibitionStatus | "all">("all");
  const visibleExhibitions = selectedStatus === "all" ? exhibitions : exhibitions.filter((item) => item.status === selectedStatus);

  return (
    <ScreenShell
      eyebrow="Organizer flow"
      title="Run the exhibition pipeline from one mobile command center."
      subtitle="Draft, publish, map fields, and review submissions without splitting the organizer journey into disconnected placeholders."
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Today</Text>
        <Text style={styles.heroTitle}>Keep the command center light enough for a semester demo, but complete enough to prove the full workflow.</Text>
        <Pressable style={styles.primaryButton} onPress={onCreateExhibition}>
          <Text style={styles.primaryButtonText}>Create exhibition draft</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
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

      {visibleExhibitions.map((exhibition) => (
        <View key={exhibition.id} style={styles.card}>
          <View style={[styles.accentBar, { backgroundColor: exhibition.accent }]} />
          <View style={styles.badgeRow}>
            <Text style={styles.typeBadge}>{exhibition.status}</Text>
            <Text style={styles.statusText}>{exhibition.dateLabel}</Text>
          </View>
          <Text style={styles.cardTitle}>{exhibition.title}</Text>
          <Text style={styles.cardMeta}>{exhibition.venue} · {exhibition.district}</Text>
          <Text style={styles.cardCopy}>{exhibition.summary}</Text>
          <Text style={styles.cardMeta}>{exhibition.submissions} submissions · {exhibition.checkedIn} checked-in · {exhibition.fieldCount} form fields</Text>
          <Text style={styles.cardMeta}>Next action: {exhibition.nextAction}</Text>
          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={() => onEditExhibition(exhibition.id)}>
              <Text style={styles.secondaryButtonText}>Edit brief</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => onOpenFormBuilder(exhibition.id)}>
              <Text style={styles.secondaryButtonText}>Field map</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => onOpenSubmissions(exhibition.id)}>
              <Text style={styles.secondaryButtonText}>Submissions</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700"
  },
  primaryButton: {
    alignSelf: "flex-start",
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  primaryButtonText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  },
  filterRow: {
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
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  },
  filterChipTextActive: {
    color: palette.background
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
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
    fontFamily: typography.body,
    textTransform: "uppercase"
  },
  statusText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700"
  },
  cardTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700"
  },
  cardMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  },
  cardCopy: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  secondaryButton: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  secondaryButtonText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  }
});