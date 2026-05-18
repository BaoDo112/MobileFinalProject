import { Injectable } from "@nestjs/common";

import type { UserRole } from "../common/contracts";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class RolesService {
  constructor(private readonly authService: AuthService) {}

  getCurrentRole(token: string) {
    return this.authService.getRoleState(token);
  }

  selectRole(token: string, role: UserRole) {
    return this.authService.selectActiveRole(token, role);
  }
}
