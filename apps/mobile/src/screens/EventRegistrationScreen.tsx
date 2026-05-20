import { useEffect, useMemo, useState } from "react";
import { Controller, useController, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { ApiError } from "../api/client";
import { registrationsApi } from "../api/registrations";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { StickyActionBar } from "../components/StickyActionBar";
import { useSessionStore } from "../state/session";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { RegistrationDraftDto, RegistrationFieldDto, RegistrationReceiptDto, SessionAvailabilityDto } from "../types/api";

type EventRegistrationScreenProps = Readonly<{
  exhibitionId: string;
}>;

type RegistrationFormValues = {
  note: string;
  consentAccepted: boolean;
  answers: Record<string, string>;
};

type PrefillValues = Readonly<{
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  accessibilityNotes?: string;
}>;

function buildRegistrationSchema(draft: RegistrationDraftDto) {
  return z
    .object({
      note: z.string().trim().max(300, "Keep the note under 300 characters."),
      consentAccepted: z.boolean(),
      answers: z.record(z.string(), z.string()),
    })
    .superRefine((values, context) => {
      if ((draft.consentTitle || draft.consentCopy) && !values.consentAccepted) {
        context.addIssue({
          code: "custom",
          path: ["consentAccepted"],
          message: "Review and accept the booking note before submitting.",
        });
      }

      for (const field of draft.fields) {
        if (field.isRequired && !values.answers[field.id]?.trim()) {
          context.addIssue({
            code: "custom",
            path: ["answers", field.id],
            message: `${field.label} is required.`,
          });
        }
      }
    });
}

function buildDefaultValues(draft: RegistrationDraftDto, prefill: PrefillValues): RegistrationFormValues {
  const answers = Object.fromEntries(
    draft.fields.map((field) => {
      if (field.id === "full-name") {
        return [field.id, prefill.fullName ?? ""];
      }

      if (field.id === "email") {
        return [field.id, prefill.email ?? ""];
      }

      if (field.id === "phone") {
        return [field.id, prefill.phoneNumber ?? ""];
      }

      if (field.id === "accessibility") {
        return [field.id, prefill.accessibilityNotes ?? ""];
      }

      return [field.id, ""];
    })
  ) as Record<string, string>;

  return {
    note: "",
    consentAccepted: false,
    answers,
  };
}

function getDefaultSessionId(sessions: SessionAvailabilityDto[]) {
  const openSession = sessions.find((session) => session.registrationState !== "closed");
  return openSession?.sessionId ?? sessions[0]?.sessionId ?? "";
}

function getKeyboardType(fieldType: RegistrationFieldDto["type"]) {
  if (fieldType === "PHONE") {
    return "phone-pad" as const;
  }

  if (fieldType === "EMAIL") {
    return "email-address" as const;
  }

  return "default" as const;
}

function getPrimaryLabel(draft: RegistrationDraftDto, isSubmitting: boolean) {
  if (isSubmitting) {
    return "Submitting...";
  }

  if (draft.selectedSession.registrationState === "waitlist") {
    return "Join waitlist";
  }

  if (draft.selectedSession.registrationState === "closed") {
    return "Registration closed";
  }

  return "Reserve visit";
}

function getSubmissionMessage(receipt: RegistrationReceiptDto) {
  if (receipt.status === "WAITLISTED") {
    return `You are on the waitlist for ${receipt.sessionLabel}. Current position: ${receipt.waitlistPosition ?? "pending"}.`;
  }

  return `${receipt.sessionLabel} is confirmed. Your visitor profile will reflect this booking from the same backend record.`;
}

function getSessionTone(session: SessionAvailabilityDto): "danger" | "warning" | "success" {
  if (session.registrationState === "closed") {
    return "danger";
  }

  if (session.registrationState === "waitlist") {
    return "warning";
  }

  return "success";
}

function getSessionModeLabel(session: SessionAvailabilityDto) {
  if (session.registrationState === "waitlist") {
    return "Waitlist mode";
  }

  if (session.registrationState === "closed") {
    return "Closed";
  }

  return "Direct booking";
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }

  return "The registration request could not be completed.";
}

