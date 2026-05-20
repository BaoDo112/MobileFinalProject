import { apiClient } from "./client";
import type { StampProgressDto } from "../types/api";

export const stampsApi = {
  getProgress(): Promise<StampProgressDto> {
    return apiClient.get<StampProgressDto>("/stamps/me/progress");
  },
};