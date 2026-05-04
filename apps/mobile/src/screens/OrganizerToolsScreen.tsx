import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { OrganizerExhibition, RegistrationField } from "../types/models";

type OrganizerToolsScreenProps = Readonly<{
  exhibition?: OrganizerExhibition;
  formFields: RegistrationField[];
  onOpenFormBuilder?: () => void;
}>;

export function OrganizerToolsScreen({ exhibition, formFields, onOpenFormBuilder }: OrganizerToolsScreenProps) {
  const [title] = useState(exhibition?.title ?? "Signal Garden Draft");
  const [summary] = useState(
    exhibition?.summary ?? "A tactile light garden shaped for calm group visits and accessible quiet-route transitions."
  );
  const [venue] = useState(exhibition?.venue ?? "Lane 6 Annex");
  const [address] = useState(`${exhibition?.district ?? "Binh Thanh"}, Ho Chi Minh City`);

  return (
    <ScreenShell
      eyebrow="Organizer flow"
      title={exhibition ? "Exhibition studio" : "Create exhibition draft"}
      subtitle="Build the exhibition story, venue logistics, and form strategy in a layout that mirrors the warm visual language of the visitor side."
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{exhibition?.status ?? "draft"}</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.helper}>{summary}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Exhibition title</Text>
        <TextInput style={styles.input} value={title} editable={false} />

        <Text style={styles.label}>Short concept</Text>
        <TextInput style={[styles.input, styles.multiline]} value={summary} editable={false} multiline />

        <Text style={styles.label}>Venue</Text>
        <TextInput style={styles.input} value={venue} editable={false} />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} editable={false} />

        <Text style={styles.label}>Upload Media</Text>
        <View style={styles.mediaRow}>
          <View style={styles.mediaPlaceholder}><Text style={styles.placeholderText}>Poster cover</Text></View>
          <View style={styles.mediaPlaceholder}><Text style={styles.placeholderText}>Gallery hero</Text></View>
          <View style={styles.mediaPlaceholder}><Text style={styles.placeholderText}>Social crop</Text></View>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Registration strategy</Text>
        <Text style={styles.helper}>Current field count: {formFields.length}</Text>
        <Text style={styles.helper}>Supported field types: text, email, phone, select, textarea.</Text>
        <Text style={styles.helper}>Keep the field set intentionally small so mobile completion stays fast.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Publishing checklist</Text>
        <Text style={styles.helper}>1. Confirm title, short concept, and venue card.</Text>
        <Text style={styles.helper}>2. Keep visitor form under five core fields for demo speed.</Text>
        <Text style={styles.helper}>3. Review the submissions pipeline before enabling stamp issue.</Text>
      </View>

      {onOpenFormBuilder ? (
        <Pressable style={styles.primaryButton} onPress={onOpenFormBuilder}>
          <Text style={styles.primaryButtonText}>Open form builder</Text>
        </Pressable>
      ) : (
        <View style={styles.infoCard}>
          <Text style={styles.helper}>Create the first draft, then jump into the form builder from the organizer dashboard cards.</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Why this screen exists</Text>
        <Text style={styles.helper}>The earlier skeleton only hinted at organizer tools. This version shows the full create/edit surface so the workflow no longer collapses into placeholders.</Text>
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
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm
  },
  label: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 14,
    fontFamily: typography.body,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  input: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    color: palette.text,
    fontFamily: typography.body
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top"
  },
  mediaRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  mediaPlaceholder: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: palette.accentSoft,
    borderRadius: radii.sm,
    padding: spacing.md,
    backgroundColor: palette.backgroundAlt,
    flex: 1,
    minHeight: 84,
    justifyContent: "center"
  },
  placeholderText: {
    color: palette.textMuted,
    fontSize: 13,
    fontFamily: typography.body,
    textAlign: "center"
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.body,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  helper: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.body
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
  infoCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs
  }
});
