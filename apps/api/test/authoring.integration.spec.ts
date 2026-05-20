import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

const request = require("supertest");

import { AppModule } from "../src/app.module";

jest.setTimeout(30_000);

describe("Phase 3 organizer authoring integration", () => {
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
        email: "phase3.authoring@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "ORGANIZER",
        name: "Authoring Organizer",
      })
      .expect(201);

    token = authResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns locked editor state for exhibitions that already have registrations", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/exhibitions/g-01/editor")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        exhibitionId: "g-01",
        isLocked: true,
      })
    );
    expect(response.body.lockReason).toContain("registrations");
  });

  it("creates a draft, blocks publish before schema validity, then publishes after schema save", async () => {
    const venues = await request(app.getHttpServer()).get("/api/venues").expect(200);
    expect(venues.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: "v-01" })]));

    const draft = await request(app.getHttpServer())
      .post("/api/exhibitions/drafts")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    const exhibitionId = draft.body.exhibitionId;
    expect(draft.body.status).toBe("DRAFT");
    expect(draft.body.formSchema.isValid).toBe(false);

    await request(app.getHttpServer())
      .patch(`/api/exhibitions/${exhibitionId}/editor`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Signal Garden Draft",
        exhibitionType: "Installation",
        bio: "A sensory garden for small-group evening visits.",
        venueId: "v-01",
        mediaUrls: ["https://example.invalid/signal-garden/poster.jpg"],
        curatorNote: "Open with the ambient route.",
        policyText: "Arrive 10 minutes before check-in.",
        highlightList: ["Quiet route", "Ambient sound cues"],
        sessions: [
          {
            startsAt: "2026-06-10T11:00:00.000Z",
            endsAt: "2026-06-10T12:15:00.000Z",
            capacity: 18,
            waitlistCapacity: 6,
            vibe: "Quiet walkthrough",
          },
        ],
      })
      .expect(200);

    const blockedPublish = await request(app.getHttpServer())
      .post(`/api/exhibitions/${exhibitionId}/publish`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(blockedPublish.body.message).toBe("Exhibition is not ready to publish.");
    expect(blockedPublish.body.code).toBe("EXHIBITION_NOT_READY");

    const savedSchema = await request(app.getHttpServer())
      .put(`/api/form-schemas/${exhibitionId}/editor`)
      .set("Authorization", `Bearer ${token}`)
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
          {
            id: "session-mood",
            label: "Preferred route",
            type: "SELECT",
            placeholder: "Choose one",
            isRequired: false,
            options: ["Quiet", "Interactive"],
            helpText: "Helps staff pace the session.",
            order: 2,
          },
        ],
      })
      .expect(200);

    expect(savedSchema.body.validation.isValid).toBe(true);

    const published = await request(app.getHttpServer())
      .post(`/api/exhibitions/${exhibitionId}/publish`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(published.body).toEqual(
      expect.objectContaining({
        exhibitionId,
        status: "PUBLISHED",
      })
    );
    expect(published.body.checklist.canPublish).toBe(true);
    expect(published.body.sessions).toEqual(expect.arrayContaining([expect.objectContaining({ registrationState: "open" })]));
  });
});