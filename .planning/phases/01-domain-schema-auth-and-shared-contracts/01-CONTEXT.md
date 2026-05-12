# Phase 1: Domain Schema, Auth, and Shared Contracts - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning and execution

<domain>
## Phase Boundary

This phase owns the implementation foundation used by every later screen: Prisma V2 entities, typed contracts, auth/session bootstrap, role persistence, and shared mobile primitives.

Screen ownership in this phase:
- Screen 1: Auth
- Shared shell/state primitives consumed by screens 2-13

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions
- Use the v1.5 production boards as the build authority.
- Plan every route from DB -> Nest module -> Expo screen; do not leave route-critical behavior explained only by mock data.
- Auth must support email/password register/login and Google OAuth in the same access flow.
- The v1.4 support stack is locked in `.planning/STACK.md`; do not swap TanStack Query, Zustand, Secure Store, or the Nest auth stack ad hoc during execution.
- Mobile session and workspace bootstrap use TanStack Query plus Zustand persisted through Expo Secure Store.
- Nest auth and request validation use `@nestjs/config`, `class-validator`, `class-transformer`, JWT/Passport strategies, and `bcrypt`.
- Tabs appear only on Discover, Vault, Visitor Profile, Dashboard, Pipeline, and Organizer Profile.
- Shared status, empty, error, and sticky-action behavior must be reusable primitives, not duplicated ad-hoc per screen.

### Claude's Discretion
- Internal folder structure for new API clients, hooks, and state helpers, as long as the monorepo stays coherent with the existing Expo and Nest layout.

</decisions>

<canonical_refs>
## Canonical References

- `project.pen` - implementation authority boards `DzqHA`, `WutYD`, `FeGE9`
- `.planning/STACK.md` - locked execution support stack for v1.4
- `.planning/milestones/v1.3-phases/04-cross-flow-design-validation-and-handoff/04-NODE-HANDOFF.md` - canonical screen/node map
- `.planning/REQUIREMENTS.md` - active requirement inventory
- `apps/mobile/src/navigation/AppNavigator.tsx` - actual 13-route navigation surface
- `apps/api/prisma/schema.prisma` - MVP schema being replaced
- `apps/api/src/common/contracts.ts` - current transport types to expand

</canonical_refs>

<specifics>
## Specific Ideas

- Replace the gallery-centric model with the V2 workflow graph from the v1.5 board.
- Remove the current login screen shortcut that only toggles a role and bypasses real auth/account bootstrapping.
- Standardize enum casing between API and mobile before visitor or organizer feature work starts.

</specifics>

<deferred>
## Deferred Ideas

- Payments
- Admin web
- QR/NFC attendance verification

</deferred>

---

*Phase: 01-domain-schema-auth-and-shared-contracts*
*Context gathered: 2026-05-12*