---
phase: 02-visitor-discovery-registration-and-profile
plan: 01
subsystem: discover-and-detail-read-path
tags: [visitor-discovery, exhibition-detail, react-query, in-memory-read-model]
provides:
  - Discover and Exhibition Detail endpoints backed by a typed exhibition/session/venue read model
  - Mobile query hooks and screen rewrites for Screen 2 and Screen 3 without mock-only props
  - API integration coverage for list, filter, detail, and legacy gallery adapter behavior
affects: [phase-2-plan-02, phase-4-hardening]
tech-stack:
  added: [exhibition-read-model, react-query-discover-hooks, api-integration-tests]
  patterns: [seeded-in-memory-projection, typed-query-keys, legacy-gallery-forwarder]
key-files:
  created: [apps/api/src/exhibitions/exhibitions.mapper.ts, apps/api/test/exhibitions.integration.spec.ts, apps/mobile/src/api/exhibitions.ts, apps/mobile/src/query/useDiscover.ts, apps/mobile/src/query/useExhibitionDetail.ts, .planning/phases/02-visitor-discovery-registration-and-profile/02-01-SUMMARY.md]
  modified: [apps/api/src/common/contracts.ts, apps/api/src/exhibitions/exhibitions.controller.ts, apps/api/src/exhibitions/exhibitions.service.ts, apps/api/src/galleries/galleries.service.ts, apps/mobile/src/types/api.ts, apps/mobile/src/screens/GalleryHomeScreen.tsx, apps/mobile/src/screens/GalleryDetailScreen.tsx, apps/mobile/src/navigation/AppNavigator.tsx]
key-decisions:
  - "Keep the visitor read path on an in-memory seeded model so Phase 2 can land without waiting for Prisma-backed list/detail services."
  - "Let the mobile discover/detail screens own their queries directly instead of threading read models through navigator props."
  - "Preserve the old galleries API as a forwarding adapter while the repo still contains legacy organizer and map surfaces."
duration: 120min
completed: 2026-05-20
---

# Phase 2 Plan 01 Summary

**Discover and Exhibition Detail now run on real typed API reads instead of local mock catalogs.**

## Performance
- **Duration:** 120min
- **Tasks:** 2 completed
- **Files modified:** 8

## Accomplishments
- Replaced the placeholder exhibition service with a seeded read model that exposes discover filters, availability, venue detail, session detail, and review preview from one contract surface.
- Added `GET /api/exhibitions`, `GET /api/exhibitions/:id`, and legacy gallery forwarding so the mobile visitor path can move first without breaking older organizer/map shells.
- Added typed Expo API wrappers plus TanStack Query hooks for discover list and exhibition detail, then rewrote `GalleryHomeScreen` and `GalleryDetailScreen` to consume those queries with explicit loading, error, and empty states.
- Added integration coverage for discover filters, detail payload shape, and the legacy gallery adapter.

## Validation
- `pnpm --filter @arthera/api build` passed.
- `pnpm --filter @arthera/api test:integration` passed.
- `pnpm --filter @arthera/mobile build` passed.

## Decisions and Deviations
- Kept map and several later visitor/organizer flows on their existing mock sources until 02-02 and later phases replace them slice by slice.
- The read model remains in-memory by design for now; later phases can swap the same contracts onto Prisma-backed queries without reopening the mobile screen API.

## Next Phase Readiness
Plan 02-02 can now consume the same session and exhibition vocabulary to implement booking, visitor history, and live preference/profile state.