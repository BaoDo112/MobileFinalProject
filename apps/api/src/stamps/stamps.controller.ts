import { Body, Controller, Get, Headers, Post, Query } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { getBearerToken } from "../common/auth-header";
import { RegistrationsService } from "../registrations/registrations.service";
import { StampsService } from "./stamps.service";

interface IssueStampRequest {
  ownerId: string;
  galleryId: string;
  title: string;
}

@Controller("stamps")
export class StampsController {
  constructor(
    private readonly authService: AuthService,
    private readonly registrationsService: RegistrationsService,
    private readonly stampsService: StampsService,
  ) {}

  @Post("issue")
  issue(@Body() payload: IssueStampRequest) {
    return this.stampsService.issue(payload.ownerId, payload.galleryId, payload.title);
  }

  @Get()
  list(@Query("ownerId") ownerId: string) {
    return this.stampsService.list(ownerId);
  }

  @Get("me/progress")
  async progress(@Headers("authorization") authorization?: string) {
    const session = await this.authService.getSessionEnvelope(getBearerToken(authorization));
    return this.stampsService.buildProgress(session.user.id, this.registrationsService.listVisitorVisitsByUserId(session.user.id));
  }
}
