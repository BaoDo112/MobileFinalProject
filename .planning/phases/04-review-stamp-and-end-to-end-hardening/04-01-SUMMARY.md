---
phase: 04-review-stamp-and-end-to-end-hardening
plan: 01
subsystem: review-hub-and-stamp-vault
tags: [review-hub, stamp-vault, attendance-gating, moderation, visitor-tests]
provides:
  - Attendance-gated review endpoints with moderation-aware status handling and exhibition preview synchronization
  - Live Review Hub and Stamp Vault mobile screens backed by TanStack Query instead of route-level mock data
  - API integration coverage plus mobile unit coverage for the full post-attendance review and reward loop
affects: [phase-04-hardening]
tech-stack:
  added: [review-service, stamp-progress-contracts, review-hooks, stamp-vault-hooks, review-integration-tests]
  patterns: [attendance-gated-review-save, preview-sync-on-publish, milestone-stamp-dedupe, live-visitor-vault-queries]
key-files:
  created: [apps/api/src/reviews/reviews.controller.ts, apps/api/src/reviews/reviews.service.ts, apps/api/test/reviews.integration.spec.ts, apps/mobile/src/api/reviews.ts, apps/mobile/src/api/stamps.ts, apps/mobile/src/query/useReviewHub.ts, apps/mobile/src/query/useStampVault.ts, apps/mobile/src/screens/ReviewHubScreen.unit.test.tsx, apps/mobile/src/screens/StampVaultScreen.unit.test.tsx, .planning/phases/04-review-stamp-and-end-to-end-hardening/04-01-SUMMARY.md]
  modified: [apps/api/src/app.module.ts, apps/api/src/common/contracts.ts, apps/api/src/exhibitions/exhibitions.service.ts, apps/api/src/registrations/registrations.service.ts, apps/api/src/stamps/stamps.controller.ts, apps/api/src/stamps/stamps.service.ts, apps/mobile/src/navigation/AppNavigator.tsx, apps/mobile/src/screens/ReviewHubScreen.tsx, apps/mobile/src/screens/StampVaultScreen.tsx, apps/mobile/src/types/api.ts, apps/mobile/src/types/models.ts]
key-decisions:
  - "Make attendance check-in the only unlock condition for reviews so Review Hub, queue actions, and stamp rewards stay anchored to one backend event."
  - "Keep moderation lightweight and deterministic in v1.4 by routing trigger content to PENDING while published reviews immediately sync back into exhibition detail preview data."
  - "Model the vault as explicit confirmed, upcoming, expired, and milestone sections from backend DTOs so the mobile screen no longer reconstructs visitor progress from mock data."
duration: 185min
completed: 2026-05-20
---

# Phase 4 Plan 01 Summary

**The post-attendance visitor loop is now live: check-in unlocks reviews, published feedback syncs into exhibition preview, and stamp progress is served from backend attendance and milestone events instead of mock data.**

## Performance
- **Duration:** 185min
- **Tasks:** 2 completed
- **Files modified:** 11

## Accomplishments
- Extended the shared contracts for review eligibility, composer state, moderation status, stamp vault sections, milestone cards, and full progress payloads.
- Added a dedicated review service and controller that enforce attendance-gated review save rules, publish or hold feedback in moderation, and synchronize public preview cards back into exhibition detail responses.
- Expanded the stamp service and controller to expose visitor progress, milestone unlocks, and attendance-backed history while preserving idempotent attendance reward issuance.
- Rebuilt `ReviewHubScreen` around live review queries and mutations with explicit loading, error, eligibility, moderation, and published-state handling.
- Rebuilt `StampVaultScreen` around live progress queries with milestone tracking, confirmed/upcoming/expired sections, and direct exhibition navigation from live vault cards.
- Removed the remaining Review Hub and Stamp Vault mock-route wiring from navigation and added backend integration coverage plus mobile unit coverage for the new flows.

## Validation
- `pnpm --filter @arthera/api build` passed.
- `pnpm --filter @arthera/api test:integration` passed.
- `pnpm --filter @arthera/mobile build` passed.
- `pnpm --filter @arthera/mobile test` passed.
- `pnpm build` passed.
- `pnpm test` passed.

## Decisions and Deviations
- Review moderation stays intentionally simple in this milestone: deterministic trigger words move a review to `PENDING`, which was enough to validate moderation-state UI and preview sync without inventing a separate organizer moderation console inside Phase 4.
- The stamp vault now treats upcoming and expired registrations as DTO-backed progress cards rather than deriving those sections from front-end mock gallery state, which reduced the remaining mock-only surface before 04-02.

## Next Phase Readiness
Phase 04-01 is complete. Phase 04-02 can now focus on the remaining end-to-end hardening and final smoke validation without reopening Review Hub or Stamp Vault data ownership.