import { Injectable } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { RegistrationsService } from "../registrations/registrations.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    private readonly registrationsService: RegistrationsService,
  ) {}

  getCurrentUser(token: string) {
    return this.authService.getSessionEnvelope(token);
  }

  async getVisitorWorkspace(token: string) {
    const session = await this.authService.getSessionEnvelope(token);
    const visits = await this.registrationsService.listVisitorVisits(token);
    const now = Date.now();
    const upcomingVisits = visits.filter((visit) => !visit.checkedInAt || Date.parse(visit.checkedInAt) >= now);
    const pastVisits = visits.filter((visit) => visit.checkedInAt && Date.parse(visit.checkedInAt) < now);

    return {
      user: session.user,
      activeRole: session.activeRole,
      availableRoles: session.availableRoles,
      visitorProfile: session.visitorProfile,
      notificationSettings: session.notificationSettings ?? (await this.authService.getNotificationSettings(token)),
      upcomingVisits,
      pastVisits,
    };
  }
}
