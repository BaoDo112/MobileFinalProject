import { apiClient } from "./client";
import type { NotificationSettingsDto, OrganizerNotificationsDto, UpdateNotificationSettingsDto, VisitorWorkspaceDto } from "../types/api";

export const profileApi = {
  getVisitorWorkspace(): Promise<VisitorWorkspaceDto> {
    return apiClient.get<VisitorWorkspaceDto>("/users/me/visitor-profile");
  },

  getNotificationSettings(): Promise<NotificationSettingsDto> {
    return apiClient.get<NotificationSettingsDto>("/preferences/me");
  },

  getOrganizerNotifications(): Promise<OrganizerNotificationsDto> {
    return apiClient.get<OrganizerNotificationsDto>("/notifications/me/organizer");
  },

  updateNotificationSettings(updates: UpdateNotificationSettingsDto): Promise<NotificationSettingsDto> {
    return apiClient.patch<NotificationSettingsDto>("/preferences/me", updates);
  },
};