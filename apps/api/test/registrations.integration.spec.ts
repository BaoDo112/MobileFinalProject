import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

const request = require("supertest");

import { AppModule } from "../src/app.module";

jest.setTimeout(30_000);

describe("Phase 2 registration integration", () => {
  let app: INestApplication;
  let token: string;
  let organizerToken: string;

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
        email: "phase2.visitor@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "VISITOR",
        name: "Phase Two Visitor",
      })
      .expect(201);

    token = authResponse.body.token;

    const organizerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "phase3.organizer@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "ORGANIZER",
        name: "Phase Three Organizer",
      })
      .expect(201);

    organizerToken = organizerResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns registration draft data and session availability for an exhibition", async () => {
    const sessions = await request(app.getHttpServer()).get("/api/sessions").query({ exhibitionId: "g-01" }).expect(200);
    expect(sessions.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sessionId: "s-01-2",
          registrationState: "open",
        }),
      ])
    );

    const draft = await request(app.getHttpServer()).get("/api/registrations/draft").query({ exhibitionId: "g-01", sessionId: "s-01-2" }).expect(200);
    expect(draft.body).toEqual(
      expect.objectContaining({
        exhibitionId: "g-01",
        sessionId: "s-01-2",
        formSchemaVersionId: "fs-g-01-v1",
      })
    );
    expect(draft.body.fields).toEqual(expect.arrayContaining([expect.objectContaining({ id: "full-name", isRequired: true })]));
  });

  it("submits confirmed and duplicate-blocked registrations", async () => {
    const confirmed = await request(app.getHttpServer())
      .post("/api/registrations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sessionId: "s-01-2",
        formSchemaVersionId: "fs-g-01-v1",
        note: "Please keep the quiet route if possible.",
        answers: [
          { formFieldId: "full-name", value: "Phase Two Visitor" },
          { formFieldId: "email", value: "phase2.visitor@example.com" },
          { formFieldId: "phone", value: "0900000000" },
          { formFieldId: "comfort-mode", value: "Quiet walkthrough" },
        ],
      })
      .expect(201);

    expect(confirmed.body).toEqual(expect.objectContaining({ status: "CONFIRMED" }));

    const duplicate = await request(app.getHttpServer())
      .post("/api/registrations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sessionId: "s-01-2",
        answers: [{ formFieldId: "full-name", value: "Phase Two Visitor" }],
      })
      .expect(400);

    expect(duplicate.body.message).toBe("You already have a booking for this session.");
    expect(duplicate.body.code).toBe("DUPLICATE_REGISTRATION");
  });

  it("submits waitlist registrations and exposes visitor workspace history", async () => {
    const waitlist = await request(app.getHttpServer())
      .post("/api/registrations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sessionId: "s-02-1",
        formSchemaVersionId: "fs-g-02-v1",
        answers: [
          { formFieldId: "full-name", value: "Phase Two Visitor" },
          { formFieldId: "email", value: "phase2.visitor@example.com" },
        ],
      })
      .expect(201);

    expect(waitlist.body).toEqual(expect.objectContaining({ status: "WAITLISTED", waitlistPosition: 1 }));

    const visits = await request(app.getHttpServer())
      .get("/api/registrations/me/visits")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(visits.body).toHaveLength(2);

    const workspace = await request(app.getHttpServer())
      .get("/api/users/me/visitor-profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(workspace.body).toEqual(
      expect.objectContaining({
        activeRole: "VISITOR",
        upcomingVisits: expect.arrayContaining([
          expect.objectContaining({ status: "CONFIRMED" }),
          expect.objectContaining({ status: "WAITLISTED" }),
        ]),
      })
    );
  });

  it("exposes organizer queue boards and review detail", async () => {
    const pipeline = await request(app.getHttpServer())
      .get("/api/registrations/organizer/pipeline")
      .set("Authorization", `Bearer ${organizerToken}`)
      .expect(200);

    expect(pipeline.body).toEqual(
      expect.objectContaining({
        urgentQueueCount: expect.any(Number),
        statusCounts: expect.objectContaining({
          pending: expect.any(Number),
          confirmed: expect.any(Number),
          waitlisted: expect.any(Number),
        }),
      })
    );
    expect(pipeline.body.boards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          exhibitionId: "g-01",
          statusCounts: expect.objectContaining({
            pending: 1,
            confirmed: 2,
            checkedIn: 1,
          }),
          sessionWorkload: expect.arrayContaining([
            expect.objectContaining({
              sessionId: "s-01-2",
              confirmedCount: 2,
              pendingCount: 1,
            }),
          ]),
        }),
        expect.objectContaining({
          exhibitionId: "g-02",
          statusCounts: expect.objectContaining({
            waitlisted: 2,
          }),
          waitlistSummary: expect.arrayContaining([
            expect.objectContaining({
              sessionId: "s-02-1",
              waitlistedCount: 1,
            }),
          ]),
        }),
      ])
    );

    const review = await request(app.getHttpServer())
      .get("/api/registrations/organizer/review")
      .set("Authorization", `Bearer ${organizerToken}`)
      .query({ exhibitionId: "g-01", registrationId: "seed-reg-03" })
      .expect(200);

    expect(review.body).toEqual(
      expect.objectContaining({
        exhibitionId: "g-01",
        selectedSubmission: expect.objectContaining({
          registrationId: "seed-reg-03",
          status: "PENDING",
          availableActions: expect.arrayContaining(["APPROVE", "WAITLIST", "REJECT"]),
        }),
      })
    );
  });

  it("keeps archive review available even when the schema is not fully valid", async () => {
    const review = await request(app.getHttpServer())
      .get("/api/registrations/organizer/review")
      .set("Authorization", `Bearer ${organizerToken}`)
      .query({ exhibitionId: "g-03" })
      .expect(200);

    expect(review.body).toEqual(
      expect.objectContaining({
        exhibitionId: "g-03",
        selectedSubmission: expect.objectContaining({
          registrationId: "seed-reg-05",
          status: "REJECTED",
          availableActions: expect.arrayContaining(["APPROVE", "WAITLIST"]),
        }),
      })
    );
  });

  it("supports organizer approve, waitlist, reject, and check-in actions", async () => {
    const approved = await request(app.getHttpServer())
      .patch("/api/registrations/seed-reg-03/decision")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ action: "APPROVE" })
      .expect(200);

    expect(approved.body.selectedSubmission).toEqual(
      expect.objectContaining({
        registrationId: "seed-reg-03",
        status: "CONFIRMED",
        availableActions: expect.arrayContaining(["CHECK_IN", "WAITLIST", "REJECT"]),
      })
    );

    const waitlisted = await request(app.getHttpServer())
      .patch("/api/registrations/seed-reg-02/decision")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ action: "WAITLIST" })
      .expect(200);

    expect(waitlisted.body.selectedSubmission).toEqual(
      expect.objectContaining({
        registrationId: "seed-reg-02",
        status: "WAITLISTED",
      })
    );

    const rejected = await request(app.getHttpServer())
      .patch("/api/registrations/seed-reg-04/decision")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ action: "REJECT" })
      .expect(200);

    expect(rejected.body.selectedSubmission).toEqual(
      expect.objectContaining({
        registrationId: "seed-reg-04",
        status: "REJECTED",
      })
    );

    const checkedIn = await request(app.getHttpServer())
      .patch("/api/registrations/seed-reg-03/decision")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ action: "CHECK_IN" })
      .expect(200);

    expect(checkedIn.body.selectedSubmission).toEqual(
      expect.objectContaining({
        registrationId: "seed-reg-03",
        status: "CHECKED_IN",
        stampNotice: expect.stringContaining("Attendance recorded"),
      })
    );
  });

  it("lets organizers publish a new venue-backed exhibition that visitors can discover and book", async () => {
    const venue = await request(app.getHttpServer())
      .post("/api/venues")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "Riverfront Media Hall",
        district: "District 7",
        address: "12 Ton Dat Tien, District 7, Ho Chi Minh City",
        city: "Ho Chi Minh City",
        latitude: 10.7294,
        longitude: 106.7218,
      })
      .expect(201);

    const draft = await request(app.getHttpServer())
      .post("/api/exhibitions/drafts")
      .set("Authorization", `Bearer ${organizerToken}`)
      .expect(201);

    const exhibitionId = draft.body.exhibitionId;

    const savedDraft = await request(app.getHttpServer())
      .patch(`/api/exhibitions/${exhibitionId}/editor`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "River Signals",
        exhibitionType: "Digital Art",
        bio: "A projection-led riverfront exhibition with timed small-group entries.",
        venueId: venue.body.id,
        mediaUrls: ["https://example.invalid/river-signals/poster.jpg"],
        curatorNote: "Open the river route five minutes before the main slot.",
        policyText: "Arrive 10 minutes early for headset pickup.",
        highlightList: ["Projection wall", "Sound cue route"],
        sessions: [
          {
            startsAt: "2026-06-12T11:00:00.000Z",
            endsAt: "2026-06-12T12:15:00.000Z",
            capacity: 18,
            waitlistCapacity: 6,
            vibe: "Quiet guided route",
          },
        ],
      })
      .expect(200);

    expect(savedDraft.body.availableVenues).toEqual(expect.arrayContaining([expect.objectContaining({ id: venue.body.id })]));

    const hiddenFromDiscover = await request(app.getHttpServer()).get("/api/exhibitions").expect(200);
    expect(hiddenFromDiscover.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: exhibitionId })]));

    await request(app.getHttpServer())
      .put(`/api/form-schemas/${exhibitionId}/editor`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        consentTitle: "Confirm your riverfront session",
        consentCopy: "Used for check-in and session pacing.",
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
            id: "email",
            label: "Email",
            type: "EMAIL",
            placeholder: "name@example.com",
            isRequired: true,
            options: [],
            helpText: "Used for confirmation updates.",
            order: 2,
          },
        ],
      })
      .expect(200);

    const published = await request(app.getHttpServer())
      .post(`/api/exhibitions/${exhibitionId}/publish`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .expect(201);

    expect(published.body).toEqual(expect.objectContaining({ exhibitionId, status: "PUBLISHED" }));

    const discover = await request(app.getHttpServer()).get("/api/exhibitions").expect(200);
    expect(discover.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: exhibitionId,
          title: "River Signals",
          venueTitle: "Riverfront Media Hall",
          latitude: 10.7294,
          longitude: 106.7218,
        }),
      ])
    );

    const sessions = await request(app.getHttpServer()).get("/api/sessions").query({ exhibitionId }).expect(200);
    const sessionId = sessions.body[0].sessionId;

    const registrationDraft = await request(app.getHttpServer())
      .get("/api/registrations/draft")
      .query({ exhibitionId, sessionId })
      .expect(200);

    const registration = await request(app.getHttpServer())
      .post("/api/registrations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sessionId,
        formSchemaVersionId: registrationDraft.body.formSchemaVersionId,
        answers: [
          { formFieldId: "full-name", value: "Phase Two Visitor" },
          { formFieldId: "email", value: "phase2.visitor@example.com" },
        ],
      })
      .expect(201);

    expect(registration.body).toEqual(expect.objectContaining({ status: "CONFIRMED" }));
  });
});