import { Controller, Get, Headers } from "@nestjs/common";

import { getBearerToken } from "../common/auth-header";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("organizer")
  organizer(@Headers("authorization") authorization?: string) {
    return this.dashboardService.getOrganizerDashboard(getBearerToken(authorization));
  }
}