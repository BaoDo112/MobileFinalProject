import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { profileApi } from "../../api/profile";
import { ErrorRecoveryPanel } from "../../components/ErrorRecoveryPanel";
import { StatusChip } from "../../components/StatusChip";
import { palette, radii, spacing, typography } from "../../theme/tokens";
import type { UserProfile } from "../../types/models";

type OrganizerProfileSectionsProps = Readonly<{
  profile: UserProfile;
}>;

function getSettingsErrorMessage(notificationsError: unknown) {
  if (notificationsError instanceof Error) {
    return notificationsError.message;
  }

  return "Organizer settings could not be restored.";
}

function QueueHealthSection({
  confirmed,
  checkedIn,
  digestCadenceLabel,
  pending,
  reminderWindowLabel,
  waitlisted,
}: Readonly<{
  confirmed: number;
  checkedIn: number;
  digestCadenceLabel: string;
  pending: number;
  reminderWindowLabel: string;
  waitlisted: number;
}>) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Queue health</Text>
      <View style={styles.queueGrid}>
        <View style={styles.queueCell}>
          <Text style={styles.queueValue}>{pending}</Text>
          <Text style={styles.queueLabel}>Pending</Text>
        </View>
        <View style={styles.queueCell}>
          <Text style={styles.queueValue}>{waitlisted}</Text>
          <Text style={styles.queueLabel}>Waitlisted</Text>
        </View>
        <View style={styles.queueCell}>
          <Text style={styles.queueValue}>{confirmed}</Text>
          <Text style={styles.queueLabel}>Confirmed</Text>
        </View>
        <View style={styles.queueCell}>
          <Text style={styles.queueValue}>{checkedIn}</Text>
          <Text style={styles.queueLabel}>Checked-in</Text>
        </View>
      </View>
      <Text style={styles.supportDescription}>{reminderWindowLabel}</Text>
      <Text style={styles.supportDescription}>{digestCadenceLabel}</Text>
    </View>
  );
}



export function OrganizerProfileSections({ profile }: OrganizerProfileSectionsProps) {
  const organizerNotificationsQuery = useQuery({
    queryKey: ["organizer-notifications"],
    queryFn: () => profileApi.getOrganizerNotifications(),
    staleTime: 120_000,
  });

  if (organizerNotificationsQuery.isLoading) {
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Organizer settings</Text>
        <StatusChip label="Loading live settings" tone="neutral" />
      </View>
    );
  }

  if (organizerNotificationsQuery.isError || !organizerNotificationsQuery.data) {
    return (
      <ErrorRecoveryPanel
        description={getSettingsErrorMessage(organizerNotificationsQuery.error)}
        onRetry={() => {
          organizerNotificationsQuery.refetch();
        }}
      />
    );
  }

  const queueCounts = organizerNotificationsQuery.data.queueCounts;
  const incompleteProfile = !profile.phoneNumber?.trim();

  return (
    <>
      <View style={styles.statusRow}>
        <StatusChip label={`${queueCounts.pending} pending`} tone={queueCounts.pending > 0 ? "warning" : "neutral"} />
        <StatusChip label={`${queueCounts.checkedIn} checked-in`} tone={queueCounts.checkedIn > 0 ? "success" : "neutral"} />
        <StatusChip label={incompleteProfile ? "Profile incomplete" : "Profile ready"} tone={incompleteProfile ? "warning" : "success"} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Workspace identity</Text>
        <Text style={styles.bodyCopy}>{profile.fullName ?? profile.name}</Text>
        <Text style={styles.supportDescription}>{profile.email ?? "Email not available"}</Text>
        <Text style={styles.supportDescription}>{profile.city ?? "City not set"}</Text>
      </View>

      <QueueHealthSection
        checkedIn={queueCounts.checkedIn}
        confirmed={queueCounts.confirmed}
        digestCadenceLabel={organizerNotificationsQuery.data.digestCadenceLabel}
        pending={queueCounts.pending}
        reminderWindowLabel={organizerNotificationsQuery.data.reminderWindowLabel}
        waitlisted={queueCounts.waitlisted}
      />

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
  bodyCopy: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  supportDescription: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  queueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  queueCell: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: palette.cardStrong,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  queueValue: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "700",
  },
  queueLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});