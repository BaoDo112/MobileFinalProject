import { Injectable } from "@nestjs/common";

import type { CreateVenueDto } from "../common/contracts";
import { ExhibitionsService } from "../exhibitions/exhibitions.service";

@Injectable()
export class VenuesService {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  list() {
    return this.exhibitionsService.listVenues();
  }

  create(payload: CreateVenueDto) {
    return this.exhibitionsService.createVenue(payload);
  }
}