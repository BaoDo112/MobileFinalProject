import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

const request = require("supertest");

import { AppModule } from "../src/app.module";

describe("Phase 3 organizer dashboard integration", () => {
  let app: INestApplication;
  let token: string;

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

    const authResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "phase3.organizer@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "ORGANIZER",
        name: "Phase Three Organizer",
      })
      .expect(201);

    token = authResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns organizer dashboard aggregates with queue state", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/dashboard/organizer")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.kpis).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Live exhibitions" }),
        expect.objectContaining({ label: "Pending review" }),
      ])
    );
    expect(response.body.urgentQueueCount).toBeGreaterThan(0);
    expect(response.body.sessionLoadSummary).toContain("waitlist");
    expect(response.body.exhibitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ exhibitionId: "g-01" }),
        expect.objectContaining({ exhibitionId: "g-02" }),
      ])
    );
  });

  it("returns organizer notification metadata and support links", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/notifications/me/organizer")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.queueCounts).toEqual(
      expect.objectContaining({
        pending: expect.any(Number),
        waitlisted: expect.any(Number),
      })
    );
    expect(response.body.reminderWindowLabel).toContain("24 hours");
    expect(response.body.supportLinks).toHaveLength(3);
  });
});