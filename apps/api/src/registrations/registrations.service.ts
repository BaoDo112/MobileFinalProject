import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import type {
  ExhibitionQueueBoardDto,
  QueueCardDto,
  QueueCountsDto,
  QueueSessionWorkloadDto,
  QueueWaitlistSummaryDto,
  RegistrationAnswerInput,
  RegistrationReceiptDto,
  RegistrationStatus,
  RegistrationSubmissionDto,
  SubmissionDecisionAction,
  SubmissionDecisionDetailDto,
  SubmissionPipelineDto,
  SubmissionReviewDto,
  VisitorVisitSummaryDto,
} from "../common/contracts";
import { ExhibitionsService } from "../exhibitions/exhibitions.service";
import { FormSchemasService } from "../form-schemas/form-schemas.service";
import { AppStateService } from "../persistence/app-state.service";
import type { RegistrationRecord } from "../persistence/app-state.types";
import { SessionsService } from "../sessions/sessions.service";
import { StampsService } from "../stamps/stamps.service";

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly authService: AuthService,
    private readonly exhibitionsService: ExhibitionsService,
    private readonly formSchemasService: FormSchemasService,
    private readonly sessionsService: SessionsService,
    private readonly stampsService: StampsService,
    private readonly appState: AppStateService,
  ) {}

  getDraft(exhibitionId: string, sessionId?: string) {
    return this.formSchemasService.getActiveDraft(exhibitionId, sessionId);
  }

  async submit(token: string, payload: RegistrationSubmissionDto): Promise<RegistrationReceiptDto> {
    const session = await this.authService.getSessionEnvelope(token);
    const sessionLookup = this.sessionsService.getSessionLookup(payload.sessionId);
    const draft = this.formSchemasService.getActiveDraft(sessionLookup.exhibitionId, payload.sessionId);

    if (this.hasDuplicateRegistration(session.user.id, payload.sessionId)) {
      throw new BadRequestException({
        message: "You already have a booking for this session.",
        code: "DUPLICATE_REGISTRATION",
      });
    }

    this.validateAnswers(draft.fields, payload.answers);

    if (sessionLookup.session.registrationState === "closed") {
      throw new BadRequestException({
        message: "This session is closed for new reservations.",
        code: "SESSION_CLOSED",
      });
    }

    const status: RegistrationStatus = sessionLookup.session.registrationState === "waitlist" ? "WAITLISTED" : "CONFIRMED";
    const waitlistPosition = status === "WAITLISTED" ? this.getNextWaitlistPosition(payload.sessionId) : undefined;
    const now = new Date().toISOString();

    this.records.push({
      id: `reg-${this.records.length + 1}`,
      attendeeName: session.visitorProfile?.name ?? session.user.email,
      userId: session.user.id,
      exhibitionId: sessionLookup.exhibitionId,
      exhibitionTitle: sessionLookup.exhibition.title,
      sessionId: payload.sessionId,
      sessionLabel: `${sessionLookup.session.dateLabel} · ${sessionLookup.session.timeLabel}`,
      status,
      note: payload.note?.trim() || undefined,
      answers: payload.answers,
      submittedAt: now,
      checkedInAt: undefined,
    });

    await this.appState.persist();
    await this.syncSessionOccupancy(payload.sessionId);

    return {
      registrationId: `reg-${this.records.length}`,
      status,
      sessionLabel: `${sessionLookup.session.dateLabel} · ${sessionLookup.session.timeLabel}`,
      waitlistPosition,
      submittedAt: now,
    };
  }

  async listVisitorVisits(token: string): Promise<VisitorVisitSummaryDto[]> {
    const session = await this.authService.getSessionEnvelope(token);
    let visits = this.listVisitorVisitsByUserId(session.user.id);

    // DEMO SEED INJECTION: If user is the demo visitor and has no visits, show them the seed visits
    if (visits.length === 0 && session.user.email === "smoke.visitor@arthera.local") {
      const seedUserIds = new Set(["seed-visitor-01", "seed-visitor-02", "seed-visitor-03", "seed-visitor-04"]);
      visits = this.records
        .filter((record) => seedUserIds.has(record.userId))
        .map((record) => ({
          registrationId: record.id,
          exhibitionId: record.exhibitionId,
          exhibitionTitle: record.exhibitionTitle,
          status: record.status,
          sessionLabel: record.sessionLabel,
          checkedInAt: record.checkedInAt,
        }));
    }

    return visits;
  }

  listVisitorVisitsByUserId(userId: string): VisitorVisitSummaryDto[] {
    return this.records
      .filter((record) => record.userId === userId)
      .map((record) => ({
        registrationId: record.id,
        exhibitionId: record.exhibitionId,
        exhibitionTitle: record.exhibitionTitle,
        status: record.status,
        sessionLabel: record.sessionLabel,
        checkedInAt: record.checkedInAt,
      }));
  }

  getVisitorExhibitionRecord(userId: string, exhibitionId: string): Readonly<{
    registrationId: string;
    exhibitionTitle: string;
    status: RegistrationStatus;
    sessionLabel: string;
    checkedInAt?: string;
  }> | undefined {
    const statusOrder: Record<RegistrationStatus, number> = {
      CHECKED_IN: 0,
      CONFIRMED: 1,
      WAITLISTED: 2,
      PENDING: 3,
      REJECTED: 4,
      CANCELLED: 5,
    };

    const record = this.records
      .filter((candidate) => candidate.userId === userId && candidate.exhibitionId === exhibitionId)
      .sort((left, right) => statusOrder[left.status] - statusOrder[right.status])[0];

    if (!record) {
      return undefined;
    }

    return {
      registrationId: record.id,
      exhibitionTitle: record.exhibitionTitle,
      status: record.status,
      sessionLabel: record.sessionLabel,
      checkedInAt: record.checkedInAt,
    };
  }

  async getOrganizerPipeline(token: string): Promise<SubmissionPipelineDto> {
    await this.requireOrganizerSession(token);

    const boards = this.exhibitionsService
      .listByOrganizer()
      .map((exhibition) => this.buildQueueBoard(exhibition.id))
      .sort((left, right) => {
        const urgencyDelta = this.getUrgentQueueCount(right.statusCounts) - this.getUrgentQueueCount(left.statusCounts);
        if (urgencyDelta !== 0) {
          return urgencyDelta;
        }

        return right.queueCards.length - left.queueCards.length;
      });

    const statusCounts = this.getQueueCounts();

    return {
      statusCounts,
      urgentQueueCount: this.getUrgentQueueCount(statusCounts),
      boards,
    };
  }

  async getSubmissionReview(token: string, exhibitionId: string, registrationId?: string): Promise<SubmissionReviewDto> {
    await this.requireOrganizerSession(token);

    const exhibition = this.exhibitionsService.getSummary(exhibitionId);
    const board = this.buildQueueBoard(exhibitionId);
    const nextRegistrationId = registrationId ?? board.queueCards[0]?.registrationId;

    return {
      exhibitionId,
      exhibitionTitle: exhibition.title,
      venueTitle: exhibition.venueTitle,
      statusCounts: board.statusCounts,
      sessionWorkload: board.sessionWorkload,
      queueCards: board.queueCards,
      selectedSubmission: nextRegistrationId ? this.buildSubmissionDetail(nextRegistrationId) : undefined,
    };
  }

  async updateSubmissionDecision(
    token: string,
    registrationId: string,
    action: SubmissionDecisionAction,
  ): Promise<SubmissionReviewDto> {
    await this.requireOrganizerSession(token);

    const record = this.requireRecord(registrationId);
    const sessionLookup = this.sessionsService.getSessionLookup(record.sessionId);
    const sessionWorkload = this.buildSessionWorkload(record.exhibitionId).find((item) => item.sessionId === record.sessionId);
    if (!sessionWorkload) {
      throw new NotFoundException("Session workload was not found.");
    }

    const nextStatus = this.resolveDecisionStatus(record, action, sessionLookup.session.capacity, sessionLookup.session.waitlistCapacity, sessionWorkload);
    const checkedInAt = this.resolveCheckedInAt(record.checkedInAt, action, nextStatus);
    const updatedRecord: RegistrationRecord = {
      ...record,
      status: nextStatus,
      checkedInAt,
    };

    this.replaceRecord(updatedRecord);
    await this.appState.persist();
    await this.syncSessionOccupancy(record.sessionId);

    if (action === "CHECK_IN") {
      const stampIssuance = Promise.resolve(
        this.stampsService.issue(record.userId, record.exhibitionId, `${record.exhibitionTitle} attendance`, record.id),
      );
      await stampIssuance;
    }

    return this.getSubmissionReview(token, record.exhibitionId, record.id);
  }

  listByExhibitionIds(exhibitionIds: readonly string[]) {
    const exhibitionIdSet = new Set(exhibitionIds);
    return this.records.filter((record) => exhibitionIdSet.has(record.exhibitionId));
  }

  hasRegistrationsForExhibition(exhibitionId: string) {
    return this.records.some((record) => record.exhibitionId === exhibitionId && record.status !== "CANCELLED");
  }

  getQueueCounts(exhibitionIds?: readonly string[]): QueueCountsDto {
    const records = exhibitionIds ? this.listByExhibitionIds(exhibitionIds) : this.records;
    return {
      pending: records.filter((record) => record.status === "PENDING").length,
      confirmed: records.filter((record) => record.status === "CONFIRMED").length,
      waitlisted: records.filter((record) => record.status === "WAITLISTED").length,
      rejected: records.filter((record) => record.status === "REJECTED").length,
      checkedIn: records.filter((record) => record.status === "CHECKED_IN").length,
    };
  }

  getExhibitionSnapshot(exhibitionIds?: readonly string[]) {
    const records = exhibitionIds ? this.listByExhibitionIds(exhibitionIds) : this.records;
    const snapshot = new Map<
      string,
      {
        pendingCount: number;
        checkedInCount: number;
        waitlistedCount: number;
      }
    >();

    for (const record of records) {
      const current = snapshot.get(record.exhibitionId) ?? {
        pendingCount: 0,
        checkedInCount: 0,
        waitlistedCount: 0,
      };

      if (record.status === "PENDING") {
        current.pendingCount += 1;
      }

      if (record.status === "CHECKED_IN") {
        current.checkedInCount += 1;
      }

      if (record.status === "WAITLISTED") {
        current.waitlistedCount += 1;
      }

      snapshot.set(record.exhibitionId, current);
    }

    return snapshot;
  }

  private async requireOrganizerSession(token: string) {
    const session = await this.authService.getSessionEnvelope(token);
    if (session.activeRole !== "ORGANIZER") {
      throw new ForbiddenException("Organizer role is required for queue operations.");
    }

    return session;
  }

  private buildQueueBoard(exhibitionId: string): ExhibitionQueueBoardDto {
    const exhibition = this.exhibitionsService.getSummary(exhibitionId);
    const records = this.listByExhibitionIds([exhibitionId]);
    const statusCounts = this.getQueueCounts([exhibitionId]);
    const sessionWorkload = this.buildSessionWorkload(exhibitionId);
    const waitlistSummary = sessionWorkload
      .filter((session) => session.waitlistedCount > 0)
      .map<QueueWaitlistSummaryDto>((session) => ({
        sessionId: session.sessionId,
        sessionLabel: session.sessionLabel,
        waitlistedCount: session.waitlistedCount,
        waitlistCapacity: session.waitlistCapacity,
        remainingWaitlistCapacity: session.waitlistCapacity === undefined ? undefined : Math.max(session.waitlistCapacity - session.waitlistedCount, 0),
      }));

    return {
      exhibitionId,
      exhibitionTitle: exhibition.title,
      venueTitle: exhibition.venueTitle,
      statusCounts,
      sessionWorkload,
      waitlistSummary,
      queueCards: records
        .slice()
        .sort((left, right) => this.compareRecords(left, right))
        .map<QueueCardDto>((record) => ({
          registrationId: record.id,
          attendeeName: record.attendeeName,
          sessionLabel: record.sessionLabel,
          status: record.status,
          submittedAt: record.submittedAt,
          note: record.note,
        })),
    };
  }

  private buildSessionWorkload(exhibitionId: string): QueueSessionWorkloadDto[] {
    return this.sessionsService.listByExhibition(exhibitionId).map((session) => {
      const records = this.records.filter((record) => record.sessionId === session.sessionId);
      const pendingCount = records.filter((record) => record.status === "PENDING").length;
      const confirmedCount = records.filter((record) => record.status === "CONFIRMED").length;
      const waitlistedCount = records.filter((record) => record.status === "WAITLISTED").length;
      const checkedInCount = records.filter((record) => record.status === "CHECKED_IN").length;
      const reservedCount = confirmedCount + checkedInCount;

      return {
        sessionId: session.sessionId,
        sessionLabel: `${session.dateLabel} · ${session.timeLabel}`,
        capacity: session.capacity,
        reservedCount,
        pendingCount,
        confirmedCount,
        waitlistedCount,
        checkedInCount,
        waitlistCapacity: session.waitlistCapacity,
        isOverCapacity: reservedCount > session.capacity,
      };
    });
  }

  private buildSubmissionDetail(registrationId: string): SubmissionDecisionDetailDto {
    const record = this.requireRecord(registrationId);
    const draft = this.getReviewDraft(record.exhibitionId, record.sessionId);
    const fieldLabels = new Map(draft?.fields.map((field) => [field.id, field.label]) ?? []);
    const stampNotice = record.status === "CHECKED_IN" ? "Attendance recorded. This visitor can now unlock review and stamp rewards." : undefined;

    return {
      registrationId: record.id,
      attendeeName: record.attendeeName,
      status: record.status,
      sessionLabel: record.sessionLabel,
      submittedAt: record.submittedAt,
      note: record.note,
      checkedInAt: record.checkedInAt,
      stampNotice,
      availableActions: this.getAvailableActions(record.status),
      answers: record.answers.map((answer) => ({
        label: fieldLabels.get(answer.formFieldId) ?? answer.formFieldId,
        value: answer.value,
      })),
    };
  }

  private getReviewDraft(exhibitionId: string, sessionId: string) {
    try {
      return this.formSchemasService.getActiveDraft(exhibitionId, sessionId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return undefined;
      }

      throw error;
    }
  }

  private getAvailableActions(status: RegistrationStatus): SubmissionDecisionAction[] {
    const actions: SubmissionDecisionAction[] = [];

    if (status !== "CONFIRMED" && status !== "CHECKED_IN") {
      actions.push("APPROVE");
    }

    if (status !== "WAITLISTED") {
      actions.push("WAITLIST");
    }

    if (status !== "REJECTED") {
      actions.push("REJECT");
    }

    if (status === "CONFIRMED") {
      actions.push("CHECK_IN");
    }

    return actions;
  }

  private resolveDecisionStatus(
    record: RegistrationRecord,
    action: SubmissionDecisionAction,
    capacity: number,
    waitlistCapacity: number | undefined,
    sessionWorkload: QueueSessionWorkloadDto,
  ): RegistrationStatus {
    switch (action) {
      case "APPROVE":
        this.ensureApprovalCapacity(record.status, capacity, sessionWorkload.reservedCount);
        return "CONFIRMED";
      case "WAITLIST":
        this.ensureWaitlistCapacity(record.status, waitlistCapacity, sessionWorkload.waitlistedCount);
        return "WAITLISTED";
      case "REJECT":
        return "REJECTED";
      case "CHECK_IN":
        this.ensureCheckInAllowed(record.status);
        return "CHECKED_IN";
    }
  }

  private resolveCheckedInAt(
    currentCheckedInAt: string | undefined,
    action: SubmissionDecisionAction,
    nextStatus: RegistrationStatus,
  ) {
    if (action === "CHECK_IN") {
      return new Date().toISOString();
    }

    return nextStatus === "CHECKED_IN" ? currentCheckedInAt : undefined;
  }

  private ensureApprovalCapacity(status: RegistrationStatus, capacity: number, reservedCount: number) {
    const nextReservedCount = reservedCount + this.getApprovalReservedDelta(status);
    if (nextReservedCount <= capacity) {
      return;
    }

    throw new BadRequestException({
      message: "The session is already full. Move this registration to the waitlist instead.",
      code: "SESSION_FULL",
    });
  }

  private getApprovalReservedDelta(status: RegistrationStatus) {
    if (status === "CONFIRMED" || status === "CHECKED_IN") {
      return 0;
    }

    return 1;
  }

  private ensureWaitlistCapacity(
    status: RegistrationStatus,
    waitlistCapacity: number | undefined,
    waitlistedCount: number,
  ) {
    if (waitlistCapacity === undefined) {
      return;
    }

    const nextWaitlistCount = waitlistedCount + this.getWaitlistDelta(status);
    if (nextWaitlistCount <= waitlistCapacity) {
      return;
    }

    throw new BadRequestException({
      message: "The waitlist is already full for this session.",
      code: "WAITLIST_FULL",
    });
  }

  private getWaitlistDelta(status: RegistrationStatus) {
    return status === "WAITLISTED" ? 0 : 1;
  }

  private ensureCheckInAllowed(status: RegistrationStatus) {
    if (status === "CONFIRMED" || status === "CHECKED_IN") {
      return;
    }

    throw new BadRequestException({
      message: "Only confirmed registrations can be checked in.",
      code: "CHECK_IN_REQUIRES_CONFIRMATION",
    });
  }

  private async syncSessionOccupancy(sessionId: string) {
    const records = this.records.filter((record) => record.sessionId === sessionId);
    const reservedCount = records.filter((record) => record.status === "CONFIRMED" || record.status === "CHECKED_IN").length;
    await this.exhibitionsService.syncSessionOccupancy(sessionId, reservedCount);
  }

  private get records() {
    return this.appState.getState().registrations.records;
  }

  private requireRecord(registrationId: string) {
    const record = this.records.find((candidate) => candidate.id === registrationId);
    if (!record) {
      throw new NotFoundException("Registration not found.");
    }

    return record;
  }

  private replaceRecord(nextRecord: RegistrationRecord) {
    const index = this.records.findIndex((candidate) => candidate.id === nextRecord.id);
    if (index === -1) {
      throw new NotFoundException("Registration not found.");
    }

    this.records.splice(index, 1, nextRecord);
  }

  private getUrgentQueueCount(queueCounts: QueueCountsDto) {
    return queueCounts.pending + queueCounts.waitlisted;
  }

  private compareRecords(left: RegistrationRecord, right: RegistrationRecord) {
    const statusOrder: Record<RegistrationStatus, number> = {
      PENDING: 0,
      WAITLISTED: 1,
      CONFIRMED: 2,
      CHECKED_IN: 3,
      REJECTED: 4,
      CANCELLED: 5,
    };

    const statusDelta = statusOrder[left.status] - statusOrder[right.status];
    if (statusDelta !== 0) {
      return statusDelta;
    }

    return Date.parse(right.submittedAt) - Date.parse(left.submittedAt);
  }

  private hasDuplicateRegistration(userId: string, sessionId: string) {
    return this.records.some((record) => record.userId === userId && record.sessionId === sessionId && record.status !== "CANCELLED");
  }

  private getNextWaitlistPosition(sessionId: string) {
    return this.records.filter((record) => record.sessionId === sessionId && record.status === "WAITLISTED").length + 1;
  }

  private validateAnswers(fields: ReturnType<FormSchemasService["getActiveDraft"]>["fields"], answers: RegistrationAnswerInput[]) {
    const valuesByFieldId = new Map(answers.map((answer) => [answer.formFieldId, answer.value.trim()]));
    const missingField = fields.find((field) => field.isRequired && !valuesByFieldId.get(field.id));

    if (missingField) {
      throw new BadRequestException({
        message: `${missingField.label} is required.`,
        code: "REGISTRATION_VALIDATION_ERROR",
      });
    }
  }

  private buildSeedRecords(): RegistrationRecord[] {
    return [
      {
        id: "seed-reg-01",
        attendeeName: "Bao Nguyen",
        userId: "seed-visitor-01",
        exhibitionId: "g-01",
        exhibitionTitle: "Lightwave: Kinetic Gallery",
        sessionId: "s-01-1",
        sessionLabel: "May 19, 2026 · 06:30 PM - 08:00 PM",
        status: "CHECKED_IN",
        note: "Arrived early for calibration briefing.",
        answers: [],
        submittedAt: new Date(Date.now() - 172_800_000).toISOString(),
        checkedInAt: new Date(Date.now() - 169_200_000).toISOString(),
      },
      {
        id: "seed-reg-02",
        attendeeName: "Truc Le",
        userId: "seed-visitor-02",
        exhibitionId: "g-01",
        exhibitionTitle: "Lightwave: Kinetic Gallery",
        sessionId: "s-01-2",
        sessionLabel: "May 21, 2026 · 06:30 PM - 08:00 PM",
        status: "CONFIRMED",
        note: "Prefers quiet entry lane.",
        answers: [],
        submittedAt: new Date(Date.now() - 86_400_000).toISOString(),
      },
      {
        id: "seed-reg-03",
        attendeeName: "Linh Dao",
        userId: "seed-visitor-03",
        exhibitionId: "g-01",
        exhibitionTitle: "Lightwave: Kinetic Gallery",
        sessionId: "s-01-2",
        sessionLabel: "May 21, 2026 · 06:30 PM - 08:00 PM",
        status: "PENDING",
        note: "Needs accessibility support confirmation.",
        answers: [],
        submittedAt: new Date(Date.now() - 43_200_000).toISOString(),
      },
      {
        id: "seed-reg-04",
        attendeeName: "Hanh Do",
        userId: "seed-visitor-04",
        exhibitionId: "g-02",
        exhibitionTitle: "Roots in Motion",
        sessionId: "s-02-2",
        sessionLabel: "Jun 02, 2026 · 02:00 PM - 03:15 PM",
        status: "WAITLISTED",
        note: "Hoping for the curator Q&A route.",
        answers: [],
        submittedAt: new Date(Date.now() - 21_600_000).toISOString(),
      },
      {
        id: "seed-reg-05",
        attendeeName: "Nhi Ho",
        userId: "seed-visitor-05",
        exhibitionId: "g-03",
        exhibitionTitle: "Memory of Neon Streets",
        sessionId: "s-03-1",
        sessionLabel: "Apr 22, 2026 · 11:00 AM - 12:30 PM",
        status: "REJECTED",
        note: "Archive replay request was late.",
        answers: [],
        submittedAt: new Date(Date.now() - 604_800_000).toISOString(),
      },
    ];
  }
}