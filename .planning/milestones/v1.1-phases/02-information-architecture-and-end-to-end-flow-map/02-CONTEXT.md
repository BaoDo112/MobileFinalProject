# Phase 2: Information Architecture and End-to-End Flow Map - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Convert approved requirements into a complete mobile information architecture and full-flow map for Visitor and Organizer journeys, including success and failure states.

</domain>

<decisions>
## Implementation Decisions

### Navigation Model
- Use a lightweight app shell: auth entry -> role-aware home shell -> detail flows.
- Visitor navigation favors bottom tabs: Home, Passport, Profile.
- Organizer navigation favors dashboard-first with direct CTA cards to Create Exhibition and Review Submissions.

### Screen-State Strategy
- Every core screen must define loading, empty, success, and error variants.
- Forms must define validation and submission feedback states.
- Review queues need clear zero-state and approval/rejection states.

### Simplicity Rules
- Avoid deep nested navigation; keep primary goals within four taps.
- Prefer one dominant CTA per screen.
- Keep list filtering visible and reversible.

### Claude's Discretion
- Naming of secondary helper states.
- Exact grouping of screen clusters.

</decisions>

<specifics>
## Specific Ideas

- Flow clarity matters more than feature density in this milestone.
- The IA should make later implementation easy for both frontend and backend teams.

</specifics>

<canonical_refs>
## Canonical References

### Planning Inputs
- `../01-requirement-decomposition-and-acceptance-matrix/01-REQUIREMENT-MATRIX.md` - requirement definitions.
- `../01-requirement-decomposition-and-acceptance-matrix/01-ROLE-SCENARIOS.md` - scenario and gating rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing mobile scaffold already suggests the main route buckets.

### Established Patterns
- Card-based presentation and tab navigation work well for a simple mobile-first experience.

### Integration Points
- Flow map should identify where backend endpoints are required for each step.

</code_context>

<deferred>
## Deferred Ideas

- Deep link routing and push-driven entry flows.
- Multi-step onboarding wizard beyond role choice.

</deferred>

---
*Phase: 02-information-architecture-and-end-to-end-flow-map*
*Context gathered: 2026-05-04*
