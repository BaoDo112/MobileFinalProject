import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

import type { AuthProvider, UserRole } from "../common/contracts";
import { getBearerToken } from "../common/auth-header";
import { AuthService } from "./auth.service";

class RegisterRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(["LOCAL"])
  provider!: AuthProvider;

  @IsIn(["VISITOR", "ORGANIZER"])
  role!: UserRole;

  @IsString()
  @MinLength(2)
  name!: string;
}

class LoginRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsIn(["LOCAL"])
  provider?: AuthProvider;

  @IsOptional()
  @IsIn(["VISITOR", "ORGANIZER"])
  role?: UserRole;
}

class GoogleContinuationDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsIn(["VISITOR", "ORGANIZER"])
  role!: UserRole;

  @IsOptional()
  @IsString()
  providerId?: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() payload: RegisterRequestDto) {
    return this.authService.registerLocal(payload);
  }

  @Post("login")
  login(@Body() payload: LoginRequestDto) {
    return this.authService.loginLocal(payload);
  }

  @Post("google")
  continueWithGoogle(@Body() payload: GoogleContinuationDto) {
    return this.authService.continueWithGoogle(payload);
  }

  @Get("session")
  session(@Headers("authorization") authorization?: string) {
    return this.authService.getSessionEnvelope(getBearerToken(authorization));
  }
}
