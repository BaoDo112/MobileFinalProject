import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { AssetsService } from "../assets/assets.service";
import type {
  AuthoringSessionDto,
  ExhibitionEditorDto,
  ExhibitionPayload,
  ReviewItemDto,
  ExhibitionSummaryDto,
  FormSchemaEditorDto,
  GallerySummary,
  LegacyGalleryStatus,
  RegistrationCtaState,
  SaveExhibitionDraftDto,
  SessionAvailabilityDto,
  Venue,
  VenueOptionDto,
} from "../common/contracts";
import {
  getDiscoverTimeline,
  toExhibitionDetail,
  toExhibitionSummary,
  toLegacyGallerySummary,
  type DiscoverTimeline,
  type ExhibitionRecord,
  type ExhibitionReviewRecord,
  type ExhibitionSessionRecord,
} from "./exhibitions.mapper";
import { AppStateService } from "../persistence/app-state.service";

type DiscoverFilters = Readonly<{
  timeline?: DiscoverTimeline;
  district?: string;
  type?: string;
  registrationState?: RegistrationCtaState;
  organizerId?: string;
}>;

type EditorContext = Readonly<{
  availableVenues: VenueOptionDto[];
  formSchema: FormSchemaEditorDto;
  isLocked: boolean;
  lockReason?: string;
}>;

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

function buildSeedData(referenceDate: Date) {
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

  const exhibitions: ExhibitionRecord[] = [
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
  ];

  const reviews: ExhibitionReviewRecord[] = [
    {
      id: "r-01",
      exhibitionId: "g-01",
      authorName: "Bao Nguyen",
      rating: 5,
      content: "The projection hall felt alive. Staff pacing made the experience calm instead of crowded.",
      status: "PUBLISHED",
      createdAt: withTimeOffset(referenceDate, -1, 21, 0, 0).startsAt,
    },
    {
      id: "r-02",
      exhibitionId: "g-01",
      authorName: "Truc Le",
      rating: 4,
      content: "Loved the guided intro. I would book the late-night slot again for stronger contrast.",
      status: "PUBLISHED",
      createdAt: withTimeOffset(referenceDate, -2, 9, 0, 0).startsAt,
    },
    {
      id: "r-03",
      exhibitionId: "g-02",
      authorName: "Hanh Do",
      rating: 5,
      content: "Preview material already feels well-curated. The hands-on table is worth the queue.",
      status: "PUBLISHED",
      createdAt: withTimeOffset(referenceDate, -3, 14, 0, 0).startsAt,
    },
    {
      id: "r-04",
      exhibitionId: "g-03",
      authorName: "Khoa Tran",
      rating: 4,
      content: "Archive wall sequencing was strong. I stayed longer than planned just reading the notes.",
      status: "PUBLISHED",
      createdAt: withTimeOffset(referenceDate, -20, 16, 0, 0).startsAt,
    },
  ];

  return { venues, exhibitions, sessions, reviews };
}

@Injectable()
export class ExhibitionsService {
  constructor(
    private readonly appState: AppStateService,
    private readonly assetsService: AssetsService,
  ) {}

  private get records() {
    return this.appState.getState().exhibitions.records;
  }

  private get venues() {
    return this.appState.getState().exhibitions.venues;
  }

  private get sessionRecords() {
    return this.appState.getState().exhibitions.sessions;
  }

  private get reviewRecords() {
    return this.appState.getState().exhibitions.reviewRecords;
  }

  async create(payload: ExhibitionPayload) {
    const record = this.buildDraftRecord({
      organizerId: payload.organizerId,
      organizerName: payload.organizerId,
      title: payload.title,
      exhibitionType: payload.exhibitionType,
      bio: payload.bio,
      mediaUrls: payload.mediaUrls,
    });

    this.records.push(record);
    await this.appState.persist();
    return record;
  }

  async createDraft(organizerId: string, organizerName: string) {
    const record = this.buildDraftRecord({ organizerId, organizerName });
    this.records.push(record);
    await this.appState.persist();
    return record;
  }

  listVenues(): VenueOptionDto[] {
    return this.venues.map((venue) => ({
      id: venue.id,
      title: venue.title,
      district: venue.district,
      address: venue.address,
      city: venue.city,
    }));
  }

  listByOrganizer(organizerId?: string) {
    return this.listDiscover({ organizerId });
  }

