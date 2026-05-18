import { apiClient } from "./client";
import type {
  AuthSessionEnvelope,
  GoogleContinuationDto,
  LoginDto,
  NotificationSettingsDto,
  RegisterDto,
  UpdateNotificationSettingsDto,
} from "../types/api";
import type { UserRole } from "../types/models";

export const authApi = {
  register(data: RegisterDto): Promise<AuthSessionEnvelope> {
    return apiClient.post<AuthSessionEnvelope>("/auth/register", data);
  },

  login(data: LoginDto): Promise<AuthSessionEnvelope> {
    return apiClient.post<AuthSessionEnvelope>("/auth/login", data);
  },

  continueWithGoogle(data: GoogleContinuationDto): Promise<AuthSessionEnvelope> {
    return apiClient.post<AuthSessionEnvelope>("/auth/google", data);
  },

  getSession(): Promise<AuthSessionEnvelope> {
    return apiClient.get<AuthSessionEnvelope>("/auth/session");
  },

  getCurrentProfile(): Promise<AuthSessionEnvelope> {
    return apiClient.get<AuthSessionEnvelope>("/users/me");
  },

  selectActiveRole(role: UserRole): Promise<AuthSessionEnvelope> {
    return apiClient.post<AuthSessionEnvelope>("/roles/active", { role });
  },

  getNotificationSettings(): Promise<NotificationSettingsDto> {
    return apiClient.get<NotificationSettingsDto>("/preferences/me");
  },

  updateNotificationSettings(updates: UpdateNotificationSettingsDto): Promise<NotificationSettingsDto> {
    return apiClient.patch<NotificationSettingsDto>("/preferences/me", updates);
  },
};
