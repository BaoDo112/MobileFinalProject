import { Body, Controller, Get, Headers, Patch } from "@nestjs/common";
import { IsBoolean, IsOptional } from "class-validator";

import { getBearerToken } from "../common/auth-header";
import { PreferencesService } from "./preferences.service";

class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  pushAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  reminderAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  queueAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;
}

@Controller("preferences")
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get("me")
  me(@Headers("authorization") authorization?: string) {
    return this.preferencesService.getCurrentPreferences(getBearerToken(authorization));
  }

  @Patch("me")
  update(@Headers("authorization") authorization: string | undefined, @Body() payload: UpdatePreferencesDto) {
    return this.preferencesService.updateCurrentPreferences(getBearerToken(authorization), payload);
  }
}