  listDiscover(filters: DiscoverFilters = {}) {
    return this.records
      .filter((record) => !filters.organizerId || record.organizerId === filters.organizerId)
      .map((record) => {
        const sessions = this.getSessions(record.id);
        const timeline = getDiscoverTimeline(record.status, sessions, new Date());
        const summary = toExhibitionSummary(record, this.getVenue(record.venueId), sessions, new Date());
        return { summary, timeline };
      })
      .filter(({ summary, timeline }) => {
        if (filters.timeline && timeline !== filters.timeline) {
          return false;
        }

        if (filters.district && summary.district.toLowerCase() !== filters.district.trim().toLowerCase()) {
          return false;
        }

        if (filters.type && summary.exhibitionType.toLowerCase() !== filters.type.trim().toLowerCase()) {
          return false;
        }

        if (filters.registrationState && summary.registrationState !== filters.registrationState) {
          return false;
        }

        return true;
      })
      .map(({ summary }) => summary);
  }

  getDetail(id: string) {
    const record = this.requireRecord(id);
    return toExhibitionDetail(record, this.getVenue(record.venueId), this.getSessions(record.id), this.getReviews(record.id), new Date());
  }

  getSummary(id: string): ExhibitionSummaryDto {
    const record = this.requireRecord(id);
    return toExhibitionSummary(record, this.getVenue(record.venueId), this.getSessions(record.id), new Date());
  }

  getSessionAvailability(exhibitionId: string): SessionAvailabilityDto[] {
    const record = this.requireRecord(exhibitionId);
    return toExhibitionDetail(record, this.getVenue(record.venueId), this.getSessions(record.id), this.getReviews(record.id), new Date()).sessions;
  }

  listAuthoringSessions(exhibitionId: string): AuthoringSessionDto[] {
    this.requireRecord(exhibitionId);
    return this.getSessions(exhibitionId).map((session) => this.toAuthoringSessionDto(session));
  }

