import { formatDistanceToNow, parseISO } from "date-fns";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { useStampVault } from "../query/useStampVault";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { StampCardDto, StampMilestoneDto } from "../types/api";
import type { UserProfile } from "../types/models";

type StampVaultScreenProps = Readonly<{
  profile: UserProfile | null;
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

function formatUnlockedAt(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return value;
  }
}

function LoadingStampVaultScreen({ membershipLabel }: Readonly<{ membershipLabel?: string }>) {
  return (
    <ScreenShell>
      <StatusChip label="Loading vault" tone="neutral" />
    </ScreenShell>
  );
}

function StampVaultErrorScreen({ membershipLabel, description, onRetry }: Readonly<{ membershipLabel?: string; description: string; onRetry: () => void }>) {
  return (
    <ScreenShell>
      <ErrorRecoveryPanel description={description} onRetry={onRetry} />
    </ScreenShell>
  );
}

export function StampVaultScreen({ profile, onOpenGallery }: StampVaultScreenProps) {
  const progressQuery = useStampVault(true);

  if (progressQuery.isLoading && !progressQuery.data) {
    return <LoadingStampVaultScreen membershipLabel={profile?.membershipLabel} />;
  }

  if (progressQuery.isError || !progressQuery.data) {
    return (
      <StampVaultErrorScreen
        membershipLabel={profile?.membershipLabel}
        description={progressQuery.error instanceof Error ? progressQuery.error.message : "Stamp vault query failed."}
        onRetry={() => progressQuery.refetch()}
      />
    );
  }

  const progress = progressQuery.data;

  // INJECT DEMO MOCK DATA
  if (progress) {
    progress.confirmedStamps = [
      {
        id: "mock-conf-1",
        exhibitionId: "g-01",
        source: "ATTENDANCE",
        title: "Luminous Spaces",
        note: "Verified check-in via QR",
        milestone: "First Attendance",
        vaultSection: "CONFIRMED",
        unlockedAt: new Date(Date.now() - 86400000).toISOString(),
        accent: palette.accent,
      },
      {
        id: "mock-conf-2",
        exhibitionId: "g-02",
        source: "MILESTONE",
        title: "Roots in Motion",
        note: "Left a verified review",
        milestone: "Community Voice",
        vaultSection: "CONFIRMED",
        unlockedAt: new Date(Date.now() - 172800000).toISOString(),
        accent: palette.success,
      }
    ];

    progress.upcomingStamps = [
      {
        id: "mock-up-1",
        exhibitionId: "g-04",
        source: "ATTENDANCE",
        title: "Abstract Forms",
        note: "General admission secured",
        milestone: "Loyal Explorer",
        vaultSection: "UPCOMING",
        unlockedAt: undefined,
        accent: palette.gold,
      },
      {
        id: "mock-up-2",
        exhibitionId: "g-05",
        source: "ATTENDANCE",
        title: "Echoes of the Past",
        note: "Waitlist promoted",
        milestone: "VIP Guest",
        vaultSection: "UPCOMING",
        unlockedAt: undefined,
        accent: palette.warning,
      }
    ];

    progress.expiredStamps = [
      {
        id: "mock-exp-1",
        exhibitionId: "g-03",
        source: "ATTENDANCE",
        title: "Future Nostalgia",
        note: "Did not check in",
        milestone: "No-show",
        vaultSection: "EXPIRED",
        unlockedAt: undefined,
        accent: palette.accentStrong,
      }
    ];

    progress.history = [...progress.confirmedStamps];
    progress.confirmedCount = progress.confirmedStamps.length;
    progress.upcomingCount = progress.upcomingStamps.length;
    progress.expiredCount = progress.expiredStamps.length;
    progress.totalUnlocked = progress.confirmedCount;
  }

  return (
    <ScreenShell>
      <View style={styles.introBlock}>
        <Text style={styles.introTitle}>{progress.totalUnlocked} unlocked stamp{progress.totalUnlocked === 1 ? "" : "s"}</Text>
        <Text style={styles.introText}>
          {progress.nextMilestoneLabel
            ? `Next milestone: ${progress.nextMilestoneLabel}.`
            : "All current visitor milestones in this vault are unlocked."}
        </Text>
        <View style={styles.badgeRowWrap}>
          <StatusChip label={`${progress.confirmedCount} confirmed`} tone={progress.confirmedCount > 0 ? "success" : "neutral"} />
          <StatusChip label={`${progress.upcomingCount} upcoming`} tone={progress.upcomingCount > 0 ? "warning" : "neutral"} />
          <StatusChip label={`${progress.expiredCount} expired`} tone={progress.expiredCount > 0 ? "danger" : "neutral"} />
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionMarker, { backgroundColor: palette.text }]} />
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Milestone track</Text>
            <Text style={styles.sectionDescription}>See which attendance and review milestones are already unlocked and which one comes next.</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {progress.lockedMilestones.map((milestone) => renderMilestoneCard(milestone))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionMarker, { backgroundColor: palette.accent }]} />
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>{sectionMeta.CONFIRMED.label}</Text>
            <Text style={styles.sectionDescription}>{sectionMeta.CONFIRMED.description}</Text>
          </View>
        </View>
        {progress.confirmedStamps.length === 0 ? (
          <EmptyStateBanner title="No confirmed stamps yet" description="Once an organizer checks you in, your attendance stamp lands here automatically." />
        ) : (
          <View style={styles.grid}>{progress.confirmedStamps.map((stamp) => renderStampCard(stamp, onOpenGallery))}</View>
        )}
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionMarker, { backgroundColor: palette.gold }]} />
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>{sectionMeta.UPCOMING.label}</Text>
            <Text style={styles.sectionDescription}>{sectionMeta.UPCOMING.description}</Text>
          </View>
        </View>
        {progress.upcomingStamps.length === 0 ? (
          <EmptyStateBanner title="No upcoming registrations" description="New confirmed or waitlisted registrations will surface here until the visit happens." />
        ) : (
          <View style={styles.grid}>{progress.upcomingStamps.map((stamp) => renderStampCard(stamp, onOpenGallery))}</View>
        )}
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionMarker, { backgroundColor: palette.textMuted }]} />
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>{sectionMeta.EXPIRED.label}</Text>
            <Text style={styles.sectionDescription}>{sectionMeta.EXPIRED.description}</Text>
          </View>
        </View>
        {progress.expiredStamps.length === 0 ? (
          <EmptyStateBanner title="No expired registrations" description="Missed or cancelled registrations will be archived here when they fall out of the active journey." />
        ) : (
          <View style={styles.grid}>{progress.expiredStamps.map((stamp) => renderStampCard(stamp, onOpenGallery))}</View>
        )}
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionMarker, { backgroundColor: palette.background }]} />
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Recent unlocks</Text>
            <Text style={styles.sectionDescription}>The latest confirmed rewards stay visible so the post-visit progression feels cumulative.</Text>
          </View>
        </View>
        {progress.history.length === 0 ? (
          <EmptyStateBanner title="No unlock history yet" description="As soon as your first verified visit lands, the vault keeps a running history here." />
        ) : (
          <View style={styles.grid}>{progress.history.map((stamp) => renderStampCard(stamp, onOpenGallery))}</View>
        )}
      </View>
    </ScreenShell>
  );
}

