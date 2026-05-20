import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid, parse } from "date-fns";
import { z } from "zod";

import { ApiError } from "../api/client";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { StickyActionBar } from "../components/StickyActionBar";
import { useExhibitionEditor } from "../query/useExhibitionEditor";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { ExhibitionEditorDto, SaveExhibitionDraftDto } from "../types/api";

type OrganizerToolsScreenProps = Readonly<{
  exhibitionId?: string;
  onOpenFormBuilder?: (exhibitionId: string) => void;
}>;

type FeedbackState = Readonly<{
  tone: "error" | "success";
  message: string;
}>;

type SessionFormValue = {
  sessionId?: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  waitlistCapacity: string;
  vibe: string;
};

type ExhibitionEditorFormValues = {
  title: string;
  exhibitionType: string;
  bio: string;
  venueId: string;
  mediaUrls: string;
  curatorNote: string;
  policyText: string;
  highlightList: string;
  sessions: SessionFormValue[];
};

const dateTimePattern = "yyyy-MM-dd HH:mm";

const sessionSchema = z.object({
  sessionId: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  capacity: z.string(),
  waitlistCapacity: z.string(),
  vibe: z.string(),
}).superRefine((value, context) => {
  if (!value.startsAt.trim() || !value.endsAt.trim() || !value.capacity.trim()) {
    return;
  }

  const start = parse(value.startsAt.trim(), dateTimePattern, new Date());
  const end = parse(value.endsAt.trim(), dateTimePattern, new Date());
  if (!isValid(start)) {
    context.addIssue({ code: "custom", path: ["startsAt"], message: "Use yyyy-MM-dd HH:mm." });
  }

  if (!isValid(end)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "Use yyyy-MM-dd HH:mm." });
  }

  if (isValid(start) && isValid(end) && end.getTime() <= start.getTime()) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "End time must be after start time." });
  }

  const capacity = Number(value.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) {
    context.addIssue({ code: "custom", path: ["capacity"], message: "Capacity must be a positive integer." });
  }

  if (value.waitlistCapacity.trim().length > 0) {
    const waitlistCapacity = Number(value.waitlistCapacity);
    if (!Number.isInteger(waitlistCapacity) || waitlistCapacity < 0) {
      context.addIssue({ code: "custom", path: ["waitlistCapacity"], message: "Waitlist must be zero or greater." });
    }
  }
});

const editorSchema = z.object({
  title: z.string(),
  exhibitionType: z.string(),
  bio: z.string(),
  venueId: z.string(),
  mediaUrls: z.string(),
  curatorNote: z.string(),
  policyText: z.string(),
  highlightList: z.string(),
  sessions: z.array(sessionSchema),
});

function emptyFormValues(): ExhibitionEditorFormValues {
  return {
    title: "",
    exhibitionType: "",
    bio: "",
    venueId: "",
    mediaUrls: "",
    curatorNote: "",
    policyText: "",
    highlightList: "",
    sessions: [],
  };
}

function formatDateTimeValue(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, dateTimePattern);
}

function toFormValues(editor: ExhibitionEditorDto): ExhibitionEditorFormValues {
  return {
    title: editor.title,
    exhibitionType: editor.exhibitionType,
    bio: editor.bio,
    venueId: editor.venueId ?? "",
    mediaUrls: editor.mediaUrls.join("\n"),
    curatorNote: editor.curatorNote ?? "",
    policyText: editor.policyText ?? "",
    highlightList: editor.highlightList.join("\n"),
    sessions: editor.sessions.map((session) => ({
      sessionId: session.sessionId,
      startsAt: formatDateTimeValue(session.startsAt),
      endsAt: formatDateTimeValue(session.endsAt),
      capacity: String(session.capacity),
      waitlistCapacity: session.waitlistCapacity === undefined ? "" : String(session.waitlistCapacity),
      vibe: session.vibe ?? "",
    })),
  };
}

function toIsoDateTime(value: string) {
  const parsed = parse(value.trim(), dateTimePattern, new Date());
  return parsed.toISOString();
}

