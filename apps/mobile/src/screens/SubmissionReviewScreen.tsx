import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { OrganizerExhibition, Submission, SubmissionStatus } from "../types/models";

type SubmissionReviewScreenProps = Readonly<{
  exhibition?: OrganizerExhibition;
  submissions: Submission[];
}>;

export function SubmissionReviewScreen({ exhibition, submissions }: SubmissionReviewScreenProps) {
  const [statuses, setStatuses] = useState<Record<string, SubmissionStatus>>(
    () => Object.fromEntries(submissions.map((item) => [item.id, item.status])) as Record<string, SubmissionStatus>
  );
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(submissions[0]?.id ?? "");

  if (!exhibition) {
    return (
      <ScreenShell eyebrow="Organizer flow" title="Submission review" subtitle="Exhibition was not found.">
        <Text style={styles.helper}>Open a submission board from the organizer dashboard or pipeline tab.</Text>
      </ScreenShell>
    );
  }

  const selectedSubmission = submissions.find((item) => item.id === selectedSubmissionId) ?? submissions[0];

  return (
    <ScreenShell
      eyebrow="Organizer flow"
      title="Submission review"
      subtitle="Confirm attendance states and keep the eventual stamp handoff legible from the same mobile surface."
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{exhibition.title}</Text>
        <Text style={styles.heroTitle}>{submissions.length} submissions in this board</Text>
        <Text style={styles.helper}>Switch between attendee cards, then mark them pending, confirmed, or checked-in.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Attendee cards</Text>
        {submissions.map((submission) => (
          <Pressable
            key={submission.id}
            onPress={() => setSelectedSubmissionId(submission.id)}
            style={[styles.submissionCard, selectedSubmissionId === submission.id && styles.submissionCardActive]}
          >
            <Text style={[styles.submissionTitle, selectedSubmissionId === submission.id && styles.submissionTitleActive]}>{submission.attendeeName}</Text>
            <Text style={[styles.submissionMeta, selectedSubmissionId === submission.id && styles.submissionTitleActive]}>{submission.timeslot} · {statuses[submission.id]}</Text>
          </Pressable>
        ))}
      </View>

      {selectedSubmission ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Selected attendee</Text>
          <Text style={styles.detailTitle}>{selectedSubmission.attendeeName}</Text>
          <Text style={styles.helper}>{selectedSubmission.timeslot} · submitted {selectedSubmission.submittedAt}</Text>
          <Text style={styles.helper}>{selectedSubmission.note}</Text>
          <View style={styles.optionRow}>
            {(["pending", "confirmed", "checked-in"] as SubmissionStatus[]).map((status) => (
              <Pressable
                key={status}
                onPress={() => setStatuses((current) => ({ ...current, [selectedSubmission.id]: status }))}
                style={[styles.statusChip, statuses[selectedSubmission.id] === status && styles.statusChipActive]}
              >
                <Text style={[styles.statusChipText, statuses[selectedSubmission.id] === status && styles.statusChipTextActive]}>{status}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.answerStack}>
            {selectedSubmission.answers.map((answer) => (
              <View key={answer.label} style={styles.answerCard}>
                <Text style={styles.answerLabel}>{answer.label}</Text>
                <Text style={styles.answerValue}>{answer.value}</Text>
              </View>
            ))}
          </View>
        </View>
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
  helper: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  }
});