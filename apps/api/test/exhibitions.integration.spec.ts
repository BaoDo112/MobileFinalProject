import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

const request = require("supertest");

import { AppModule } from "../src/app.module";

describe("Phase 2 exhibition discover integration", () => {
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

  it("lists discover exhibitions with timeline and capacity context", async () => {
    const response = await request(app.getHttpServer()).get("/api/exhibitions").expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "g-01",
          timelineStatus: "PRESENT",
          registrationState: "open",
        }),
        expect.objectContaining({
          id: "g-02",
          timelineStatus: "FUTURE",
          registrationState: "waitlist",
        }),
      ])
    );

    const futureOnly = await request(app.getHttpServer()).get("/api/exhibitions").query({ timeline: "future" }).expect(200);
    expect(futureOnly.body).toHaveLength(1);
    expect(futureOnly.body[0]).toEqual(
      expect.objectContaining({
        id: "g-02",
        registrationState: "waitlist",
      })
    );

    const districtOnly = await request(app.getHttpServer()).get("/api/exhibitions").query({ district: "District 1" }).expect(200);
    expect(districtOnly.body).toHaveLength(1);
    expect(districtOnly.body[0].id).toBe("g-01");
  });

  it("returns exhibition detail with venue, session availability, and review preview", async () => {
    const response = await request(app.getHttpServer()).get("/api/exhibitions/g-01").expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        exhibition: expect.objectContaining({
          id: "g-01",
          registrationState: "open",
          capacityBadge: expect.any(String),
        }),
        venue: expect.objectContaining({
          id: "v-01",
          district: "District 1",
        }),
        sessions: expect.arrayContaining([
          expect.objectContaining({
            sessionId: "s-01-2",
            registrationState: "open",
          }),
        ]),
        reviewPreview: expect.arrayContaining([
          expect.objectContaining({
            id: "r-01",
            authorName: "Bao Nguyen",
          }),
        ]),
      })
    );
  });

  it("keeps legacy gallery endpoints as thin adapters over the discover model", async () => {
    const response = await request(app.getHttpServer()).get("/api/galleries").query({ status: "present" }).expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: "g-01",
        status: "PRESENT",
      }),
    ]);

    const detail = await request(app.getHttpServer()).get("/api/galleries/g-02").expect(200);
    expect(detail.body).toEqual(
      expect.objectContaining({
        id: "g-02",
        status: "FUTURE",
      })
    );
  });
});