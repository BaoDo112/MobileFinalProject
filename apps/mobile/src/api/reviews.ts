import { apiClient } from "./client";
import type { ReviewHubDto, SaveReviewDto } from "../types/api";

export const reviewsApi = {
  getHub(exhibitionId: string): Promise<ReviewHubDto> {
    const params = new URLSearchParams({ exhibitionId });
    return apiClient.get<ReviewHubDto>(`/reviews/hub?${params.toString()}`);
  },

  save(exhibitionId: string, payload: SaveReviewDto): Promise<ReviewHubDto> {
    return apiClient.put<ReviewHubDto>(`/reviews/${exhibitionId}`, payload);
  },
};