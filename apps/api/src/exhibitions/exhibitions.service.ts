import { Injectable } from "@nestjs/common";

import type { ExhibitionPayload } from "../common/contracts";

interface ExhibitionRecord extends ExhibitionPayload {
  id: string;
  createdAt: string;
}

@Injectable()
export class ExhibitionsService {
  private readonly records: ExhibitionRecord[] = [];

  create(payload: ExhibitionPayload) {
    const record: ExhibitionRecord = {
      ...payload,
      id: `ex-${this.records.length + 1}`,
      createdAt: new Date().toISOString()
    };

    this.records.push(record);
    return record;
  }

  listByOrganizer(organizerId?: string) {
    if (!organizerId) {
      return this.records;
    }

    return this.records.filter((record) => record.organizerId === organizerId);
  }
}
