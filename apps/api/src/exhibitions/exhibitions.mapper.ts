import type {
  ExhibitionDetailDto,
  ExhibitionStatus,
  ExhibitionSummaryDto,
  GallerySummary,
  LegacyGalleryStatus,
  RegistrationCtaState,
  ReviewItemDto,
  SessionAvailabilityDto,
  SessionStatus,
  Venue,
} from "../common/contracts";

export type DiscoverTimeline = "present" | "future" | "past";

export type ExhibitionRecord = Readonly<{
  id: string;
  organizerId: string;
  organizerName: string;
  venueId?: string;
  title: string;
  exhibitionType: string;
  bio: string;
  status: ExhibitionStatus;
  accent?: string;
  curatorNote?: string;
  policyText?: string;
  highlights: string[];
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}>;

export type ExhibitionSessionRecord = Readonly<{
  id: string;
  exhibitionId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  reservedCount: number;
  waitlistCapacity?: number;
  registrationState: RegistrationCtaState;
  status: SessionStatus;
  vibe?: string;
}>;

export type ExhibitionReviewRecord = Readonly<ReviewItemDto & { exhibitionId: string }>;

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatMonthDay(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sortSessions(sessions: readonly ExhibitionSessionRecord[]) {
  return [...sessions].sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));
}

function pickPrimarySession(sessions: readonly ExhibitionSessionRecord[], now: Date) {
  const ordered = sortSessions(sessions);
  const nextScheduled = ordered.find((session) => session.status === "SCHEDULED" && Date.parse(session.endsAt) >= now.getTime());
  return nextScheduled ?? ordered.at(-1);
}

function formatDateRangeLabel(sessions: readonly ExhibitionSessionRecord[]) {
  const ordered = sortSessions(sessions);
  if (ordered.length === 0) {
    return "Schedule to be announced";
  }

  const lastSession = ordered.at(-1);
  if (!lastSession) {
    return "Schedule to be announced";
  }

  const first = new Date(ordered[0].startsAt);
  const last = new Date(lastSession.startsAt);
  if (first.toDateString() === last.toDateString()) {
    return formatDate(first);
  }

  return `${formatMonthDay(first)} - ${formatDate(last)}`;
}

function formatTimeLabel(session?: ExhibitionSessionRecord) {
  if (!session) {
    return "Session times pending";
  }

  const start = new Date(session.startsAt);
  const end = new Date(session.endsAt);
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function getRemainingCapacity(session: ExhibitionSessionRecord) {
  return Math.max(session.capacity - session.reservedCount, 0);
}

function getCapacityBadge(session?: ExhibitionSessionRecord) {
  if (!session || session.registrationState === "closed") {
    return "Registration closed";
  }

  if (session.registrationState === "waitlist") {
    return session.waitlistCapacity ? `Waitlist open (${session.waitlistCapacity} spots)` : "Waitlist open";
  }

  const remaining = getRemainingCapacity(session);
  if (remaining === 0) {
    return session.waitlistCapacity ? `Waitlist open (${session.waitlistCapacity} spots)` : "Sold out";
  }

  return `${remaining} spots left`;
}

function pickHeroImageUrl(mediaUrls: readonly string[]) {
  return mediaUrls.find((value) => /^https?:\/\//i.test(value) || value.startsWith("/"));
}

function toLegacyTimelineStatus(timeline: DiscoverTimeline): LegacyGalleryStatus {
  if (timeline === "future") {
    return "FUTURE";
  }

  if (timeline === "past") {
    return "PAST";
  }

  return "PRESENT";
}

export function getDiscoverTimeline(
  exhibitionStatus: ExhibitionStatus,
  sessions: readonly ExhibitionSessionRecord[],
  now: Date
): DiscoverTimeline {
  if (sessions.length === 0) {
    return exhibitionStatus === "CLOSED" ? "past" : "future";
  }

  const ordered = sortSessions(sessions);
  const lastSession = ordered.at(-1);
  if (!lastSession) {
    return exhibitionStatus === "CLOSED" ? "past" : "future";
  }

  const firstStart = Date.parse(ordered[0].startsAt);
  const lastEnd = Date.parse(lastSession.endsAt);

  if (exhibitionStatus === "CLOSED" || lastEnd < now.getTime()) {
    return "past";
  }

  if (firstStart > now.getTime()) {
    return "future";
  }

  return "present";
}

function toSessionAvailabilityDto(session: ExhibitionSessionRecord): SessionAvailabilityDto {
  return {
    sessionId: session.id,
    dateLabel: formatDate(new Date(session.startsAt)),
    timeLabel: formatTimeLabel(session),
    capacity: session.capacity,
    remainingCapacity: getRemainingCapacity(session),
    waitlistCapacity: session.waitlistCapacity,
    registrationState: session.registrationState,
    status: session.status,
    vibe: session.vibe,
  };
}

export function toExhibitionSummary(
  exhibition: ExhibitionRecord,
  venue: Venue | undefined,
  sessions: readonly ExhibitionSessionRecord[],
  now: Date
): ExhibitionSummaryDto {
  const primarySession = pickPrimarySession(sessions, now);
  const timeline = getDiscoverTimeline(exhibition.status, sessions, now);

  return {
    id: exhibition.id,
    title: exhibition.title,
    bio: exhibition.bio,
    exhibitionType: exhibition.exhibitionType,
    heroImageUrl: pickHeroImageUrl(exhibition.mediaUrls),
    status: exhibition.status,
    timelineStatus: toLegacyTimelineStatus(timeline),
    organizerName: exhibition.organizerName,
    district: venue?.district ?? "District pending",
    venueTitle: venue?.title,
    dateLabel: formatDateRangeLabel(sessions),
    timeLabel: formatTimeLabel(primarySession),
    capacityBadge: getCapacityBadge(primarySession),
    registrationState: primarySession?.registrationState ?? "closed",
    accent: exhibition.accent,
  };
}

export function toExhibitionDetail(
  exhibition: ExhibitionRecord,
  venue: Venue | undefined,
  sessions: readonly ExhibitionSessionRecord[],
  reviews: readonly ExhibitionReviewRecord[],
  now: Date
): ExhibitionDetailDto {
  return {
    exhibition: toExhibitionSummary(exhibition, venue, sessions, now),
    venue,
    sessions: sortSessions(sessions).map((session) => toSessionAvailabilityDto(session)),
    policyText: exhibition.policyText,
    curatorNote: exhibition.curatorNote,
    highlights: [...exhibition.highlights],
    reviewPreview: reviews.filter((review) => review.status === "PUBLISHED").slice(0, 3),
  };
}

export function toLegacyGallerySummary(summary: ExhibitionSummaryDto, timeline: DiscoverTimeline): GallerySummary {
  return {
    id: summary.id,
    title: summary.title,
    galleryType: summary.exhibitionType,
    district: summary.district,
    dateLabel: summary.dateLabel,
    timeLabel: summary.timeLabel,
    organizer: summary.organizerName,
    status: toLegacyTimelineStatus(timeline),
  };
}