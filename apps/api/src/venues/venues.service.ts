import { Injectable } from "@nestjs/common";

import { ExhibitionsService } from "../exhibitions/exhibitions.service";

@Injectable()
export class VenuesService {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  list() {
    return this.exhibitionsService.listVenues();
  }
}