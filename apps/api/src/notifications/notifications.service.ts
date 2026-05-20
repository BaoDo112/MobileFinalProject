import { Injectable } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import type { OrganizerNotificationsDto } from "../common/contracts";
import { RegistrationsService } from "../registrations/registrations.service";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly authService: AuthService,
    private readonly registrationsService: RegistrationsService,
  ) {}

  async getOrganizerNotifications(token: string): Promise<OrganizerNotificationsDto> {
    const session = await this.authService.getSessionEnvelope(token);
    const queueCounts = this.registrationsService.getQueueCounts();

    return {
      queueCounts,
      reminderWindowLabel: "Reminder job runs 24 hours before each scheduled session window.",
      digestCadenceLabel: `Digest cadence follows ${session.notificationSettings?.emailAlerts ? "email" : "in-app"} alerts with queue escalation enabled.`,
      supportLinks: [
        {
          label: "Support inbox",
          url: "mailto:support@arthera.local",
          description: "Use when an attendee needs a manual queue or accessibility update.",
        },
        {
          label: "Organizer playbook",
          url: "https://example.invalid/arthera/organizer-playbook",
          description: "Check publishing, queue, and attendance operating guidelines.",
        },
        {
          label: "Policy notes",
          url: "https://example.invalid/arthera/policies",
          description: "Review moderation, privacy, and reminder rules before outreach.",
        },
      ],
    };
  }
}