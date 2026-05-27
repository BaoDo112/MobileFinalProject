import type { NotificationPreference, RegistrationFieldDto, Venue } from "../common/contracts";
import type { ExhibitionRecord, ExhibitionReviewRecord, ExhibitionSessionRecord } from "../exhibitions/exhibitions.mapper";
import type { CommentRecord, FormSchemaVersionRecord, PersistedAppState, RegistrationRecord, ReviewRecord, StampRecord, StoredAccount } from "./app-state.types";

function withTimeOffset(reference: Date, dayOffset: number, hour: number, minute: number, durationMinutes: number) {
  const start = new Date(reference);
  start.setDate(start.getDate() + dayOffset);
  start.setHours(hour, minute, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  return {
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSessionLabel(startsAt: string, endsAt: string) {
  return `${formatDate(new Date(startsAt))} · ${formatTime(new Date(startsAt))} - ${formatTime(new Date(endsAt))}`;
}

function buildSeedExhibitions(referenceDate: Date) {
  const nowIso = referenceDate.toISOString();

  const venues: Venue[] = [
    {
      id: "v-01",
      title: "Arthera Studio Hall A",
      district: "District 1",
      address: "25 Nguyen Hue, District 1, Ho Chi Minh City",
      city: "Ho Chi Minh City",
      latitude: 10.776531,
      longitude: 106.702087,
      accessibilityNotes: "Barrier-free entrance and a quiet decompression zone near the lobby.",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "v-02",
      title: "Cedar House Courtyard",
      district: "District 3",
      address: "88 Vo Van Tan, District 3, Ho Chi Minh City",
      city: "Ho Chi Minh City",
      accessibilityNotes: "Courtyard seating is available, but the preview route uses uneven stone flooring.",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "v-03",
      title: "Lane 6 Annex",
      district: "Binh Thanh",
      address: "12 Phan Dang Luu, Binh Thanh, Ho Chi Minh City",
      city: "Ho Chi Minh City",
      latitude: 10.801179,
      longitude: 106.701784,
      accessibilityNotes: "Archive room is on the ground floor with headphone support on request.",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const records: ExhibitionRecord[] = [
    {
      id: "g-01",
      organizerId: "org-01",
      organizerName: "Arthera Studio",
      venueId: "v-01",
      title: "Lightwave: Kinetic Gallery",
      exhibitionType: "Technology",
      bio: "An immersive showcase where responsive projections react to live sound and body movement.",
      status: "PUBLISHED",
      accent: "#d66b55",
      curatorNote: "Arrive 10 minutes early for the intro loop and motion calibration.",
      policyText: "Check in 15 minutes before your session. Late arrivals may be reassigned to the next available quiet-entry slot.",
      highlights: ["Reactive projection hall", "Late-night audio slot", "Accessible pathway"],
      mediaUrls: ["hero-lightwave.jpg", "hall-a.jpg"],
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "g-02",
      organizerId: "org-02",
      organizerName: "Cedar House",
      venueId: "v-02",
      title: "Roots in Motion",
      exhibitionType: "Art",
      bio: "A visual dialogue between traditional materials and contemporary installation techniques.",
      status: "PUBLISHED",
      accent: "#ba6f3d",
      curatorNote: "Preview week keeps the route intimate, so registration closes quickly.",
      policyText: "Preview sessions are capped tightly. Join the waitlist to receive the first reopened slot by email.",
      highlights: ["Ceramic installation line", "Hands-on material table", "Curator Q&A"],
      mediaUrls: ["roots-main.jpg"],
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "g-03",
      organizerId: "org-03",
      organizerName: "Lane 6 Collective",
      venueId: "v-03",
      title: "Memory of Neon Streets",
      exhibitionType: "Mixed",
      bio: "Photography and mapped projection pieces tracing how city light shifts after midnight.",
      status: "CLOSED",
      accent: "#6f4d67",
      curatorNote: "The team kept a full walk-through recording for returning visitors and review prompts.",
      policyText: "Archive replay is open for reading and reflection only. New registrations are closed.",
      highlights: ["Photo essay wall", "Projection archive", "Post-visit critique notes"],
      mediaUrls: ["neon-main.jpg"],
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "g-04",
      organizerId: "org-04",
      organizerName: "The Factory",
      venueId: "v-01",
      title: "Abstract Forms",
      exhibitionType: "Art",
      bio: "A study of abstract geometry in modern urban spaces.",
      status: "PUBLISHED",
      accent: "#437b5a",
      curatorNote: "Explore the installations at your own pace.",
      policyText: "Please avoid touching the sculptures.",
      highlights: ["Giant structures", "Minimalist lighting"],
      mediaUrls: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "g-05",
      organizerId: "org-01",
      organizerName: "Arthera Studio",
      venueId: "v-02",
      title: "Echoes of the Past",
      exhibitionType: "History",
      bio: "Historical artifacts brought to life with AR.",
      status: "PUBLISHED",
      accent: "#1e3a8a",
      curatorNote: "Download the AR app before entering.",
      policyText: "Headphones required.",
      highlights: ["AR experiences", "Ancient artifacts"],
      mediaUrls: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const sessions: ExhibitionSessionRecord[] = [
    {
      id: "s-01-1",
      exhibitionId: "g-01",
      ...withTimeOffset(referenceDate, -1, 18, 30, 90),
      capacity: 32,
      reservedCount: 32,
      waitlistCapacity: 12,
      registrationState: "closed",
      status: "COMPLETED",
      vibe: "Opening-night motion calibration",
    },
    {
      id: "s-01-2",
      exhibitionId: "g-01",
      ...withTimeOffset(referenceDate, 1, 18, 30, 90),
      capacity: 32,
      reservedCount: 20,
      waitlistCapacity: 12,
      registrationState: "open",
      status: "SCHEDULED",
      vibe: "Best balance of light and crowd",
    },
    {
      id: "s-01-3",
      exhibitionId: "g-01",
      ...withTimeOffset(referenceDate, 2, 20, 0, 90),
      capacity: 32,
      reservedCount: 31,
      waitlistCapacity: 12,
      registrationState: "waitlist",
      status: "SCHEDULED",
      vibe: "High-contrast late night audio",
    },
    {
      id: "s-02-1",
      exhibitionId: "g-02",
      ...withTimeOffset(referenceDate, 12, 10, 0, 75),
      capacity: 24,
      reservedCount: 24,
      waitlistCapacity: 18,
      registrationState: "waitlist",
      status: "SCHEDULED",
      vibe: "Quiet guided route",
    },
    {
      id: "s-02-2",
      exhibitionId: "g-02",
      ...withTimeOffset(referenceDate, 13, 14, 0, 75),
      capacity: 24,
      reservedCount: 24,
      waitlistCapacity: 18,
      registrationState: "waitlist",
      status: "SCHEDULED",
      vibe: "Material table with curator Q&A",
    },
    {
      id: "s-03-1",
      exhibitionId: "g-03",
      ...withTimeOffset(referenceDate, -28, 11, 0, 90),
      capacity: 48,
      reservedCount: 48,
      registrationState: "closed",
      status: "COMPLETED",
      vibe: "Archive replay",
    },
    {
      id: "s-04-1",
      exhibitionId: "g-04",
      ...withTimeOffset(referenceDate, -1, 10, 0, 90),
      capacity: 30,
      reservedCount: 30,
      registrationState: "closed",
      status: "COMPLETED",
      vibe: "Opening morning",
    },
    {
      id: "s-04-2",
      exhibitionId: "g-04",
      ...withTimeOffset(referenceDate, 2, 10, 0, 90),
      capacity: 30,
      reservedCount: 15,
      registrationState: "open",
      status: "SCHEDULED",
      vibe: "Weekend viewing",
    },
    {
      id: "s-05-1",
      exhibitionId: "g-05",
      ...withTimeOffset(referenceDate, -2, 9, 0, 90),
      capacity: 50,
      reservedCount: 50,
      registrationState: "closed",
      status: "COMPLETED",
      vibe: "Early access",
    },
    {
      id: "s-05-2",
      exhibitionId: "g-05",
      ...withTimeOffset(referenceDate, 1, 14, 0, 90),
      capacity: 50,
      reservedCount: 40,
      waitlistCapacity: 10,
      registrationState: "waitlist",
      status: "SCHEDULED",
      vibe: "Curator guided tour",
    },
  ];

  const reviews: ReviewRecord[] = [
    {
      id: "r-01",
      exhibitionId: "g-01",
      visitorId: "seed-reviewer-1-1",
      authorName: "Bao Nguyen",
      rating: 5,
      content: "The projection hall felt alive. Staff pacing made the experience calm instead of crowded.",
      status: "PUBLISHED",
      createdAt: withTimeOffset(referenceDate, -1, 21, 0, 0).startsAt,
    },
    {
      id: "r-02",
      exhibitionId: "g-01",
      visitorId: "seed-reviewer-1-2",
      authorName: "Truc Le",
      rating: 4,
      content: "Loved the guided intro. I would book the late-night slot again for stronger contrast.",
      status: "PUBLISHED",
      createdAt: withTimeOffset(referenceDate, -2, 9, 0, 0).startsAt,
    },
    {
      id: "r-03",
      exhibitionId: "g-02",
      visitorId: "seed-reviewer-2-1",
      authorName: "Hanh Do",
      rating: 5,
      content: "Preview material already feels well-curated. The hands-on table is worth the queue.",
      status: "PUBLISHED",
      createdAt: withTimeOffset(referenceDate, -3, 14, 0, 0).startsAt,
    },
    {
      id: "r-04",
      exhibitionId: "g-03",
      visitorId: "seed-reviewer-3-1",
      authorName: "Khoa Tran",
      rating: 4,
      content: "Archive wall sequencing was strong. I stayed longer than planned just reading the notes.",
      status: "PUBLISHED",
      createdAt: withTimeOffset(referenceDate, -20, 16, 0, 0).startsAt,
    },
  ];

  const reviewRecords: ExhibitionReviewRecord[] = reviews.map((review) => ({
    id: review.id,
    exhibitionId: review.exhibitionId,
    authorName: review.authorName,
    rating: review.rating,
    content: review.content,
    status: review.status,
    createdAt: review.updatedAt ?? review.createdAt,
  }));

  return { venues, records, sessions, reviews, reviewRecords };
}

function buildFormSchemaState(referenceDate: Date): Record<string, FormSchemaVersionRecord[]> {
  const now = referenceDate.toISOString();
  const definitions: Record<string, { formSchemaVersionId: string; consentTitle?: string; consentCopy?: string; fields: RegistrationFieldDto[] }> = {
    "g-01": {
      formSchemaVersionId: "fs-g-01-v1",
      consentTitle: "Confirm your visit details",
      consentCopy: "Your answers are used for session check-in, accessibility prep, and same-day organizer coordination.",
      fields: [
        { id: "full-name", label: "Full name", type: "TEXT", placeholder: "Your full name", isRequired: true, options: [], helpText: "Used for session check-in.", order: 1 },
        { id: "email", label: "Email", type: "EMAIL", placeholder: "name@example.com", isRequired: true, options: [], helpText: "Confirmation and reminder are sent here.", order: 2 },
        { id: "phone", label: "Phone", type: "PHONE", placeholder: "09xx xxx xxx", isRequired: true, options: [], helpText: "Used if the session time changes.", order: 3 },
        { id: "comfort-mode", label: "Preferred session mood", type: "SELECT", placeholder: "Choose a slot style", isRequired: true, options: ["Quiet walkthrough", "Interactive / playful", "Late-night contrast"], helpText: "Helps the host balance each session.", order: 4 },
        { id: "accessibility", label: "Accessibility notes", type: "TEXTAREA", placeholder: "Anything the team should prepare for your visit", isRequired: false, options: [], helpText: "Optional, but useful for planning accessible support.", order: 5 },
      ],
    },
    "g-02": {
      formSchemaVersionId: "fs-g-02-v1",
      consentTitle: "Join the preview waitlist",
      consentCopy: "Preview sessions are capacity-managed. You will receive a confirmation if the waitlist clears.",
      fields: [
        { id: "full-name", label: "Full name", type: "TEXT", placeholder: "Your full name", isRequired: true, options: [], order: 1 },
        { id: "email", label: "Email", type: "EMAIL", placeholder: "name@example.com", isRequired: true, options: [], order: 2 },
        { id: "favorite-material", label: "What material are you most curious about?", type: "SELECT", placeholder: "Select one", isRequired: false, options: ["Clay", "Wood", "Fiber", "Mixed media"], order: 3 },
      ],
    },
    "g-03": {
      formSchemaVersionId: "fs-g-03-v1",
      consentTitle: "Archive replay request",
      consentCopy: "Archive replay is closed for new reservations, but saved questions help shape future replays.",
      fields: [
        { id: "reflection", label: "Archive reflection", type: "TEXTAREA", placeholder: "What visual moment stayed with you?", isRequired: false, options: [], helpText: "Used as a prompt before leaving a rating and comment.", order: 1 },
      ],
    },
  };

  return Object.fromEntries(
    Object.entries(definitions).map(([exhibitionId, definition]) => [
      exhibitionId,
      [
        {
          exhibitionId,
          formSchemaVersionId: definition.formSchemaVersionId,
          version: 1,
          isActive: true,
          consentTitle: definition.consentTitle,
          consentCopy: definition.consentCopy,
          fields: definition.fields,
          createdAt: now,
          updatedAt: now,
        },
      ],
    ])
  );
}

function buildRegistrationRecords(referenceDate: Date, sessions: readonly ExhibitionSessionRecord[]): RegistrationRecord[] {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const label = (sessionId: string) => {
    const session = sessionById.get(sessionId);
    if (!session) {
      return "Schedule pending";
    }

    return formatSessionLabel(session.startsAt, session.endsAt);
  };

  return [
    {
      id: "seed-reg-01",
      attendeeName: "Bao Nguyen",
      userId: "seed-visitor-01",
      exhibitionId: "g-01",
      exhibitionTitle: "Lightwave: Kinetic Gallery",
      sessionId: "s-01-1",
      sessionLabel: label("s-01-1"),
      status: "CHECKED_IN",
      note: "Arrived early for calibration briefing.",
      answers: [],
      submittedAt: new Date(referenceDate.getTime() - 172_800_000).toISOString(),
      checkedInAt: new Date(referenceDate.getTime() - 169_200_000).toISOString(),
    },
    {
      id: "seed-reg-02",
      attendeeName: "Truc Le",
      userId: "seed-visitor-02",
      exhibitionId: "g-01",
      exhibitionTitle: "Lightwave: Kinetic Gallery",
      sessionId: "s-01-2",
      sessionLabel: label("s-01-2"),
      status: "CONFIRMED",
      note: "Prefers quiet entry lane.",
      answers: [],
      submittedAt: new Date(referenceDate.getTime() - 86_400_000).toISOString(),
    },
    {
      id: "seed-reg-03",
      attendeeName: "Linh Dao",
      userId: "seed-visitor-03",
      exhibitionId: "g-01",
      exhibitionTitle: "Lightwave: Kinetic Gallery",
      sessionId: "s-01-2",
      sessionLabel: label("s-01-2"),
      status: "PENDING",
      note: "Needs accessibility support confirmation.",
      answers: [],
      submittedAt: new Date(referenceDate.getTime() - 43_200_000).toISOString(),
    },
    {
      id: "seed-reg-04",
      attendeeName: "Hanh Do",
      userId: "seed-visitor-04",
      exhibitionId: "g-02",
      exhibitionTitle: "Roots in Motion",
      sessionId: "s-02-2",
      sessionLabel: label("s-02-2"),
      status: "WAITLISTED",
      note: "Hoping for the curator Q&A route.",
      answers: [],
      submittedAt: new Date(referenceDate.getTime() - 21_600_000).toISOString(),
    },
    {
      id: "seed-reg-05",
      attendeeName: "Nhi Ho",
      userId: "seed-visitor-05",
      exhibitionId: "g-03",
      exhibitionTitle: "Memory of Neon Streets",
      sessionId: "s-03-1",
      sessionLabel: label("s-03-1"),
      status: "REJECTED",
      note: "Archive replay request was late.",
      answers: [],
      submittedAt: new Date(referenceDate.getTime() - 604_800_000).toISOString(),
    },
    {
      id: "seed-reg-06",
      attendeeName: "Minh Vu",
      userId: "seed-visitor-06",
      exhibitionId: "g-02",
      exhibitionTitle: "Roots in Motion",
      sessionId: "s-02-1",
      sessionLabel: label("s-02-1"),
      status: "CANCELLED",
      note: "Cancelled before confirmation.",
      answers: [],
      submittedAt: new Date(referenceDate.getTime() - 10_800_000).toISOString(),
    },
  ];
}

function buildCommentRecords(referenceDate: Date): CommentRecord[] {
  return [
    {
      id: "comment-1",
      galleryId: "g-01",
      author: "Bao Nguyen",
      body: "The calibration intro helped me settle in before the motion wall opened up.",
      rating: 5,
      roleLabel: "Visitor",
      highlight: "Quiet route felt intentional",
      createdAt: new Date(referenceDate.getTime() - 172_000_000).toISOString(),
    },
    {
      id: "comment-2",
      galleryId: "g-02",
      author: "Hanh Do",
      body: "Material samples were the strongest part of the preview route.",
      rating: 5,
      roleLabel: "Visitor",
      highlight: "Hands-on table",
      createdAt: new Date(referenceDate.getTime() - 64_000_000).toISOString(),
    },
    {
      id: "comment-3",
      galleryId: "g-03",
      author: "Khoa Tran",
      body: "The archive notes still read well even after the live program closed.",
      rating: 4,
      roleLabel: "Visitor",
      highlight: "Archive wall sequencing",
      createdAt: new Date(referenceDate.getTime() - 600_000_000).toISOString(),
    },
  ];
}

export const v14WorkflowSeed = {
  smokeAccounts: {
    organizer: {
      email: "smoke.organizer@arthera.local",
      role: "ORGANIZER",
      name: "Smoke Organizer",
    },
    visitor: {
      email: "smoke.visitor@arthera.local",
      role: "VISITOR",
      name: "Smoke Visitor",
    },
  },
  publishedExhibitions: {
    lightwave: {
      exhibitionId: "g-01",
      title: "Lightwave: Kinetic Gallery",
      openSessionId: "s-01-2",
      pendingRegistrationId: "seed-reg-03",
    },
    roots: {
      exhibitionId: "g-02",
      title: "Roots in Motion",
      waitlistSessionId: "s-02-1",
    },
    neon: {
      exhibitionId: "g-03",
      title: "Memory of Neon Streets",
      archiveSessionId: "s-03-1",
    },
  },
  draftBlueprint: {
    title: "Signal Garden Draft",
    exhibitionType: "Installation",
    venueId: "v-01",
    sessionStartsAt: "2026-06-10T11:00:00.000Z",
    sessionEndsAt: "2026-06-10T12:15:00.000Z",
  },
} as const;

export function buildRuntimeSeed(referenceDate = new Date()): PersistedAppState {
  const exhibitions = buildSeedExhibitions(referenceDate);

  return {
    version: "2026.05.runtime-state.v1",
    updatedAt: referenceDate.toISOString(),
    auth: {
      users: [],
      accounts: [] as StoredAccount[],
      visitorProfiles: [],
      organizerProfiles: [],
      preferences: [] as NotificationPreference[],
    },
    exhibitions: {
      records: exhibitions.records,
      venues: exhibitions.venues,
      sessions: exhibitions.sessions,
      reviewRecords: exhibitions.reviewRecords,
    },
    formSchemas: {
      versionsByExhibitionId: buildFormSchemaState(referenceDate),
    },
    registrations: {
      records: buildRegistrationRecords(referenceDate, exhibitions.sessions),
    },
    reviews: {
      records: exhibitions.reviews,
    },
    stamps: {
      records: [] as StampRecord[],
    },
    comments: {
      records: buildCommentRecords(referenceDate),
    },
  };
}