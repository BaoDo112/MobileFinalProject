# Phase 3: Organizer Publication and Queue Operations - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning and execution

<domain>
## Phase Boundary

This phase owns the organizer authoring and operational queue slice.

Screen ownership in this phase:
- Screen 8: Organizer Dashboard
- Screen 9: Exhibition Editor
- Screen 10: Form Builder
- Screen 11: Submission Pipeline
- Screen 12: Submission Review
- Screen 13: Organizer Profile

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions
- Dashboard prioritizes KPI, urgent queue, today's sessions, and shortcuts before decorative copy.
- Exhibition publish requires valid session and schema data.
- Form Builder is constrained to a lightweight supported field set with explicit validation and consent configuration.
- Submission queue counts, approval, waitlist, and check-in must derive from the same session-aware registration model used by visitors.
- Organizer Profile manages workspace identity and notification rules, not only a cosmetic role switch.

### Claude's Discretion
- Exact internal decomposition between dashboard, queue, and authoring services, as long as aggregate counts and decision actions stay consistent.

</decisions>

<canonical_refs>
## Canonical References

- `project.pen` - board `WutYD` entries 8 through 13
- `project.pen` - board `FeGE9` organizer workflow, event list, entity model, and module list
- `apps/mobile/src/screens/OrganizerDashboardScreen.tsx`
- `apps/mobile/src/screens/OrganizerToolsScreen.tsx`
- `apps/mobile/src/screens/FormBuilderScreen.tsx`
- `apps/mobile/src/screens/SubmissionPipelineScreen.tsx`
- `apps/mobile/src/screens/SubmissionReviewScreen.tsx`

</canonical_refs>

<specifics>
## Specific Ideas

- Keep `OrganizerToolsScreen.tsx` as the current editor anchor unless extraction into smaller editor sections becomes necessary.
- Queue and decision states must match the status chips defined by the V2 enums.
- Check-in is the trigger that unlocks visitor review and starts stamp evaluation.

</specifics>

<deferred>
## Deferred Ideas

- Multi-organizer collaboration
- Advanced analytics dashboards beyond the KPI strip and queue aggregates

</deferred>

---

*Phase: 03-organizer-publication-and-queue-operations*
*Context gathered: 2026-05-12*