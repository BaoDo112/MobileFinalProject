import { Controller, Get, Headers } from "@nestjs/common";

import { getBearerToken } from "../common/auth-header";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("me/organizer")
  organizer(@Headers("authorization") authorization?: string) {
    return this.notificationsService.getOrganizerNotifications(getBearerToken(authorization));
  }
}