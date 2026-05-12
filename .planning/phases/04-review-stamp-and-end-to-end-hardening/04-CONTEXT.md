# Phase 4: Review, Stamp, and End-to-End Hardening - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning and execution

<domain>
## Phase Boundary

This phase closes the post-attendance loop and removes the remaining implementation ambiguity across the whole app.

Screen ownership in this phase:
- Screen 5: Review Hub
- Screen 6: Stamp Vault
- Shared integration and verification coverage across screens 1-13

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions
- Review remains locked until attendance is confirmed.
- Review visibility and moderation state must be explicit.
- Stamp progression and milestone history must come from backend events, not local screen math.
- The final app must stop relying on route-critical `mockData.ts` wiring.
- Smoke validation must cover all 13 screens plus the critical transitions from publish -> discover -> register -> approve -> check in -> review -> stamp.
- Final hardening uses Prisma seed plus Jest/Supertest and `jest-expo`/React Native Testing Library as the required verification stack.
- Any reminder or status-reconciliation cron introduced earlier must be deterministic and testable, not fire-and-forget.
- Do not add new fallback mock abstractions in this phase; remove route-critical mock usage instead.

### Claude's Discretion
- Exact shape of the smoke tests and seed helpers, as long as they are executable through repo scripts.

</decisions>

<canonical_refs>
## Canonical References

- `project.pen` - board `WutYD` entries 5 and 6
- `project.pen` - board `FeGE9` system events and status rules
- `.planning/STACK.md`
- `apps/mobile/src/screens/ReviewHubScreen.tsx`
- `apps/mobile/src/screens/StampVaultScreen.tsx`
- `apps/mobile/src/data/mockData.ts`
- `package.json`, `apps/api/package.json`, `apps/mobile/package.json`

</canonical_refs>

<specifics>
## Specific Ideas

- Stamp issue timing should stay aligned with attendance and milestone evaluation rules from the v1.5 board.
- Final verification should exercise both local auth and Google-auth bootstrap paths, even if Google credentials are configured later by the user.
- Root build/test scripts need to become meaningful enough to validate the implementation milestone.

</specifics>

<deferred>
## Deferred Ideas

- Advanced moderation tooling
- Rich achievement systems beyond the current stamp milestone model

</deferred>

---

*Phase: 04-review-stamp-and-end-to-end-hardening*
*Context gathered: 2026-05-12*