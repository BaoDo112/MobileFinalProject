import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { Stamp, UserProfile } from "../types/models";

type StampVaultScreenProps = Readonly<{
  stamps: Stamp[];
  profile: UserProfile;
  onOpenGallery: (galleryId: string) => void;
}>;

export function StampVaultScreen({ stamps, profile, onOpenGallery }: StampVaultScreenProps) {
  const unlocked = stamps.filter((stamp) => stamp.unlocked).length;
  const nextUnlock = stamps.find((stamp) => !stamp.unlocked);

  return (
    <ScreenShell
      eyebrow="Visitor flow"
      title="Gallery passport and reward loop."
      subtitle={`${profile.name} has unlocked ${unlocked}/${stamps.length} stamp moments so far.`}
    >
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Passport tier</Text>
        <Text style={styles.progressTitle}>{profile.membershipLabel}</Text>
        <Text style={styles.progressText}>The vault makes post-visit actions legible: register, attend, leave feedback, then unlock the right visual token.</Text>
      </View>

      {nextUnlock ? (
        <View style={styles.nextCard}>
          <Text style={styles.progressLabel}>Next unlock</Text>
          <Text style={styles.cardTitle}>{nextUnlock.title}</Text>
          <Text style={styles.cardMeta}>{nextUnlock.note}</Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        {stamps.map((stamp) => (
          <Pressable key={stamp.id} onPress={() => onOpenGallery(stamp.galleryId)} style={[styles.card, !stamp.unlocked && styles.lockedCard]}>
            <View style={[styles.stampAccent, { backgroundColor: stamp.accent }]} />
            <Text style={styles.cardTitle}>{stamp.title}</Text>
            <Text style={styles.cardMeta}>{stamp.unlocked ? "Unlocked" : "Locked"}</Text>
            <Text style={styles.cardMeta}>{stamp.milestone}</Text>
            <Text style={styles.noteText}>{stamp.note}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs
  },
  progressLabel: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  progressTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700"
  },
  progressText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20
  },
  nextCard: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
    width: "47%",
    overflow: "hidden"
  },
  lockedCard: {
    opacity: 0.6
  },
  stampAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6
  },
  cardTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: typography.display,
    lineHeight: 26
  },
  cardMeta: {
    color: palette.textMuted,
    fontSize: 13,
    fontFamily: typography.body
  },
  noteText: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.body
  }
});