function toPayload(values: ExhibitionEditorFormValues): SaveExhibitionDraftDto {
  return {
    title: values.title.trim(),
    exhibitionType: values.exhibitionType.trim(),
    bio: values.bio.trim(),
    venueId: values.venueId.trim() || undefined,
    mediaUrls: values.mediaUrls.split(/\r?\n/).map((item) => item.trim()).filter((item) => item.length > 0),
    curatorNote: values.curatorNote.trim() || undefined,
    policyText: values.policyText.trim() || undefined,
    highlightList: values.highlightList.split(/\r?\n/).map((item) => item.trim()).filter((item) => item.length > 0),
    sessions: values.sessions.map((session) => ({
      sessionId: session.sessionId,
      startsAt: toIsoDateTime(session.startsAt),
      endsAt: toIsoDateTime(session.endsAt),
      capacity: Number(session.capacity),
      waitlistCapacity: session.waitlistCapacity.trim().length > 0 ? Number(session.waitlistCapacity) : undefined,
      vibe: session.vibe.trim() || undefined,
    })),
  };
}

function getStatusTone(status: ExhibitionEditorDto["status"]): "neutral" | "warning" | "success" {
  if (status === "PUBLISHED") {
    return "success";
  }

  if (status === "REVIEW") {
    return "warning";
  }

  return "neutral";
}

function getActionErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The authoring action could not be completed.";
}

function ControlledInput({
  control,
  editable,
  label,
  multiline,
  name,
  placeholder,
  errorMessage,
}: Readonly<{
  control: ReturnType<typeof useForm<ExhibitionEditorFormValues>>["control"];
  editable: boolean;
  label: string;
  multiline?: boolean;
  name: any;
  placeholder?: string;
  errorMessage?: string;
}>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={field.value ?? ""}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            editable={editable}
            style={[styles.input, multiline && styles.multiline, !editable && styles.inputDisabled]}
            placeholder={placeholder}
            placeholderTextColor={palette.textMuted}
            multiline={multiline}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      )}
    />
  );
}

