import { Body, Controller, Post } from "@nestjs/common";

import type { UserRole } from "../common/contracts";
import { AuthService } from "./auth.service";

interface LoginRequest {
  email: string;
  role: UserRole;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() payload: LoginRequest) {
    return this.authService.login(payload.email, payload.role);
  }
}
