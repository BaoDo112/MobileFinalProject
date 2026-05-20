import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { profileApi } from "../../api/profile";
import { EmptyStateBanner } from "../../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../../components/ErrorRecoveryPanel";
import { StatusChip } from "../../components/StatusChip";
import { palette, radii, spacing, typography } from "../../theme/tokens";
import type { NotificationSettingsDto } from "../../types/api";
import type { UserProfile } from "../../types/models";

const preferencesSchema = z.object({
  emailAlerts: z.boolean(),
  pushAlerts: z.boolean(),
  reminderAlerts: z.boolean(),
  queueAlerts: z.boolean(),
  marketingOptIn: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

type OrganizerProfileSectionsProps = Readonly<{
  profile: UserProfile;
}>;

const preferenceFields: Array<Readonly<{ key: keyof PreferencesFormValues; label: string; description: string }>> = [
  { key: "emailAlerts", label: "Email alerts", description: "Send exhibition and queue updates by email." },
  { key: "pushAlerts", label: "Push alerts", description: "Surface fast queue changes inside the app." },
  { key: "reminderAlerts", label: "Reminder jobs", description: "Enable reminder runs before each scheduled session." },
  { key: "queueAlerts", label: "Queue escalation", description: "Alert when pending or waitlist pressure rises." },
  { key: "marketingOptIn", label: "Program digests", description: "Receive wider program and growth updates for the workspace." },
];

function toDefaultValues(settings: NotificationSettingsDto | undefined): PreferencesFormValues {
  return {
    emailAlerts: settings?.emailAlerts ?? true,
    pushAlerts: settings?.pushAlerts ?? false,
    reminderAlerts: settings?.reminderAlerts ?? true,
    queueAlerts: settings?.queueAlerts ?? true,
    marketingOptIn: settings?.marketingOptIn ?? false,
  };
}

function getSettingsErrorMessage(settingsError: unknown, notificationsError: unknown) {
  if (settingsError instanceof Error) {
    return settingsError.message;
  }

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

function NotificationRulesSection({
  control,
  errorMessage,
  isPending,
  isSubmitting,
  onSave,
  saved,
}: Readonly<{
  control: ReturnType<typeof useForm<PreferencesFormValues>>["control"];
  errorMessage?: string;
  isPending: boolean;
  isSubmitting: boolean;
  onSave: () => void;
  saved: boolean;
}>) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Notification rules</Text>
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

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {saved ? <Text style={styles.successText}>Preferences saved.</Text> : null}

      <Pressable style={[styles.saveButton, (isSubmitting || isPending) && styles.saveButtonDisabled]} onPress={onSave} disabled={isSubmitting || isPending}>
        <Text style={styles.saveButtonText}>{isSubmitting || isPending ? "Saving..." : "Save preferences"}</Text>
      </Pressable>
    </View>
  );
}

function SupportLinksSection({
  supportLinks,
}: Readonly<{
  supportLinks: Array<Readonly<{ description?: string; label: string; url: string }>>;
}>) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Support links</Text>
      {supportLinks.length === 0 ? (
        <EmptyStateBanner title="No support links" description="Support metadata is not configured yet for this workspace." />
      ) : (
        supportLinks.map((link) => (
          <View key={link.url} style={styles.supportCard}>
            <Text style={styles.supportTitle}>{link.label}</Text>
            <Text style={styles.supportDescription}>{link.description ?? link.url}</Text>
            <Text style={styles.supportUrl}>{link.url}</Text>
          </View>
        ))
      )}
    </View>
  );
}

export function OrganizerProfileSections({ profile }: OrganizerProfileSectionsProps) {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["notification-settings"],
    queryFn: () => profileApi.getNotificationSettings(),
    staleTime: 120_000,
  });
  const organizerNotificationsQuery = useQuery({
    queryKey: ["organizer-notifications"],
    queryFn: () => profileApi.getOrganizerNotifications(),
    staleTime: 120_000,
  });

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
    if (settingsQuery.data) {
      reset(toDefaultValues(settingsQuery.data));
    }
  }, [reset, settingsQuery.data]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (values: PreferencesFormValues) => profileApi.updateNotificationSettings(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      await queryClient.invalidateQueries({ queryKey: ["organizer-notifications"] });
    },
  });

  const submitPreferences = handleSubmit(async (values) => {
    await updatePreferencesMutation.mutateAsync(values);
  });

  if (settingsQuery.isLoading || organizerNotificationsQuery.isLoading) {
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Organizer settings</Text>
        <StatusChip label="Loading live settings" tone="neutral" />
      </View>
    );
  }

  if (settingsQuery.isError || organizerNotificationsQuery.isError || !settingsQuery.data || !organizerNotificationsQuery.data) {
    return (
      <ErrorRecoveryPanel
        description={getSettingsErrorMessage(settingsQuery.error, organizerNotificationsQuery.error)}
        onRetry={() => {
          settingsQuery.refetch();
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

      <NotificationRulesSection
        control={control}
        errorMessage={updatePreferencesMutation.error instanceof Error ? updatePreferencesMutation.error.message : undefined}
        isPending={updatePreferencesMutation.isPending}
        isSubmitting={isSubmitting}
        onSave={() => {
          void submitPreferences();
        }}
        saved={updatePreferencesMutation.isSuccess}
      />

      <SupportLinksSection supportLinks={organizerNotificationsQuery.data.supportLinks} />
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
  supportCard: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  supportTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  supportUrl: {
    color: palette.accentStrong,
    fontFamily: typography.mono,
    fontSize: 12,
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