  getEditorState(exhibitionId: string, context: EditorContext): ExhibitionEditorDto {
    const record = this.requireRecord(exhibitionId);
    const sessions = this.getSessions(exhibitionId);
    const checklist = this.buildPublishChecklist(record, sessions, context.formSchema, context.isLocked, context.lockReason);

    return {
      exhibitionId: record.id,
      organizerId: record.organizerId,
      organizerName: record.organizerName,
      title: record.title,
      exhibitionType: record.exhibitionType,
      bio: record.bio,
      venueId: record.venueId,
      status: record.status,
      mediaUrls: [...record.mediaUrls],
      curatorNote: record.curatorNote,
      policyText: record.policyText,
      highlightList: [...record.highlights],
      sessions: sessions.map((session) => this.toAuthoringSessionDto(session)),
      formSchema: {
        formSchemaVersionId: context.formSchema.formSchemaVersionId,
        version: context.formSchema.version,
        consentTitle: context.formSchema.consentTitle,
        consentCopy: context.formSchema.consentCopy,
        fieldCount: context.formSchema.validation.fieldCount,
        isValid: context.formSchema.validation.isValid,
        validationIssues: [...context.formSchema.validation.validationIssues],
      },
      availableVenues: context.availableVenues,
      checklist,
      isLocked: context.isLocked,
      lockReason: context.lockReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async saveDraft(exhibitionId: string, payload: SaveExhibitionDraftDto, context: EditorContext): Promise<ExhibitionEditorDto> {
    const record = this.requireRecord(exhibitionId);
    this.ensureEditable(record, context.isLocked, context.lockReason);
    this.validateVenue(payload.venueId);
    const previousMediaUrls = [...record.mediaUrls];

    const updatedAt = new Date().toISOString();
    const nextRecord: ExhibitionRecord = {
      ...record,
      title: payload.title.trim(),
      exhibitionType: payload.exhibitionType.trim(),
      bio: payload.bio.trim(),
      venueId: payload.venueId?.trim() || undefined,
      mediaUrls: payload.mediaUrls.map((url) => url.trim()).filter((url) => url.length > 0),
      curatorNote: payload.curatorNote?.trim() || undefined,
      policyText: payload.policyText?.trim() || undefined,
      highlights: payload.highlightList.map((item) => item.trim()).filter((item) => item.length > 0),
      updatedAt,
    };

    const existingBySessionId = new Map(this.getSessions(exhibitionId).map((session) => [session.id, session]));
    const usedIds = new Set(this.sessionRecords.map((session) => session.id));
    const nextSessions = payload.sessions.map((sessionInput) => this.buildSessionRecord(exhibitionId, sessionInput, existingBySessionId, usedIds));

    this.replaceRecord(nextRecord);
    this.replaceSessions(exhibitionId, nextSessions);
    await this.appState.persist();
    await this.cleanupRemovedManagedMedia(exhibitionId, previousMediaUrls, nextRecord.mediaUrls);

    return this.getEditorState(exhibitionId, {
      ...context,
      formSchema: context.formSchema,
    });
  }

  async publishDraft(exhibitionId: string, context: EditorContext): Promise<ExhibitionEditorDto> {
    const record = this.requireRecord(exhibitionId);
    this.ensureEditable(record, context.isLocked, context.lockReason);
    const sessions = this.getSessions(exhibitionId);
    const checklist = this.buildPublishChecklist(record, sessions, context.formSchema, context.isLocked, context.lockReason);

    if (!checklist.canPublish) {
      throw new BadRequestException({
        message: "Exhibition is not ready to publish.",
        code: "EXHIBITION_NOT_READY",
        blockingReasons: checklist.blockingReasons,
      });
    }

    const updatedAt = new Date().toISOString();
    this.replaceRecord({
      ...record,
      status: "PUBLISHED",
      updatedAt,
    });
    this.replaceSessions(
      exhibitionId,
      sessions.map((session) => ({
        ...session,
        registrationState: this.resolveRegistrationState(session.capacity, session.reservedCount, session.waitlistCapacity, session.status, true),
      }))
    );
    await this.appState.persist();

    return this.getEditorState(exhibitionId, context);
  }

  getSessionById(sessionId: string): Readonly<{
    exhibitionId: string;
    exhibition: ExhibitionSummaryDto;
    session: SessionAvailabilityDto;
  }> {
    for (const record of this.records) {
      const session = this.getSessionAvailability(record.id).find((candidate) => candidate.sessionId === sessionId);
      if (session) {
        return {
          exhibitionId: record.id,
          exhibition: this.getSummary(record.id),
          session,
        };
      }
    }

    throw new NotFoundException("Session not found.");
  }

  async syncReviewPreview(review: ReviewItemDto & Readonly<{ exhibitionId: string }>) {
    const currentIndex = this.reviewRecords.findIndex((candidate) => candidate.id === review.id);

    if (review.status !== "PUBLISHED") {
      if (currentIndex >= 0) {
        this.reviewRecords.splice(currentIndex, 1);
        await this.appState.persist();
      }

      return;
    }

    if (currentIndex >= 0) {
      this.reviewRecords.splice(currentIndex, 1, review);
      await this.appState.persist();
      return;
    }

    this.reviewRecords.push(review);
    await this.appState.persist();
  }

  async syncSessionOccupancy(sessionId: string, reservedCount: number) {
    const session = this.sessionRecords.find((candidate) => candidate.id === sessionId);
    if (!session) {
      throw new NotFoundException("Session not found.");
    }

    const exhibition = this.requireRecord(session.exhibitionId);
    const nextSession = {
      ...session,
      reservedCount,
      registrationState: this.resolveRegistrationState(
        session.capacity,
        reservedCount,
        session.waitlistCapacity,
        session.status,
        exhibition.status === "PUBLISHED",
      ),
    };

    const index = this.sessionRecords.findIndex((candidate) => candidate.id === sessionId);
    this.sessionRecords.splice(index, 1, nextSession);
    await this.appState.persist();
    return nextSession;
  }

  listLegacyGalleries(status?: LegacyGalleryStatus): GallerySummary[] {
    const timeline = status?.toLowerCase() as DiscoverTimeline | undefined;

    return this.records
      .map((record) => {
        const sessions = this.getSessions(record.id);
        const nextTimeline = getDiscoverTimeline(record.status, sessions, new Date());
        const summary = toExhibitionSummary(record, this.getVenue(record.venueId), sessions, new Date());
        return { summary, timeline: nextTimeline };
      })
      .filter((item) => !timeline || item.timeline === timeline)
      .map((item) => toLegacyGallerySummary(item.summary, item.timeline));
  }

  getLegacyGallery(id: string) {
    const record = this.records.find((candidate) => candidate.id === id);
    if (!record) {
      return null;
    }

    const sessions = this.getSessions(record.id);
    const timeline = getDiscoverTimeline(record.status, sessions, new Date());
    const summary = toExhibitionSummary(record, this.getVenue(record.venueId), sessions, new Date());
    return toLegacyGallerySummary(summary, timeline);
  }

  private getVenue(venueId?: string) {
    return venueId ? this.venues.find((venue) => venue.id === venueId) : undefined;
  }

  private getSessions(exhibitionId: string) {
    return this.sessionRecords
      .filter((record) => record.exhibitionId === exhibitionId)
      .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));
  }

