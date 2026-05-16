import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { UserProfile, UserRole } from "../types/models";

type ProfileScreenProps = Readonly<{
  role: UserRole;
  profile: UserProfile;
  onSwitchRole: () => void;
  onLogout: () => void;
}>;

export function ProfileScreen({ role, profile, onSwitchRole, onLogout }: ProfileScreenProps) {
  const nextRoleLabel = role === "VISITOR" ? "Organizer" : "Visitor";

  return (
    <ScreenShell hideHeader title={profile.name} subtitle={profile.tagline}>
      <View style={styles.profileCard}>
        <Text style={styles.cardLabel}>Name</Text>
        <Text style={styles.profileName}>{profile.name}</Text>

        <Text style={styles.cardLabel}>Bio</Text>
        <Text style={styles.bioText}>{profile.tagline ?? "No bio available."}</Text>

        <Text style={styles.cardLabel}>Interests</Text>
        <View style={styles.interestRow}>
          {profile.highlights.map((highlight) => (
            <View key={highlight} style={styles.interestChip}>
              <Text style={styles.interestText}>{highlight}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardLabel}>Personal information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full name</Text>
          <Text style={styles.infoValue}>{profile.fullName ?? profile.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender</Text>
          <Text style={styles.infoValue}>{profile.gender ?? "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date of birth</Text>
          <Text style={styles.infoValue}>{profile.dateOfBirth ?? "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profile.email ?? "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone number</Text>
          <Text style={styles.infoValue}>{profile.phoneNumber ?? "Not specified"}</Text>
        </View>
      </View>

      <View style={styles.statRow}>
        {profile.stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.switchButton} onPress={onSwitchRole}>
        <Text style={styles.switchButtonText}>Switch to {nextRoleLabel} view</Text>
      </Pressable>
      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </Pressable>
      <View style={styles.helperCard}>
        <Text style={styles.helperText}>Role switching stays in-app so reviewers can traverse both user journeys quickly during demos.</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm
  },
  cardLabel: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  profileName: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700"
  },
  bioText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: typography.body
  },
  interestRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  interestChip: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  interestText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700"
  },
  infoCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm
  },
  infoRow: {
    gap: 2
  },
  infoLabel: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  infoValue: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
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
  logoutButton: {
    marginTop: spacing.sm,
    backgroundColor: palette.card,
    borderColor: palette.accent,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center"
  },
  logoutButtonText: {
    color: palette.accent,
    fontFamily: typography.body,
    fontWeight: "700",
    fontSize: 15
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
