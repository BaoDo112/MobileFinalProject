import { useQuery } from "@tanstack/react-query";

import { profileApi } from "../api/profile";

export function useVisitorProfile(enabled = true) {
  return useQuery({
    queryKey: ["visitor-workspace"],
    queryFn: () => profileApi.getVisitorWorkspace(),
    enabled,
    staleTime: 120_000,
  });
}