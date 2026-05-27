import { StyleSheet, Text, View } from "react-native";
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
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {visits.length === 0 ? (
        <Text style={styles.bodyCopy}>{emptyDescription}</Text>
      ) : (
        <View style={styles.listContainer}>
          {visits.map((visit, index) => (
            <View key={visit.registrationId}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.visitRow}>
                <View style={styles.visitInfo}>
                  <Text style={styles.visitTitle}>{visit.exhibitionTitle}</Text>
                  <Text style={styles.visitMeta}>{visit.sessionLabel}</Text>
                </View>
                <StatusChip label={visit.status.toLowerCase()} tone={visit.status === "WAITLISTED" ? "warning" : "success"} />
              </View>
            </View>
          ))}
        </View>
      )}
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

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Membership</Text>
          <Text style={styles.detailValue}>{liveProfile?.membershipLabel ?? profile.membershipLabel ?? "Member"}</Text>
        </View>
        <View style={styles.dividerDetail} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{liveProfile?.city ?? profile.city ?? "City not set"}</Text>
        </View>
        <View style={styles.dividerDetail} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Accessibility</Text>
          <Text style={styles.detailValue}>{liveProfile?.accessibilityNotes?.trim() ? liveProfile.accessibilityNotes : "Not configured"}</Text>
        </View>
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
  listContainer: {
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginBottom: spacing.md,
  },
  visitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  visitInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  visitTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 16,
    lineHeight: 22,
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
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  detailLabel: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  detailValue: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  dividerDetail: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.xs,
  },
});