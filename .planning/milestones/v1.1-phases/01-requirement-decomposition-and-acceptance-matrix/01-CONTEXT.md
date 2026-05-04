# Phase 1: Requirement Decomposition and Acceptance Matrix - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn the current feature list into a build-ready requirement system that is simple for users, realistic for a semester project, and extensible enough to support future growth.

</domain>

<decisions>
## Implementation Decisions

### Simplicity Rules
- Authentication stays email/password only in v1.
- Role is selected once during onboarding, but both roles share one account model.
- Profile stays lightweight: name, avatar, short bio, favorite art type/organizer note optional.

### Visitor Rules
- Ratings and comments are only unlocked after a valid registration or visit confirmation.
- Gallery passport is issued from simple visit confirmation, not QR/NFC complexity in v1.
- Gallery browsing must support timeline grouping: past, present, future.

### Organizer Rules
- Exhibition lifecycle uses four states: draft, submitted, published, closed.
- Registration forms use a constrained field system for feasibility: short text, long text, single select, checkbox, email, phone, datetime.
- Media upload is represented as image URLs in v1 planning and backend contracts.

### Claude's Discretion
- Final Given/When/Then phrasing.
- Priority annotations for optional edge cases.

</decisions>

<specifics>
## Specific Ideas

- The product should feel easy for first-time visitors while still exposing enough structure for later feature expansion.
- Technical ambition must stay within Expo React Native + NestJS + Prisma + Neon scope.

</specifics>

<canonical_refs>
## Canonical References

### Product Direction
- `.planning/PROJECT.md` - core product value and fixed constraints.
- `.planning/REQUIREMENTS.md` - current top-level requirement inventory.
- `.planning/v1.0-MILESTONE-AUDIT.md` - gaps that phase 1 must close.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Current mobile scaffold already proves screen buckets: login, gallery home, detail, vault, organizer tools.

### Established Patterns
- App stays mobile-first, no admin web dependency.
- Backend shape is REST-oriented and maps well to screen-oriented planning.

### Integration Points
- Phase 1 outputs drive phase 2 IA and all downstream wireframe states.

</code_context>

<deferred>
## Deferred Ideas

- Social sharing, push notifications, analytics dashboard.
- Advanced attendance verification such as QR/NFC.

</deferred>

---
*Phase: 01-requirement-decomposition-and-acceptance-matrix*
*Context gathered: 2026-05-04*
