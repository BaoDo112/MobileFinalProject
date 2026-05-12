# Phase 2: Visitor Discovery, Registration, and Profile - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning and execution

<domain>
## Phase Boundary

This phase owns the visitor browse and reservation slice after Phase 1 lands.

Screen ownership in this phase:
- Screen 2: Discover
- Screen 3: Exhibition Detail
- Screen 4: Event Registration
- Screen 7: Visitor Profile

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions
- Discover is exhibition-first, not gallery-placeholder-first.
- First viewport on Discover and Detail must answer where the visitor is, whether space is available, and what the next action is.
- Registration keeps one dominant CTA with sticky submit, inline validation, confirmation summary before final submit, and explicit waitlist fallback.
- Visitor Profile must surface upcoming visits, past activity, preferences, accessibility notes, and role switching from real backend state.
- Visitor data flows use TanStack Query hooks over typed mobile API clients; do not reintroduce screen-local fetch state for route-critical behavior.
- Visitor forms use React Hook Form + Zod, with dynamic attendee fields rendered from backend field definitions instead of a second hard-coded schema layer.
- Timeline, session, and availability formatting use `date-fns`.

### Claude's Discretion
- Whether to keep `ProfileScreen.tsx` as a shared shell with role-specific sections or split into internal subcomponents.

</decisions>

<canonical_refs>
## Canonical References

- `project.pen` - board `WutYD` entries 2, 3, 4, and 7
- `project.pen` - board `FeGE9` visitor workflow and status rules
- `.planning/STACK.md`
- `apps/mobile/src/screens/GalleryHomeScreen.tsx`
- `apps/mobile/src/screens/GalleryDetailScreen.tsx`
- `apps/mobile/src/screens/EventRegistrationScreen.tsx`
- `apps/mobile/src/screens/ProfileScreen.tsx`
- `apps/mobile/src/data/mockData.ts`

</canonical_refs>

<specifics>
## Specific Ideas

- Filters must include timeline, district, and type from the locked contract.
- Reservation answers must be stored row-by-row, not only as a JSON blob.
- Visitor Profile upcoming and past activity should come from registrations and attendance, not hard-coded profile copy.

</specifics>

<deferred>
## Deferred Ideas

- Saved exhibitions or favorites beyond the small "recent context" block
- Multi-language or calendar export features

</deferred>

---

*Phase: 02-visitor-discovery-registration-and-profile*
*Context gathered: 2026-05-12*