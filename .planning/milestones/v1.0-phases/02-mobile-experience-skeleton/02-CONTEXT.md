# Phase 2: Mobile Experience Skeleton - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the mobile UI skeleton for visitor and organizer journeys based on the provided Pencil draft, using mock data and navigation-ready screen components.

</domain>

<decisions>
## Implementation Decisions

### Navigation
- Root stack: Login -> Main tabs -> Gallery details.
- Main tabs expose Gallery, Organizer Tools, Passport Vault, and Profile placeholder.

### Visual Language
- Keep warm background and vibrant accent inspired by Pencil file.
- Use consistent card-based layout with role-specific actions.

### Data Strategy
- Use static mock data in phase 2 to unblock UI work.

### Claude's Discretion
- Exact typography fallback in React Native.
- Small utility component structure.

</decisions>

<specifics>
## Specific Ideas

- Reflect screen intents from `Vibrant Login Entry`, `Vibrant Organizer Tools`, `Vibrant Stamp Vault`, `Vibrant Gallery Home`, and `Vibrant Exhibition Details`.

</specifics>

<canonical_refs>
## Canonical References

### Design Inputs
- `project.pen` - source for visual and flow direction.
- `.planning/REQUIREMENTS.md` - feature IDs covered by this phase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Root workspace scripts from phase 1.

### Established Patterns
- Keep screen modules under `apps/mobile/src/screens`.

### Integration Points
- Gallery detail screen should be callable from gallery list card taps.

</code_context>

<deferred>
## Deferred Ideas

- Full offline cache for gallery data.
- Advanced map and geofencing behavior.

</deferred>

---
*Phase: 02-mobile-experience-skeleton*
*Context gathered: 2026-03-31*
