import { apiClient } from "./client";
import type { ExhibitionDetailDto, ExhibitionEditorDto, ExhibitionSummaryDto, RegistrationCtaState, SaveExhibitionDraftDto } from "../types/api";
import type { GalleryStatus } from "../types/models";

export type DiscoverFilters = Readonly<{
  timeline?: GalleryStatus;
  district?: string;
  type?: string;
  registrationState?: RegistrationCtaState;
  organizerId?: string;
}>;

function buildQuery(filters: DiscoverFilters) {
  const parts = Object.entries(filters)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

export const exhibitionsApi = {
  list(filters: DiscoverFilters = {}) {
    return apiClient.get<ExhibitionSummaryDto[]>(`/exhibitions${buildQuery(filters)}`);
  },

  getDetail(exhibitionId: string) {
    return apiClient.get<ExhibitionDetailDto>(`/exhibitions/${exhibitionId}`);
  },

  createDraft() {
    return apiClient.post<ExhibitionEditorDto>("/exhibitions/drafts");
  },

  getEditor(exhibitionId: string) {
    return apiClient.get<ExhibitionEditorDto>(`/exhibitions/${exhibitionId}/editor`);
  },

  saveEditor(exhibitionId: string, payload: SaveExhibitionDraftDto) {
    return apiClient.patch<ExhibitionEditorDto>(`/exhibitions/${exhibitionId}/editor`, payload);
  },

  publish(exhibitionId: string) {
    return apiClient.post<ExhibitionEditorDto>(`/exhibitions/${exhibitionId}/publish`);
  },

  listVenues() {
    return apiClient.get<ExhibitionEditorDto["availableVenues"]>("/venues");
  },
};