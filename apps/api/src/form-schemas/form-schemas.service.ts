import { Injectable, NotFoundException } from "@nestjs/common";

import type { FormSchemaEditorDto, FormSchemaValidationDto, RegistrationDraftDto, RegistrationFieldDto, SaveFormSchemaDto } from "../common/contracts";
import { SessionsService } from "../sessions/sessions.service";

type FormSchemaSeed = Readonly<{
  formSchemaVersionId: string;
  consentTitle?: string;
  consentCopy?: string;
  fields: RegistrationFieldDto[];
}>;

type FormSchemaVersionRecord = Readonly<{
  exhibitionId: string;
  formSchemaVersionId: string;
  version: number;
  isActive: boolean;
  consentTitle?: string;
  consentCopy?: string;
  fields: RegistrationFieldDto[];
  createdAt: string;
  updatedAt: string;
}>;

const formSchemaSeeds: Record<string, FormSchemaSeed> = {
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

@Injectable()
export class FormSchemasService {
  private readonly versionsByExhibitionId = new Map<string, FormSchemaVersionRecord[]>();

  constructor(private readonly sessionsService: SessionsService) {}

  getActiveDraft(exhibitionId: string, sessionId?: string): RegistrationDraftDto {
    const schema = this.getActiveVersion(exhibitionId);
    const validation = this.validateSchema(schema);
    if (!validation.isValid || schema.fields.length === 0) {
      throw new NotFoundException("Registration schema not found.");
    }

    const sessions = this.sessionsService.listByExhibition(exhibitionId);
    const selectedSession = sessionId
      ? sessions.find((session) => session.sessionId === sessionId)
      : sessions.find((session) => session.registrationState !== "closed");

    if (!selectedSession) {
      throw new NotFoundException("Registration session not found.");
    }

    return {
      exhibitionId,
      sessionId: selectedSession.sessionId,
      formSchemaVersionId: schema.formSchemaVersionId,
      fields: schema.fields,
      selectedSession,
      consentTitle: schema.consentTitle,
      consentCopy: schema.consentCopy,
    };
  }

  initializeDraftSchema(exhibitionId: string): FormSchemaEditorDto {
    this.ensureHistory(exhibitionId);
    return this.getEditorState(exhibitionId);
  }

  getEditorState(exhibitionId: string): FormSchemaEditorDto {
    const schema = this.getActiveVersion(exhibitionId);
    return this.toEditorDto(schema);
  }

  saveEditorState(exhibitionId: string, payload: SaveFormSchemaDto): FormSchemaEditorDto {
    const history = this.ensureHistory(exhibitionId);
    const version = (history.at(-1)?.version ?? 0) + 1;
    const now = new Date().toISOString();
    const next: FormSchemaVersionRecord = {
      exhibitionId,
      formSchemaVersionId: `fs-${exhibitionId}-v${version}`,
      version,
      isActive: true,
      consentTitle: payload.consentTitle?.trim() || undefined,
      consentCopy: payload.consentCopy?.trim() || undefined,
      fields: this.normalizeFields(payload.fields),
      createdAt: now,
      updatedAt: now,
    };

    history.push(next);
    return this.toEditorDto(next);
  }

  private ensureHistory(exhibitionId: string) {
    const existing = this.versionsByExhibitionId.get(exhibitionId);
    if (existing) {
      return existing;
    }

    const seed = formSchemaSeeds[exhibitionId];
    const now = new Date().toISOString();
    const record: FormSchemaVersionRecord = seed
      ? {
          exhibitionId,
          formSchemaVersionId: seed.formSchemaVersionId,
          version: 1,
          isActive: true,
          consentTitle: seed.consentTitle,
          consentCopy: seed.consentCopy,
          fields: this.normalizeFields(seed.fields),
          createdAt: now,
          updatedAt: now,
        }
      : {
          exhibitionId,
          formSchemaVersionId: `fs-${exhibitionId}-v1`,
          version: 1,
          isActive: true,
          consentTitle: undefined,
          consentCopy: undefined,
          fields: [],
          createdAt: now,
          updatedAt: now,
        };

    const history = [record];
    this.versionsByExhibitionId.set(exhibitionId, history);
    return history;
  }

  private getActiveVersion(exhibitionId: string) {
    const history = this.ensureHistory(exhibitionId);
    const active = [...history].reverse().find((version) => version.isActive);
    if (!active) {
      throw new NotFoundException("Registration schema not found.");
    }

    return active;
  }

  private toEditorDto(schema: FormSchemaVersionRecord): FormSchemaEditorDto {
    return {
      exhibitionId: schema.exhibitionId,
      formSchemaVersionId: schema.formSchemaVersionId,
      version: schema.version,
      isActive: schema.isActive,
      consentTitle: schema.consentTitle,
      consentCopy: schema.consentCopy,
      fields: schema.fields,
      validation: this.validateSchema(schema),
      updatedAt: schema.updatedAt,
    };
  }

  private normalizeFields(fields: RegistrationFieldDto[]) {
    return fields
      .map((field, index) => ({
        ...field,
        id: field.id.trim() || `field-${index + 1}`,
        label: field.label.trim(),
        placeholder: field.placeholder?.trim() || undefined,
        isRequired: field.isRequired,
        options: field.options.map((option) => option.trim()).filter((option) => option.length > 0),
        helpText: field.helpText?.trim() || undefined,
        order: field.order,
      }))
      .sort((left, right) => left.order - right.order);
  }

  private validateSchema(schema: Readonly<{ consentTitle?: string; consentCopy?: string; fields: RegistrationFieldDto[] }>): FormSchemaValidationDto {
    const validationIssues: string[] = [];
    const fieldIds = new Set<string>();

    if (schema.fields.length === 0) {
      validationIssues.push("Add at least one registration field.");
    }

    if (!schema.consentTitle?.trim() || !schema.consentCopy?.trim()) {
      validationIssues.push("Add consent title and consent copy.");
    }

    if (!schema.fields.some((field) => field.isRequired)) {
      validationIssues.push("Mark at least one field as required.");
    }

    for (const field of schema.fields) {
      if (!field.label.trim()) {
        validationIssues.push("Every field needs a label.");
      }

      if (fieldIds.has(field.id)) {
        validationIssues.push("Field ids must be unique.");
      }

      fieldIds.add(field.id);

      if (field.type === "SELECT" && field.options.length === 0) {
        validationIssues.push(`Add options for ${field.label || field.id}.`);
      }
    }

    return {
      fieldCount: schema.fields.length,
      requiredFieldCount: schema.fields.filter((field) => field.isRequired).length,
      isValid: validationIssues.length === 0,
      validationIssues,
    };
  }
}