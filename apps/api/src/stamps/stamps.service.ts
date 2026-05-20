import { Injectable } from "@nestjs/common";

import type { StampCardDto, StampProgressDto, StampSource, StampVaultSection, VisitorVisitSummaryDto } from "../common/contracts";
import { ExhibitionsService } from "../exhibitions/exhibitions.service";

interface StampRecord {
  id: string;
  exhibitionId: string;
  visitorId: string;
  registrationId?: string;
  source: StampSource;
  vaultSection: StampVaultSection;
  title: string;
  milestone: string;
  note?: string;
  accent?: string;
  unlockedAt: string;
  dedupeKey: string;
}

@Injectable()
export class StampsService {
  private readonly stamps: StampRecord[] = [];

  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  issue(ownerId: string, galleryId: string, title: string, sourceRegistrationId?: string) {
    return this.issueAttendanceStamp(ownerId, galleryId, sourceRegistrationId, title);
  }

  list(ownerId: string) {
    return this.stamps.filter((stamp) => stamp.visitorId === ownerId).map((stamp) => this.toStampCard(stamp));
  }

  issueAttendanceStamp(visitorId: string, exhibitionId: string, registrationId?: string, title?: string) {
    const summary = this.exhibitionsService.getSummary(exhibitionId);

    return this.issueStamp({
      visitorId,
      exhibitionId,
      registrationId,
      source: "ATTENDANCE",
      vaultSection: "CONFIRMED",
      title: title ?? summary.title,
      milestone: "Visited and confirmed",
      note: "Attendance was verified from the organizer check-in flow.",
      accent: summary.accent,
      dedupeKey: registrationId ? `attendance:${registrationId}` : `attendance:${visitorId}:${exhibitionId}`,
    });
  }

  issueMilestoneStamp(visitorId: string, exhibitionId: string, milestoneKey: string) {
    const summary = this.exhibitionsService.getSummary(exhibitionId);

    return this.issueStamp({
      visitorId,
      exhibitionId,
      source: "MILESTONE",
      vaultSection: "CONFIRMED",
      title: "Community Voice",
      milestone: "Published visitor review",
      note: "Unlocked after a post-visit review became visible to the public feed.",
      accent: summary.accent,
      dedupeKey: `milestone:${milestoneKey}:${visitorId}:${exhibitionId}`,
    });
  }

  buildProgress(ownerId: string, visits: VisitorVisitSummaryDto[]): StampProgressDto {
    const confirmedStamps = this.list(ownerId).filter((stamp) => stamp.vaultSection === "CONFIRMED");
    const unlockedExhibitionIds = new Set(confirmedStamps.map((stamp) => stamp.exhibitionId).filter(Boolean));

    const upcomingStamps = visits
      .filter((visit) => (visit.status === "CONFIRMED" || visit.status === "WAITLISTED") && !unlockedExhibitionIds.has(visit.exhibitionId))
      .map((visit) => this.toVisitCard(visit, "UPCOMING"));

    const expiredStamps = visits
      .filter((visit) => visit.status === "REJECTED" || visit.status === "CANCELLED")
      .map((visit) => this.toVisitCard(visit, "EXPIRED"));

    const hasCommunityStamp = confirmedStamps.some((stamp) => stamp.source === "MILESTONE");
    const lockedMilestones = [
      {
        id: "milestone-first-attendance",
        title: "First attendance",
        milestone: "Check in to your first confirmed visit",
        note: "Organizer check-in unlocks your first verified attendance stamp.",
        accent: "#d66b55",
        unlocked: confirmedStamps.some((stamp) => stamp.source === "ATTENDANCE"),
      },
      {
        id: "milestone-community-voice",
        title: "Community voice",
        milestone: "Publish one visitor review",
        note: "Visible post-visit feedback unlocks the review milestone stamp.",
        accent: "#6f4d67",
        unlocked: hasCommunityStamp,
      },
    ];
    const nextMilestoneLabel = lockedMilestones.find((milestone) => !milestone.unlocked)?.milestone;

    return {
      totalUnlocked: confirmedStamps.length,
      confirmedCount: confirmedStamps.length,
      upcomingCount: upcomingStamps.length,
      expiredCount: expiredStamps.length,
      nextMilestoneLabel,
      confirmedStamps,
      upcomingStamps,
      expiredStamps,
      lockedMilestones,
      history: confirmedStamps.slice().sort((left, right) => Date.parse(right.unlockedAt ?? "") - Date.parse(left.unlockedAt ?? "")),
    };
  }

  private issueStamp(input: Omit<StampRecord, "id" | "unlockedAt">) {
    const existing = this.stamps.find((stamp) => stamp.dedupeKey === input.dedupeKey);
    if (existing) {
      return this.toStampCard(existing);
    }

    const record: StampRecord = {
      id: `stamp-${this.stamps.length + 1}`,
      unlockedAt: new Date().toISOString(),
      ...input,
    };

    this.stamps.push(record);
    return this.toStampCard(record);
  }

  private toVisitCard(visit: VisitorVisitSummaryDto, vaultSection: StampVaultSection): StampCardDto {
    const summary = this.exhibitionsService.getSummary(visit.exhibitionId);
    return {
      id: `${vaultSection.toLowerCase()}-${visit.registrationId}`,
      exhibitionId: visit.exhibitionId,
      source: "ATTENDANCE",
      vaultSection,
      title: visit.exhibitionTitle,
      milestone: vaultSection === "UPCOMING" ? "Registration is active" : "Registration expired",
      note: visit.sessionLabel,
      accent: summary.accent,
      unlockedAt: visit.checkedInAt,
    };
  }

  private toStampCard(stamp: StampRecord): StampCardDto {
    return {
      id: stamp.id,
      exhibitionId: stamp.exhibitionId,
      source: stamp.source,
      vaultSection: stamp.vaultSection,
      title: stamp.title,
      milestone: stamp.milestone,
      note: stamp.note,
      accent: stamp.accent,
      unlockedAt: stamp.unlockedAt,
    };
  }
}
