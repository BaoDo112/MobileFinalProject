import { Injectable } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService) {}

  getCurrentUser(token: string) {
    return this.authService.getSessionEnvelope(token);
  }
}
