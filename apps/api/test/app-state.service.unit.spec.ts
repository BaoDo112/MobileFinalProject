import { AppStateService } from "../src/persistence/app-state.service";
import type { PrismaService } from "../src/persistence/prisma.service";

function createPrisma(overrides?: Readonly<Record<string, unknown>>) {
  return {
    runtimeState: {
      findUnique: async () => null,
      create: async () => undefined,
      upsert: async () => undefined,
      ...overrides,
    } as any,
  } as unknown as PrismaService;
}

describe("AppStateService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ARTHERA_PERSISTENCE_DRIVER: "prisma",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("falls back to memory mode when Prisma is unavailable during bootstrap", async () => {
    const prismaError = Object.assign(new Error("Can't reach database server."), { code: "P1001" });
    const service = new AppStateService(
      createPrisma({
        findUnique: jest.fn().mockRejectedValue(prismaError),
      })
    );

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(service.getState().exhibitions.records.length).toBeGreaterThan(0);
  });

  it("keeps user-facing mutations alive when Prisma becomes unavailable during persist", async () => {
    const prismaError = Object.assign(new Error("Can't reach database server."), { code: "P1001" });
    const upsert = jest.fn().mockRejectedValue(prismaError);
    const service = new AppStateService(createPrisma({ upsert }));

    await expect(service.persist()).resolves.toBeUndefined();
    await expect(service.persist()).resolves.toBeUndefined();

    expect(upsert).toHaveBeenCalledTimes(1);
  });
});