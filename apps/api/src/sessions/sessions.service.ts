import { Injectable } from "@nestjs/common";

import { ExhibitionsService } from "../exhibitions/exhibitions.service";

@Injectable()
export class SessionsService {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  listByExhibition(exhibitionId: string) {
    return this.exhibitionsService.getSessionAvailability(exhibitionId);
  }

  listAuthoringByExhibition(exhibitionId: string) {
    return this.exhibitionsService.listAuthoringSessions(exhibitionId);
  }

  getSessionLookup(sessionId: string) {
    return this.exhibitionsService.getSessionById(sessionId);
  }
}