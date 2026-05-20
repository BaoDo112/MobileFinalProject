import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reviewsApi } from "../api/reviews";
import type { SaveReviewDto } from "../types/api";

export function useReviewHub(exhibitionId: string) {
  const queryClient = useQueryClient();

  const reviewQuery = useQuery({
    queryKey: ["review-hub", exhibitionId],
    queryFn: () => reviewsApi.getHub(exhibitionId),
    enabled: exhibitionId.length > 0,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  const saveReviewMutation = useMutation({
    mutationFn: (payload: SaveReviewDto) => reviewsApi.save(exhibitionId, payload),
    onSuccess: async (reviewHub) => {
      queryClient.setQueryData(["review-hub", exhibitionId], reviewHub);
      await queryClient.invalidateQueries({ queryKey: ["review-hub", exhibitionId] });
      await queryClient.invalidateQueries({ queryKey: ["exhibition-detail", exhibitionId] });
      await queryClient.invalidateQueries({ queryKey: ["stamp-vault"] });
    },
  });

  return {
    reviewQuery,
    saveReviewMutation,
  };
}