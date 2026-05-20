import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

const request = require("supertest");

import { v14WorkflowSeed } from "../prisma/seed";
import { AppModule } from "../src/app.module";

jest.setTimeout(30_000);

describe("v1.4 workflow smoke", () => {
  let app: INestApplication;
  let organizerToken: string;
  let visitorToken: string;

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

    const organizerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: v14WorkflowSeed.smokeAccounts.organizer.email,
        password: "secure-pass-123",
        provider: "LOCAL",
        role: v14WorkflowSeed.smokeAccounts.organizer.role,
        name: v14WorkflowSeed.smokeAccounts.organizer.name,
      })
      .expect(201);

    organizerToken = organizerResponse.body.token;

    const visitorResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: v14WorkflowSeed.smokeAccounts.visitor.email,
        password: "secure-pass-123",
        provider: "LOCAL",
        role: v14WorkflowSeed.smokeAccounts.visitor.role,
        name: v14WorkflowSeed.smokeAccounts.visitor.name,
      })
      .expect(201);

    visitorToken = visitorResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("publishes a new exhibition and exposes it in discover/detail reads", async () => {
    const draft = await request(app.getHttpServer())
      .post("/api/exhibitions/drafts")
      .set("Authorization", `Bearer ${organizerToken}`)
      .expect(201);

    const exhibitionId = draft.body.exhibitionId;

    const savedEditor = await request(app.getHttpServer())
      .patch(`/api/exhibitions/${exhibitionId}/editor`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: v14WorkflowSeed.draftBlueprint.title,
        exhibitionType: v14WorkflowSeed.draftBlueprint.exhibitionType,
        bio: "A sensory garden for small-group evening visits.",
        venueId: v14WorkflowSeed.draftBlueprint.venueId,
        mediaUrls: ["https://example.invalid/signal-garden/poster.jpg"],
        curatorNote: "Open with the ambient route.",
        policyText: "Arrive 10 minutes before check-in.",
        highlightList: ["Quiet route", "Ambient sound cues"],
        sessions: [
          {
            startsAt: v14WorkflowSeed.draftBlueprint.sessionStartsAt,
            endsAt: v14WorkflowSeed.draftBlueprint.sessionEndsAt,
            capacity: 18,
            waitlistCapacity: 6,
            vibe: "Quiet walkthrough",
          },
        ],
      })
      .expect(200);

    const sessionId = savedEditor.body.sessions[0]?.sessionId;
    expect(sessionId).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .put(`/api/form-schemas/${exhibitionId}/editor`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        consentTitle: "Confirm your visit details",
        consentCopy: "Your answers are used for session planning and check-in.",
        fields: [
          {
            id: "full-name",
            label: "Full name",
            type: "TEXT",
            placeholder: "Your full name",
            isRequired: true,
            options: [],
            helpText: "Used for arrival check-in.",
            order: 1,
          },
        ],
      })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/exhibitions/${exhibitionId}/publish`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .expect(201);

    const discover = await request(app.getHttpServer())
      .get("/api/exhibitions")
      .query({ timeline: "future" })
      .expect(200);

    expect(discover.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: exhibitionId,
          title: v14WorkflowSeed.draftBlueprint.title,
          status: "PUBLISHED",
        }),
      ])
    );

    const detail = await request(app.getHttpServer()).get(`/api/exhibitions/${exhibitionId}`).expect(200);

    expect(detail.body).toEqual(
      expect.objectContaining({
        exhibition: expect.objectContaining({
          id: exhibitionId,
          title: v14WorkflowSeed.draftBlueprint.title,
        }),
        reviewPreview: [],
      })
    );
  });

  it("covers organizer approval plus visitor registration, check-in, review, and stamp progress", async () => {
    const approved = await request(app.getHttpServer())
      .patch(`/api/registrations/${v14WorkflowSeed.publishedExhibitions.lightwave.pendingRegistrationId}/decision`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ action: "APPROVE" })
      .expect(200);

    expect(approved.body.selectedSubmission).toEqual(
      expect.objectContaining({
        registrationId: v14WorkflowSeed.publishedExhibitions.lightwave.pendingRegistrationId,
        status: "CONFIRMED",
      })
    );

    const registration = await request(app.getHttpServer())
      .post("/api/registrations")
      .set("Authorization", `Bearer ${visitorToken}`)
      .send({
        sessionId: v14WorkflowSeed.publishedExhibitions.lightwave.openSessionId,
        formSchemaVersionId: "fs-g-01-v1",
        answers: [
          { formFieldId: "full-name", value: v14WorkflowSeed.smokeAccounts.visitor.name },
          { formFieldId: "email", value: v14WorkflowSeed.smokeAccounts.visitor.email },
          { formFieldId: "phone", value: "0900222333" },
          { formFieldId: "comfort-mode", value: "Quiet walkthrough" },
        ],
      })
      .expect(201);

    const registrationId = registration.body.registrationId;
    expect(registration.body.status).toBe("CONFIRMED");

    await request(app.getHttpServer())
      .patch(`/api/registrations/${registrationId}/decision`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ action: "CHECK_IN" })
      .expect(200);

    const reviewHub = await request(app.getHttpServer())
      .get("/api/reviews/hub")
      .set("Authorization", `Bearer ${visitorToken}`)
      .query({ exhibitionId: v14WorkflowSeed.publishedExhibitions.lightwave.exhibitionId })
      .expect(200);

    expect(reviewHub.body.eligibility).toEqual(
      expect.objectContaining({
        isEligible: true,
        checkedInAt: expect.any(String),
      })
    );

    const savedReview = await request(app.getHttpServer())
      .put(`/api/reviews/${v14WorkflowSeed.publishedExhibitions.lightwave.exhibitionId}`)
      .set("Authorization", `Bearer ${visitorToken}`)
      .send({
        rating: 5,
        content: "The quiet route and pacing cues made the kinetic hall feel immersive all the way through the checked-in visit.",
      })
      .expect(200);

    expect(savedReview.body.composer).toEqual(
      expect.objectContaining({
        status: "PUBLISHED",
        rating: 5,
      })
    );

    const detail = await request(app.getHttpServer())
      .get(`/api/exhibitions/${v14WorkflowSeed.publishedExhibitions.lightwave.exhibitionId}`)
      .expect(200);

    expect(detail.body.reviewPreview).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          authorName: v14WorkflowSeed.smokeAccounts.visitor.name,
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
  });
});