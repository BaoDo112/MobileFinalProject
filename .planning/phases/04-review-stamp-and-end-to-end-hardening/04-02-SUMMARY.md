---
phase: 04-review-stamp-and-end-to-end-hardening
plan: 02
subsystem: smoke-validation-and-final-hardening
tags: [smoke-tests, lint-hardening, route-contracts, milestone-closeout]
provides:
  - Meaningful root lint and test entry points backed by real package-level verification commands
  - API smoke coverage for publish, discover, register, approve, check-in, review, and stamp transitions
  - Mobile smoke coverage that mounts the full locked screen surface against deterministic contract data
affects: [phase-04-hardening, milestone-v1.4-closeout]
tech-stack:
  added: [api-smoke-suite, mobile-screen-contract-suite]
  patterns: [typecheck-as-lint, deterministic-smoke-manifest, query-backed-screen-contracts]
key-files:
  created: [apps/api/prisma/seed.ts, apps/api/test/v1_4_smoke.spec.ts, apps/mobile/src/test/v1_4_screen_contract.spec.tsx, .planning/phases/04-review-stamp-and-end-to-end-hardening/04-02-SUMMARY.md]
  modified: [package.json, apps/api/jest.config.cjs, apps/api/package.json, apps/api/prisma/schema.prisma, apps/mobile/jest.config.cjs, apps/mobile/package.json, apps/mobile/src/navigation/AppNavigator.tsx, apps/mobile/src/screens/DiscoverMapScreen.tsx, apps/mobile/src/screens/StampVaultScreen.tsx]
key-decisions:
  - "Use deterministic smoke suites instead of heavyweight end-to-end automation so the semester repo can validate the full workflow quickly on every run."
  - "Promote lint from placeholder scripts to TypeScript-based verification so IDE-visible contract drift fails the same way local validation does."
  - "Eliminate route-critical runtime imports from mobile mock data and prove screen wiring through live-query contract mounts rather than navigation-only stubs."
duration: 145min
completed: 2026-05-20
---

# Phase 4 Plan 02 Summary

**The milestone closeout is now executable: route-critical mobile screens no longer depend on `mockData`, root verification commands are real, and both backend workflow smoke tests and mobile screen-contract smoke tests validate the locked v1.4 surface.**

## Performance
- **Duration:** 145min
- **Tasks:** 2 completed
- **Files modified:** 9

## Accomplishments
- Removed the last route-critical runtime mock wiring from the mobile app by switching navigation and Discover/Stamp/Profile paths onto live query-backed flows only.
- Added a deterministic workflow seed manifest and an API smoke suite that exercises publish, discover, approval, check-in, review, and stamp-progress transitions end to end.
- Added a mobile smoke suite that mounts the locked screen contracts for visitor and organizer flows, covering the full planned surface without depending on in-screen mock arrays.
- Replaced placeholder `lint` scripts with real TypeScript verification and wired `test:smoke` into package and root test flows so repository-level validation is trustworthy.
- Updated Jest discovery rules to include the new smoke suite naming and keep smoke coverage runnable from normal package scripts.

## Validation
- `pnpm --filter @arthera/mobile test:smoke` passed.
- `pnpm --filter @arthera/api test:smoke` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `pnpm test` passed.

## Decisions and Deviations
- The Prisma seed output remains a deterministic manifest rather than a database-writing seeder because runtime persistence is still in-memory for this milestone; that was enough to anchor the smoke workflow and keep the schema artifact aligned.
- The mobile smoke suite validates screen contracts with mocked query results instead of full navigation-driven automation to keep the check fast and stable while still proving that all locked screens can mount against the agreed DTO shape.

## Next Phase Readiness
Phase 04-02 is complete. Milestone v1.4 is fully implemented and validated, so the next step is a new milestone or post-milestone cleanup rather than more hardening inside this roadmap.