  private getReviews(exhibitionId: string) {
    return this.reviewRecords.filter((record) => record.exhibitionId === exhibitionId);
  }

  private requireRecord(id: string) {
    const record = this.records.find((candidate) => candidate.id === id);
    if (!record) {
      throw new NotFoundException("Exhibition not found.");
    }

    return record;
  }

  private buildDraftRecord(
    input: Readonly<{
      organizerId: string;
      organizerName: string;
      title?: string;
      exhibitionType?: string;
      bio?: string;
      mediaUrls?: string[];
    }>
  ): ExhibitionRecord {
    const now = new Date().toISOString();

    return {
      id: this.nextExhibitionId(),
      organizerId: input.organizerId,
      organizerName: input.organizerName,
      venueId: undefined,
      title: input.title ?? "Untitled exhibition draft",
      exhibitionType: input.exhibitionType ?? "Mixed",
      bio: input.bio ?? "Add the exhibition concept, visitor promise, and schedule framing for this draft.",
      status: "DRAFT",
      accent: "#a36a5d",
      curatorNote: undefined,
      policyText: undefined,
      highlights: [],
      mediaUrls: input.mediaUrls ?? [],
      createdAt: now,
      updatedAt: now,
    };
  }

  private nextExhibitionId() {
    const nextIndex = this.records
      .map((record) => Number(record.id.replace(/\D+/g, "")))
      .filter((value) => Number.isFinite(value))
      .reduce((current, value) => Math.max(current, value), 0) + 1;

    return `g-${String(nextIndex).padStart(2, "0")}`;
  }

  private ensureEditable(record: ExhibitionRecord, isLocked: boolean, lockReason?: string) {
    if (isLocked) {
      throw new BadRequestException({
        message: lockReason ?? "This exhibition is locked because registrations already exist.",
        code: "EXHIBITION_LOCKED",
      });
    }

    if (record.status === "CLOSED") {
      throw new BadRequestException({
        message: "Closed exhibitions cannot be edited.",
        code: "EXHIBITION_CLOSED",
      });
    }
  }

  private validateVenue(venueId?: string) {
    if (!venueId) {
      return;
    }

    if (!this.venues.some((venue) => venue.id === venueId)) {
      throw new BadRequestException({
        message: "Venue not found.",
        code: "VENUE_NOT_FOUND",
      });
    }
  }

  private buildSessionRecord(
    exhibitionId: string,
    sessionInput: SaveExhibitionDraftDto["sessions"][number],
    existingBySessionId: ReadonlyMap<string, ExhibitionSessionRecord>,
    usedIds: Set<string>
  ): ExhibitionSessionRecord {
    const startsAt = Date.parse(sessionInput.startsAt);
    const endsAt = Date.parse(sessionInput.endsAt);
    if (Number.isNaN(startsAt) || Number.isNaN(endsAt) || endsAt <= startsAt) {
      throw new BadRequestException({
        message: "Each session must end after it starts.",
        code: "SESSION_TIME_INVALID",
      });
    }

    if (sessionInput.capacity < 1) {
      throw new BadRequestException({
        message: "Session capacity must be at least 1.",
        code: "SESSION_CAPACITY_INVALID",
      });
    }

    if (typeof sessionInput.waitlistCapacity === "number" && sessionInput.waitlistCapacity < 0) {
      throw new BadRequestException({
        message: "Waitlist capacity cannot be negative.",
        code: "SESSION_WAITLIST_INVALID",
      });
    }

    const existing = sessionInput.sessionId ? existingBySessionId.get(sessionInput.sessionId) : undefined;
    const sessionId = existing?.id ?? this.nextSessionId(exhibitionId, usedIds);
    usedIds.add(sessionId);

    return {
      id: sessionId,
      exhibitionId,
      startsAt: sessionInput.startsAt,
      endsAt: sessionInput.endsAt,
      capacity: sessionInput.capacity,
      reservedCount: existing?.reservedCount ?? 0,
      waitlistCapacity: sessionInput.waitlistCapacity,
      registrationState: "closed",
      status: sessionInput.status ?? "SCHEDULED",
      vibe: sessionInput.vibe?.trim() || undefined,
    };
  }

