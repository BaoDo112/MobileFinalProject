# Stack: Arthera Mobile Final Project

**Locked:** 2026-05-12
**Scope:** v1.4 End-to-End Contract Alignment and Delivery

## Why This Exists

Lock the cross-cutting runtime and verification stack before execution starts so feature plans do not drift into different data-fetching, auth, validation, or testing patterns.

Freeze only the shared execution stack. Feature-local helpers can stay flexible if they do not replace a locked concern.

## Core Platforms

- Monorepo: `pnpm` workspace
- Mobile: Expo 53, React Native 0.79, React 19, React Navigation 7
- API: NestJS 11, Prisma 6, PostgreSQL on Neon
- Contract authority: `project.pen` v1.5 production boards

## Locked Cross-Cutting Stack

### Mobile data, auth, and state

- `@tanstack/react-query` for server state, caching, invalidation, retry, and mutation status
- Typed `fetch` wrappers inside `apps/mobile/src/api/*.ts`; do not add Axios for v1.4
- `zustand` for persisted session, active role, and small workspace-level client state
- `expo-secure-store` for access token, refresh token, and active-role persistence
- `expo-auth-session` + `expo-web-browser` for Google OAuth continuation in Expo

### Mobile forms and formatting

- `react-hook-form` + `zod` + `@hookform/resolvers` for auth, preferences, editor sections, and registration validation
- Dynamic attendee forms still render from backend field definitions; do not replace that contract with hard-coded local schemas
- `date-fns` for timeline, session, and availability formatting

### API foundation

- `@nestjs/config` for configuration loading and environment validation entry
- `class-validator` + `class-transformer` for DTO validation and request shaping
- `@nestjs/jwt` + `@nestjs/passport` + `passport` + `passport-jwt` + `passport-google-oauth20` + `bcrypt` for local and Google auth
- `@nestjs/schedule` for reminder jobs or status reconciliation if a locked workflow needs time-based execution
- Prisma Migrate + Prisma Seed for schema evolution and deterministic workflow fixtures

### Verification stack

- API: Jest + Supertest
- Mobile: `jest-expo` + `@testing-library/react-native` + `@testing-library/jest-native`
- Root `pnpm lint`, `pnpm build`, and `pnpm test` must become trustworthy milestone gates in Phase 4

## Explicit Non-Goals for v1.4

- Axios, RTK Query, or Redux Toolkit as parallel state stacks
- BullMQ, Redis, or multi-service queue orchestration
- GraphQL or WebSocket transport layers
- Full binary media upload pipeline to Cloudinary, S3, or similar
- Push notification delivery infrastructure
- Cross-service event buses beyond the Nest app itself

## Implementation Rules

- Mobile server data must flow through TanStack Query hooks in `apps/mobile/src/query/`.
- Session and workspace state must live in Zustand and persist through Expo Secure Store.
- Google OAuth must use Expo AuthSession/WebBrowser on mobile and Passport Google strategy on Nest.
- Screen-level forms use React Hook Form + Zod; dynamic attendee fields map backend validation rules into the form renderer instead of inventing a second schema system.
- Organizer media in v1.4 stays URL and metadata first. Do not add cloud upload infrastructure unless the roadmap is reopened.
- Time-based reminder or status-reconciliation logic uses `@nestjs/schedule` only. Do not introduce Redis-backed queues in this milestone.

## Phase Mapping

- Phase 1 installs and wires the auth, config, query, store, validation, and secure-session stack.
- Phase 2 applies the query, form, and date stack to visitor discovery, booking, and profile flows.
- Phase 3 applies the same stack to organizer dashboard, authoring, queue, and notification-rule surfaces.
- Phase 4 adds deterministic seed data, smoke tests, and any schedule-related validation required by the locked workflows.

---
*Last updated: 2026-05-12 after locking the v1.4 execution stack*