import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { profileApi } from "../../api/profile";
import { EmptyStateBanner } from "../../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../../components/ErrorRecoveryPanel";
import { StatusChip } from "../../components/StatusChip";
import { useVisitorProfile } from "../../query/useVisitorProfile";
import { palette, radii, spacing, typography } from "../../theme/tokens";
import type { NotificationSettingsDto, VisitorVisitSummaryDto } from "../../types/api";
import type { UserProfile } from "../../types/models";

const preferencesSchema = z.object({
  emailAlerts: z.boolean(),
  pushAlerts: z.boolean(),
  reminderAlerts: z.boolean(),
  queueAlerts: z.boolean(),
  marketingOptIn: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

type VisitorProfileSectionsProps = Readonly<{
  profile: UserProfile;
}>;

const preferenceFields: Array<Readonly<{ key: keyof PreferencesFormValues; label: string; description: string }>> = [
  { key: "emailAlerts", label: "Email alerts", description: "Receive confirmations and schedule changes by email." },
  { key: "pushAlerts", label: "Push alerts", description: "Get queue and booking updates in the mobile app." },
  { key: "reminderAlerts", label: "Visit reminders", description: "Send a reminder before the selected session starts." },
  { key: "queueAlerts", label: "Queue updates", description: "Notify when a waitlist booking clears or moves." },
  { key: "marketingOptIn", label: "Program highlights", description: "Receive future exhibition recommendations and public program updates." },
];

function toDefaultValues(settings: NotificationSettingsDto | undefined): PreferencesFormValues {
  return {
    emailAlerts: settings?.emailAlerts ?? true,
    pushAlerts: settings?.pushAlerts ?? true,
    reminderAlerts: settings?.reminderAlerts ?? true,
    queueAlerts: settings?.queueAlerts ?? true,
    marketingOptIn: settings?.marketingOptIn ?? false,
  };
}

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
  const queryClient = useQueryClient();
  const visitorProfileQuery = useVisitorProfile(true);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: toDefaultValues(undefined),
  });

  useEffect(() => {
    if (visitorProfileQuery.data?.notificationSettings) {
      reset(toDefaultValues(visitorProfileQuery.data.notificationSettings));
    }
  }, [reset, visitorProfileQuery.data?.notificationSettings]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (values: PreferencesFormValues) => profileApi.updateNotificationSettings(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visitor-workspace"] });
    },
  });

  const submitPreferences = handleSubmit(async (values) => {
    await updatePreferencesMutation.mutateAsync(values);
  });

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
        <Text style={styles.sectionTitle}>Preferences</Text>
        {preferenceFields.map((field) => (
          <Controller
            key={field.key}
            control={control}
            name={field.key}
            render={({ field: controllerField }) => (
              <Pressable style={[styles.preferenceRow, controllerField.value && styles.preferenceRowActive]} onPress={() => controllerField.onChange(!controllerField.value)}>
                <View style={[styles.preferenceToggle, controllerField.value && styles.preferenceToggleActive]}>
                  <Text style={[styles.preferenceToggleMark, controllerField.value && styles.preferenceToggleMarkActive]}>{controllerField.value ? "On" : "Off"}</Text>
                </View>
                <View style={styles.preferenceCopy}>
                  <Text style={styles.preferenceLabel}>{field.label}</Text>
                  <Text style={styles.preferenceDescription}>{field.description}</Text>
                </View>
              </Pressable>
            )}
          />
        ))}

        {updatePreferencesMutation.isError ? (
          <Text style={styles.errorText}>{updatePreferencesMutation.error instanceof Error ? updatePreferencesMutation.error.message : "Preferences could not be saved."}</Text>
        ) : null}

        {updatePreferencesMutation.isSuccess ? <Text style={styles.successText}>Preferences saved.</Text> : null}

        <Pressable style={[styles.saveButton, (isSubmitting || updatePreferencesMutation.isPending) && styles.saveButtonDisabled]} onPress={() => void submitPreferences()} disabled={isSubmitting || updatePreferencesMutation.isPending}>
          <Text style={styles.saveButtonText}>{isSubmitting || updatePreferencesMutation.isPending ? "Saving..." : "Save preferences"}</Text>
        </Pressable>
      </View>

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
  preferenceRow: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  preferenceRowActive: {
    backgroundColor: palette.cardStrong,
  },
  preferenceToggle: {
    width: 58,
    borderRadius: radii.pill,
    backgroundColor: palette.card,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  preferenceToggleActive: {
    backgroundColor: palette.text,
    borderColor: palette.text,
  },
  preferenceToggleMark: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
  },
  preferenceToggleMarkActive: {
    color: palette.background,
  },
  preferenceCopy: {
    flex: 1,
    gap: 2,
  },
  preferenceLabel: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  preferenceDescription: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  bodyCopy: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: palette.accentStrong,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 16,
  },
  successText: {
    color: "#166534",
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
});