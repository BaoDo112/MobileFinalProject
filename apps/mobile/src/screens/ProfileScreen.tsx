import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { UserProfile, UserRole } from "../types/models";

type ProfileScreenProps = Readonly<{
  role: UserRole;
  profile: UserProfile;
  onSwitchRole: () => void;
}>;

export function ProfileScreen({ role, profile, onSwitchRole }: ProfileScreenProps) {
  const nextRoleLabel = role === "visitor" ? "Organizer" : "Visitor";

  return (
    <ScreenShell eyebrow="Shared profile" title={profile.name} subtitle={profile.tagline}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{role}</Text>
        <Text style={styles.heroTitle}>{profile.membershipLabel}</Text>
        <Text style={styles.text}>{profile.city}</Text>
      </View>

      <View style={styles.statRow}>
        {profile.stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Current focus</Text>
        {profile.highlights.map((highlight) => (
          <Text key={highlight} style={styles.text}>{highlight}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Stack context</Text>
        <Text style={styles.text}>Mobile FE: Expo React Native + React Navigation</Text>
        <Text style={styles.text}>Backend: NestJS + Prisma + Neon</Text>
        <Text style={styles.text}>This milestone stays mock-driven so UI can stabilize before API binding.</Text>
      </View>

      <Pressable style={styles.switchButton} onPress={onSwitchRole}>
        <Text style={styles.switchButtonText}>Switch to {nextRoleLabel} view</Text>
      </Pressable>
      <View style={styles.helperCard}>
        <Text style={styles.helperText}>Role switching stays in-app so reviewers can traverse both user journeys quickly during demos.</Text>
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
  statRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs
  },
  statValue: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "700"
  },
  statLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs
  },
  title: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 15,
    marginTop: spacing.xs,
    fontFamily: typography.body,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  text: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.body
  },
  switchButton: {
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center"
  },
  switchButtonText: {
    color: palette.background,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700"
  },
  helperCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.md,
    padding: spacing.md
  },
  helperText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
  }
});
