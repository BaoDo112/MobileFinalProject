import { useQuery } from "@tanstack/react-query";

import { registrationsApi } from "../api/registrations";

export function useSubmissionPipeline(enabled = true) {
  return useQuery({
    queryKey: ["submission-pipeline"],
    queryFn: () => registrationsApi.getOrganizerPipeline(),
    enabled,
    staleTime: 60_000,
  });
}