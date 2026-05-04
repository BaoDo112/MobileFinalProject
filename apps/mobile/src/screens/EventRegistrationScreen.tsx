import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { Gallery, RegistrationField, VisitSlot } from "../types/models";

type EventRegistrationScreenProps = Readonly<{
  gallery?: Gallery;
  fields: RegistrationField[];
  slots: VisitSlot[];
}>;

export function EventRegistrationScreen({ gallery, fields, slots }: EventRegistrationScreenProps) {
  const [selectedSlotId, setSelectedSlotId] = useState(slots[0]?.id ?? "");
  const [formValues, setFormValues] = useState<Record<string, string>>(
    () => Object.fromEntries(fields.map((field) => [field.id, ""])) as Record<string, string>
  );
  const [submitted, setSubmitted] = useState(false);

  const updateFieldValue = (fieldId: string, value: string) => {
    setFormValues((current) => ({ ...current, [fieldId]: value }));
  };

  const getKeyboardType = (fieldType: RegistrationField["type"]) => {
    if (fieldType === "phone") {
      return "phone-pad" as const;
    }

    if (fieldType === "email") {
      return "email-address" as const;
    }

    return "default" as const;
  };

  const renderField = (field: RegistrationField) => (
    <View key={field.id} style={styles.fieldGroup}>
      <Text style={styles.label}>{field.label}{field.required ? " *" : ""}</Text>
      {field.type === "select" ? (
        <View style={styles.optionRow}>
          {(field.options ?? []).map((option) => (
            <Pressable
              key={option}
              onPress={() => updateFieldValue(field.id, option)}
              style={[styles.optionChip, formValues[field.id] === option && styles.optionChipActive]}
            >
              <Text style={[styles.optionText, formValues[field.id] === option && styles.optionTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <TextInput
          value={formValues[field.id] ?? ""}
          onChangeText={(value) => updateFieldValue(field.id, value)}
          style={[styles.input, field.type === "textarea" && styles.multiline]}
          placeholder={field.placeholder}
          placeholderTextColor={palette.textMuted}
          multiline={field.type === "textarea"}
          keyboardType={getKeyboardType(field.type)}
        />
      )}
      {field.helpText ? <Text style={styles.helper}>{field.helpText}</Text> : null}
    </View>
  );

  if (!gallery) {
    return (
      <ScreenShell eyebrow="Visitor flow" title="Reserve a slot" subtitle="Gallery was not found.">
        <Text style={styles.helper}>Choose a gallery card again to continue with registration.</Text>
      </ScreenShell>
    );
  }

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  return (
    <ScreenShell
      eyebrow="Visitor flow"
      title="Reserve your visit"
      subtitle="Registration keeps the essential fields visible and lightweight so visitors can commit quickly on mobile."
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>{gallery.title}</Text>
        <Text style={styles.heroTitle}>{gallery.dateLabel}</Text>
        <Text style={styles.helper}>{gallery.timeLabel} · {gallery.entryMode}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Visit slot</Text>
        <View style={styles.slotStack}>
          {slots.map((slot) => (
            <Pressable
              key={slot.id}
              onPress={() => setSelectedSlotId(slot.id)}
              style={[styles.slotCard, selectedSlotId === slot.id && styles.slotCardActive]}
            >
              <Text style={[styles.slotTitle, selectedSlotId === slot.id && styles.slotTitleActive]}>{slot.label}</Text>
              <Text style={[styles.slotMeta, selectedSlotId === slot.id && styles.slotTitleActive]}>{slot.remaining}</Text>
              <Text style={[styles.slotMeta, selectedSlotId === slot.id && styles.slotTitleActive]}>{slot.vibe}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Registration fields</Text>
        {fields.map(renderField)}
      </View>

      <Pressable style={styles.primaryButton} onPress={() => setSubmitted(true)}>
        <Text style={styles.primaryButtonText}>Reserve slot</Text>
      </Pressable>

      {submitted ? (
        <View style={styles.successCard}>
          <Text style={styles.sectionTitle}>Reservation staged</Text>
          <Text style={styles.helper}>{selectedSlot?.label ?? "Slot pending"} has been staged for confirmation.</Text>
          <Text style={styles.helper}>Next step: keep this flow connected to reminders, post-visit ratings, and stamp issuance once API integration lands.</Text>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  helper: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center"
  },
  primaryButtonText: {
    color: palette.white,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
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