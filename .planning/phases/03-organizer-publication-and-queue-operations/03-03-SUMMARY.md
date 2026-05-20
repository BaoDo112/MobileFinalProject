---
phase: 03-organizer-publication-and-queue-operations
plan: 03
subsystem: submission-pipeline-and-review
tags: [organizer-queue, submission-review, attendance, stamps-handoff, queue-tests]
provides:
  - Organizer queue endpoints for pipeline boards, review detail, decision actions, and attendance updates
  - Live Submission Pipeline and Submission Review mobile screens backed by TanStack Query instead of organizer submission mock data
  - Coverage for organizer queue API flows plus new mobile unit tests for the pipeline and review screens
affects: [phase-04-review-stamps, phase-04-hardening]
tech-stack:
  added: [organizer-queue-contracts, submission-review-hooks, attendance-stamp-bridge, organizer-queue-tests]
  patterns: [registration-owned-queue-state, selected-review-detail-query, session-occupancy-reconciliation]
key-files:
  created: [apps/mobile/src/query/useSubmissionPipeline.ts, apps/mobile/src/query/useSubmissionReview.ts, apps/mobile/src/screens/SubmissionPipelineScreen.unit.test.tsx, apps/mobile/src/screens/SubmissionReviewScreen.unit.test.tsx, .planning/phases/03-organizer-publication-and-queue-operations/03-03-SUMMARY.md]
  modified: [apps/api/src/common/contracts.ts, apps/api/src/exhibitions/exhibitions.service.ts, apps/api/src/registrations/registrations.controller.ts, apps/api/src/registrations/registrations.service.ts, apps/api/src/stamps/stamps.service.ts, apps/api/test/registrations.integration.spec.ts, apps/mobile/src/api/registrations.ts, apps/mobile/src/navigation/AppNavigator.tsx, apps/mobile/src/screens/SubmissionPipelineScreen.tsx, apps/mobile/src/screens/SubmissionReviewScreen.tsx, apps/mobile/src/types/api.ts]
key-decisions:
  - "Keep the registration service as the single owner of organizer queue decisions, then push occupancy reconciliation back into exhibition sessions so booking, dashboard, and review stay aligned."
  - "Return one selected submission detail from the review endpoint instead of shipping a second local decision store into Expo; the client only owns selection, not workflow truth."
  - "Issue attendance stamps idempotently from the check-in action so Phase 4 can build review and reward progress on top of the same attendance event without another migration."
duration: 165min
completed: 2026-05-20
---

# Phase 3 Plan 03 Summary

**Organizer queue operations now run on live registration data: the pipeline shows status counts and session pressure, the review board executes approve/waitlist/reject/check-in actions, and attendance now hands off into the stamp flow.**

## Performance
- **Duration:** 165min
- **Tasks:** 2 completed
- **Files modified:** 11

## Accomplishments
- Added organizer queue contracts for pipeline boards, session workload, waitlist summaries, selected submission detail, and decision actions.
- Extended the registration service with organizer queue reads, decision mutations, organizer-role enforcement, and session occupancy reconciliation so queue changes immediately affect shared registration state.
- Added attendance-driven stamp issuance to the check-in path, keeping the Phase 4 review and reward loop anchored to one explicit backend event.
- Rebuilt `SubmissionPipelineScreen` around live queue queries with filter chips, session workload panels, waitlist pressure, and review-board handoff.
- Rebuilt `SubmissionReviewScreen` around live review detail queries with attendee selection, answer inspection, decision actions, attendance feedback, and mutation error handling.
- Removed organizer submission mock-data wiring from navigation and added API integration coverage plus new mobile unit tests for both queue screens.

## Validation
- `pnpm --filter @arthera/api build` passed.
- `pnpm --filter @arthera/api test:integration` passed.
- `pnpm --filter @arthera/mobile build` passed.
- `pnpm --filter @arthera/mobile test` passed.
- `pnpm build` passed.
- `pnpm test` passed.

## Decisions and Deviations
- The registration integration suite needed the same explicit Jest timeout increase as the newer authoring suite once organizer queue coverage expanded Nest bootstrap work in isolated runs.
- Queue filtering stays client-side for now because the backend already returns screen-shaped board data, and targeted invalidation keeps the mobile review flow simpler than introducing server-side filter permutations this late in v1.4.

## Next Phase Readiness
Phase 03-03 is complete. Phase 04-01 can now implement attendance-gated reviews and stamp progress on top of the explicit check-in and reward handoff introduced here.