import { Controller, Get, Param, Query } from "@nestjs/common";

import { GalleriesService } from "./galleries.service";

@Controller("galleries")
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Get()
  list(@Query("status") status?: string) {
    return this.galleriesService.list(status);
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.galleriesService.detail(id);
  }
}
