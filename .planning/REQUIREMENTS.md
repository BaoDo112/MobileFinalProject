# Requirements: Arthera Mobile Final Project

**Defined:** 2026-03-31
**Core Value:** A single mobile experience where visitors discover and collect gallery moments, while organizers launch exhibitions with minimal friction

## Current Note

v1.2 implemented the UI surface in code, but v1.3 is required to make `project.pen` the complete high-fidelity source of truth before code review and API integration continue.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can register or login with email and password.
- [ ] **AUTH-02**: User role (visitor or organizer) is persisted in authenticated session.
- [ ] **AUTH-03**: User can view profile information after login.

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

- [ ] **INFRA-01**: Expo React Native app is scaffolded with navigation and design token baseline.
- [ ] **INFRA-02**: NestJS API is scaffolded with Prisma schema targeting Neon.
- [ ] **INFRA-03**: CI pipeline executes lint/test/build checks for both apps.

## v2 Requirements

### Growth

- **GROW-01**: Push notifications for exhibition reminders.
- **GROW-02**: Attendance analytics dashboard for organizers.
- **GROW-03**: Social sharing and favorite galleries collection.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment and ticketing settlement | Too large for initial semester scope |
| Desktop web admin panel | Mobile-first delivery goal |
| Full multilingual i18n | Not essential for MVP demo |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 (v1.0) | Complete |
| INFRA-02 | Phase 1 (v1.0) | Complete |
| AUTH-01 | Phases 1-2 (v1.3) | UI Implemented, design lock pending |
| AUTH-02 | Phases 1-3 (v1.3) | UI Implemented, design lock pending |
| AUTH-03 | Phases 1-3 (v1.3) | UI Implemented, design lock pending |
| GALL-01 | Phases 1-2 (v1.3) | UI Implemented, design lock pending |
| GALL-02 | Phases 1-2 (v1.3) | UI Implemented, design lock pending |
| GALL-03 | Phases 1-2 (v1.3) | UI Implemented, design lock pending |
| GALL-04 | Phases 2, 4 (v1.3) | UI Implemented, design lock pending |
| PASS-01 | Phases 2-3 (v1.3) | UI Implemented, design lock pending |
| PASS-02 | Phases 1-2, 4 (v1.3) | UI Implemented, design lock pending |
| ORG-01 | Phases 1, 3 (v1.3) | UI Implemented, design lock pending |
| ORG-02 | Phase 3 (v1.3) | UI Implemented, design lock pending |
| ORG-03 | Phases 1, 3-4 (v1.3) | UI Implemented, design lock pending |
| COMM-01 | Phase 2 (v1.3) | UI Implemented, design lock pending |
| COMM-02 | Phases 2, 4 (v1.3) | UI Implemented, design lock pending |
| INFRA-03 | Phase 4 (v1.0) | Complete |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-05-04 after opening the v1.3 Pencil-first design lock milestone*
