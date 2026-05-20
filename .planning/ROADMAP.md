# Roadmap: Arthera Mobile Final Project

## Milestones

- ✅ **v1.0 Mobile Project Initialization** - Shipped 2026-03-31 ([archive](milestones/v1.0-ROADMAP.md))
- ✅ **v1.1 Detailed Planning and Wireframe Reference** - Completed 2026-05-04 ([archive](milestones/v1.1-ROADMAP.md))
- ✅ **v1.2 Full Mobile UI Implementation and Validation** - Completed 2026-05-04 ([archive](milestones/v1.2-ROADMAP.md))
- ✅ **v1.3 Full High-Fidelity Pencil UI Lock** - Completed 2026-05-12 ([archive](milestones/v1.3-ROADMAP.md))
- ✅ **v1.4 End-to-End Contract Alignment and Delivery** - Completed 2026-05-20

## Phases

### ✅ v1.4 End-to-End Contract Alignment and Delivery

**Milestone Goal:** Turn the locked v1.5 Pencil contract into executable Prisma, Nest, and Expo work for all 13 screens without reopening screen planning.

**2026-05-18 Audit Snapshot:** The latest pull expanded the FE shell surface across most screens, but route-critical data is still mocked from `apps/mobile/src/data/mockData.ts` and backend services remain placeholder or in-memory. Treat this as UI acceleration, not completed phase execution. See `.planning/v1.4-PULL-AUDIT.md`.

**Locked Execution Stack:**
- Mobile data: `@tanstack/react-query` + typed `fetch` client wrappers.
- Mobile session/auth: `zustand` + `expo-secure-store` + `expo-auth-session`/`expo-web-browser`.
- Mobile forms/date: `react-hook-form` + `zod` + `@hookform/resolvers` + `date-fns`.
- API auth/config/validation: `@nestjs/config`, `class-validator`, `class-transformer`, `@nestjs/jwt`, Passport strategies, and `bcrypt`.
- Scheduling/verification: `@nestjs/schedule`, Prisma seed, Jest + Supertest, `jest-expo`, and React Native Testing Library.
- Explicitly deferred: Axios, RTK Query, BullMQ/Redis, push delivery, and full cloud upload infrastructure.

- [x] **Phase 1: Domain Schema, Auth, and Shared Contracts** - Replace the MVP data model and auth stubs with the V2 workflow graph, typed contracts, and shared mobile primitives.
- [x] **Phase 2: Visitor Discovery, Registration, and Profile** - Deliver the read and reservation flows for Discover, Exhibition Detail, Event Registration, and Visitor Profile against real backend contracts.
- [x] **Phase 3: Organizer Publication and Queue Operations** - Deliver the Dashboard, Exhibition Editor, Form Builder, Submission Pipeline, Submission Review, and Organizer Profile flows against the new workflow model.
- [x] **Phase 4: Review, Stamp, and End-to-End Hardening** - Deliver Review Hub, Stamp Vault, and the cross-flow hardening needed to verify all 13 screens end-to-end.

## Phase Details

### Phase 1: Domain Schema, Auth, and Shared Contracts
**Goal**: Establish the shared domain, enums, auth/session flow, and UI primitives that every later screen depends on.
**Depends on**: Archived v1.3 production boards, current stub schema, and current auth shortcut.
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, INFRA-02]
**Screen Coverage**: 1 Auth, plus shared navigation/state primitives consumed by screens 2-13.
**Execution Stack Focus**: `@nestjs/config`, `class-validator`, `class-transformer`, JWT/Passport/Google auth, TanStack Query, Zustand, Expo Secure Store, Expo AuthSession, React Hook Form, and Zod.
**Success Criteria** (what must be TRUE):
	1. The database can represent auth providers, profiles, venues, exhibitions, sessions, registrations, answers, reviews, attendance, stamps, and notification settings without JSON-only shortcuts.
	2. Local auth and Google auth return the same workspace bootstrap contract with a persisted active role.
	3. Expo navigation uses real session state and shared status/error/sticky-action primitives instead of mock-only role switching.
**Plans**: 2 plans

Plans:
- [x] 01-01: Replace the MVP schema and shared contracts with the V2 workflow entity model.
- [x] 01-02: Implement auth/workspace bootstrap and shared mobile primitives for the locked access flow.

