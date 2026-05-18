# Arthera Mobile Final Project

## What This Is

Arthera is a mobile app for two roles: Visitors and Organizers. Visitors discover exhibitions, register for events, leave post-visit feedback, and collect a digital gallery passport. Organizers publish exhibitions, configure lightweight registration forms, and review attendee submissions from a mobile-first workflow.

## Core Value

A single mobile experience where visitors discover and collect gallery moments, while organizers launch exhibitions with minimal friction.

## Latest Milestone Output

v1.3 completed the full Pencil-first design lock and is now archived as the stable UI handoff baseline:

- finalized the canonical Pen screen set for all implemented Visitor and Organizer routes
- separated visual reference boards from v1.5 production authority boards
- locked the auth contract to support email/password plus Google OAuth
- published node-level handoff references for downstream schema and code work

v1.4 is now planned as the build milestone that translates that locked contract into executable Prisma, Nest, and Expo work without reopening the screen definition.

## Current Position

- **Latest completed milestone**: v1.3 Full High-Fidelity Pencil UI Lock
- **Active milestone**: v1.4 End-to-End Contract Alignment and Delivery
- **Execution mode used**: planning-first implementation with screen-by-screen DB -> BE -> FE ownership
- **Execution stack authority**: `.planning/STACK.md` locks the cross-cutting libraries for auth, query, form validation, persistence, scheduling, and smoke testing.
- **Latest audit snapshot**: `.planning/v1.4-PULL-AUDIT.md` records the 2026-05-18 post-pull state: frontend shells expanded, but route-critical data and service execution remain unimplemented.
- **Immediate goal**: execute the schema/auth foundation, then parallelize visitor and organizer slices against the locked v1.5 boards

## Requirements

### Validated for Planning

- [x] Full Visitor flow is defined from login to post-visit engagement.
- [x] Full Organizer flow is defined from dashboard to attendance handling.
- [x] Screen states are mapped for loading, empty, validation, success, and failure.
- [x] Mobile/API implementation can resume from a stable planning baseline.
- [x] High-fidelity Pencil source covers every implemented mobile route one-to-one.
- [x] All 13 mobile screens are assigned to explicit execution phases and plans.
- [x] DB, Nest module, and Expo ownership is defined for every locked workflow transition.

### Active for Implementation

- [ ] Visitors and organizers can authenticate and keep sessions.
- [ ] Visitors can browse, filter, and inspect galleries (past, present, future).
- [ ] Visitors can register to events, rate, and comment after participation.
- [ ] Visitors receive and track digital stamps in a passport vault.
- [ ] Organizers can submit exhibition registrations with media and logistics.
- [ ] Organizers can configure dynamic registration forms.
- [ ] Organizers can review submissions and confirm attendance.

### Out of Scope

- Web dashboard for organizers - mobile-first scope for this milestone.
- Full payment workflow - not required for this graduation iteration.
- Multi-language localization - deferred to future milestone.
- Advanced attendance verification such as QR/NFC - deferred for feasibility.

## Context

- `project.pen` now contains canonical route coverage, archived reference boards, and v1.5 production authority boards for downstream implementation.
- Mobile implementation uses Expo React Native + Expo Go for fast iteration.
- Backend uses NestJS + Prisma, with Neon as PostgreSQL provider.
- `.planning/STACK.md` now freezes the support stack for v1.4: TanStack Query, Zustand, Expo Secure Store, Expo AuthSession, React Hook Form, Zod, date-fns, Nest auth/validation/config packages, and the milestone test stack.
- Deploy target for backend is Koyeb (fallback: Render).
- CI/CD baseline already runs lint/test/build checks for both mobile and API.
- Current Expo routes still depend on `apps/mobile/src/data/mockData.ts` for route-critical state.
- Current Nest modules are placeholder controllers/services and do not yet satisfy the v1.5 workflow contract.
- 2026-05-18 pull audit confirms that most screens now have FE shells, but this does not yet count as completed v1.4 delivery because DB, shared contracts, and service modules are still missing.

## Constraints

- **Timeline**: Semester final project delivery - prioritize demonstrable end-to-end flows over platform complexity.
- **Tech Stack**: Expo React Native + NestJS + Prisma + Neon remain the platform base; the execution-level support stack is now frozen in `.planning/STACK.md`.
- **Deployment**: Start with low-cost/free platform constraints (Koyeb/Render tiers).
- **Scope Control**: Keep organizer media URL/metadata-first and avoid Redis queues, push delivery, or cloud upload infrastructure in v1.4.
- **UX Direction**: Keep flows simple, obvious, and mobile-first while preserving the established vibrant art direction.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use monorepo with `apps/mobile` and `apps/api` | Keeps frontend/backend aligned during fast iteration | Complete |
| Keep v1 as mobile-first without admin web | Aligns with limited timeline and grading scope | Complete |
| Model both visitor and organizer roles from day one | Core flows require role-specific paths | Complete |
| Use planning-first milestone before further implementation | Reduced rework and clarified full delivery scope | Complete |
| Use the 5 sample screens as the visual source for v1.2 | Maintains continuity with the approved design direction | Complete |
| Gate comments, ratings, and stamps by participation or attendance | Preserves simple but coherent domain rules | Complete |
| Freeze design in Pencil before reviewing or extending the current UI code | Current code should be judged against finalized flows, not partial design references | Complete |
| Plan v1.4 by screen and by DB -> BE -> FE ownership | Avoids another planning rewrite once implementation starts | Complete |
| Lock the support libraries before execution | Prevents phase-by-phase drift between query, auth, validation, persistence, and testing patterns | Complete |

## 2026-05-18 Pull Audit

- Buildability was restored after the latest pull through compatibility fixes in mobile types and shared API contracts.
- Current FE work is ahead of backend execution: nearly all planned screens have UI shells, but route-critical state is still mocked from `apps/mobile/src/data/mockData.ts`.
- Current API services remain placeholder, seeded, or in-memory; no v1.4 phase can be marked complete from the pulled code alone.
- The correct next execution step remains Phase 1 Plan 01, not a roadmap rewrite.

---
*Last updated: 2026-05-18 after post-pull audit and build repair*
