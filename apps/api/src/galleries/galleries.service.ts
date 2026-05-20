import { Injectable } from "@nestjs/common";

import { ExhibitionsService } from "../exhibitions/exhibitions.service";

@Injectable()
export class GalleriesService {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  list(status?: string) {
    return this.exhibitionsService.listLegacyGalleries(status?.toUpperCase() as "PAST" | "PRESENT" | "FUTURE" | undefined);
  }

  detail(id: string) {
    return this.exhibitionsService.getLegacyGallery(id);
  }
}
