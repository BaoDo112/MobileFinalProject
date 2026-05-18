import { UnauthorizedException } from "@nestjs/common";

export function getBearerToken(authorization?: string): string {
  if (!authorization?.startsWith("Bearer ")) {
    throw new UnauthorizedException("Missing bearer token");
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new UnauthorizedException("Missing bearer token");
  }

  return token;
}
