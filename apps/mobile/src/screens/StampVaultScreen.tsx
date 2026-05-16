import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { Stamp, UserProfile } from "../types/models";

type VaultGallery = Readonly<{
  id: string;
  title: string;
  images?: string[];
}>;

type VaultStamp = Stamp & Readonly<{
  exhibitionId?: string;
  vaultSection?: "CONFIRMED" | "UPCOMING" | "EXPIRED";
}>;

type StampVaultScreenProps = Readonly<{
  stamps: VaultStamp[];
  galleries: VaultGallery[];
  profile: UserProfile;
  onOpenGallery: (galleryId: string) => void;
}>;

const sectionMeta: Record<"CONFIRMED" | "UPCOMING" | "EXPIRED", { label: string; description: string }> = {
  CONFIRMED: {
    label: "Confirmed stamps",
    description: "Exhibitions you attended and had confirmed."
  },
  UPCOMING: {
    label: "Upcoming registrations",
    description: "Exhibitions you registered for that are coming up soon."
  },
  EXPIRED: {
    label: "Expired registrations",
    description: "Exhibitions you registered for but did not attend."
  }
};

export function StampVaultScreen({ stamps, galleries, profile, onOpenGallery }: StampVaultScreenProps) {
  const galleryMap = new Map(galleries.map((gallery) => [gallery.id, gallery]));
  const confirmedStamps = stamps.filter((stamp) => (stamp.vaultSection ?? "CONFIRMED") === "CONFIRMED");
  const upcomingStamps = stamps.filter((stamp) => stamp.vaultSection === "UPCOMING");
  const expiredStamps = stamps.filter((stamp) => stamp.vaultSection === "EXPIRED");

  return (
    <ScreenShell
      eyebrow="Visitor flow"
      title={profile.membershipLabel ?? "Passport tier"}
      subtitle="Track confirmed visits, upcoming registrations, and expired signups in one clean vault view."
    >
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionMarker, { backgroundColor: palette.accent }]} />
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>{sectionMeta.CONFIRMED.label}</Text>
            <Text style={styles.sectionDescription}>{sectionMeta.CONFIRMED.description}</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {confirmedStamps.map((stamp) => renderStampCard(stamp, galleryMap, onOpenGallery))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionMarker, { backgroundColor: palette.gold }]} />
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>{sectionMeta.UPCOMING.label}</Text>
            <Text style={styles.sectionDescription}>{sectionMeta.UPCOMING.description}</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {upcomingStamps.map((stamp) => renderStampCard(stamp, galleryMap, onOpenGallery))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionMarker, { backgroundColor: palette.textMuted }]} />
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>{sectionMeta.EXPIRED.label}</Text>
            <Text style={styles.sectionDescription}>{sectionMeta.EXPIRED.description}</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {expiredStamps.map((stamp) => renderStampCard(stamp, galleryMap, onOpenGallery))}
        </View>
      </View>
    </ScreenShell>
  );
}

function renderStampCard(
  stamp: VaultStamp,
  galleryMap: Map<string, VaultGallery>,
  onOpenGallery: (galleryId: string) => void
) {
  const galleryId = stamp.exhibitionId;
  const gallery = galleryId ? galleryMap.get(galleryId) : undefined;
  const logoText = gallery?.title
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || stamp.title.slice(0, 2).toUpperCase();

  const statusText = stamp.vaultSection === "CONFIRMED"
    ? "Confirmed attendance"
    : stamp.vaultSection === "UPCOMING"
      ? "Registered, upcoming"
      : "Registered, expired";

  return (
    <Pressable
      key={stamp.id}
      onPress={() => galleryId ? onOpenGallery(galleryId) : undefined}
      style={({ pressed }) => [styles.card, stamp.vaultSection === "EXPIRED" && styles.expiredCard, pressed && styles.cardPressed]}
    >
      <View style={[styles.stampAccent, { backgroundColor: stamp.accent }]} />
      <View style={[styles.logoBox, { backgroundColor: stamp.accent }]}>
        <Text style={styles.logoText}>{logoText}</Text>
      </View>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{stamp.title}</Text>
        <Text style={[styles.cardStatus, stamp.vaultSection === "CONFIRMED" && styles.cardStatusConfirmed, stamp.vaultSection === "UPCOMING" && styles.cardStatusUpcoming, stamp.vaultSection === "EXPIRED" && styles.cardStatusExpired]}>
          {statusText}
        </Text>
      </View>
      <Text style={styles.cardMeta}>{stamp.milestone}</Text>
      <Text style={styles.cardMeta}>{stamp.note}</Text>
      {gallery?.title ? <Text style={styles.galleryTitle}>{gallery.title}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  introBlock: {
    backgroundColor: palette.cardStrong,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs
  },
  introTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700"
  },
  introText: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20
  },
  sectionBlock: {
    gap: spacing.xs
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: "100%",
    backgroundColor: "#7a2431",
    borderRadius: 0,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: "#e8a1ac"
  },
  sectionMarker: {
    width: 10,
    height: 10,
    borderRadius: 9999,
    marginTop: 7,
    flexShrink: 0
  },
  sectionHeaderText: {
    flex: 1,
    gap: 2
  },
  sectionTitle: {
    color: palette.background,
    fontFamily: typography.display,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  sectionDescription: {
    color: "#f4d7da",
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18
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
  cardPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: palette.accent
  },
  expiredCard: {
    opacity: 0.84
  },
  stampAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xs
  },
  logoText: {
    color: palette.white,
    fontFamily: typography.body,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1
  },
  cardHeaderRow: {
    gap: 4
  },
  cardTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: typography.display,
    lineHeight: 26
  },
  cardStatus: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontFamily: typography.body,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    overflow: "hidden"
  },
  cardStatusConfirmed: {
    color: palette.background,
    backgroundColor: palette.text
  },
  cardStatusUpcoming: {
    color: palette.accent,
    backgroundColor: palette.backgroundAlt
  },
  cardStatusExpired: {
    color: palette.background,
    backgroundColor: palette.textMuted
  },
  cardMeta: {
    color: palette.textMuted,
    fontSize: 13,
    fontFamily: typography.body
  },
  galleryTitle: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  noteText: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.body
  }
});
