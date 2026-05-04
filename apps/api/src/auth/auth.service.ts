import { Injectable } from "@nestjs/common";

import type { AuthResponse, UserRole } from "../common/contracts";

@Injectable()
export class AuthService {
  login(email: string, role: UserRole): AuthResponse {
    return {
      token: `dev-token-${role.toLowerCase()}`,
      role,
      email
    };
  }
}
