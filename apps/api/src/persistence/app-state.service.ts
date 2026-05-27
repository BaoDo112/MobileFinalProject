import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "./prisma.service";
import type { PersistedAppState } from "./app-state.types";
import { buildRuntimeSeed } from "./runtime-seed";

const APP_STATE_KEY = "app-state";

function pickArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function pickObject<T>(value: unknown, fallback: T): T {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : fallback;
}

@Injectable()
export class AppStateService implements OnModuleInit {
  private readonly logger = new Logger(AppStateService.name);
  private state: PersistedAppState = buildRuntimeSeed(new Date());
  private readonly usePrisma: boolean;
  private prismaHealthy = true;
  private persistChain: Promise<void> = Promise.resolve();

  constructor(private readonly prisma: PrismaService) {
    const driver = process.env.ARTHERA_PERSISTENCE_DRIVER?.trim().toLowerCase();
    this.usePrisma = driver === "prisma" || (driver !== "memory" && Boolean(process.env.DATABASE_URL) && process.env.NODE_ENV !== "test");
  }

  async onModuleInit() {
    if (!this.usePrisma) {
      return;
    }

    try {
      const existing = await this.prisma.runtimeState.findUnique({
        where: { key: APP_STATE_KEY },
      });

      if (!existing) {
        this.state = buildRuntimeSeed(new Date());
        await this.prisma.runtimeState.create({
          data: {
            key: APP_STATE_KEY,
            value: this.serializeState(this.state),
          },
        });
        return;
      }

      this.state = this.normalizeState(existing.value);
    } catch (error) {
      if (this.shouldFallbackToMemory(error)) {
        this.markPrismaUnavailable("bootstrap runtime state", error);
        return;
      }

      throw error;
    }
  }

  getState(): PersistedAppState {
    return this.state;
  }

  async persist() {
    this.state.updatedAt = new Date().toISOString();

    if (!this.usePrisma || !this.prismaHealthy) {
      return;
    }

    this.persistChain = this.persistChain.then(async () => {
      try {
        await this.prisma.runtimeState.upsert({
          where: { key: APP_STATE_KEY },
          update: { value: this.serializeState(this.state) },
          create: {
            key: APP_STATE_KEY,
            value: this.serializeState(this.state),
          },
        });
      } catch (error) {
        if (this.shouldFallbackToMemory(error)) {
          this.markPrismaUnavailable("persist runtime state", error);
          return;
        }

        throw error;
      }
    });

    await this.persistChain;
  }

  private shouldFallbackToMemory(error: unknown) {
    const code = this.getErrorCode(error) ?? "";

    if (code === "P1001" || code === "P1002" || code === "P1017") {
      return true;
    }

    const message = this.getErrorMessage(error) ?? "";
    return /can't reach database server|timed out|server has closed the connection/i.test(message);
  }

  private markPrismaUnavailable(action: string, error: unknown) {
    if (this.prismaHealthy) {
      const detail = this.getErrorMessage(error) ?? "Unknown Prisma error.";
      this.logger.warn(`Prisma persistence unavailable while attempting to ${action}; continuing in memory. ${detail}`);
    }

    this.prismaHealthy = false;
  }

  private getErrorCode(error: unknown) {
    if (!error || typeof error !== "object" || !("code" in error)) {
      return undefined;
    }

    const candidate = (error as { code?: unknown }).code;
    return typeof candidate === "string" ? candidate : undefined;
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (!error || typeof error !== "object" || !("message" in error)) {
      return undefined;
    }

    const candidate = (error as { message?: unknown }).message;
    return typeof candidate === "string" ? candidate : undefined;
  }

  private normalizeState(value: Prisma.JsonValue): PersistedAppState {
    const seeded = buildRuntimeSeed(new Date());
    const candidate = (value ?? {}) as Partial<PersistedAppState>;

    return {
      version: typeof candidate.version === "string" ? candidate.version : seeded.version,
      updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : seeded.updatedAt,
      auth: this.normalizeAuthState(candidate.auth, seeded.auth),
      exhibitions: this.normalizeExhibitionsState(candidate.exhibitions, seeded.exhibitions),
      formSchemas: this.normalizeFormSchemasState(candidate.formSchemas, seeded.formSchemas),
      registrations: {
        records: pickArray(candidate.registrations?.records, seeded.registrations.records),
      },
      reviews: {
        records: pickArray(candidate.reviews?.records, seeded.reviews.records),
      },
      stamps: {
        records: pickArray(candidate.stamps?.records, seeded.stamps.records),
      },
      comments: {
        records: pickArray(candidate.comments?.records, seeded.comments.records),
      },
    };
  }

  private serializeState(state: PersistedAppState): Prisma.InputJsonValue {
    return structuredClone(state) as unknown as Prisma.InputJsonValue;
  }

  private normalizeAuthState(candidate: Partial<PersistedAppState["auth"]> | undefined, seeded: PersistedAppState["auth"]) {
    return {
      users: pickArray(candidate?.users, seeded.users),
      accounts: pickArray(candidate?.accounts, seeded.accounts),
      visitorProfiles: pickArray(candidate?.visitorProfiles, seeded.visitorProfiles),
      organizerProfiles: pickArray(candidate?.organizerProfiles, seeded.organizerProfiles),
      preferences: pickArray(candidate?.preferences, seeded.preferences),
    };
  }

  private normalizeExhibitionsState(
    candidate: Partial<PersistedAppState["exhibitions"]> | undefined,
    seeded: PersistedAppState["exhibitions"]
  ) {
    return {
      records: pickArray(candidate?.records, seeded.records),
      venues: pickArray(candidate?.venues, seeded.venues),
      sessions: pickArray(candidate?.sessions, seeded.sessions),
      reviewRecords: pickArray(candidate?.reviewRecords, seeded.reviewRecords),
    };
  }

  private normalizeFormSchemasState(
    candidate: Partial<PersistedAppState["formSchemas"]> | undefined,
    seeded: PersistedAppState["formSchemas"]
  ) {
    return {
      versionsByExhibitionId: pickObject(candidate?.versionsByExhibitionId, seeded.versionsByExhibitionId),
    };
  }
}