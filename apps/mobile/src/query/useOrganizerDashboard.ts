import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "../api/dashboard";

export function useOrganizerDashboard(enabled = true) {
  return useQuery({
    queryKey: ["organizer-dashboard"],
    queryFn: () => dashboardApi.getOrganizerDashboard(),
    enabled,
    staleTime: 120_000,
  });
}