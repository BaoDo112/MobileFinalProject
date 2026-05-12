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

The next step is no longer UI discovery. It is implementation alignment: Prisma schema v2, Nest module planning, and Expo screen updates against the archived v1.3 contract.

## Current Position

- **Latest completed milestone**: v1.3 Full High-Fidelity Pencil UI Lock
- **Active milestone**: none
- **Execution mode used**: autonomous design-first closure before code review resumes
- **Immediate goal**: start the next milestone for schema, API, and Expo alignment from the archived v1.3 contract

## Requirements

### Validated for Planning

- [x] Full Visitor flow is defined from login to post-visit engagement.
- [x] Full Organizer flow is defined from dashboard to attendance handling.
- [x] Screen states are mapped for loading, empty, validation, success, and failure.
- [x] Mobile/API implementation can resume from a stable planning baseline.
- [x] High-fidelity Pencil source covers every implemented mobile route one-to-one.

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
- Deploy target for backend is Koyeb (fallback: Render).
- CI/CD baseline already runs lint/test/build checks for both mobile and API.

## Constraints

- **Timeline**: Semester final project delivery - prioritize demonstrable end-to-end flows over platform complexity.
- **Tech Stack**: Expo React Native + NestJS + Prisma + Neon are fixed for this project.
- **Deployment**: Start with low-cost/free platform constraints (Koyeb/Render tiers).
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

---
*Last updated: 2026-05-12 after archiving the v1.3 design-lock milestone*
