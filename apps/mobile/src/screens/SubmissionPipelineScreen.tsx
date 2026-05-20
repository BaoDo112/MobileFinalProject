import { useMemo, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { useSubmissionPipeline } from "../query/useSubmissionPipeline";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { ExhibitionQueueBoardDto, QueueCountsDto, QueueSessionWorkloadDto } from "../types/api";
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

function formatStatusLabel(status: RegistrationStatus) {
  return status.replace("_", " ").toLowerCase();
}

function formatSubmittedAt(value: string) {
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return value;
  }
}

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

function getStatusTone(status: RegistrationStatus): "neutral" | "success" | "warning" | "danger" {
  if (status === "CHECKED_IN") {
    return "success";
  }

  if (status === "REJECTED") {
    return "danger";
  }

  if (status === "PENDING" || status === "WAITLISTED") {
    return "warning";
  }

  return "neutral";
}

function getSessionTone(session: QueueSessionWorkloadDto): "neutral" | "success" | "warning" {
  if (session.pendingCount > 0 || session.waitlistedCount > 0) {
    return "warning";
  }

  if (session.checkedInCount > 0) {
    return "success";
  }

  return "neutral";
}

function LoadingPipelineScreen() {
  return (
    <ScreenShell title="Submission pipeline" subtitle="Loading live queue counts, waitlist pressure, and session workload from organizer registration data.">
      <StatusChip label="Loading pipeline" tone="neutral" />
    </ScreenShell>
  );
}

function PipelineErrorScreen({ description, onRetry }: Readonly<{ description: string; onRetry: () => void }>) {
  return (
    <ScreenShell title="Submission pipeline" subtitle="The organizer queue surface could not be restored.">
      <ErrorRecoveryPanel description={description} onRetry={onRetry} />
    </ScreenShell>
  );
}

function SessionWorkloadPanel({ sessions }: Readonly<{ sessions: QueueSessionWorkloadDto[] }>) {
  return (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Session workload</Text>
      <View style={styles.workloadGrid}>
        {sessions.map((session) => (
          <View key={session.sessionId} style={styles.metricCard}>
            <View style={styles.workloadHeader}>
              <Text style={styles.workloadTitle}>{session.sessionLabel}</Text>
              <StatusChip label={`${session.reservedCount}/${session.capacity}`} tone={getSessionTone(session)} />
            </View>
            <Text style={styles.cardMeta}>{session.pendingCount} pending · {session.waitlistedCount} waitlist · {session.checkedInCount} checked-in</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function WaitlistSummaryPanel({ board }: Readonly<{ board: ExhibitionQueueBoardDto }>) {
  if (board.waitlistSummary.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Waitlist pressure</Text>
      {board.waitlistSummary.map((summary) => (
        <View key={summary.sessionId} style={styles.metricCard}>
          <Text style={styles.workloadTitle}>{summary.sessionLabel}</Text>
          <Text style={styles.cardMeta}>{formatWaitlistSummary(summary.waitlistedCount, summary.remainingWaitlistCapacity)}</Text>
        </View>
      ))}
    </View>
  );
}

function formatWaitlistSummary(waitlistedCount: number, remainingWaitlistCapacity: number | undefined) {
  if (remainingWaitlistCapacity === undefined) {
    return `${waitlistedCount} waiting`;
  }

  return `${waitlistedCount} waiting · ${remainingWaitlistCapacity} slots left`;
}

function QueuePreviewList({
  board,
  selectedFilter,
  onOpenSubmissions,
}: Readonly<{
  board: ExhibitionQueueBoardDto;
  selectedFilter: PipelineFilter;
  onOpenSubmissions: (exhibitionId: string) => void;
}>) {
  const visibleCards = board.queueCards.filter((card) => selectedFilter === "ALL" || card.status === selectedFilter).slice(0, 3);

  if (visibleCards.length === 0) {
    return (
      <EmptyStateBanner
        title="No queue cards in this filter"
        description="Switch filters or open the review board to inspect the rest of this exhibition workload."
        actionLabel="Open review board"
        onAction={() => onOpenSubmissions(board.exhibitionId)}
      />
    );
  }

  return (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Queue preview</Text>
      {visibleCards.map((card) => (
        <View key={card.registrationId} style={styles.metricCard}>
          <View style={styles.workloadHeader}>
            <Text style={styles.workloadTitle}>{card.attendeeName}</Text>
            <StatusChip label={formatStatusLabel(card.status)} tone={getStatusTone(card.status)} />
          </View>
          <Text style={styles.cardMeta}>{card.sessionLabel}</Text>
          <Text style={styles.cardMeta}>Submitted {formatSubmittedAt(card.submittedAt)}</Text>
          {card.note ? <Text style={styles.queueNote}>{card.note}</Text> : null}
        </View>
      ))}
      <Pressable style={styles.primaryButton} onPress={() => onOpenSubmissions(board.exhibitionId)}>
        <Text style={styles.primaryButtonText}>Open review board</Text>
      </Pressable>
    </View>
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
    <ScreenShell
      eyebrow="Organizer flow"
      title="Submission pipeline"
      subtitle="Scan status counts, session pressure, and waitlist hotspots from the same registration model used by booking and dashboard."
    >
      <View style={styles.card}>
        <Text style={styles.metricLabel}>Queue operations</Text>
        <Text style={styles.metricValue}>{pipelineQuery.data.urgentQueueCount}</Text>
        <Text style={styles.cardMeta}>Pending and waitlisted visitors are prioritized here so queue work stays visible before attendance and post-visit flows.</Text>
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
          description="Switch filters to review another queue stage. Once new registrations arrive, they will appear here automatically."
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
          <SessionWorkloadPanel sessions={board.sessionWorkload} />
          <WaitlistSummaryPanel board={board} />
          <QueuePreviewList board={board} selectedFilter={selectedFilter} onOpenSubmissions={onOpenSubmissions} />
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
  metricCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: spacing.xs
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
  sectionStack: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  workloadGrid: {
    gap: spacing.sm,
  },
  workloadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  workloadTitle: {
    flex: 1,
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  queueNote: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
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
  }
});