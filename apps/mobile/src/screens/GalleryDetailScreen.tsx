import { formatDistanceToNow, parseISO } from "date-fns";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { assetsApi } from "../api/assets";
import { EmptyStateBanner } from "../components/EmptyStateBanner";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { useExhibitionDetail } from "../query/useExhibitionDetail";
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { RegistrationCtaState, ReviewItemDto, SessionAvailabilityDto } from "../types/api";
import type { Venue } from "../types/models";

type GalleryDetailScreenProps = Readonly<{
  galleryId: string;
  onOpenRegistration: () => void;
  onOpenReview: () => void;
}>;

type SessionAvailabilitySectionProps = Readonly<{
  sessions: SessionAvailabilityDto[];
}>;

function getRegistrationTone(state: RegistrationCtaState) {
  if (state === "waitlist") {
    return "warning" as const;
  }

  if (state === "closed") {
    return "danger" as const;
  }

  return "success" as const;
}

function getPrimaryLabel(state: RegistrationCtaState) {
  if (state === "waitlist") {
    return "Join waitlist";
  }

  if (state === "closed") {
    return "Registration closed";
  }

  return "Reserve a slot";
}

function SessionAvailabilitySection({ sessions }: SessionAvailabilitySectionProps) {
  if (sessions.length === 0) {
    return <EmptyStateBanner title="Session schedule pending" description="The exhibition exists, but the organizer has not attached session slots yet." />;
  }

  return (
    <>
      {sessions.map((session) => (
        <View key={session.sessionId} style={styles.sessionCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.reviewAuthor}>{session.dateLabel}</Text>
            <StatusChip label={getPrimaryLabel(session.registrationState)} tone={getRegistrationTone(session.registrationState)} />
          </View>
          <Text style={styles.reviewMeta}>{session.timeLabel}</Text>
          <Text style={styles.text}>
            {session.remainingCapacity} of {session.capacity} spots remaining
            {session.waitlistCapacity ? ` · ${session.waitlistCapacity} waitlist places` : ""}
          </Text>
          {session.vibe ? <Text style={styles.text}>{session.vibe}</Text> : null}
        </View>
      ))}
    </>
  );
}

function AddressSection({
  canOpenMap,
  mapPreviewAvailable,
  onOpenMap,
  venue,
}: Readonly<{
  canOpenMap: boolean;
  mapPreviewAvailable: boolean;
  onOpenMap: () => void;
  venue?: Venue;
}>) {
  if (!venue) {
    return <EmptyStateBanner title="Venue details pending" description="This exhibition is published without a venue payload yet, so map and address states stay explicit." />;
  }

  return (
    <>
      <Pressable onPress={canOpenMap ? onOpenMap : undefined} style={[styles.mapFrame, !mapPreviewAvailable && styles.mapFrameMuted]}>
        <View style={styles.mapFrameOverlay} />
        <View style={styles.mapFrameBadge}>
          <Ionicons name="location-outline" size={16} color={palette.accent} />
          <Text style={styles.mapFrameBadgeText}>{mapPreviewAvailable ? "Map preview" : "Map fallback"}</Text>
        </View>
        <Text style={styles.mapFrameText}>
          {mapPreviewAvailable ? "Tap to open location in Google Maps" : "Preview coordinates are unavailable. Use the venue address instead."}
        </Text>
      </Pressable>
      <Text style={styles.text}>{venue.title}</Text>
      <Text style={styles.text}>{venue.address}</Text>
      {venue.accessibilityNotes ? <Text style={styles.text}>{venue.accessibilityNotes}</Text> : null}
      {canOpenMap ? (
        <Pressable onPress={onOpenMap} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Open in Google Maps</Text>
        </Pressable>
      ) : null}
    </>
  );
}

function CommunityPreviewSection({
  reviewPreview,
}: Readonly<{
  reviewPreview: ReviewItemDto[];
}>) {
  if (reviewPreview.length === 0) {
    return <EmptyStateBanner title="No published reviews yet" description="The review gate is ready, but this exhibition has no public social proof yet." />;
  }

  return (
    <>
      {reviewPreview.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.reviewAuthor}>{review.authorName}</Text>
            <Text style={styles.statusText}>{review.rating}/5 · {formatDistanceToNow(parseISO(review.createdAt), { addSuffix: true })}</Text>
          </View>
          <Text style={styles.reviewMeta}>{review.status}</Text>
          <Text style={styles.text}>{review.content}</Text>
        </View>
      ))}
    </>
  );
}

