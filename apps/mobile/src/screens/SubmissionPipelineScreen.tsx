import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { useSubmissionPipeline } from "../query/useSubmissionPipeline";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { QueueCountsDto } from "../types/api";
import type { RegistrationStatus } from "../types/models";

type SubmissionPipelineScreenProps = Readonly<{
  onOpenSubmissions: (exhibitionId: string) => void;
}>;

type PipelineFilter = "ALL" | RegistrationStatus;

const filterOptions: Array<Readonly<{ key: PipelineFilter; label: string }>> = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "WAITLISTED", label: "Waitlist" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "CHECKED_IN", label: "Checked-in" },
  { key: "REJECTED", label: "Rejected" },
];

function getFilterCount(statusCounts: QueueCountsDto, filter: PipelineFilter) {
  if (filter === "ALL") {
    return statusCounts.pending + statusCounts.confirmed + statusCounts.waitlisted + statusCounts.checkedIn + statusCounts.rejected;
  }

  if (filter === "PENDING") {
    return statusCounts.pending;
  }

  if (filter === "CONFIRMED") {
    return statusCounts.confirmed;
  }

  if (filter === "WAITLISTED") {
    return statusCounts.waitlisted;
  }

  if (filter === "CHECKED_IN") {
    return statusCounts.checkedIn;
  }

  return statusCounts.rejected;
}

function LoadingPipelineScreen() {
  return (
    <ScreenShell title="Submission pipeline" subtitle="Loading pipeline data.">
      <StatusChip label="Loading pipeline" tone="neutral" />
    </ScreenShell>
  );
}

function PipelineErrorScreen({ description, onRetry }: Readonly<{ description: string; onRetry: () => void }>) {
  return (
    <ScreenShell title="Submission pipeline" subtitle="Pipeline data is unavailable.">
      <ErrorRecoveryPanel description={description} onRetry={onRetry} />
    </ScreenShell>
  );
}

export function SubmissionPipelineScreen({ onOpenSubmissions }: SubmissionPipelineScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<PipelineFilter>("ALL");
  const pipelineQuery = useSubmissionPipeline(true);

  const visibleBoards = useMemo(() => {
    if (!pipelineQuery.data) {
      return [];
    }

    return pipelineQuery.data.boards.filter((board) => selectedFilter === "ALL" || board.queueCards.some((card) => card.status === selectedFilter));
  }, [pipelineQuery.data, selectedFilter]);

  if (pipelineQuery.isLoading) {
    return <LoadingPipelineScreen />;
  }

  if (pipelineQuery.isError || !pipelineQuery.data) {
    return (
      <PipelineErrorScreen
        description={pipelineQuery.error instanceof Error ? pipelineQuery.error.message : "Submission pipeline could not be loaded."}
        onRetry={() => pipelineQuery.refetch()}
      />
    );
  }

  return (
    <ScreenShell eyebrow="Organizer flow" title="Submission pipeline" subtitle="Scan queue counts fast.">
      <View style={styles.card}>
        <Text style={styles.metricLabel}>Queue operations</Text>
        <Text style={styles.metricValue}>{pipelineQuery.data.urgentQueueCount}</Text>
        <Text style={styles.cardMeta}>Pending and waitlisted visitors stay at the front of the queue.</Text>
        <View style={styles.metricRow}>
          <StatusChip label={`${pipelineQuery.data.statusCounts.pending} pending`} tone={pipelineQuery.data.statusCounts.pending > 0 ? "warning" : "neutral"} />
          <StatusChip label={`${pipelineQuery.data.statusCounts.waitlisted} waitlist`} tone={pipelineQuery.data.statusCounts.waitlisted > 0 ? "warning" : "neutral"} />
          <StatusChip label={`${pipelineQuery.data.statusCounts.checkedIn} checked-in`} tone={pipelineQuery.data.statusCounts.checkedIn > 0 ? "success" : "neutral"} />
        </View>
      </View>

      <View style={styles.filterRow}>
        {filterOptions.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => setSelectedFilter(option.key)}
            style={[styles.filterChip, selectedFilter === option.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedFilter === option.key && styles.filterChipTextActive]}>
              {option.label} · {getFilterCount(pipelineQuery.data.statusCounts, option.key)}
            </Text>
          </Pressable>
        ))}
      </View>

      {visibleBoards.length === 0 ? (
        <EmptyStateBanner
          title="No submissions in this filter"
          description="Switch filters to review another queue stage."
        />
      ) : null}

      {visibleBoards.map((board) => (
        <View key={board.exhibitionId} style={styles.card}>
          <Text style={styles.cardTitle}>{board.exhibitionTitle}</Text>
          <Text style={styles.cardMeta}>{board.venueTitle ?? "Venue pending"}</Text>
          <View style={styles.metricRow}>
            <StatusChip label={`${board.statusCounts.pending} pending`} tone={board.statusCounts.pending > 0 ? "warning" : "neutral"} />
            <StatusChip label={`${board.statusCounts.confirmed} confirmed`} tone="neutral" />
            <StatusChip label={`${board.statusCounts.waitlisted} waitlist`} tone={board.statusCounts.waitlisted > 0 ? "warning" : "neutral"} />
            <StatusChip label={`${board.statusCounts.checkedIn} checked-in`} tone={board.statusCounts.checkedIn > 0 ? "success" : "neutral"} />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => onOpenSubmissions(board.exhibitionId)}>
            <Text style={styles.primaryButtonText}>Open review board</Text>
          </Pressable>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: "hidden"
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
    fontSize: 13
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  metricValue: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700"
  },
  metricLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
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
  primaryButton: {
    alignSelf: "flex-start",
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center"
  },
  primaryButtonText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  }
});