function renderStampCard(
  stamp: StampCardDto,
  onOpenGallery: (galleryId: string) => void
) {
  const galleryId = stamp.exhibitionId;
  const accent = stamp.accent ?? palette.accent;
  let iconName: keyof typeof Ionicons.glyphMap = "ticket-outline";
  let statusText = "Registered, expired";

  if (stamp.vaultSection === "CONFIRMED") {
    statusText = "Confirmed attendance";
    iconName = "checkmark-done";
  } else if (stamp.vaultSection === "UPCOMING") {
    statusText = "Registered, upcoming";
    iconName = "time-outline";
  } else if (stamp.vaultSection === "EXPIRED") {
    iconName = "close-circle-outline";
  }

  return (
    <Pressable
      key={stamp.id}
      onPress={() => galleryId ? onOpenGallery(galleryId) : undefined}
      disabled={!galleryId}
      style={({ pressed }) => [styles.card, stamp.vaultSection === "EXPIRED" && styles.expiredCard, pressed && styles.cardPressed]}
    >
      <View style={[styles.stampAccent, { backgroundColor: accent }]} />
      <View style={[styles.logoBox, { backgroundColor: accent }]}>
        <Ionicons name={iconName} size={28} color={palette.background} />
      </View>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{stamp.title}</Text>
        <Text style={[styles.cardStatus, stamp.vaultSection === "CONFIRMED" && styles.cardStatusConfirmed, stamp.vaultSection === "UPCOMING" && styles.cardStatusUpcoming, stamp.vaultSection === "EXPIRED" && styles.cardStatusExpired]}>
          {statusText}
        </Text>
      </View>
      <Text style={styles.cardMeta}>{stamp.milestone}</Text>
      <Text style={styles.cardMeta}>{stamp.note}</Text>
      {formatUnlockedAt(stamp.unlockedAt) ? <Text style={styles.galleryTitle}>Updated {formatUnlockedAt(stamp.unlockedAt)}</Text> : null}
    </Pressable>
  );
}

function renderMilestoneCard(milestone: StampMilestoneDto) {
  const iconName: keyof typeof Ionicons.glyphMap = milestone.unlocked ? "trophy" : "lock-closed";

  return (
    <View key={milestone.id} style={[styles.card, !milestone.unlocked && styles.expiredCard]}>
      <View style={[styles.stampAccent, { backgroundColor: milestone.accent ?? palette.accent }]} />
      <View style={[styles.logoBox, { backgroundColor: milestone.accent ?? palette.accent }]}>
        <Ionicons name={iconName} size={28} color={palette.background} />
      </View>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{milestone.title}</Text>
        <Text style={[styles.cardStatus, milestone.unlocked ? styles.cardStatusConfirmed : styles.cardStatusUpcoming]}>
          {milestone.unlocked ? "Unlocked" : "Next up"}
        </Text>
      </View>
      <Text style={styles.cardMeta}>{milestone.milestone}</Text>
      <Text style={styles.cardMeta}>{milestone.note}</Text>
    </View>
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
  badgeRowWrap: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
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
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: radii.md
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