export function GalleryDetailScreen({ galleryId, onOpenRegistration, onOpenReview }: GalleryDetailScreenProps) {
  const detailQuery = useExhibitionDetail(galleryId);

  if (detailQuery.isLoading && !detailQuery.data) {
    return (
      <ScreenShell eyebrow="Visitor flow" title="Exhibition details" subtitle="Loading venue, policy, and availability from the backend read path.">
        <StatusChip label="Loading exhibition" tone="neutral" />
      </ScreenShell>
    );
  }

  if (detailQuery.isError) {
    return (
      <ScreenShell eyebrow="Visitor flow" title="Exhibition details" subtitle="The detail view could not restore the exhibition read model.">
        <ErrorRecoveryPanel
          description={detailQuery.error instanceof Error ? detailQuery.error.message : "Exhibition detail query failed."}
          onRetry={() => {
            detailQuery.refetch();
          }}
        />
      </ScreenShell>
    );
  }

  const detail = detailQuery.data;
  if (!detail) {
    return (
      <ScreenShell eyebrow="Visitor flow" title="Exhibition details" subtitle="This exhibition could not be found in the live read model.">
        <EmptyStateBanner title="Exhibition unavailable" description="Return to Gallery Home and choose another exhibition from the discover feed." />
      </ScreenShell>
    );
  }

  const { exhibition, venue, sessions, reviewPreview, curatorNote, policyText, highlights } = detail;
  const averageRating = reviewPreview.length > 0 ? (reviewPreview.reduce((sum, review) => sum + review.rating, 0) / reviewPreview.length).toFixed(1) : "New";
  const primaryLabel = getPrimaryLabel(exhibition.registrationState);
  const mapPreviewAvailable = venue?.latitude !== undefined && venue?.longitude !== undefined;
  const canOpenMap = Boolean(venue?.address?.trim());
  const heroImageUri = assetsApi.resolveAssetUrl(exhibition.heroImageUrl);

  const openMap = () => {
    if (!venue?.address) {
      return;
    }

    const query = encodeURIComponent(venue.address);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <ScreenShell eyebrow="Visitor flow" title={exhibition.title} subtitle={exhibition.bio ?? curatorNote ?? "Review the venue, timing, and next attendance action before reserving."}>
      <View style={styles.heroCard}>
        {heroImageUri ? <Image source={{ uri: heroImageUri }} style={styles.heroImage} /> : null}
        <View style={[styles.heroAccent, { backgroundColor: exhibition.accent ?? palette.accent }]} />
        <View style={styles.badgeRow}>
          <Text style={styles.typeBadge}>{exhibition.exhibitionType}</Text>
          <Text style={styles.ratingBadge}>{averageRating}/5</Text>
        </View>
        <Text style={styles.heroTitle}>{exhibition.capacityBadge}</Text>
        <StatusChip label={primaryLabel} tone={getRegistrationTone(exhibition.registrationState)} />
        <Text style={styles.text}>{curatorNote ?? "Availability is driven by the next published session and its capacity."}</Text>
        <View style={styles.actionRow}>
          <Pressable
            onPress={exhibition.registrationState === "closed" ? undefined : onOpenRegistration}
            style={[styles.primaryButton, exhibition.registrationState === "closed" && styles.primaryButtonDisabled]}
            disabled={exhibition.registrationState === "closed"}
          >
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>
          <Pressable onPress={onOpenReview} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Rate & comment</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Visit blueprint</Text>
        <Text style={styles.text}>{exhibition.dateLabel} · {exhibition.timeLabel}</Text>
        <Text style={styles.text}>{exhibition.capacityBadge}</Text>
        <Text style={styles.text}>{exhibition.district} · {exhibition.organizerName}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Session availability</Text>
        <SessionAvailabilitySection sessions={sessions} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Address</Text>
        <AddressSection canOpenMap={canOpenMap} mapPreviewAvailable={mapPreviewAvailable} onOpenMap={openMap} venue={venue} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>House policy</Text>
        <Text style={styles.text}>{policyText ?? "Policy details will appear here when the organizer finalizes attendance rules."}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Experience highlights</Text>
        <View style={styles.chipRow}>
          {highlights.map((highlight) => (
            <View key={highlight} style={styles.personChip}>
              <Text style={styles.personChipText}>{highlight}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Community preview</Text>
        <CommunityPreviewSection reviewPreview={reviewPreview} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: "hidden"
  },
  heroImage: {
    height: 196,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.sm,
  },
  heroAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6
  },
  panel: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  typeBadge: {
    backgroundColor: palette.backgroundAlt,
    color: palette.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontWeight: "700",
    overflow: "hidden",
    fontFamily: typography.body
  },
  ratingBadge: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  },
  heroTitle: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700"
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.body,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  text: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: typography.body
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.48,
  },
  primaryButtonText: {
    color: palette.white,
    fontFamily: typography.body,
    fontWeight: "700"
  },
  secondaryButton: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  secondaryButtonText: {
    color: palette.text,
    fontFamily: typography.body,
    fontWeight: "700"
  },
  linkButton: {
    marginTop: spacing.xs,
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  linkButtonText: {
    color: palette.white,
    fontWeight: "700",
    fontFamily: typography.body
  },
  mapFrame: {
    height: 160,
    borderRadius: radii.md,
    backgroundColor: palette.backgroundAlt,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: spacing.sm,
  },
  mapFrameMuted: {
    opacity: 0.78,
  },
  mapFrameOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(37, 23, 19, 0.07)"
  },
  mapFrameBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "rgba(255, 248, 241, 0.9)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  mapFrameBadgeText: {
    color: palette.accent,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4
  },
  mapFrameText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 248, 241, 0.86)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  personChip: {
    backgroundColor: palette.backgroundAlt,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  personChipText: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: "700"
  },
  sessionCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  reviewCard: {
    backgroundColor: palette.muted,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: spacing.xs
  },
  reviewAuthor: {
    color: palette.text,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: "700"
  },
  reviewMeta: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 13
  },
  statusText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: typography.body
  }
});
