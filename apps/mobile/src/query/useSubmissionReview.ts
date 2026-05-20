import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { registrationsApi } from "../api/registrations";
import type { SubmissionDecisionAction } from "../types/api";

export function useSubmissionReview(exhibitionId: string) {
  const queryClient = useQueryClient();
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string>();

  useEffect(() => {
    setSelectedRegistrationId(undefined);
  }, [exhibitionId]);

  const reviewQuery = useQuery({
    queryKey: ["submission-review", exhibitionId, selectedRegistrationId ?? "board"],
    queryFn: () => registrationsApi.getOrganizerReview(exhibitionId, selectedRegistrationId),
    enabled: Boolean(exhibitionId),
    staleTime: 60_000,
  });

  useEffect(() => {
    const nextRegistrationId = reviewQuery.data?.selectedSubmission?.registrationId;
    if (!selectedRegistrationId && nextRegistrationId) {
      setSelectedRegistrationId(nextRegistrationId);
    }
  }, [reviewQuery.data?.selectedSubmission?.registrationId, selectedRegistrationId]);

  const updateDecisionMutation = useMutation({
    mutationFn: ({ registrationId, action }: { registrationId: string; action: SubmissionDecisionAction }) =>
      registrationsApi.updateSubmissionDecision(registrationId, { action }),
    onSuccess: async (review) => {
      const nextRegistrationId = review.selectedSubmission?.registrationId;

      if (nextRegistrationId) {
        setSelectedRegistrationId(nextRegistrationId);
        queryClient.setQueryData(["submission-review", exhibitionId, nextRegistrationId], review);
      }

      await queryClient.invalidateQueries({ queryKey: ["submission-review", exhibitionId] });
      await queryClient.invalidateQueries({ queryKey: ["submission-pipeline"] });
      await queryClient.invalidateQueries({ queryKey: ["organizer-dashboard"] });
    },
  });

  return {
    selectedRegistrationId,
    setSelectedRegistrationId,
    reviewQuery,
    updateDecisionMutation,
  };
}