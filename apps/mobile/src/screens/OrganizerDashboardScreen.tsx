import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { useOrganizerDashboard } from "../query/useOrganizerDashboard";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { OrganizerDashboardDto, OrganizerExhibitionCardDto, OrganizerKpiCardDto } from "../types/api";
import type { ExhibitionStatus } from "../types/models";

type OrganizerDashboardScreenProps = Readonly<{
  onCreateExhibition: () => void;
  onEditExhibition: (exhibitionId: string) => void;
  onOpenFormBuilder: (exhibitionId: string) => void;
  onOpenSubmissions: (exhibitionId: string) => void;
}>;

type DashboardFilter = ExhibitionStatus | "ALL";

const statusOptions: Array<Readonly<{ key: DashboardFilter; label: string }>> = [
  { key: "ALL", label: "All" },
  { key: "PUBLISHED", label: "Published" },
  { key: "REVIEW", label: "Review" },
  { key: "DRAFT", label: "Draft" },
];

function toKpiTone(tone: OrganizerKpiCardDto["tone"]): "neutral" | "warning" | "success" {
  if (tone === "alert") {
    return "warning";
  }

  if (tone === "success") {
    return "success";
  }

  return "neutral";
}

function formatStatusLabel(status: OrganizerExhibitionCardDto["status"]) {
  return status.toLowerCase();
}

function getHeroCopy(data: OrganizerDashboardDto) {
  if (data.urgentQueueCount > 0) {
    return "Queue work is active. Start with urgent submissions, then fan back out to form or publishing tasks.";
  }

  return "Dashboard is healthy. Use this window to refine briefs, field design, and publishing cadence before the next queue spike.";
}

export function OrganizerDashboardScreen({
  onCreateExhibition,
  onEditExhibition,
  onOpenFormBuilder,
  onOpenSubmissions,
}: OrganizerDashboardScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<DashboardFilter>("ALL");
  const dashboardQuery = useOrganizerDashboard(true);

  const visibleExhibitions = useMemo(() => {
    if (!dashboardQuery.data) {
      return [];
    }

    if (selectedStatus === "ALL") {
      return dashboardQuery.data.exhibitions;
    }

    return dashboardQuery.data.exhibitions.filter((item) => item.status === selectedStatus);
  }, [dashboardQuery.data, selectedStatus]);

  if (dashboardQuery.isLoading) {
    return (
      <ScreenShell title="Organizer Dashboard" subtitle="Loading queue, session, and exhibition aggregates from the command-center API.">
        <StatusChip label="Loading dashboard" tone="neutral" />
      </ScreenShell>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <ScreenShell title="Organizer Dashboard" subtitle="The organizer aggregate surface could not be restored.">
        <ErrorRecoveryPanel
          description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "Organizer dashboard could not be loaded."}
          onRetry={() => dashboardQuery.refetch()}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Organizer Dashboard" subtitle="Monitor queue health, session pressure, and exhibition shortcuts from the same workflow data used by the organizer pipeline.">
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Command center</Text>
        <Text style={styles.heroTitle}>{getHeroCopy(dashboardQuery.data)}</Text>
        <Text style={styles.heroCopy}>{dashboardQuery.data.sessionLoadSummary}</Text>
        <View style={styles.heroStatusRow}>
          <StatusChip label={`${dashboardQuery.data.urgentQueueCount} urgent`} tone={dashboardQuery.data.urgentQueueCount > 0 ? "warning" : "success"} />
          <StatusChip label={`${dashboardQuery.data.exhibitions.length} exhibitions`} tone="neutral" />
        </View>
        <Pressable style={styles.primaryButton} onPress={onCreateExhibition}>
          <Text style={styles.primaryButtonText}>Create exhibition draft</Text>
        </Pressable>
      </View>

      <View style={styles.kpiGrid}>
        {dashboardQuery.data.kpis.map((kpi) => (
          <View key={kpi.label} style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            <StatusChip label={kpi.tone ?? "neutral"} tone={toKpiTone(kpi.tone)} />
          </View>
        ))}
      </View>

      <View style={styles.queueCard}>
        <Text style={styles.sectionTitle}>Urgent queue</Text>
        <Text style={styles.queueCount}>{dashboardQuery.data.urgentQueueCount}</Text>
        <Text style={styles.heroCopy}>Pending or waitlisted items that will likely need organizer attention first.</Text>
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

      {visibleExhibitions.length === 0 ? (
        <EmptyStateBanner
          title="No exhibitions in this filter"
          description="Clear the current filter or create a new exhibition draft to reopen the organizer command center."
          actionLabel="Create exhibition draft"
          onAction={onCreateExhibition}
        />
      ) : null}

      {visibleExhibitions.map((exhibition) => (
        <View key={exhibition.exhibitionId} style={styles.card}>
          <View style={styles.badgeRow}>
            <Text style={styles.typeBadge}>{formatStatusLabel(exhibition.status)}</Text>
            <StatusChip label={`${exhibition.pendingCount} pending`} tone={exhibition.pendingCount > 0 ? "warning" : "neutral"} />
          </View>
          <Text style={styles.cardTitle}>{exhibition.title}</Text>
          <Text style={styles.cardMeta}>{exhibition.venueTitle ?? "Venue pending"}</Text>
          <Text style={styles.cardMeta}>{exhibition.checkedInCount} checked-in · {exhibition.nextAction ?? "No next action"}</Text>
          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={() => onEditExhibition(exhibition.exhibitionId)}>
              <Text style={styles.secondaryButtonText}>Edit brief</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => onOpenFormBuilder(exhibition.exhibitionId)}>
              <Text style={styles.secondaryButtonText}>Field map</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => onOpenSubmissions(exhibition.exhibitionId)}>
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700"
  },
  heroCopy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  heroStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
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
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  kpiCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  kpiValue: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  kpiLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  queueCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  sectionTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  queueCount: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
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
  cardTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700"
  },
  cardMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
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