import { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ApiError } from "../api/client";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { useSubmissionReview } from "../query/useSubmissionReview";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { QueueSessionWorkloadDto, SubmissionDecisionAction, SubmissionReviewDto } from "../types/api";
import type { RegistrationStatus } from "../types/models";

type SubmissionReviewScreenProps = Readonly<{
  exhibitionId: string;
}>;

function formatStatusLabel(status: RegistrationStatus) {
  return status.replace("_", " ").toLowerCase();
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

function formatRelativeLabel(value: string) {
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return value;
  }
}

function getActionLabel(action: SubmissionDecisionAction) {
  if (action === "APPROVE") {
    return "Approve";
  }

  if (action === "WAITLIST") {
    return "Move to waitlist";
  }

  if (action === "CHECK_IN") {
    return "Check in attendee";
  }

  return "Reject";
}

function getActionTone(action: SubmissionDecisionAction): "primary" | "secondary" | "danger" {
  if (action === "REJECT") {
    return "danger";
  }

  if (action === "WAITLIST") {
    return "secondary";
  }

  return "primary";
}

function getReviewErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "SESSION_FULL") {
      return "The session is full. Move this attendee to the waitlist instead.";
    }

    if (error.code === "WAITLIST_FULL") {
      return "The waitlist is full for this session.";
    }

    if (error.code === "CHECK_IN_REQUIRES_CONFIRMATION") {
      return "Approve this attendee before checking them in.";
    }
  }

  return error instanceof Error ? error.message : "The organizer decision could not be saved.";
}

function LoadingReviewScreen() {
  return (
    <ScreenShell>
      <StatusChip label="Loading review board" tone="neutral" />
    </ScreenShell>
  );
}

function ReviewErrorScreen({ description, onRetry }: Readonly<{ description: string; onRetry: () => void }>) {
  return (
    <ScreenShell>
      <ErrorRecoveryPanel description={description} onRetry={onRetry} />
    </ScreenShell>
  );
}

function SessionWorkloadPanel({ sessions }: Readonly<{ sessions: QueueSessionWorkloadDto[] }>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Session workload</Text>
      {sessions.map((session) => (
        <View key={session.sessionId} style={styles.answerCard}>
          <Text style={styles.answerValue}>{session.sessionLabel}</Text>
          <Text style={styles.helper}>{session.reservedCount}/{session.capacity} reserved · {session.pendingCount} pending · {session.waitlistedCount} waitlist</Text>
        </View>
      ))}
    </View>
  );
}

