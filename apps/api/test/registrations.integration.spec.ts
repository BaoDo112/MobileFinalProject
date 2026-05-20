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
});