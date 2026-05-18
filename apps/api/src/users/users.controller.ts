import { Controller, Get, Headers } from "@nestjs/common";

import { getBearerToken } from "../common/auth-header";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@Headers("authorization") authorization?: string) {
    return this.usersService.getCurrentUser(getBearerToken(authorization));
  }
}
