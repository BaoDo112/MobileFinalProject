import { Injectable } from "@nestjs/common";

import type { NotificationSettingsDto } from "../common/contracts";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class PreferencesService {
  constructor(private readonly authService: AuthService) {}

  getCurrentPreferences(token: string) {
    return this.authService.getNotificationSettings(token);
  }

  updateCurrentPreferences(token: string, updates: Partial<NotificationSettingsDto>) {
    return this.authService.updateNotificationSettings(token, updates);
  }
}
