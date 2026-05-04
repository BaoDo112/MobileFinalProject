import { Injectable } from "@nestjs/common";

interface StampRecord {
  id: string;
  galleryId: string;
  ownerId: string;
  title: string;
  milestone: string;
  unlockedAt: string;
}

@Injectable()
export class StampsService {
  private readonly stamps: StampRecord[] = [];

  issue(ownerId: string, galleryId: string, title: string) {
    const record: StampRecord = {
      id: `stamp-${this.stamps.length + 1}`,
      ownerId,
      galleryId,
      title,
      milestone: "Visited",
      unlockedAt: new Date().toISOString()
    };

    this.stamps.push(record);
    return record;
  }

  list(ownerId: string) {
    return this.stamps.filter((stamp) => stamp.ownerId === ownerId);
  }
}
