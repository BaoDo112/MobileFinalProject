# Roadmap: Arthera Mobile Final Project

## Milestones

- ✅ **v1.0 Mobile Project Initialization** - Shipped 2026-03-31 (archived in `.planning/milestones/`)
- ✅ **v1.1 Detailed Planning and Wireframe Reference** - Completed 2026-05-04 (archived in `.planning/milestones/`)
- ✅ **v1.2 Full Mobile UI Implementation and Validation** - Completed 2026-05-04
- ⏳ **v1.3 Full High-Fidelity Pencil UI Lock** - In Progress 2026-05-04

## Phases

### ⏳ v1.3 Full High-Fidelity Pencil UI Lock

**Milestone Goal:** Turn `project.pen` into the authoritative high-fidelity UI source for every implemented mobile route before code review and API binding continue.

- [ ] **Phase 1: Route-to-Screen Contract and Design System** - Map every implemented route to a canonical Pen screen and lock the shared high-fidelity design language.
- [ ] **Phase 2: Visitor High-Fidelity Pencil Pack** - Upgrade and extend the Visitor side into a complete high-fidelity screen set.
- [ ] **Phase 3: Organizer High-Fidelity Pencil Pack** - Upgrade and extend the Organizer side into a complete high-fidelity screen set.
- [ ] **Phase 4: Cross-Flow Design Validation and Handoff** - Validate consistency, navigation behavior, state coverage, and node-level handoff references.

## Phase Details

### Phase 1: Route-to-Screen Contract and Design System
**Goal**: Inventory the real implemented route surface, decide which existing Pen frames are canonical vs need replacement, and define the shared design rules for the full high-fidelity pack.
**Depends on**: v1.2 implemented route surface, `project.pen`
**Requirements**: [AUTH-01, AUTH-03, GALL-01, GALL-03, PASS-02, ORG-01, ORG-03]
**Gap Closure**: Closes the mismatch between implemented screens and the incomplete high-fidelity design source.
**Success Criteria** (what must be TRUE):
  1. Every implemented route is mapped to one canonical Pen screen.
  2. Reusable shell patterns are locked for headers, bottom navigation, hero cards, list cards, forms, and status sections.
  3. Existing 5 sample frames are classified as keep/refine/derive.
**Plans**: 1 plan

Plans:
- [ ] 01-01: Create the route-to-screen matrix and shared high-fidelity design contract before any new Pen screens are added.

### Phase 2: Visitor High-Fidelity Pencil Pack
**Goal**: Build the complete high-fidelity Visitor screen set in Pen using the refined shared system.
**Depends on**: Phase 1
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, GALL-01, GALL-02, GALL-03, GALL-04, COMM-01, COMM-02, PASS-01, PASS-02]
**Gap Closure**: Closes missing high-fidelity Pen coverage for Event Registration, Review Hub, Visitor Profile, and aligned states across the Visitor flow.
**Success Criteria** (what must be TRUE):
  1. Visitor flow has a canonical high-fidelity screen for login, home, detail, registration, review, vault, and profile.
  2. Shared header, navigation, CTA, filter, and state treatments remain visually consistent.
  3. Key empty, locked, success, and progression states are reflected in the screen content.
**Plans**: 1 plan

Plans:
- [ ] 02-01: Extend the Visitor side of `project.pen` into a full high-fidelity pack aligned to the implemented routes.

### Phase 3: Organizer High-Fidelity Pencil Pack
**Goal**: Build the complete high-fidelity Organizer screen set in Pen using the same locked system.
**Depends on**: Phase 1
**Requirements**: [AUTH-02, AUTH-03, ORG-01, ORG-02, ORG-03, PASS-01]
**Gap Closure**: Closes missing high-fidelity Pen coverage for Organizer Dashboard, Form Builder, Submission Pipeline, Submission Review, and Organizer Profile.
**Success Criteria** (what must be TRUE):
  1. Organizer flow has a canonical high-fidelity screen for dashboard, exhibition editor, form builder, submission pipeline, submission review, and profile.
  2. Operational states are clear enough to drive later backend/API reviews.
  3. Existing Organizer Tools sample is refined rather than visually contradicted.
**Plans**: 1 plan

Plans:
- [ ] 03-01: Extend the Organizer side of `project.pen` into a full high-fidelity pack aligned to the implemented routes.

### Phase 4: Cross-Flow Design Validation and Handoff
**Goal**: Validate the new Pen pack across both roles and produce implementation-ready node references.
**Depends on**: Phase 2, Phase 3
**Requirements**: [AUTH-01, AUTH-03, GALL-04, COMM-02, PASS-02, ORG-03]
**Gap Closure**: Ensures the design source is actually usable as the review baseline for code and future API work.
**Success Criteria** (what must be TRUE):
  1. Navigation/state patterns are consistent across Visitor and Organizer screens.
  2. No implemented route lacks a Pen counterpart.
  3. Handoff docs list screen names and node IDs for downstream code review.
**Plans**: 1 plan

Plans:
- [ ] 04-01: Run cross-flow Pen validation and record the final node-level handoff map.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Route-to-Screen Contract and Design System | 0/1 | In Progress | |
| 2. Visitor High-Fidelity Pencil Pack | 0/1 | Not Started | |
| 3. Organizer High-Fidelity Pencil Pack | 0/1 | Not Started | |
| 4. Cross-Flow Design Validation and Handoff | 0/1 | Not Started | |
