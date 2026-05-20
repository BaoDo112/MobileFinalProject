import { Controller, Get, Query } from "@nestjs/common";
import { IsIn, IsOptional, IsString } from "class-validator";

import { SessionsService } from "./sessions.service";

class SessionsQueryDto {
  @IsString()
  exhibitionId!: string;

  @IsOptional()
  @IsIn(["availability", "authoring"])
  mode?: "availability" | "authoring";
}

@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  list(@Query() query: SessionsQueryDto) {
    if (query.mode === "authoring") {
      return this.sessionsService.listAuthoringByExhibition(query.exhibitionId);
    }

    return this.sessionsService.listByExhibition(query.exhibitionId);
  }
}