function SessionEditorCard({
  control,
  editable,
  errorMessage,
  index,
  onRemove,
}: Readonly<{
  control: ReturnType<typeof useForm<ExhibitionEditorFormValues>>["control"];
  editable: boolean;
  errorMessage?: string;
  index: number;
  onRemove: () => void;
}>) {
  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>Session {index + 1}</Text>
        {editable ? (
          <Pressable onPress={onRemove}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
      <ControlledInput control={control} editable={editable} label="Start" name={`sessions.${index}.startsAt`} placeholder="2026-06-10 11:00" />
      <ControlledInput control={control} editable={editable} label="End" name={`sessions.${index}.endsAt`} placeholder="2026-06-10 12:15" />
      <View style={styles.sessionGrid}>
        <View style={styles.sessionGridItem}>
          <ControlledInput control={control} editable={editable} label="Capacity" name={`sessions.${index}.capacity`} placeholder="18" />
        </View>
        <View style={styles.sessionGridItem}>
          <ControlledInput control={control} editable={editable} label="Waitlist" name={`sessions.${index}.waitlistCapacity`} placeholder="6" />
        </View>
      </View>
      <ControlledInput control={control} editable={editable} label="Route / vibe" name={`sessions.${index}.vibe`} placeholder="Quiet walkthrough" errorMessage={errorMessage} />
    </View>
  );
}

function LoadingDraftScreen() {
  return (
    <ScreenShell eyebrow="Organizer flow" title="Exhibition studio" subtitle="Preparing the live authoring draft and publish checklist.">
      <StatusChip label="Loading draft" tone="neutral" />
    </ScreenShell>
  );
}

function EditorErrorScreen({ description, onRetry }: Readonly<{ description: string; onRetry: () => void }>) {
  return (
    <ScreenShell eyebrow="Organizer flow" title="Exhibition studio" subtitle="The live authoring state could not be restored.">
      <ErrorRecoveryPanel description={description} onRetry={onRetry} />
    </ScreenShell>
  );
}

function VenueAssignmentPanel({
  control,
  draft,
  editable,
}: Readonly<{
  control: ReturnType<typeof useForm<ExhibitionEditorFormValues>>["control"];
  draft: ExhibitionEditorDto;
  editable: boolean;
}>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Venue assignment</Text>
      <Controller
        control={control}
        name="venueId"
        render={({ field }) => (
          <View style={styles.venueGrid}>
            {draft.availableVenues.map((venue) => {
              const selected = field.value === venue.id;
              return (
                <Pressable
                  key={venue.id}
                  onPress={() => {
                    if (editable) {
                      field.onChange(venue.id);
                    }
                  }}
                  style={[styles.venueCard, selected && styles.venueCardActive, !editable && styles.inputDisabled]}
                >
                  <Text style={[styles.venueTitle, selected && styles.venueTitleActive]}>{venue.title}</Text>
                  <Text style={[styles.venueMeta, selected && styles.venueMetaActive]}>{venue.district}</Text>
                  <Text style={[styles.venueMeta, selected && styles.venueMetaActive]}>{venue.address}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
    </View>
  );
}

function SchedulePanel({
  append,
  control,
  editable,
  errors,
  fields,
  remove,
}: Readonly<{
  append: ReturnType<typeof useFieldArray<ExhibitionEditorFormValues, "sessions">>["append"];
  control: ReturnType<typeof useForm<ExhibitionEditorFormValues>>["control"];
  editable: boolean;
  errors: ReturnType<typeof useForm<ExhibitionEditorFormValues>>["formState"]["errors"];
  fields: ReturnType<typeof useFieldArray<ExhibitionEditorFormValues, "sessions">>["fields"];
  remove: ReturnType<typeof useFieldArray<ExhibitionEditorFormValues, "sessions">>["remove"];
}>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Schedule</Text>
      {fields.length === 0 ? <EmptyStateBanner title="No sessions yet" description="Add at least one session to move this draft toward publish readiness." /> : null}
      {fields.map((field, index) => (
        <SessionEditorCard
          key={field.id}
          control={control}
          editable={editable}
          errorMessage={errors.sessions?.[index]?.message}
          index={index}
          onRemove={() => remove(index)}
        />
      ))}
      {editable ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            append({
              startsAt: "2026-06-10 11:00",
              endsAt: "2026-06-10 12:15",
              capacity: "18",
              waitlistCapacity: "6",
              vibe: "Quiet walkthrough",
            })
          }
        >
          <Text style={styles.secondaryButtonText}>Add session</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function RegistrationSchemaPanel({
  draft,
  onOpenFormBuilder,
  resolvedExhibitionId,
}: Readonly<{
  draft: ExhibitionEditorDto;
  onOpenFormBuilder?: (exhibitionId: string) => void;
  resolvedExhibitionId?: string;
}>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Registration schema</Text>
      <Text style={styles.helper}>Version {draft.formSchema.version ?? 1} · {draft.formSchema.fieldCount} fields</Text>
      <Text style={styles.helper}>{draft.formSchema.isValid ? "Schema is ready for registration." : "Schema still needs fixes before publish."}</Text>
      {draft.formSchema.validationIssues.length > 0 ? (
        <View style={styles.issueList}>
          {draft.formSchema.validationIssues.map((issue) => (
            <Text key={issue} style={styles.warningText}>• {issue}</Text>
          ))}
        </View>
      ) : null}
      {onOpenFormBuilder && resolvedExhibitionId ? (
        <Pressable style={styles.primaryButton} onPress={() => onOpenFormBuilder(resolvedExhibitionId)}>
          <Text style={styles.primaryButtonText}>Open form builder</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function PublishChecklistPanel({ draft }: Readonly<{ draft: ExhibitionEditorDto }>) {
  const checklistHelper = draft.checklist.blockingReasons.join("\n");

  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Publish checklist</Text>
      {draft.checklist.items.map((item) => (
        <View key={item.key} style={styles.checklistRow}>
          <StatusChip label={item.complete ? "Ready" : "Pending"} tone={item.complete ? "success" : "warning"} />
          <View style={styles.checklistCopy}>
            <Text style={styles.checklistTitle}>{item.label}</Text>
            <Text style={styles.helper}>{item.detail}</Text>
          </View>
        </View>
      ))}
      {draft.checklist.canPublish ? null : <Text style={styles.warningText}>{checklistHelper}</Text>}
    </View>
  );
}

function OrganizerEditorContent({
  append,
  control,
  draft,
  editable,
  errors,
  feedback,
  fields,
  onOpenFormBuilder,
  onPublish,
  onSave,
  pendingAction,
  remove,
  resolvedExhibitionId,
}: Readonly<{
  append: ReturnType<typeof useFieldArray<ExhibitionEditorFormValues, "sessions">>["append"];
  control: ReturnType<typeof useForm<ExhibitionEditorFormValues>>["control"];
  draft: ExhibitionEditorDto;
  editable: boolean;
  errors: ReturnType<typeof useForm<ExhibitionEditorFormValues>>["formState"]["errors"];
  feedback: FeedbackState | null;
  fields: ReturnType<typeof useFieldArray<ExhibitionEditorFormValues, "sessions">>["fields"];
  onOpenFormBuilder?: (exhibitionId: string) => void;
  onPublish: () => void;
  onSave: () => void;
  pendingAction: boolean;
  remove: ReturnType<typeof useFieldArray<ExhibitionEditorFormValues, "sessions">>["remove"];
  resolvedExhibitionId?: string;
}>) {
  return (
    <ScreenShell
      eyebrow="Organizer flow"
      title={resolvedExhibitionId ? "Exhibition studio" : "Create exhibition draft"}
      subtitle="Build the exhibition story, venue logistics, and publish readiness from the same live contract used by the dashboard."
    >
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.kicker}>{draft.organizerName}</Text>
          <StatusChip label={draft.status} tone={getStatusTone(draft.status)} />
        </View>
        <Text style={styles.heroTitle}>{draft.title}</Text>
        <Text style={styles.helper}>{draft.bio}</Text>
        <View style={styles.statusRow}>
          <StatusChip label={draft.checklist.canPublish ? "Ready to publish" : "Needs fixes"} tone={draft.checklist.canPublish ? "success" : "warning"} />
          <StatusChip label={draft.isLocked ? "Locked" : `${draft.sessions.length} sessions`} tone={draft.isLocked ? "warning" : "neutral"} />
          <StatusChip label={`${draft.formSchema.fieldCount} fields`} tone={draft.formSchema.isValid ? "success" : "warning"} />
        </View>
        {draft.lockReason ? <Text style={styles.warningText}>{draft.lockReason}</Text> : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Core details</Text>
        <ControlledInput control={control} editable={editable} label="Exhibition title" name="title" placeholder="Signal Garden Draft" />
        <ControlledInput control={control} editable={editable} label="Exhibition type" name="exhibitionType" placeholder="Installation" />
        <ControlledInput control={control} editable={editable} label="Short concept" name="bio" placeholder="What makes this visit distinct?" multiline errorMessage={errors.bio?.message} />
        <ControlledInput control={control} editable={editable} label="Curator note" name="curatorNote" placeholder="Arrival rhythm, route prep, or facilitation notes." multiline />
        <ControlledInput control={control} editable={editable} label="Policy text" name="policyText" placeholder="Arrival and booking policy visible in detail/registration." multiline />
      </View>

      <VenueAssignmentPanel control={control} draft={draft} editable={editable} />

      <SchedulePanel append={append} control={control} editable={editable} errors={errors} fields={fields} remove={remove} />

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Media and highlights</Text>
        <ControlledInput control={control} editable={editable} label="Media URLs" name="mediaUrls" placeholder="One URL per line" multiline />
        <ControlledInput control={control} editable={editable} label="Highlight list" name="highlightList" placeholder="One highlight per line" multiline />
      </View>

      <RegistrationSchemaPanel draft={draft} onOpenFormBuilder={onOpenFormBuilder} resolvedExhibitionId={resolvedExhibitionId} />

      <PublishChecklistPanel draft={draft} />

      {feedback ? <Text style={feedback.tone === "error" ? styles.errorText : styles.successText}>{feedback.message}</Text> : null}

      <StickyActionBar
        primaryLabel={pendingAction ? "Publishing..." : "Publish exhibition"}
        onPrimaryPress={onPublish}
        primaryDisabled={pendingAction || draft.isLocked}
        secondaryLabel={pendingAction ? "Saving..." : "Save draft"}
        onSecondaryPress={onSave}
        helperText={draft.isLocked ? draft.lockReason : "Publish stays blocked until the checklist is complete. Save draft at any time while no registrations exist."}
      />
    </ScreenShell>
  );
}

export function OrganizerToolsScreen({ exhibitionId, onOpenFormBuilder }: OrganizerToolsScreenProps) {
  const { exhibitionId: resolvedExhibitionId, editorQuery, createDraftMutation, saveDraftMutation, publishMutation } = useExhibitionEditor(exhibitionId);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const draft = editorQuery.data ?? createDraftMutation.data;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExhibitionEditorFormValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: emptyFormValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  useEffect(() => {
    if (draft) {
      reset(toFormValues(draft));
    }
  }, [draft, reset]);

  const retry = () => {
    if (!resolvedExhibitionId) {
      createDraftMutation.mutate();
      return;
    }

    editorQuery.refetch();
  };

  if ((createDraftMutation.isPending && !draft) || (resolvedExhibitionId && editorQuery.isLoading && !draft)) {
    return <LoadingDraftScreen />;
  }

  const loadError = createDraftMutation.error ?? editorQuery.error;
  if (!draft || loadError) {
    return <EditorErrorScreen description={getActionErrorMessage(loadError)} onRetry={retry} />;
  }

  const submitSave = handleSubmit(async (values) => {
    try {
      const savedDraft = await saveDraftMutation.mutateAsync(toPayload(values));
      setFeedback({ tone: "success", message: `${savedDraft.title} saved.` });
    } catch (error) {
      setFeedback({ tone: "error", message: getActionErrorMessage(error) });
    }
  });

  const submitPublish = handleSubmit(async (values) => {
    try {
      await saveDraftMutation.mutateAsync(toPayload(values));
      const publishedDraft = await publishMutation.mutateAsync();
      setFeedback({ tone: "success", message: `${publishedDraft.title} is now published.` });
    } catch (error) {
      setFeedback({ tone: "error", message: getActionErrorMessage(error) });
    }
  });

  const editable = !draft.isLocked;
  const pendingAction = isSubmitting || saveDraftMutation.isPending || publishMutation.isPending;

  return (
    <OrganizerEditorContent
      append={append}
      control={control}
      draft={draft}
      editable={editable}
      errors={errors}
      feedback={feedback}
      fields={fields}
      onOpenFormBuilder={onOpenFormBuilder}
      onPublish={() => {
        submitPublish().catch(() => undefined);
      }}
      onSave={() => {
        submitSave().catch(() => undefined);
      }}
      pendingAction={pendingAction}
      remove={remove}
      resolvedExhibitionId={resolvedExhibitionId}
    />
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  kicker: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  panel: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 14,
    fontFamily: typography.body,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    color: palette.text,
    fontFamily: typography.body,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.body,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  helper: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.body,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  primaryButtonText: {
    color: palette.white,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  venueGrid: {
    gap: spacing.sm,
  },
  venueCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "transparent",
  },
  venueCardActive: {
    backgroundColor: palette.cardStrong,
    borderColor: palette.accent,
  },
  venueTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  venueTitleActive: {
    color: palette.text,
  },
  venueMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  venueMetaActive: {
    color: palette.text,
  },
  sessionCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  removeText: {
    color: palette.accentStrong,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
  },
  sessionGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  sessionGridItem: {
    flex: 1,
  },
  issueList: {
    gap: spacing.xs,
  },
  checklistRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  checklistCopy: {
    flex: 1,
    gap: 2,
  },
  checklistTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  warningText: {
    color: palette.accentStrong,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  errorText: {
    color: palette.accentStrong,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  successText: {
    color: "#166534",
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
});
