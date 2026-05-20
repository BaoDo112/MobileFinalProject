import { Body, Controller, ForbiddenException, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";

import { AuthService } from "../auth/auth.service";
import { getBearerToken } from "../common/auth-header";
import type { ExhibitionPayload, RegistrationCtaState } from "../common/contracts";
import { FormSchemasService } from "../form-schemas/form-schemas.service";
import { RegistrationsService } from "../registrations/registrations.service";
import { VenuesService } from "../venues/venues.service";
import { ExhibitionsService } from "./exhibitions.service";

class DiscoverExhibitionsQueryDto {
  @IsOptional()
  @IsIn(["present", "future", "past"])
  timeline?: "present" | "future" | "past";

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsIn(["open", "waitlist", "closed"])
  registrationState?: RegistrationCtaState;

  @IsOptional()
  @IsString()
  organizerId?: string;
}

class SaveDraftSessionDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  waitlistCapacity?: number;

  @IsOptional()
  @IsIn(["SCHEDULED", "CANCELLED", "COMPLETED"])
  status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";

  @IsOptional()
  @IsString()
  vibe?: string;
}

class SaveExhibitionDraftBodyDto {
  @IsString()
  title!: string;

  @IsString()
  exhibitionType!: string;

  @IsString()
  bio!: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsArray()
  @IsString({ each: true })
  mediaUrls!: string[];

  @IsOptional()
  @IsString()
  curatorNote?: string;

  @IsOptional()
  @IsString()
  policyText?: string;

  @IsArray()
  @IsString({ each: true })
  highlightList!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveDraftSessionDto)
  sessions!: SaveDraftSessionDto[];
}

@Controller("exhibitions")
export class ExhibitionsController {
  constructor(
    private readonly authService: AuthService,
    private readonly exhibitionsService: ExhibitionsService,
    private readonly formSchemasService: FormSchemasService,
    private readonly registrationsService: RegistrationsService,
    private readonly venuesService: VenuesService,
  ) {}

  @Post()
  create(@Body() payload: ExhibitionPayload) {
    return this.exhibitionsService.create(payload);
  }

  @Post("drafts")
  async createDraft(@Headers("authorization") authorization?: string) {
    const organizerSession = await this.requireOrganizerSession(authorization);
    const organizerName = organizerSession.organizerProfile?.organizationName ?? organizerSession.organizerProfile?.name ?? organizerSession.user.email;
    const draft = this.exhibitionsService.createDraft(organizerSession.user.id, organizerName);
    this.formSchemasService.initializeDraftSchema(draft.id);
    return this.exhibitionsService.getEditorState(draft.id, this.getEditorContext(draft.id));
  }

  @Get()
  list(@Query() query: DiscoverExhibitionsQueryDto) {
    return this.exhibitionsService.listDiscover(query);
  }

  @Get(":id/editor")
  async editor(@Param("id") id: string, @Headers("authorization") authorization?: string) {
    await this.requireOrganizerSession(authorization);
    return this.exhibitionsService.getEditorState(id, this.getEditorContext(id));
  }

  @Patch(":id/editor")
  async saveEditor(@Param("id") id: string, @Body() payload: SaveExhibitionDraftBodyDto, @Headers("authorization") authorization?: string) {
    await this.requireOrganizerSession(authorization);
    return this.exhibitionsService.saveDraft(id, payload, this.getEditorContext(id));
  }

  @Post(":id/publish")
  async publish(@Param("id") id: string, @Headers("authorization") authorization?: string) {
    await this.requireOrganizerSession(authorization);
    return this.exhibitionsService.publishDraft(id, this.getEditorContext(id));
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.exhibitionsService.getDetail(id);
  }

  private getEditorContext(exhibitionId: string) {
    const hasRegistrations = this.registrationsService.hasRegistrationsForExhibition(exhibitionId);
    return {
      availableVenues: this.venuesService.list(),
      formSchema: this.formSchemasService.getEditorState(exhibitionId),
      isLocked: hasRegistrations,
      lockReason: hasRegistrations ? "Editing locks after registrations exist for this exhibition." : undefined,
    };
  }

  private async requireOrganizerSession(authorization?: string) {
    const session = await this.authService.getSessionEnvelope(getBearerToken(authorization));
    if (session.activeRole !== "ORGANIZER") {
      throw new ForbiddenException("Organizer role is required for authoring.");
    }

    return session;
  }
}
