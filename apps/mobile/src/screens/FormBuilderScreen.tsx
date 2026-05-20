import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ApiError } from "../api/client";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { StickyActionBar } from "../components/StickyActionBar";
import { useExhibitionEditor } from "../query/useExhibitionEditor";
import { useFormBuilder } from "../query/useFormBuilder";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { RegistrationFieldDto } from "../types/api";

type FormBuilderScreenProps = Readonly<{
  exhibitionId: string;
}>;

type EditableField = {
  id: string;
  label: string;
  type: RegistrationFieldDto["type"];
  placeholder: string;
  isRequired: boolean;
  optionsText: string;
  helpText: string;
  order: number;
};

type FeedbackState = Readonly<{
  tone: "error" | "success";
  message: string;
}>;

type FieldSetter = Dispatch<SetStateAction<EditableField[]>>;

const fieldTypeOptions: Array<Readonly<{ label: string; type: RegistrationFieldDto["type"] }>> = [
  { label: "Text", type: "TEXT" },
  { label: "Email", type: "EMAIL" },
  { label: "Phone", type: "PHONE" },
  { label: "Select", type: "SELECT" },
  { label: "Textarea", type: "TEXTAREA" },
];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The form builder action could not be completed.";
}

function toEditableFields(fields: RegistrationFieldDto[]): EditableField[] {
  return fields.map((field) => ({
    id: field.id,
    label: field.label,
    type: field.type,
    placeholder: field.placeholder ?? "",
    isRequired: field.isRequired,
    optionsText: field.options.join("\n"),
    helpText: field.helpText ?? "",
    order: field.order,
  }));
}

function toFieldPayload(fields: EditableField[]): RegistrationFieldDto[] {
  return fields.map((field, index) => ({
    id: field.id.trim() || `field-${index + 1}`,
    label: field.label.trim(),
    type: field.type,
    placeholder: field.placeholder.trim() || undefined,
    isRequired: field.isRequired,
    options: field.optionsText.split(/\r?\n/).map((option) => option.trim()).filter((option) => option.length > 0),
    helpText: field.helpText.trim() || undefined,
    order: index + 1,
  }));
}

function buildPreviewIssues(consentTitle: string, consentCopy: string, fields: EditableField[]) {
  const issues: string[] = [];
  const ids = new Set<string>();

  if (!consentTitle.trim() || !consentCopy.trim()) {
    issues.push("Add consent title and consent copy.");
  }

  if (fields.length === 0) {
    issues.push("Add at least one registration field.");
  }

  if (!fields.some((field) => field.isRequired)) {
    issues.push("Mark at least one field as required.");
  }

  for (const field of fields) {
    if (!field.label.trim()) {
      issues.push("Every field needs a label.");
    }

    if (ids.has(field.id.trim())) {
      issues.push("Field ids must be unique.");
    }

    ids.add(field.id.trim());

    if (field.type === "SELECT" && field.optionsText.trim().length === 0) {
      issues.push(`Add options for ${field.label || field.id}.`);
    }
  }

  return issues;
}

function LoadingSchemaScreen() {
  return (
    <ScreenShell eyebrow="Organizer flow" title="Form builder" subtitle="Loading the active schema version and validation summary.">
      <StatusChip label="Loading schema" tone="neutral" />
    </ScreenShell>
  );
}

function BuilderErrorScreen({ description, onRetry }: Readonly<{ description: string; onRetry: () => void }>) {
  return (
    <ScreenShell eyebrow="Organizer flow" title="Form builder" subtitle="The live form schema could not be restored.">
      <ErrorRecoveryPanel description={description} onRetry={onRetry} />
    </ScreenShell>
  );
}

