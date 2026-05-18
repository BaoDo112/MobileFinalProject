import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { IsIn } from "class-validator";

import type { UserRole } from "../common/contracts";
import { getBearerToken } from "../common/auth-header";
import { RolesService } from "./roles.service";

class SelectRoleDto {
  @IsIn(["VISITOR", "ORGANIZER"])
  role!: UserRole;
}

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get("current")
  current(@Headers("authorization") authorization?: string) {
    return this.rolesService.getCurrentRole(getBearerToken(authorization));
  }

  @Post("active")
  selectRole(@Headers("authorization") authorization: string | undefined, @Body() payload: SelectRoleDto) {
    return this.rolesService.selectRole(getBearerToken(authorization), payload.role);
  }
}
