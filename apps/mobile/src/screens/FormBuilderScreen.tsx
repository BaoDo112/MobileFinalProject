import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { OrganizerExhibition, RegistrationField } from "../types/models";

type FormBuilderScreenProps = Readonly<{
  exhibition?: OrganizerExhibition;
  initialFields: RegistrationField[];
}>;

export function FormBuilderScreen({ exhibition, initialFields }: FormBuilderScreenProps) {
  const [fields, setFields] = useState(initialFields);

  return (
    <ScreenShell
      eyebrow="Organizer flow"
      title="Form builder"
      subtitle="Keep the field palette intentionally small so the organizer can explain and manage the whole registration model during demos."
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{exhibition?.title ?? "Draft exhibition"}</Text>
        <Text style={styles.heroTitle}>{fields.length} active fields</Text>
        <Text style={styles.helper}>Default structure favors full name, contact, slot choice, and one optional context question.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Supported field types</Text>
        <View style={styles.optionRow}>
          {["text", "email", "phone", "select", "textarea"].map((option) => (
            <View key={option} style={styles.optionChip}>
              <Text style={styles.optionText}>{option}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Field stack</Text>
        {fields.map((field) => (
          <View key={field.id} style={styles.fieldCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.fieldTitle}>{field.label}</Text>
              <Text style={styles.statusText}>{field.required ? "Required" : "Optional"}</Text>
            </View>
            <Text style={styles.helper}>{field.type}</Text>
            <Text style={styles.helper}>{field.helpText ?? field.placeholder}</Text>
            {field.options?.length ? (
              <View style={styles.optionRow}>
                {field.options.map((option) => (
                  <View key={option} style={styles.previewChip}>
                    <Text style={styles.previewChipText}>{option}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          setFields((current) => [
            ...current,
            {
              id: `custom-${current.length + 1}`,
              label: "Audience note",
              type: "textarea",
              placeholder: "Optional reflection or attendance note",
              required: false,
              helpText: "Useful when the organizer wants one richer visitor signal."
            }
          ])
        }
      >
        <Text style={styles.primaryButtonText}>Add optional note field</Text>
      </Pressable>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Preview intent</Text>
        <Text style={styles.helper}>This screen exists to prove that dynamic fields are visible and editable in the UI before they are wired to the backend contract layer.</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
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
    textTransform: "uppercase",
    letterSpacing: 1
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
  optionText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  },
  fieldCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: spacing.xs
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  fieldTitle: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  },
  statusText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700"
  },
  previewChip: {
    backgroundColor: palette.card,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  previewChipText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "600"
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
  }
});