import { apiClient } from "./client";
import type {
  RegistrationDraftDto,
  RegistrationReceiptDto,
  RegistrationSubmissionDto,
  SessionAvailabilityDto,
  SubmissionPipelineDto,
  SubmissionReviewDto,
  UpdateSubmissionDecisionDto,
  VisitorVisitSummaryDto,
} from "../types/api";

export const registrationsApi = {
  listSessions(exhibitionId: string): Promise<SessionAvailabilityDto[]> {
    const params = new URLSearchParams({ exhibitionId });
    return apiClient.get<SessionAvailabilityDto[]>(`/sessions?${params.toString()}`);
  },

  getDraft(exhibitionId: string, sessionId?: string): Promise<RegistrationDraftDto> {
    const params = new URLSearchParams({ exhibitionId });
    if (sessionId) {
      params.set("sessionId", sessionId);
    }

    return apiClient.get<RegistrationDraftDto>(`/registrations/draft?${params.toString()}`);
  },

  submit(payload: RegistrationSubmissionDto): Promise<RegistrationReceiptDto> {
    return apiClient.post<RegistrationReceiptDto>("/registrations", payload);
  },

  getOrganizerPipeline(): Promise<SubmissionPipelineDto> {
    return apiClient.get<SubmissionPipelineDto>("/registrations/organizer/pipeline");
  },

  getOrganizerReview(exhibitionId: string, registrationId?: string): Promise<SubmissionReviewDto> {
    const params = new URLSearchParams({ exhibitionId });
    if (registrationId) {
      params.set("registrationId", registrationId);
    }

    return apiClient.get<SubmissionReviewDto>(`/registrations/organizer/review?${params.toString()}`);
  },

  updateSubmissionDecision(registrationId: string, payload: UpdateSubmissionDecisionDto): Promise<SubmissionReviewDto> {
    return apiClient.patch<SubmissionReviewDto>(`/registrations/${registrationId}/decision`, payload);
  },

  listMyVisits(): Promise<VisitorVisitSummaryDto[]> {
    return apiClient.get<VisitorVisitSummaryDto[]>("/registrations/me/visits");
  },
};