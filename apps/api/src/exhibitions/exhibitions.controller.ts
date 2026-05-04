import { Body, Controller, Get, Post, Query } from "@nestjs/common";

import type { ExhibitionPayload } from "../common/contracts";
import { ExhibitionsService } from "./exhibitions.service";

@Controller("exhibitions")
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @Post()
  create(@Body() payload: ExhibitionPayload) {
    return this.exhibitionsService.create(payload);
  }

  @Get()
  list(@Query("organizerId") organizerId?: string) {
    return this.exhibitionsService.listByOrganizer(organizerId);
  }
}
