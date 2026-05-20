import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
const request = require("supertest");

import { AppModule } from "../src/app.module";

describe("Phase 1 auth bootstrap integration", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers, restores session, switches role, and updates preferences", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "phase1@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "VISITOR",
        name: "Phase One Visitor",
      })
      .expect(201);

    expect(registerResponse.body.activeRole).toBe("VISITOR");
    expect(registerResponse.body.visitorProfile.name).toBe("Phase One Visitor");

    const sessionResponse = await request(app.getHttpServer())
      .get("/api/auth/session")
      .set("Authorization", `Bearer ${registerResponse.body.token}`)
      .expect(200);

    expect(sessionResponse.body.user.email).toBe("phase1@example.com");
    expect(sessionResponse.body.activeRole).toBe("VISITOR");

    const roleResponse = await request(app.getHttpServer())
      .post("/api/roles/active")
      .set("Authorization", `Bearer ${registerResponse.body.token}`)
      .send({ role: "ORGANIZER" })
      .expect(201);

    expect(roleResponse.body.activeRole).toBe("ORGANIZER");
    expect(roleResponse.body.organizerProfile.organizationName).toContain("Phase One Visitor");

    const preferenceResponse = await request(app.getHttpServer())
      .patch("/api/preferences/me")
      .set("Authorization", `Bearer ${roleResponse.body.token}`)
      .send({ pushAlerts: true, marketingOptIn: true })
      .expect(200);

    expect(preferenceResponse.body).toMatchObject({
      pushAlerts: true,
      marketingOptIn: true,
    });

    const meResponse = await request(app.getHttpServer())
      .get("/api/users/me")
      .set("Authorization", `Bearer ${roleResponse.body.token}`)
      .expect(200);

    expect(meResponse.body.activeRole).toBe("ORGANIZER");
    expect(meResponse.body.user.id).toBe(registerResponse.body.user.id);
  });

  it("reuses the same user id for Google continuation", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "google-link@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "VISITOR",
        name: "Google Link",
      })
      .expect(201);

    const googleResponse = await request(app.getHttpServer())
      .post("/api/auth/google")
      .send({
        email: "google-link@example.com",
        name: "Google Link",
        role: "ORGANIZER",
        providerId: "google-link-sub",
      })
      .expect(201);

    expect(googleResponse.body.user.id).toBe(registerResponse.body.user.id);
    expect(googleResponse.body.activeRole).toBe("ORGANIZER");
  });

  it("rejects malformed auth input and missing bearer tokens", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "bad-email",
        password: "short",
        provider: "LOCAL",
        role: "VISITOR",
        name: "A",
      })
      .expect(400);

    return request(app.getHttpServer())
      .get("/api/auth/session")
      .expect(401);
  });
});
