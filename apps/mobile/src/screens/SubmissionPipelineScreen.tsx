import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { OrganizerExhibition, Submission } from "../types/models";

type SubmissionPipelineScreenProps = Readonly<{
  exhibitions: OrganizerExhibition[];
  submissionsByExhibition: Record<string, Submission[]>;
  onOpenSubmissions: (exhibitionId: string) => void;
}>;

export function SubmissionPipelineScreen({ exhibitions, submissionsByExhibition, onOpenSubmissions }: SubmissionPipelineScreenProps) {
  return (
    <ScreenShell
      eyebrow="Organizer flow"
      title="Submission pipeline"
      subtitle="A dedicated tab keeps review work visible instead of burying it under the exhibition editor."
    >
      {exhibitions.map((exhibition) => {
        const submissions = submissionsByExhibition[exhibition.id] ?? [];
        const pending = submissions.filter((item) => item.status === "pending").length;
        const confirmed = submissions.filter((item) => item.status === "confirmed").length;
        const checkedIn = submissions.filter((item) => item.status === "checked-in").length;

        return (
          <View key={exhibition.id} style={styles.card}>
            <View style={[styles.accentBar, { backgroundColor: exhibition.accent }]} />
            <Text style={styles.cardTitle}>{exhibition.title}</Text>
            <Text style={styles.cardMeta}>{exhibition.venue}</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricCard}><Text style={styles.metricValue}>{pending}</Text><Text style={styles.metricLabel}>Pending</Text></View>
              <View style={styles.metricCard}><Text style={styles.metricValue}>{confirmed}</Text><Text style={styles.metricLabel}>Confirmed</Text></View>
              <View style={styles.metricCard}><Text style={styles.metricValue}>{checkedIn}</Text><Text style={styles.metricLabel}>Checked-in</Text></View>
            </View>
            <Pressable style={styles.primaryButton} onPress={() => onOpenSubmissions(exhibition.id)}>
              <Text style={styles.primaryButtonText}>Open review board</Text>
            </Pressable>
          </View>
        );
      })}
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
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6
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
    gap: spacing.sm
  },
  metricCard: {
    flex: 1,
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
  primaryButton: {
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center"
  },
  primaryButtonText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  }
});