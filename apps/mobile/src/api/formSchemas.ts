import { apiClient } from "./client";
import type { FormSchemaEditorDto, SaveFormSchemaDto } from "../types/api";

export const formSchemasApi = {
  getEditor(exhibitionId: string) {
    return apiClient.get<FormSchemaEditorDto>(`/form-schemas/${exhibitionId}/editor`);
  },

  saveEditor(exhibitionId: string, payload: SaveFormSchemaDto) {
    return apiClient.put<FormSchemaEditorDto>(`/form-schemas/${exhibitionId}/editor`, payload);
  },
};