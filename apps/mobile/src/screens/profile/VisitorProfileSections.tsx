import { StyleSheet, Text, View } from "react-native";
import { EmptyStateBanner } from "../../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../../components/ErrorRecoveryPanel";
import { StatusChip } from "../../components/StatusChip";
import { useVisitorProfile } from "../../query/useVisitorProfile";
import { palette, radii, spacing, typography } from "../../theme/tokens";
import type { VisitorVisitSummaryDto } from "../../types/api";
import type { UserProfile } from "../../types/models";

type VisitorProfileSectionsProps = Readonly<{
  profile: UserProfile;
}>;

function VisitList({
  emptyDescription,
  title,
  visits,
}: Readonly<{
  emptyDescription: string;
  title: string;
  visits: VisitorVisitSummaryDto[];
}>) {
  if (!visits.length) {
    return <EmptyStateBanner title={title} description={emptyDescription} />;
  }

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {visits.map((visit) => (
        <View key={visit.registrationId} style={styles.visitCard}>
          <Text style={styles.visitTitle}>{visit.exhibitionTitle}</Text>
          <Text style={styles.visitMeta}>{visit.sessionLabel}</Text>
          <StatusChip label={visit.status.toLowerCase()} tone={visit.status === "WAITLISTED" ? "warning" : "success"} />
        </View>
      ))}
    </View>
  );
}

export function VisitorProfileSections({ profile }: VisitorProfileSectionsProps) {
  const visitorProfileQuery = useVisitorProfile(true);

  if (visitorProfileQuery.isLoading) {
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Visitor workspace</Text>
        <StatusChip label="Loading live profile" tone="neutral" />
      </View>
    );
  }

  if (visitorProfileQuery.isError || !visitorProfileQuery.data) {
    return (
      <ErrorRecoveryPanel
        description={visitorProfileQuery.error instanceof Error ? visitorProfileQuery.error.message : "Visitor workspace could not be restored."}
        onRetry={() => visitorProfileQuery.refetch()}
      />
    );
  }

  const liveProfile = visitorProfileQuery.data.visitorProfile;
  const completionTone = liveProfile?.accessibilityNotes?.trim() ? "success" : "warning";

  return (
    <>
      <View style={styles.statusRow}>
        <StatusChip label={`${visitorProfileQuery.data.upcomingVisits.length} upcoming`} tone="neutral" />
        <StatusChip label={`${visitorProfileQuery.data.pastVisits.length} past`} tone="neutral" />
        <StatusChip label={liveProfile?.accessibilityNotes?.trim() ? "Accessibility ready" : "Profile incomplete"} tone={completionTone} />
      </View>

      <VisitList
        title="Upcoming visits"
        visits={visitorProfileQuery.data.upcomingVisits}
        emptyDescription="Book a live session from the exhibition detail screen and it will appear here immediately."
      />

      <VisitList
        title="Past activity"
        visits={visitorProfileQuery.data.pastVisits}
        emptyDescription="Past attendance will appear here after checked-in sessions start syncing into the visitor timeline."
      />



      {liveProfile?.accessibilityNotes?.trim() ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Accessibility notes</Text>
          <Text style={styles.bodyCopy}>{liveProfile.accessibilityNotes}</Text>
        </View>
      ) : (
        <EmptyStateBanner
          title="Accessibility notes missing"
          description="This visitor profile has not saved accessibility details yet. Keep this explicit so organizers do not assume the profile is complete."
        />
      )}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Membership snapshot</Text>
        <Text style={styles.bodyCopy}>{liveProfile?.membershipLabel ?? profile.membershipLabel ?? "Member"}</Text>
        <Text style={styles.preferenceDescription}>{liveProfile?.city ?? profile.city ?? "City not set"}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  sectionCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
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
  visitCard: {
    gap: spacing.xs,
    backgroundColor: palette.cardStrong,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  visitTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  visitMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  preferenceDescription: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  bodyCopy: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },

});