import { BadRequestException, Body, Controller, ForbiddenException, Get, Headers, Param, Put, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";

import { AuthService } from "../auth/auth.service";
import { getBearerToken } from "../common/auth-header";
import { RegistrationsService } from "../registrations/registrations.service";
import { FormSchemasService } from "./form-schemas.service";

class ActiveFormSchemaQueryDto {
  @IsString()
  exhibitionId!: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

class FormSchemaFieldDto {
  @IsString()
  id!: string;

  @IsString()
  label!: string;

  @IsIn(["TEXT", "EMAIL", "PHONE", "TEXTAREA", "SELECT"])
  type!: "TEXT" | "EMAIL" | "PHONE" | "TEXTAREA" | "SELECT";

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsBoolean()
  isRequired!: boolean;

  @IsArray()
  @IsString({ each: true })
  options!: string[];

  @IsOptional()
  @IsString()
  helpText?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  order!: number;
}

class SaveFormSchemaBodyDto {
  @IsOptional()
  @IsString()
  consentTitle?: string;

  @IsOptional()
  @IsString()
  consentCopy?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormSchemaFieldDto)
  fields!: FormSchemaFieldDto[];
}

@Controller("form-schemas")
export class FormSchemasController {
  constructor(
    private readonly authService: AuthService,
    private readonly registrationsService: RegistrationsService,
    private readonly formSchemasService: FormSchemasService,
  ) {}

  @Get("active")
  active(@Query() query: ActiveFormSchemaQueryDto) {
    return this.formSchemasService.getActiveDraft(query.exhibitionId, query.sessionId);
  }

  @Get(":exhibitionId/editor")
  async editor(@Param("exhibitionId") exhibitionId: string, @Headers("authorization") authorization?: string) {
    await this.requireOrganizerSession(authorization);
    return this.formSchemasService.getEditorState(exhibitionId);
  }

  @Put(":exhibitionId/editor")
  async save(
    @Param("exhibitionId") exhibitionId: string,
    @Body() payload: SaveFormSchemaBodyDto,
    @Headers("authorization") authorization?: string,
  ) {
    await this.requireOrganizerSession(authorization);

    if (this.registrationsService.hasRegistrationsForExhibition(exhibitionId)) {
      throw new BadRequestException({
        message: "Editing locks after registrations exist for this exhibition.",
        code: "EXHIBITION_LOCKED",
      });
    }

    return this.formSchemasService.saveEditorState(exhibitionId, payload);
  }

  private async requireOrganizerSession(authorization?: string) {
    const session = await this.authService.getSessionEnvelope(getBearerToken(authorization));
    if (session.activeRole !== "ORGANIZER") {
      throw new ForbiddenException("Organizer role is required for authoring.");
    }

    return session;
  }
}