### Phase 2: Visitor Discovery, Registration, and Profile
**Goal**: Deliver the visitor browse and reservation path using the new exhibition-first domain.
**Depends on**: Phase 1
**Requirements**: [GALL-01, GALL-02, GALL-03, GALL-04, AUTH-03]
**Screen Coverage**: 2 Discover, 3 Exhibition Detail, 4 Event Registration, 7 Visitor Profile.
**Execution Stack Focus**: TanStack Query for list/detail/profile state, React Hook Form + Zod for booking/profile validation, and `date-fns` for timeline and availability formatting.
**Success Criteria** (what must be TRUE):
	1. Discover and Detail read from exhibition/session/venue contracts with availability and filter logic that match the v1.5 board.
	2. Event Registration persists answers row-by-row, supports duplicate-booking and waitlist fallbacks, and surfaces confirmation before submit.
	3. Visitor Profile shows upcoming visits, past activity, preferences, accessibility notes, and role switching from real backend data.
**Plans**: 2 plans

Plans:
- [x] 02-01: Deliver the Discover and Exhibition Detail read path with real filters, availability, and venue data.
- [x] 02-02: Deliver Event Registration and Visitor Profile against real session, registration, and preference contracts.

### Phase 3: Organizer Publication and Queue Operations
**Goal**: Deliver the organizer authoring and operational queue path from dashboard to decision handling.
**Depends on**: Phase 1
**Requirements**: [ORG-01, ORG-02, ORG-03, AUTH-03]
**Screen Coverage**: 8 Organizer Dashboard, 9 Exhibition Editor, 10 Form Builder, 11 Submission Pipeline, 12 Submission Review, 13 Organizer Profile.
**Execution Stack Focus**: TanStack Query for queue/dashboard state, React Hook Form + Zod for editor sections, URL-first media metadata, and `@nestjs/schedule`-compatible notification rules.
**Success Criteria** (what must be TRUE):
	1. Organizers can create, edit, publish, and lock exhibitions using session, venue, media, and checklist data that matches the v1.5 contract.
	2. Queue counts, approval decisions, waitlist state, and check-in flows all derive from the same registration model used by visitor booking.
	3. Dashboard and Organizer Profile surface real KPI, queue, notification, and workspace settings instead of static copy.
**Plans**: 3 plans

Plans:
- [x] 03-01: Deliver dashboard aggregates and organizer profile settings/notifications.
- [x] 03-02: Deliver the Exhibition Editor and Form Builder authoring stack.
- [x] 03-03: Deliver Submission Pipeline and Submission Review with decision and attendance actions.

### Phase 4: Review, Stamp, and End-to-End Hardening
**Goal**: Finish the post-attendance loop and harden the entire app so all locked states are implementable and verifiable.
**Depends on**: Phase 2, Phase 3
**Requirements**: [COMM-01, COMM-02, PASS-01, PASS-02, INFRA-03]
**Screen Coverage**: 5 Review Hub, 6 Stamp Vault, plus shared hardening across all 13 screens.
**Execution Stack Focus**: Prisma seed, Jest + Supertest, `jest-expo`, React Native Testing Library, and deterministic validation for any schedule-driven logic that lands.
**Success Criteria** (what must be TRUE):
	1. Review Hub only unlocks after attendance, supports moderation states, and updates community visibility.
	2. Stamp Vault reflects unlock progress and milestone history from the same attendance/review events driving the backend.
	3. The app no longer depends on in-screen mock data for route-critical behavior, and the repo has executable smoke validation for the full surface.
**Plans**: 2 plans

Plans:
- [x] 04-01: Deliver Review Hub and Stamp Vault from attendance-gated review and stamp services.
- [x] 04-02: Remove remaining mock-only paths and add end-to-end smoke validation for all 13 screens.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Domain Schema, Auth, and Shared Contracts | 2/2 | Completed | 2026-05-18 |
| 2. Visitor Discovery, Registration, and Profile | 2/2 | Completed | 2026-05-20 |
| 3. Organizer Publication and Queue Operations | 3/3 | Completed | 2026-05-20 |
| 4. Review, Stamp, and End-to-End Hardening | 2/2 | Completed | 2026-05-20 |
