import { Injectable } from "@nestjs/common";

import type { GallerySummary } from "../common/contracts";

const gallerySeed: GallerySummary[] = [
  {
    id: "g-01",
    title: "Lightwave: Kinetic Gallery",
    galleryType: "Technology",
    district: "District 1",
    dateLabel: "Apr 03 - Apr 16, 2026",
    timeLabel: "09:00 - 21:00",
    organizer: "Arthera Studio",
    status: "PRESENT"
  },
  {
    id: "g-02",
    title: "Roots in Motion",
    galleryType: "Art",
    district: "District 3",
    dateLabel: "May 12 - May 28, 2026",
    timeLabel: "10:00 - 19:00",
    organizer: "Cedar House",
    status: "FUTURE"
  }
];

@Injectable()
export class GalleriesService {
  list(status?: string) {
    if (!status) {
      return gallerySeed;
    }

    return gallerySeed.filter((gallery) => gallery.status === status.toUpperCase());
  }

  detail(id: string) {
    return gallerySeed.find((gallery) => gallery.id === id) ?? null;
  }
}