  private nextSessionId(exhibitionId: string, usedIds: Set<string>) {
    let sequence = usedIds.size + 1;
    let candidate = `s-${exhibitionId.replace(/^g-/, "")}-${sequence}`;

    while (usedIds.has(candidate)) {
      sequence += 1;
      candidate = `s-${exhibitionId.replace(/^g-/, "")}-${sequence}`;
    }

    return candidate;
  }

  private replaceRecord(nextRecord: ExhibitionRecord) {
    const index = this.records.findIndex((record) => record.id === nextRecord.id);
    if (index < 0) {
      throw new NotFoundException("Exhibition not found.");
    }

    this.records[index] = nextRecord;
  }

  private replaceSessions(exhibitionId: string, nextSessions: ExhibitionSessionRecord[]) {
    for (let index = this.sessionRecords.length - 1; index >= 0; index -= 1) {
      if (this.sessionRecords[index].exhibitionId === exhibitionId) {
        this.sessionRecords.splice(index, 1);
      }
    }

    this.sessionRecords.push(...nextSessions);
  }

  private async cleanupRemovedManagedMedia(exhibitionId: string, previousMediaUrls: readonly string[], nextMediaUrls: readonly string[]) {
    const nextMediaUrlSet = new Set(nextMediaUrls);

    for (const mediaUrl of previousMediaUrls) {
      if (nextMediaUrlSet.has(mediaUrl) || !this.assetsService.getManagedAssetKey(mediaUrl)) {
        continue;
      }

      const isStillReferenced = this.records.some((candidate) => candidate.id !== exhibitionId && candidate.mediaUrls.includes(mediaUrl));
      if (isStillReferenced) {
        continue;
      }

      await this.assetsService.deleteManagedAsset(mediaUrl);
    }
  }

  private toAuthoringSessionDto(session: ExhibitionSessionRecord): AuthoringSessionDto {
    return {
      sessionId: session.id,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      capacity: session.capacity,
      reservedCount: session.reservedCount,
      waitlistCapacity: session.waitlistCapacity,
      registrationState: session.registrationState,
      status: session.status,
      vibe: session.vibe,
    };
  }

  private buildPublishChecklist(
    record: ExhibitionRecord,
    sessions: readonly ExhibitionSessionRecord[],
    formSchema: FormSchemaEditorDto,
    isLocked: boolean,
    lockReason?: string
  ) {
    const validSessionCount = sessions.filter((session) => Date.parse(session.endsAt) > Date.parse(session.startsAt) && session.capacity > 0).length;
    const items = [
      {
        key: "title",
        label: "Title and concept",
        complete: record.title.trim().length > 0 && record.bio.trim().length > 0,
        detail: "Add an exhibition title and short concept.",
      },
      {
        key: "venue",
        label: "Venue assignment",
        complete: Boolean(record.venueId),
        detail: "Assign a venue before publishing.",
      },
      {
        key: "media",
        label: "Media coverage",
        complete: record.mediaUrls.length > 0,
        detail: "Add at least one media URL for the poster or hero image.",
      },
      {
        key: "sessions",
        label: "Session schedule",
        complete: sessions.length > 0 && validSessionCount === sessions.length,
        detail: "Create at least one valid session with capacity.",
      },
      {
        key: "schema",
        label: "Registration schema",
        complete: formSchema.validation.isValid,
        detail: "Save an active form schema with consent copy and valid fields.",
      },
    ];

    const blockingReasons = items.filter((item) => !item.complete).map((item) => item.detail);
    if (isLocked) {
      blockingReasons.unshift(lockReason ?? "Editing locks after registrations exist for this exhibition.");
    }

    return {
      canPublish: !isLocked && blockingReasons.length === 0,
      blockingReasons,
      items,
    };
  }

  private resolveRegistrationState(
    capacity: number,
    reservedCount: number,
    waitlistCapacity: number | undefined,
    status: ExhibitionSessionRecord["status"],
    isPublished: boolean
  ): RegistrationCtaState {
    if (!isPublished || status !== "SCHEDULED") {
      return "closed";
    }

    if (reservedCount >= capacity) {
      return typeof waitlistCapacity === "number" && waitlistCapacity > 0 ? "waitlist" : "closed";
    }

    return "open";
  }
}
