# Implementation Handoff Notes

## Suggested Build Order

1. Finalize auth/session handling and add `GET /users/me`.
2. Expand galleries list/detail payloads to match wireframe needs.
3. Expose exhibition registration create/list/status endpoints on top of the existing Prisma model.
4. Add exhibition lifecycle status and editable form-schema updates.
5. Enforce comment/rating/stamp rules after registration review and attendance support exist.

## Mobile Priorities

- Start by replacing mock data in Login Entry, Gallery Home, Gallery Detail, and Passport Vault.
- Keep the wireframe card sequence as the screen implementation order.
- Reuse one shared status-state component pattern across empty/loading/error/success states.

## API Priorities

- Preserve the existing controller grouping: auth, galleries, exhibitions, comments, stamps.
- Add registration operations under the exhibitions domain instead of creating too many new modules.
- Keep payload contracts close to `contracts.ts` to reduce frontend/backend drift.

## Definition of Ready for Implementation Milestone

- Wireframe board approved as the single visual planning reference.
- Required new endpoints agreed: profile, registrations create/list/status, exhibition patch.
- Minimal Prisma status fields added for exhibition and registration lifecycles.
