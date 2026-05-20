import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { getBearerToken } from "../common/auth-header";
import type { RegistrationAnswerInput, SubmissionDecisionAction, UpdateSubmissionDecisionDto } from "../common/contracts";
import { RegistrationsService } from "./registrations.service";

class RegistrationDraftQueryDto {
  @IsString()
  exhibitionId!: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

class RegistrationAnswerInputDto implements RegistrationAnswerInput {
  @IsString()
  formFieldId!: string;

  @IsString()
  value!: string;
}

class SubmitRegistrationDto {
  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  formSchemaVersionId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistrationAnswerInputDto)
  answers!: RegistrationAnswerInputDto[];
}

class OrganizerReviewQueryDto {
  @IsString()
  exhibitionId!: string;

  @IsOptional()
  @IsString()
  registrationId?: string;
}

class UpdateSubmissionDecisionBodyDto implements UpdateSubmissionDecisionDto {
  @IsString()
  action!: SubmissionDecisionAction;
}

@Controller("registrations")
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get("draft")
  draft(@Query() query: RegistrationDraftQueryDto) {
    return this.registrationsService.getDraft(query.exhibitionId, query.sessionId);
  }

  @Post()
  submit(@Headers("authorization") authorization: string | undefined, @Body() payload: SubmitRegistrationDto) {
    return this.registrationsService.submit(getBearerToken(authorization), payload);
  }

  @Get("organizer/pipeline")
  organizerPipeline(@Headers("authorization") authorization: string | undefined) {
    return this.registrationsService.getOrganizerPipeline(getBearerToken(authorization));
  }

  @Get("organizer/review")
  organizerReview(@Headers("authorization") authorization: string | undefined, @Query() query: OrganizerReviewQueryDto) {
    return this.registrationsService.getSubmissionReview(getBearerToken(authorization), query.exhibitionId, query.registrationId);
  }

  @Patch(":registrationId/decision")
  updateSubmissionDecision(
    @Headers("authorization") authorization: string | undefined,
    @Param("registrationId") registrationId: string,
    @Body() payload: UpdateSubmissionDecisionBodyDto,
  ) {
    return this.registrationsService.updateSubmissionDecision(getBearerToken(authorization), registrationId, payload.action);
  }

  @Get("me/visits")
  visits(@Headers("authorization") authorization: string | undefined) {
    return this.registrationsService.listVisitorVisits(getBearerToken(authorization));
  }
}