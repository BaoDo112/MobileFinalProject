import { Injectable, NotFoundException } from "@nestjs/common";

import type { FormSchemaEditorDto, FormSchemaValidationDto, RegistrationDraftDto, RegistrationFieldDto, SaveFormSchemaDto } from "../common/contracts";
import { AppStateService } from "../persistence/app-state.service";
import type { FormSchemaVersionRecord } from "../persistence/app-state.types";
import { SessionsService } from "../sessions/sessions.service";

@Injectable()
export class FormSchemasService {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly appState: AppStateService,
  ) {}

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

  async initializeDraftSchema(exhibitionId: string): Promise<FormSchemaEditorDto> {
    this.ensureHistory(exhibitionId);
    await this.appState.persist();
    return this.getEditorState(exhibitionId);
  }

  getEditorState(exhibitionId: string): FormSchemaEditorDto {
    const schema = this.getActiveVersion(exhibitionId);
    return this.toEditorDto(schema);
  }

  async saveEditorState(exhibitionId: string, payload: SaveFormSchemaDto): Promise<FormSchemaEditorDto> {
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
    await this.appState.persist();
    return this.toEditorDto(next);
  }

  private ensureHistory(exhibitionId: string) {
    const existing = this.versionsByExhibitionId[exhibitionId];
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const record: FormSchemaVersionRecord = {
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
    this.versionsByExhibitionId[exhibitionId] = history;
    return history;
  }

  private getActiveVersion(exhibitionId: string) {
    const history = this.versionsByExhibitionId[exhibitionId];
    if (!history) {
      throw new NotFoundException("Registration schema not found.");
    }

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

  private get versionsByExhibitionId() {
    return this.appState.getState().formSchemas.versionsByExhibitionId;
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