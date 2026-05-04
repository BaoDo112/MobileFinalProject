# Phase 3: Backend Domain Skeleton - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Provide backend contracts and schema for authentication, galleries, exhibitions, registrations, comments, and digital passport stamps.

</domain>

<decisions>
## Implementation Decisions

### API Style
- Use NestJS REST controllers with explicit route prefixes.
- Return typed JSON payloads aligned with mobile screens.

### Data Model
- Use Prisma schema with Neon-compatible PostgreSQL datasource.
- Keep first pass relation model simple but complete for core entities.

### Security Scope
- Use starter auth endpoints as scaffold; full auth hardening can be separate milestone.

### Claude's Discretion
- DTO layering depth and validation strategy in v1.

</decisions>

<specifics>
## Specific Ideas

- Organizer registration flow should support media URLs and custom form schema payload.
- Passport stamps should be tied to visit check-ins.

</specifics>

<canonical_refs>
## Canonical References

### Product Requirements
- `.planning/REQUIREMENTS.md` - API-facing requirement IDs.
- `apps/mobile/src/data/mockData.ts` - initial payload shape baseline.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Mobile mock models can inform DTO shape.

### Established Patterns
- Feature module split by domain (`auth`, `galleries`, `exhibitions`, `comments`, `stamps`).

### Integration Points
- Gallery list/detail endpoints feed `GalleryHome` and `GalleryDetail` screens.

</code_context>

<deferred>
## Deferred Ideas

- Role-based authorization guards per endpoint.
- File storage strategy beyond URL-based metadata.

</deferred>

---
*Phase: 03-backend-domain-skeleton*
*Context gathered: 2026-03-31*
