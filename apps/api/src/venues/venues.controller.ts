import { Body, Controller, ForbiddenException, Get, Headers, Post } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

import { AuthService } from "../auth/auth.service";
import { getBearerToken } from "../common/auth-header";
import { VenuesService } from "./venues.service";

class CreateVenueBodyDto {
  @IsString()
  title!: string;

  @IsString()
  district!: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  mapUrl?: string;

  @IsOptional()
  @IsString()
  accessibilityNotes?: string;
}

@Controller("venues")
export class VenuesController {
  constructor(
    private readonly authService: AuthService,
    private readonly venuesService: VenuesService,
  ) {}

  @Get()
  list() {
    return this.venuesService.list();
  }

  @Post()
  async create(@Headers("authorization") authorization: string | undefined, @Body() payload: CreateVenueBodyDto) {
    const session = await this.authService.getSessionEnvelope(getBearerToken(authorization));
    if (session.activeRole !== "ORGANIZER") {
      throw new ForbiddenException("Organizer role is required for venue management.");
    }

    return this.venuesService.create(payload);
  }
}