function FieldEditorCard({
  editable,
  field,
  onChange,
  onRemove,
  onToggleRequired,
}: Readonly<{
  editable: boolean;
  field: EditableField;
  onChange: (changes: Partial<EditableField>) => void;
  onRemove: () => void;
  onToggleRequired: () => void;
}>) {
  return (
    <View style={styles.fieldCard}>
      <View style={styles.badgeRow}>
        <Text style={styles.fieldTitle}>{field.label || "Untitled field"}</Text>
        <Pressable onPress={onToggleRequired} disabled={!editable} style={[styles.toggleChip, field.isRequired && styles.toggleChipActive, !editable && styles.inputDisabled]}>
          <Text style={[styles.toggleChipText, field.isRequired && styles.toggleChipTextActive]}>{field.isRequired ? "Required" : "Optional"}</Text>
        </Pressable>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Field id</Text>
        <TextInput editable={editable} value={field.id} onChangeText={(value) => onChange({ id: value })} style={[styles.input, !editable && styles.inputDisabled]} placeholder="full-name" placeholderTextColor={palette.textMuted} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Label</Text>
        <TextInput editable={editable} value={field.label} onChangeText={(value) => onChange({ label: value })} style={[styles.input, !editable && styles.inputDisabled]} placeholder="Full name" placeholderTextColor={palette.textMuted} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.optionRow}>
          {fieldTypeOptions.map((option) => {
            const selected = option.type === field.type;
            return (
              <Pressable key={option.type} onPress={() => editable && onChange({ type: option.type })} style={[styles.optionChip, selected && styles.optionChipActive, !editable && styles.inputDisabled]}>
                <Text style={[styles.optionText, selected && styles.optionTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Placeholder</Text>
        <TextInput editable={editable} value={field.placeholder} onChangeText={(value) => onChange({ placeholder: value })} style={[styles.input, !editable && styles.inputDisabled]} placeholder="Visible hint for visitors" placeholderTextColor={palette.textMuted} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Help text</Text>
        <TextInput editable={editable} value={field.helpText} onChangeText={(value) => onChange({ helpText: value })} style={[styles.input, styles.multiline, !editable && styles.inputDisabled]} multiline placeholder="Explain why the organizer needs this answer" placeholderTextColor={palette.textMuted} />
      </View>

      {field.type === "SELECT" ? (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Options</Text>
          <TextInput editable={editable} value={field.optionsText} onChangeText={(value) => onChange({ optionsText: value })} style={[styles.input, styles.multiline, !editable && styles.inputDisabled]} multiline placeholder="One option per line" placeholderTextColor={palette.textMuted} />
        </View>
      ) : null}

      {editable ? (
        <Pressable onPress={onRemove}>
          <Text style={styles.removeText}>Remove field</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function updateFieldAtIndex(setFields: FieldSetter, index: number, changes: Partial<EditableField>) {
  setFields((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...changes } : entry)));
}

function removeFieldAtIndex(setFields: FieldSetter, index: number) {
  setFields((current) => current.filter((_, entryIndex) => entryIndex !== index).map((entry, entryIndex) => ({ ...entry, order: entryIndex + 1 })));
}

function toggleRequiredAtIndex(setFields: FieldSetter, index: number) {
  setFields((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, isRequired: !entry.isRequired } : entry)));
}

function ConsentPanel({
  consentCopy,
  consentTitle,
  editable,
  onChangeConsentCopy,
  onChangeConsentTitle,
}: Readonly<{
  consentCopy: string;
  consentTitle: string;
  editable: boolean;
  onChangeConsentCopy: (value: string) => void;
  onChangeConsentTitle: (value: string) => void;
}>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Consent block</Text>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Consent title</Text>
        <TextInput editable={editable} value={consentTitle} onChangeText={onChangeConsentTitle} style={[styles.input, !editable && styles.inputDisabled]} placeholder="Confirm your visit details" placeholderTextColor={palette.textMuted} />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Consent copy</Text>
        <TextInput editable={editable} value={consentCopy} onChangeText={onChangeConsentCopy} style={[styles.input, styles.multiline, !editable && styles.inputDisabled]} multiline placeholder="Explain how answers are used for check-in and accommodations." placeholderTextColor={palette.textMuted} />
      </View>
    </View>
  );
}

function FieldPalettePanel({ editable, onAddField }: Readonly<{ editable: boolean; onAddField: (type: RegistrationFieldDto["type"]) => void }>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Field palette</Text>
      <View style={styles.optionRow}>
        {fieldTypeOptions.map((option) => (
          <Pressable key={option.type} onPress={() => editable && onAddField(option.type)} style={[styles.optionChip, !editable && styles.inputDisabled]}>
            <Text style={styles.optionText}>Add {option.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FieldStackPanel({
  editable,
  fields,
  setFields,
}: Readonly<{
  editable: boolean;
  fields: EditableField[];
  setFields: FieldSetter;
}>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Field stack</Text>
      {fields.length === 0 ? <EmptyStateBanner title="Blank schema" description="Add the first field to start shaping the registration contract." /> : null}
      {fields.map((field, index) => (
        <FieldEditorCard
          key={`${field.id}-${index}`}
          editable={editable}
          field={field}
          onChange={(changes) => {
            updateFieldAtIndex(setFields, index, changes);
          }}
          onRemove={() => {
            removeFieldAtIndex(setFields, index);
          }}
          onToggleRequired={() => {
            toggleRequiredAtIndex(setFields, index);
          }}
        />
      ))}
    </View>
  );
}

function ValidationSummaryPanel({
  previewIssues,
  savedIssues,
}: Readonly<{
  previewIssues: string[];
  savedIssues: string[];
}>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Validation summary</Text>
      {previewIssues.length === 0 ? <Text style={styles.successText}>Preview looks publish-ready.</Text> : null}
      {previewIssues.map((issue) => (
        <Text key={issue} style={styles.warningText}>• {issue}</Text>
      ))}
      {savedIssues.map((issue) => (
        <Text key={`saved-${issue}`} style={styles.helper}>Saved version: {issue}</Text>
      ))}
    </View>
  );
}

function FormBuilderContent({
  consentCopy,
  consentTitle,
  editable,
  editorTitle,
  feedback,
  fields,
  lockReason,
  onAddField,
  onChangeConsentCopy,
  onChangeConsentTitle,
  onReset,
  onSave,
  previewIssues,
  savedIssues,
  setFields,
  saving,
  version,
}: Readonly<{
  consentCopy: string;
  consentTitle: string;
  editable: boolean;
  editorTitle: string;
  feedback: FeedbackState | null;
  fields: EditableField[];
  lockReason?: string;
  onAddField: (type: RegistrationFieldDto["type"]) => void;
  onChangeConsentCopy: (value: string) => void;
  onChangeConsentTitle: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
  previewIssues: string[];
  savedIssues: string[];
  setFields: FieldSetter;
  saving: boolean;
  version: number;
}>) {
  const validSchema = savedIssues.length === 0;

  return (
    <ScreenShell
      eyebrow="Organizer flow"
      title="Form builder"
      subtitle="Shape the attendee schema, consent block, and validation summary used by reservation and publish readiness."
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{editorTitle}</Text>
        <Text style={styles.heroTitle}>{fields.length} working fields</Text>
        <Text style={styles.helper}>Active version {version} · {validSchema ? "publish-ready" : "needs fixes"}</Text>
        <View style={styles.statusRow}>
          <StatusChip label={validSchema ? "Valid schema" : "Invalid schema"} tone={validSchema ? "success" : "warning"} />
          <StatusChip label={editable ? "Editable" : "Locked"} tone={editable ? "neutral" : "warning"} />
          <StatusChip label={`${previewIssues.length} preview issues`} tone={previewIssues.length === 0 ? "success" : "warning"} />
        </View>
      </View>

      <ConsentPanel
        consentCopy={consentCopy}
        consentTitle={consentTitle}
        editable={editable}
        onChangeConsentCopy={onChangeConsentCopy}
        onChangeConsentTitle={onChangeConsentTitle}
      />

      <FieldPalettePanel editable={editable} onAddField={onAddField} />
  <FieldStackPanel editable={editable} fields={fields} setFields={setFields} />

      <ValidationSummaryPanel previewIssues={previewIssues} savedIssues={savedIssues} />

      {feedback ? <Text style={feedback.tone === "error" ? styles.errorText : styles.successText}>{feedback.message}</Text> : null}

      <StickyActionBar
        primaryLabel={saving ? "Saving..." : "Save schema"}
        onPrimaryPress={onSave}
        primaryDisabled={saving || !editable}
        secondaryLabel="Reset"
        onSecondaryPress={onReset}
        helperText={editable ? "Saving a schema updates the publish checklist in the exhibition editor." : lockReason}
      />
    </ScreenShell>
  );
}

export function FormBuilderScreen({ exhibitionId }: FormBuilderScreenProps) {
  const { editorQuery } = useExhibitionEditor(exhibitionId);
  const { formSchemaQuery, saveFormSchemaMutation } = useFormBuilder(exhibitionId);
  const [consentTitle, setConsentTitle] = useState("");
  const [consentCopy, setConsentCopy] = useState("");
  const [fields, setFields] = useState<EditableField[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  useEffect(() => {
    if (formSchemaQuery.data) {
      setConsentTitle(formSchemaQuery.data.consentTitle ?? "");
      setConsentCopy(formSchemaQuery.data.consentCopy ?? "");
      setFields(toEditableFields(formSchemaQuery.data.fields));
    }
  }, [formSchemaQuery.data]);

  const previewIssues = useMemo(() => buildPreviewIssues(consentTitle, consentCopy, fields), [consentCopy, consentTitle, fields]);
  const editor = editorQuery.data;

  if ((editorQuery.isLoading && !editor) || (formSchemaQuery.isLoading && !formSchemaQuery.data)) {
    return <LoadingSchemaScreen />;
  }

  const loadError = editorQuery.error ?? formSchemaQuery.error;
  if (!formSchemaQuery.data || loadError) {
    return (
      <BuilderErrorScreen
        description={getErrorMessage(loadError)}
        onRetry={() => {
          editorQuery.refetch();
          formSchemaQuery.refetch();
        }}
      />
    );
  }

  const editable = !editor?.isLocked;

  const addField = (type: RegistrationFieldDto["type"]) => {
    setFields((current) => [
      ...current,
      {
        id: `field-${current.length + 1}`,
        label: type === "SELECT" ? "Selection prompt" : "New field",
        type,
        placeholder: "",
        isRequired: current.length === 0,
        optionsText: type === "SELECT" ? "Option 1\nOption 2" : "",
        helpText: "",
        order: current.length + 1,
      },
    ]);
  };

  const resetFromServer = () => {
    setConsentTitle(formSchemaQuery.data.consentTitle ?? "");
    setConsentCopy(formSchemaQuery.data.consentCopy ?? "");
    setFields(toEditableFields(formSchemaQuery.data.fields));
    setFeedback(null);
  };

  const submitSave = () => {
    saveFormSchemaMutation
      .mutateAsync({
        consentTitle: consentTitle.trim() || undefined,
        consentCopy: consentCopy.trim() || undefined,
        fields: toFieldPayload(fields),
      })
      .then((schema) => {
        setFeedback({ tone: "success", message: `Schema version ${schema.version} saved.` });
      })
      .catch((error) => {
        setFeedback({ tone: "error", message: getErrorMessage(error) });
      });
  };

  return (
    <FormBuilderContent
      consentCopy={consentCopy}
      consentTitle={consentTitle}
      editable={editable}
      editorTitle={editor?.title ?? exhibitionId}
      feedback={feedback}
      fields={fields}
      lockReason={editor?.lockReason}
      onAddField={addField}
      onChangeConsentCopy={setConsentCopy}
      onChangeConsentTitle={setConsentTitle}
      onReset={resetFromServer}
      onSave={submitSave}
      previewIssues={previewIssues}
      savedIssues={formSchemaQuery.data.validation.validationIssues}
      setFields={setFields}
      saving={saveFormSchemaMutation.isPending}
      version={formSchemaQuery.data.version}
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
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 13,
    fontFamily: typography.body,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  optionChip: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  optionChipActive: {
    backgroundColor: palette.text,
    borderColor: palette.text,
  },
  optionText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
  },
  optionTextActive: {
    color: palette.background,
  },
  fieldCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  fieldTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
  },
  toggleChip: {
    backgroundColor: palette.card,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  toggleChipActive: {
    backgroundColor: palette.text,
    borderColor: palette.text,
  },
  toggleChipText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
  },
  toggleChipTextActive: {
    color: palette.background,
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
  helper: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  removeText: {
    color: palette.accentStrong,
    fontFamily: typography.body,
    fontSize: 12,
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
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