function SessionCard({
  isSelected,
  onPress,
  remainingLabel,
  session,
}: Readonly<{
  isSelected: boolean;
  onPress: () => void;
  remainingLabel: string;
  session: SessionAvailabilityDto;
}>) {
  return (
    <Pressable onPress={onPress} style={[styles.slotCard, isSelected && styles.slotCardActive]}>
      <Text style={[styles.slotTitle, isSelected && styles.slotTitleActive]}>{session.dateLabel}</Text>
      <Text style={[styles.slotMeta, isSelected && styles.slotMetaActive]}>{session.timeLabel}</Text>
      <Text style={[styles.slotMeta, isSelected && styles.slotMetaActive]}>{remainingLabel}</Text>
      {session.vibe ? <Text style={[styles.slotMeta, isSelected && styles.slotMetaActive]}>{session.vibe}</Text> : null}
    </Pressable>
  );
}

function RegistrationFieldInput({
  control,
  errorMessage,
  field,
}: Readonly<{
  control: ReturnType<typeof useForm<RegistrationFormValues>>["control"];
  errorMessage?: string;
  field: RegistrationFieldDto;
}>) {
  const { field: controlledField } = useController({
    control,
    name: `answers.${field.id}` as const,
  });

  const selectOption = (option: string) => {
    controlledField.onChange(option);
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{field.label}{field.isRequired ? " *" : ""}</Text>
      {field.type === "SELECT" ? (
        <View style={styles.optionRow}>
          {field.options.map((option) => (
            <Pressable
              key={option}
              onPress={() => selectOption(option)}
              style={[styles.optionChip, controlledField.value === option && styles.optionChipActive]}
            >
              <Text style={[styles.optionText, controlledField.value === option && styles.optionTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <TextInput
          value={controlledField.value ?? ""}
          onChangeText={controlledField.onChange}
          onBlur={controlledField.onBlur}
          style={[styles.input, field.type === "TEXTAREA" && styles.multiline]}
          placeholder={field.placeholder}
          placeholderTextColor={palette.textMuted}
          multiline={field.type === "TEXTAREA"}
          keyboardType={getKeyboardType(field.type)}
        />
      )}
      {field.helpText ? <Text style={styles.helper}>{field.helpText}</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

function RegistrationDraftForm({
  draft,
  onSelectSession,
  prefill,
  sessions,
}: Readonly<{
  draft: RegistrationDraftDto;
  onSelectSession: (sessionId: string) => void;
  prefill: PrefillValues;
  sessions: SessionAvailabilityDto[];
}>) {
  const queryClient = useQueryClient();
  const schema = useMemo(() => buildRegistrationSchema(draft), [draft]);
  const defaultValues = useMemo(() => buildDefaultValues(draft, prefill), [draft, prefill]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<RegistrationReceiptDto | null>(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const submitMutation = useMutation({
    mutationFn: (values: RegistrationFormValues) =>
      registrationsApi.submit({
        sessionId: draft.selectedSession.sessionId,
        formSchemaVersionId: draft.formSchemaVersionId,
        note: values.note.trim() || undefined,
        answers: draft.fields.map((field) => ({
          formFieldId: field.id,
          value: values.answers[field.id]?.trim() ?? "",
        })),
      }),
    onSuccess: async (nextReceipt) => {
      setSubmitError(null);
      setReceipt(nextReceipt);
      await queryClient.invalidateQueries({ queryKey: ["visitor-workspace"] });
      await queryClient.invalidateQueries({ queryKey: ["registration-visits"] });
    },
  });

  const answers = watch("answers");
  const note = watch("note");

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitMutation.mutateAsync(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  let sessionHelperText = `${draft.selectedSession.remainingCapacity} / ${draft.selectedSession.capacity} places left`;
  if (draft.selectedSession.registrationState === "waitlist") {
    sessionHelperText = `${draft.selectedSession.remainingCapacity} direct places left. Waitlist available.`;
  } else if (draft.selectedSession.registrationState === "closed") {
    sessionHelperText = "This session is closed for new bookings.";
  }

  return (
    <>
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>Selected session</Text>
        <Text style={styles.heroTitle}>{draft.selectedSession.dateLabel}</Text>
        <Text style={styles.helper}>{draft.selectedSession.timeLabel}</Text>
        <Text style={styles.helper}>{sessionHelperText}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Choose a session</Text>
        <View style={styles.slotStack}>
          {sessions.map((session) => {
            const remainingLabel =
              session.registrationState === "waitlist"
                ? `${session.remainingCapacity} direct slots · ${session.waitlistCapacity ?? 0} waitlist`
                : `${session.remainingCapacity} of ${session.capacity} left`;

            return (
              <SessionCard
                key={session.sessionId}
                isSelected={draft.selectedSession.sessionId === session.sessionId}
                onPress={() => onSelectSession(session.sessionId)}
                remainingLabel={remainingLabel}
                session={session}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Visitor form</Text>
        {draft.fields.map((field) => {
          const fieldError = errors.answers?.[field.id];

          return (
            <RegistrationFieldInput
              key={field.id}
              control={control}
              errorMessage={fieldError?.message}
              field={field}
            />
          );
        })}

        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Optional note</Text>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                style={[styles.input, styles.multiline]}
                placeholder="Anything the host should know before arrival"
                placeholderTextColor={palette.textMuted}
                multiline
              />
              <Text style={styles.helper}>Visible in the organizer queue so the session lead can prepare.</Text>
              {errors.note ? <Text style={styles.errorText}>{errors.note.message}</Text> : null}
            </View>
          )}
        />
      </View>

      {(draft.consentTitle || draft.consentCopy) ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Consent</Text>
          {draft.consentTitle ? <Text style={styles.consentTitle}>{draft.consentTitle}</Text> : null}
          {draft.consentCopy ? <Text style={styles.helper}>{draft.consentCopy}</Text> : null}
          <Controller
            control={control}
            name="consentAccepted"
            render={({ field }) => (
              <Pressable style={[styles.consentRow, field.value && styles.consentRowActive]} onPress={() => field.onChange(!field.value)}>
                <View style={[styles.checkbox, field.value && styles.checkboxActive]}>
                  <Text style={styles.checkboxMark}>{field.value ? "✓" : ""}</Text>
                </View>
                <Text style={styles.consentLabel}>I reviewed the booking note and want to continue.</Text>
              </Pressable>
            )}
          />
          {errors.consentAccepted ? <Text style={styles.errorText}>{errors.consentAccepted.message}</Text> : null}
        </View>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Confirmation summary</Text>
        <Text style={styles.helper}>Session: {draft.selectedSession.dateLabel} · {draft.selectedSession.timeLabel}</Text>
        {draft.fields.slice(0, 3).map((field) => (
          <View key={field.id} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{field.label}</Text>
            <Text style={styles.summaryValue}>{answers[field.id]?.trim() || "Pending"}</Text>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Host note</Text>
          <Text style={styles.summaryValue}>{note.trim() || "No note added"}</Text>
        </View>
      </View>

      {submitError ? <ErrorRecoveryPanel description={submitError} onRetry={() => setSubmitError(null)} retryLabel="Clear error" /> : null}

      {receipt ? (
        <View style={styles.successCard}>
          <Text style={styles.sectionTitle}>{receipt.status === "WAITLISTED" ? "Waitlist staged" : "Reservation confirmed"}</Text>
          <Text style={styles.helper}>{getSubmissionMessage(receipt)}</Text>
        </View>
      ) : null}

      <StickyActionBar
        primaryLabel={getPrimaryLabel(draft, isSubmitting || submitMutation.isPending)}
        onPrimaryPress={() => {
          void onSubmit();
        }}
        primaryDisabled={draft.selectedSession.registrationState === "closed" || isSubmitting || submitMutation.isPending}
        helperText={draft.selectedSession.registrationState === "waitlist" ? "This slot is currently in waitlist mode. Your profile will show the queue result immediately after submit." : "Submit once the summary looks right. Duplicate-booking protection is enforced by the same backend used for visitor history."}
      />
    </>
  );
}

export function EventRegistrationScreen({ exhibitionId }: EventRegistrationScreenProps) {
  const user = useSessionStore((state) => state.user);
  const visitorProfile = useSessionStore((state) => state.visitorProfile);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const sessionsQuery = useQuery({
    queryKey: ["registration-sessions", exhibitionId],
    queryFn: () => registrationsApi.listSessions(exhibitionId),
    staleTime: 120_000,
  });

  useEffect(() => {
    if (!selectedSessionId && sessionsQuery.data?.length) {
      const nextSessionId = getDefaultSessionId(sessionsQuery.data);
      if (nextSessionId) {
        setSelectedSessionId(nextSessionId);
      }
    }
  }, [selectedSessionId, sessionsQuery.data]);

  const draftQuery = useQuery({
    queryKey: ["registration-draft", exhibitionId, selectedSessionId],
    queryFn: () => registrationsApi.getDraft(exhibitionId, selectedSessionId),
    enabled: Boolean(selectedSessionId),
    staleTime: 120_000,
  });

  const prefill = useMemo<PrefillValues>(
    () => ({
      fullName: visitorProfile?.fullName ?? visitorProfile?.name,
      email: user?.email,
      phoneNumber: visitorProfile?.phoneNumber,
      accessibilityNotes: visitorProfile?.accessibilityNotes,
    }),
    [user?.email, visitorProfile]
  );

  const onSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  if (sessionsQuery.isLoading) {
    return (
      <ScreenShell eyebrow="Screen 4" title="Reserve your visit" subtitle="Loading live session availability from the visitor booking API.">
        <StatusChip label="Fetching sessions" tone="neutral" />
      </ScreenShell>
    );
  }

  if (sessionsQuery.isError) {
    return (
      <ScreenShell eyebrow="Screen 4" title="Reserve your visit" subtitle="The session list could not be restored.">
        <ErrorRecoveryPanel description={getErrorMessage(sessionsQuery.error)} onRetry={() => sessionsQuery.refetch()} />
      </ScreenShell>
    );
  }

  if (!sessionsQuery.data?.length) {
    return (
      <ScreenShell eyebrow="Screen 4" title="Reserve your visit" subtitle="There are no sessions configured for this exhibition yet.">
        <EmptyStateBanner
          title="No live sessions"
          description="The organizer has not published a reservation slot yet. Check the exhibition detail screen again later."
        />
      </ScreenShell>
    );
  }

  if (draftQuery.isLoading || !draftQuery.data) {
    return (
      <ScreenShell eyebrow="Screen 4" title="Reserve your visit" subtitle="Loading the active attendee form and booking rules for the selected session.">
        <StatusChip label="Preparing form" tone="neutral" />
      </ScreenShell>
    );
  }

  if (draftQuery.isError) {
    return (
      <ScreenShell eyebrow="Screen 4" title="Reserve your visit" subtitle="The attendee form could not be restored for the selected session.">
        <ErrorRecoveryPanel description={getErrorMessage(draftQuery.error)} onRetry={() => draftQuery.refetch()} />
      </ScreenShell>
    );
  }

  const sessionTone = getSessionTone(draftQuery.data.selectedSession);
  const sessionModeLabel = getSessionModeLabel(draftQuery.data.selectedSession);

  return (
    <ScreenShell
      eyebrow="Screen 4"
      title="Reserve your visit"
      subtitle="Choose a live slot, complete the attendee form, confirm consent, and submit against the same backend contract that powers visitor history."
    >
      <View style={styles.statusRow}>
        <StatusChip label={sessionModeLabel} tone={sessionTone} />
        <StatusChip label={`${draftQuery.data.selectedSession.remainingCapacity} places left`} tone="neutral" />
      </View>

      <RegistrationDraftForm
        key={`${draftQuery.data.formSchemaVersionId ?? "default"}-${draftQuery.data.selectedSession.sessionId}`}
        draft={draftQuery.data}
        onSelectSession={onSelectSession}
        prefill={prefill}
        sessions={sessionsQuery.data}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  summaryCard: {
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
    letterSpacing: 1,
    textTransform: "uppercase"
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
  slotStack: {
    gap: spacing.sm
  },
  slotCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs
  },
  slotCardActive: {
    backgroundColor: palette.text
  },
  slotTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700"
  },
  slotTitleActive: {
    color: palette.background
  },
  slotMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  },
  slotMetaActive: {
    color: palette.backgroundAlt,
  },
  fieldGroup: {
    gap: spacing.xs
  },
  label: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  },
  input: {
    backgroundColor: palette.white,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    color: palette.text,
    fontFamily: typography.body
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top"
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  optionChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  optionChipActive: {
    backgroundColor: palette.accent
  },
  optionText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  },
  optionTextActive: {
    color: palette.white
  },
  consentTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  consentRowActive: {
    backgroundColor: palette.cardStrong,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
  },
  checkboxActive: {
    backgroundColor: palette.text,
    borderColor: palette.text,
  },
  checkboxMark: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
  },
  consentLabel: {
    flex: 1,
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  helper: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  },
  summaryRow: {
    gap: 2,
  },
  summaryLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  errorText: {
    color: palette.accentStrong,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 16,
  },
  successCard: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs
  }
});