import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

const request = require("supertest");

import { AppModule } from "../src/app.module";

jest.setTimeout(30_000);

describe("Phase 4 review and stamp integration", () => {
  let app: INestApplication;
  let visitorToken: string;
  let organizerToken: string;
  let registrationId: string;

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

    const visitorResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "phase4.visitor@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "VISITOR",
        name: "Phase Four Visitor",
      })
      .expect(201);

    visitorToken = visitorResponse.body.token;

    const organizerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "phase4.organizer@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "ORGANIZER",
        name: "Phase Four Organizer",
      })
      .expect(201);

    organizerToken = organizerResponse.body.token;

    const registrationResponse = await request(app.getHttpServer())
      .post("/api/registrations")
      .set("Authorization", `Bearer ${visitorToken}`)
      .send({
        sessionId: "s-01-2",
        formSchemaVersionId: "fs-g-01-v1",
        answers: [
          { formFieldId: "full-name", value: "Phase Four Visitor" },
          { formFieldId: "email", value: "phase4.visitor@example.com" },
          { formFieldId: "phone", value: "0900111222" },
          { formFieldId: "comfort-mode", value: "Quiet walkthrough" },
        ],
      })
      .expect(201);

    registrationId = registrationResponse.body.registrationId;
  });

  afterAll(async () => {
    await app.close();
  });

  it("keeps the review hub locked before attendance is checked in", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/reviews/hub")
      .set("Authorization", `Bearer ${visitorToken}`)
      .query({ exhibitionId: "g-01" })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        exhibitionId: "g-01",
        averageRatingLabel: expect.any(String),
        eligibility: expect.objectContaining({
          isEligible: false,
        }),
        composer: expect.objectContaining({
          rating: 5,
          content: "",
        }),
      })
    );
    expect(response.body.eligibility.reason).toContain("check-in");
  });

  it("unlocks reviews after organizer check-in and exposes attendance stamp progress", async () => {
    await request(app.getHttpServer())
      .patch(`/api/registrations/${registrationId}/decision`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ action: "CHECK_IN" })
      .expect(200);

    const reviewHub = await request(app.getHttpServer())
      .get("/api/reviews/hub")
      .set("Authorization", `Bearer ${visitorToken}`)
      .query({ exhibitionId: "g-01" })
      .expect(200);

    expect(reviewHub.body.eligibility).toEqual(
      expect.objectContaining({
        isEligible: true,
        checkedInAt: expect.any(String),
      })
    );

    const progress = await request(app.getHttpServer())
      .get("/api/stamps/me/progress")
      .set("Authorization", `Bearer ${visitorToken}`)
      .expect(200);

    expect(progress.body).toEqual(
      expect.objectContaining({
        totalUnlocked: 1,
        confirmedCount: 1,
        upcomingCount: expect.any(Number),
        confirmedStamps: expect.arrayContaining([
          expect.objectContaining({
            source: "ATTENDANCE",
            vaultSection: "CONFIRMED",
          }),
        ]),
        lockedMilestones: expect.arrayContaining([
          expect.objectContaining({
            id: "milestone-community-voice",
            unlocked: false,
          }),
        ]),
      })
    );
  });

  it("publishes eligible reviews and unlocks the review milestone stamp", async () => {
    const response = await request(app.getHttpServer())
      .put("/api/reviews/g-01")
      .set("Authorization", `Bearer ${visitorToken}`)
      .send({
        rating: 5,
        content: "The calm entry briefing made the projection hall feel immersive instead of overwhelming once the lights shifted.",
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        exhibitionId: "g-01",
        reviewCount: 3,
        composer: expect.objectContaining({
          status: "PUBLISHED",
          rating: 5,
        }),
      })
    );
    expect(response.body.recentReviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          authorName: "Phase Four Visitor",
          status: "PUBLISHED",
        }),
      ])
    );

    const progress = await request(app.getHttpServer())
      .get("/api/stamps/me/progress")
      .set("Authorization", `Bearer ${visitorToken}`)
      .expect(200);

    expect(progress.body.confirmedStamps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "ATTENDANCE" }),
        expect.objectContaining({ source: "MILESTONE", milestone: "Published visitor review" }),
      ])
    );
    expect(progress.body.lockedMilestones).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "milestone-community-voice", unlocked: true }),
      ])
    );
  });

  it("keeps moderation-triggered review edits pending and out of the public preview", async () => {
    const response = await request(app.getHttpServer())
      .put("/api/reviews/g-01")
      .set("Authorization", `Bearer ${visitorToken}`)
      .send({
        rating: 4,
        content: "Great route overall, but please DM me on telegram for a refund discussion and staff contact.",
      })
      .expect(200);

    expect(response.body.composer).toEqual(
      expect.objectContaining({
        status: "PENDING",
        rating: 4,
      })
    );
    expect(response.body.recentReviews).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          authorName: "Phase Four Visitor",
          content: expect.stringContaining("telegram"),
        }),
      ])
    );
  });
});