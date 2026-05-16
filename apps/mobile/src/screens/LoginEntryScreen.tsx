import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { UserRole } from "../types/models";

type LoginEntryScreenProps = Readonly<{
  onContinue: (role: UserRole) => void;
}>;

export function LoginEntryScreen({ onContinue }: LoginEntryScreenProps) {
  return (
    <ScreenShell
      eyebrow="Arthera mobile"
      title="Choose the gallery lane that fits today."
      subtitle="Start as a Visitor to collect exhibition moments, or switch into Organizer mode to publish and manage a full event flow."
    >
      <View style={styles.roleGrid}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Visitor</Text>
          <Text style={styles.cardTitle}>Discover, reserve, review, and unlock passport stamps.</Text>
          <Text style={styles.copy}>Browse exhibitions by timeline, grab a slot, and keep every gallery memory in one warm archive.</Text>
          <View style={styles.featureStack}>
            <Text style={styles.feature}>Now-on and upcoming exhibition filters</Text>
            <Text style={styles.feature}>Registration and post-visit feedback loop</Text>
            <Text style={styles.feature}>Passport vault with progression milestones</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => onContinue("VISITOR")}>
            <Text style={styles.primaryButtonText}>Continue as Visitor</Text>
          </Pressable>
        </View>

        <View style={[styles.card, styles.organizerCard]}>
          <Text style={[styles.eyebrow, styles.organizerEyebrow]}>Organizer</Text>
          <Text style={styles.cardTitle}>Launch exhibitions without leaving the mobile flow.</Text>
          <Text style={styles.copy}>Draft the story, map the form, review submissions, and monitor check-ins from a single command center.</Text>
          <View style={styles.featureStack}>
            <Text style={styles.feature}>Exhibition publishing workspace</Text>
            <Text style={styles.feature}>Lightweight dynamic registration fields</Text>
            <Text style={styles.feature}>Attendance and stamp handoff states</Text>
          </View>
          <Pressable style={styles.secondaryButton} onPress={() => onContinue("ORGANIZER")}>
            <Text style={styles.secondaryButtonText}>Continue as Organizer</Text>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  roleGrid: {
    gap: spacing.md
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm
  },
  organizerCard: {
    backgroundColor: palette.backgroundAlt
  },
  eyebrow: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  organizerEyebrow: {
    color: palette.accentStrong
  },
  cardTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700"
  },
  copy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22
  },
  featureStack: {
    gap: spacing.xs
  },
  feature: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 15,
    fontWeight: "700",
    fontFamily: typography.body
  },
  secondaryButton: {
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: palette.background,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: typography.body
  }
});
