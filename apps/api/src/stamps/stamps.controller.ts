import { Body, Controller, Get, Post, Query } from "@nestjs/common";

import { StampsService } from "./stamps.service";

interface IssueStampRequest {
  ownerId: string;
  galleryId: string;
  title: string;
}

@Controller("stamps")
export class StampsController {
  constructor(private readonly stampsService: StampsService) {}

  @Post("issue")
  issue(@Body() payload: IssueStampRequest) {
    return this.stampsService.issue(payload.ownerId, payload.galleryId, payload.title);
  }

  @Get()
  list(@Query("ownerId") ownerId: string) {
    return this.stampsService.list(ownerId);
  }
}
