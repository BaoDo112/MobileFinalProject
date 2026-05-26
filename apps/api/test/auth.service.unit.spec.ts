import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import type { AssetsService } from "../src/assets/assets.service";
import { AuthService } from "../src/auth/auth.service";
import { AppStateService } from "../src/persistence/app-state.service";
import type { PrismaService } from "../src/persistence/prisma.service";

function createService() {
  const prisma = {
    runtimeState: {
      findUnique: async () => null,
      create: async () => undefined,
      upsert: async () => undefined,
    },
  } as unknown as PrismaService;
  const assetsService = {
    deleteManagedAsset: async () => undefined,
  } as unknown as AssetsService;

  return new AuthService(new JwtService({ secret: "unit-test-secret" }), new AppStateService(prisma), assetsService);
}

describe("AuthService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ARTHERA_DEMO_VISITOR_PASSWORD;
    delete process.env.ARTHERA_DEMO_ORGANIZER_PASSWORD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("registers a local user with a session envelope and visitor profile", async () => {
    const service = createService();

    const session = await service.registerLocal({
      email: "visitor@example.com",
      password: "secure-pass-123",
      role: "VISITOR",
      name: "Visitor Example",
    });

    expect(session.user.email).toBe("visitor@example.com");
    expect(session.activeRole).toBe("VISITOR");
    expect(session.availableRoles).toEqual(["VISITOR", "ORGANIZER"]);
    expect(session.visitorProfile?.name).toBe("Visitor Example");
    expect(session.organizerProfile).toBeUndefined();
    expect(session.notificationSettings?.queueAlerts).toBe(true);
    expect(session.token).toEqual(expect.any(String));
  });

  it("reuses one user identity for local and Google auth", async () => {
    const service = createService();
    const localSession = await service.registerLocal({
      email: "shared@example.com",
      password: "secure-pass-123",
      role: "VISITOR",
      name: "Shared Identity",
    });

    const googleSession = await service.continueWithGoogle({
      email: "shared@example.com",
      name: "Shared Identity",
      role: "ORGANIZER",
      providerId: "google-shared-id",
    });

    expect(googleSession.user.id).toBe(localSession.user.id);
    expect(googleSession.activeRole).toBe("ORGANIZER");
    expect(googleSession.organizerProfile?.name).toBe("Shared Identity");
    expect(googleSession.visitorProfile?.name).toBe("Shared Identity");
  });

  it("switches active role without changing the user id", async () => {
    const service = createService();
    const visitorSession = await service.registerLocal({
      email: "switcher@example.com",
      password: "secure-pass-123",
      role: "VISITOR",
      name: "Role Switcher",
    });

    const organizerSession = await service.selectActiveRole(visitorSession.token, "ORGANIZER");

    expect(organizerSession.user.id).toBe(visitorSession.user.id);
    expect(organizerSession.activeRole).toBe("ORGANIZER");
    expect(organizerSession.organizerProfile?.organizationName).toContain("Role Switcher");
  });

  it("rejects invalid local credentials", async () => {
    const service = createService();
    await service.registerLocal({
      email: "invalid@example.com",
      password: "secure-pass-123",
      role: "VISITOR",
      name: "Invalid Login",
    });

    await expect(
      service.loginLocal({
        email: "invalid@example.com",
        password: "wrong-password",
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