function SubmissionCardsPanel({
  queueCards,
  selectedRegistrationId,
  onSelect,
}: Readonly<{
  queueCards: SubmissionReviewDto["queueCards"];
  selectedRegistrationId: string | undefined;
  onSelect: (registrationId: string) => void;
}>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Attendee cards</Text>
      {queueCards.map((submission) => (
        <Pressable
          key={submission.registrationId}
          onPress={() => onSelect(submission.registrationId)}
          style={[styles.submissionCard, selectedRegistrationId === submission.registrationId && styles.submissionCardActive]}
        >
          <View style={styles.submissionHeader}>
            <Text style={[styles.submissionTitle, selectedRegistrationId === submission.registrationId && styles.submissionTitleActive]}>{submission.attendeeName}</Text>
            <StatusChip label={formatStatusLabel(submission.status)} tone={getStatusTone(submission.status)} />
          </View>
          <Text style={[styles.submissionMeta, selectedRegistrationId === submission.registrationId && styles.submissionMetaActive]}>{submission.sessionLabel}</Text>
          <Text style={[styles.submissionMeta, selectedRegistrationId === submission.registrationId && styles.submissionMetaActive]}>Submitted {formatRelativeLabel(submission.submittedAt)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SubmissionDetailPanel({
  selectedSubmission,
  pendingAction,
  isError,
  error,
  onAction,
}: Readonly<{
  selectedSubmission: NonNullable<SubmissionReviewDto["selectedSubmission"]>;
  pendingAction: SubmissionDecisionAction | null;
  isError: boolean;
  error: unknown;
  onAction: (action: SubmissionDecisionAction) => void;
}>) {
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <View style={styles.detailTitleRow}>
          <Text style={styles.detailTitle}>{selectedSubmission.attendeeName}</Text>
          <StatusChip label={formatStatusLabel(selectedSubmission.status)} tone={getStatusTone(selectedSubmission.status)} />
        </View>
        <Text style={styles.detailMeta}>{selectedSubmission.sessionLabel}</Text>
        <Text style={styles.detailMeta}>Submitted {formatRelativeLabel(selectedSubmission.submittedAt)}</Text>
        {selectedSubmission.checkedInAt ? <Text style={styles.detailMeta}>Checked in {formatRelativeLabel(selectedSubmission.checkedInAt)}</Text> : null}
      </View>

      {selectedSubmission.note || selectedSubmission.stampNotice || selectedSubmission.answers.length > 0 ? (
        <View style={styles.detailContent}>
          {selectedSubmission.note ? (
            <View style={styles.noteBlock}>
              <Text style={styles.noteLabel}>Note</Text>
              <Text style={styles.noteText}>{selectedSubmission.note}</Text>
            </View>
          ) : null}
          {selectedSubmission.stampNotice ? (
            <View style={styles.stampNoticeBlock}>
              <Text style={styles.stampNoticeText}>{selectedSubmission.stampNotice}</Text>
            </View>
          ) : null}
          
          <View style={styles.answerStack}>
            {selectedSubmission.answers.map((answer) => (
              <View key={`${selectedSubmission.registrationId}-${answer.label}`} style={styles.answerRow}>
                <Text style={styles.answerLabel}>{answer.label}</Text>
                <Text style={styles.answerValue}>{answer.value}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.detailActionsBlock}>
        <Text style={styles.detailActionsTitle}>Decision Actions</Text>
        <View style={styles.optionRow}>
          {selectedSubmission.availableActions.map((action) => {
            const tone = getActionTone(action);

            return (
              <Pressable
                key={action}
                onPress={() => onAction(action)}
                disabled={pendingAction !== null}
                style={[
                  styles.statusChip,
                  tone === "primary" && styles.statusChipActive,
                  tone === "secondary" && styles.statusChipSecondary,
                  tone === "danger" && styles.statusChipDanger,
                  pendingAction !== null && styles.statusChipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    tone === "primary" && styles.statusChipTextActive,
                    tone === "danger" && styles.statusChipTextActive,
                  ]}
                >
                  {pendingAction === action ? "Saving..." : getActionLabel(action)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {isError ? <Text style={styles.errorText}>{getReviewErrorMessage(error)}</Text> : null}
      </View>
    </View>
  );
}

export function SubmissionReviewScreen({ exhibitionId }: SubmissionReviewScreenProps) {
  const { reviewQuery, selectedRegistrationId, setSelectedRegistrationId, updateDecisionMutation } = useSubmissionReview(exhibitionId);
  const [pendingAction, setPendingAction] = useState<SubmissionDecisionAction | null>(null);

  if (reviewQuery.isLoading) {
    return <LoadingReviewScreen />;
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <ReviewErrorScreen
        description={reviewQuery.error instanceof Error ? reviewQuery.error.message : "Submission review could not be loaded."}
        onRetry={() => reviewQuery.refetch()}
      />
    );
  }

  if (reviewQuery.data.queueCards.length === 0) {
    return (
      <ScreenShell>
        <EmptyStateBanner
          title="Queue is empty"
          description="Return to the pipeline to monitor other exhibitions, or wait for new registrations to enter this board."
        />
      </ScreenShell>
    );
  }

  const selectedSubmission = reviewQuery.data.selectedSubmission;

  const handleActionPress = async (action: SubmissionDecisionAction) => {
    if (!selectedSubmission) {
      return;
    }

    try {
      setPendingAction(action);
      await updateDecisionMutation.mutateAsync({ registrationId: selectedSubmission.registrationId, action });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <ScreenShell>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{reviewQuery.data.exhibitionTitle}</Text>
        <Text style={styles.heroTitle}>{reviewQuery.data.queueCards.length} registrations in this board</Text>
        <Text style={styles.helper}>{reviewQuery.data.venueTitle ?? "Venue pending"}</Text>
        <View style={styles.optionRow}>
          <StatusChip label={`${reviewQuery.data.statusCounts.pending} pending`} tone={reviewQuery.data.statusCounts.pending > 0 ? "warning" : "neutral"} />
          <StatusChip label={`${reviewQuery.data.statusCounts.waitlisted} waitlist`} tone={reviewQuery.data.statusCounts.waitlisted > 0 ? "warning" : "neutral"} />
          <StatusChip label={`${reviewQuery.data.statusCounts.checkedIn} checked-in`} tone={reviewQuery.data.statusCounts.checkedIn > 0 ? "success" : "neutral"} />
        </View>
      </View>

      <SessionWorkloadPanel sessions={reviewQuery.data.sessionWorkload} />

      <SubmissionCardsPanel
        queueCards={reviewQuery.data.queueCards}
        selectedRegistrationId={selectedRegistrationId}
        onSelect={setSelectedRegistrationId}
      />

      {selectedSubmission ? (
        <SubmissionDetailPanel
          selectedSubmission={selectedSubmission}
          pendingAction={pendingAction}
          isError={updateDecisionMutation.isError}
          error={updateDecisionMutation.error}
          onAction={(action) => void handleActionPress(action)}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
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
  submissionCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: spacing.xs
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  submissionCardActive: {
    backgroundColor: palette.text
  },
  submissionTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700"
  },
  submissionTitleActive: {
    color: palette.background
  },
  submissionMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13
  },
  submissionMetaActive: {
    color: palette.backgroundAlt
  },
  detailTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700"
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  statusChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  statusChipActive: {
    backgroundColor: palette.accent
  },
  statusChipSecondary: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1
  },
  statusChipDanger: {
    backgroundColor: "#991b1b"
  },
  statusChipDisabled: {
    opacity: 0.5
  },
  statusChipText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  },
  statusChipTextActive: {
    color: palette.white
  },
  answerStack: {
    gap: spacing.xs
  },
  answerCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: spacing.xs
  },
  answerLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  answerValue: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20
  },
  errorText: {
    color: "#991b1b",
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  },
  helper: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  },
  detailCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  detailHeader: {
    padding: spacing.md,
    backgroundColor: palette.cardStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  detailTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  detailMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  detailContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  noteBlock: {
    backgroundColor: palette.muted,
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  noteLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noteText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  stampNoticeBlock: {
    backgroundColor: "rgba(111, 77, 103, 0.1)", // accent soft
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(111, 77, 103, 0.2)",
  },
  stampNoticeText: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  detailActionsBlock: {
    padding: spacing.md,
    backgroundColor: palette.backgroundAlt,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    gap: spacing.md,
  },
  detailActionsTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});