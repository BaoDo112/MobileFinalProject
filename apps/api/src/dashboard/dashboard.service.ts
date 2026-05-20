import { Injectable } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import type { OrganizerDashboardDto, OrganizerExhibitionCardDto, OrganizerKpiCardDto } from "../common/contracts";
import { ExhibitionsService } from "../exhibitions/exhibitions.service";
import { RegistrationsService } from "../registrations/registrations.service";

@Injectable()
export class DashboardService {
  constructor(
    private readonly authService: AuthService,
    private readonly exhibitionsService: ExhibitionsService,
    private readonly registrationsService: RegistrationsService,
  ) {}

  async getOrganizerDashboard(token: string): Promise<OrganizerDashboardDto> {
    await this.authService.getSessionEnvelope(token);

    const exhibitions = this.exhibitionsService.listByOrganizer();
    const exhibitionIds = exhibitions.map((exhibition) => exhibition.id);
    const queueCounts = this.registrationsService.getQueueCounts(exhibitionIds);
    const exhibitionSnapshot = this.registrationsService.getExhibitionSnapshot(exhibitionIds);
    const scheduledSoon = exhibitions.filter((exhibition) => exhibition.timelineStatus !== "PAST");
    const waitlistLiveCount = exhibitions.filter((exhibition) => exhibition.registrationState === "waitlist").length;

    return {
      kpis: this.buildKpis(exhibitions.length, queueCounts, waitlistLiveCount),
      urgentQueueCount: queueCounts.pending + queueCounts.waitlisted,
      sessionLoadSummary: `${scheduledSoon.length} active exhibition windows · ${waitlistLiveCount} waitlist queues live`,
      exhibitions: exhibitions.map((exhibition) => {
        const counts = exhibitionSnapshot.get(exhibition.id) ?? {
          pendingCount: 0,
          checkedInCount: 0,
          waitlistedCount: 0,
        };

        return this.toDashboardCard(exhibition, counts.pendingCount, counts.checkedInCount, counts.waitlistedCount);
      }),
    };
  }

  private buildKpis(totalExhibitions: number, queueCounts: ReturnType<RegistrationsService["getQueueCounts"]>, waitlistLiveCount: number): OrganizerKpiCardDto[] {
    return [
      {
        label: "Live exhibitions",
        value: String(totalExhibitions),
        tone: "success",
      },
      {
        label: "Pending review",
        value: String(queueCounts.pending),
        tone: queueCounts.pending > 0 ? "alert" : "neutral",
      },
      {
        label: "Checked-in",
        value: String(queueCounts.checkedIn),
        tone: queueCounts.checkedIn > 0 ? "success" : "neutral",
      },
      {
        label: "Waitlist live",
        value: String(waitlistLiveCount),
        tone: waitlistLiveCount > 0 ? "alert" : "neutral",
      },
    ];
  }

  private toDashboardCard(
    exhibition: ReturnType<ExhibitionsService["listByOrganizer"]>[number],
    pendingCount: number,
    checkedInCount: number,
    waitlistedCount: number,
  ): OrganizerExhibitionCardDto {
    let nextAction = "Refine the exhibition brief";
    if (pendingCount > 0) {
      nextAction = "Review pending submissions";
    } else if (waitlistedCount > 0) {
      nextAction = "Watch waitlist conversions";
    } else if (checkedInCount > 0) {
      nextAction = "Prepare post-visit follow-up";
    }

    return {
      exhibitionId: exhibition.id,
      title: exhibition.title,
      venueTitle: exhibition.venueTitle,
      status: exhibition.status,
      pendingCount,
      checkedInCount,
      nextAction,
    };
  }
}