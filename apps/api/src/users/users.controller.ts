import { Body, Controller, Get, Headers, Patch } from "@nestjs/common";
import { IsString } from "class-validator";

import { getBearerToken } from "../common/auth-header";
import { UsersService } from "./users.service";

class UpdateAvatarRequestDto {
  @IsString()
  avatarUrl!: string;
}

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@Headers("authorization") authorization?: string) {
    return this.usersService.getCurrentUser(getBearerToken(authorization));
  }

  @Patch("me/avatar")
  updateAvatar(@Headers("authorization") authorization: string | undefined, @Body() payload: UpdateAvatarRequestDto) {
    return this.usersService.updateCurrentAvatar(getBearerToken(authorization), payload.avatarUrl);
  }

  @Get("me/visitor-profile")
  visitorProfile(@Headers("authorization") authorization?: string) {
    return this.usersService.getVisitorWorkspace(getBearerToken(authorization));
  }
}
