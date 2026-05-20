import { apiClient } from "./client";
import type { OrganizerDashboardDto } from "../types/api";

export const dashboardApi = {
  getOrganizerDashboard(): Promise<OrganizerDashboardDto> {
    return apiClient.get<OrganizerDashboardDto>("/dashboard/organizer");
  },
};