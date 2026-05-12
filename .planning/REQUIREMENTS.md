# Requirements: Arthera Mobile Final Project

**Defined:** 2026-03-31
**Active milestone:** v1.4 End-to-End Contract Alignment and Delivery

## Current Note

v1.3 locked the UI contract in `project.pen`. v1.4 is the implementation milestone that must translate that same contract into executable Prisma schema, Nest modules, and Expo screens without reopening the route or screen definition.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can register or login with email and password.
- [ ] **AUTH-02**: User role (visitor or organizer) is persisted in authenticated session.
- [ ] **AUTH-03**: User can view profile information after login.
- [ ] **AUTH-04**: User can continue with Google OAuth from the same access flow.

### Gallery Discovery

- [ ] **GALL-01**: Visitor can view gallery list grouped by timeline status (past, present, future).
- [ ] **GALL-02**: Visitor can sort/filter gallery list by district, date, time, artists/organizers, and type.
- [ ] **GALL-03**: Visitor can view gallery details with type, bio, address (map link), images, artists/organizers, and duration.
- [ ] **GALL-04**: Visitor can submit registration form for a selected exhibition event.

### Community

- [ ] **COMM-01**: Visitor can submit rating (1-5) for attended gallery.
- [ ] **COMM-02**: Visitor can submit and read comments for gallery details.

### Passport

- [ ] **PASS-01**: Visitor receives a digital stamp after confirmed visit.
- [ ] **PASS-02**: Visitor can view collected stamps in gallery passport vault.

### Organizer Workflows

- [ ] **ORG-01**: Organizer can submit exhibition registration with type, bio, images, and address.
- [ ] **ORG-02**: Organizer can create custom registration forms for visitors.
- [ ] **ORG-03**: Organizer can review submitted registrations for own exhibitions.

### Foundation

- [x] **INFRA-01**: Expo React Native app is scaffolded with navigation and design token baseline.
- [x] **INFRA-02**: NestJS API is scaffolded with Prisma schema targeting Neon.
- [x] **INFRA-03**: CI pipeline executes lint/test/build checks for both apps.

## Traceability for v1.4

| Requirement | Planned Phase(s) | Planned Status |
|-------------|------------------|----------------|
| INFRA-01 | Phase 1, Phase 4 | Existing shell retained, then hardened |
| INFRA-02 | Phase 1 | Schema and contracts being replaced by V2 |
| INFRA-03 | Phase 4 | Build/test/smoke validation upgraded |
| AUTH-01 | Phase 1 | Local register/login flow planned |
| AUTH-02 | Phase 1, Phase 4 | Active role and session restore planned |
| AUTH-03 | Phases 1-3 | Profile hydration planned for both roles |
| AUTH-04 | Phase 1 | Google OAuth path planned in the same access flow |
| GALL-01 | Phase 2, Phase 4 | Discover list planned against exhibition summaries |
| GALL-02 | Phase 2 | Filter and query contract planned |
| GALL-03 | Phase 2 | Detail screen data contract planned |
| GALL-04 | Phases 2-4 | Reservation plus queue flow planned end-to-end |
| COMM-01 | Phase 4 | Rating flow planned after attendance |
| COMM-02 | Phase 4 | Review visibility and community feed planned |
| PASS-01 | Phases 3-4 | Attendance trigger and reward issuance planned |
| PASS-02 | Phases 4 | Vault progress and milestone history planned |
| ORG-01 | Phase 3 | Exhibition authoring planned |
| ORG-02 | Phase 3 | Form schema builder planned |
| ORG-03 | Phases 3-4 | Queue, decision, and hardening coverage planned |

## Planning Guardrails

- Treat the v1.5 Production UI Rules, Screen-by-Screen Production Contract, and Workflow + Schema Contract boards as the implementation authority.
- Treat `.planning/STACK.md` as the execution-stack authority; do not introduce alternate query, auth, persistence, queue, or test stacks without reopening the plan.
- Every screen must keep loading, empty, error, success, and locked states explicit.
- No route-critical behavior may stay explained only by `mockData.ts` once v1.4 finishes.

---
*Last updated: 2026-05-12 after opening the v1.4 implementation milestone*