# Cross-Flow QA Checklist

## QA Result

Overall verdict: **Pass with implementation notes**

## Visitor Flow Checks

- [x] Login Entry leads to the correct role-aware shell.
- [x] Gallery Home exposes browse and filter behavior without hidden dependencies.
- [x] Gallery Detail supports both registration intent and map/navigation intent.
- [x] Registration flow has clear validation, duplicate, and success states.
- [x] Passport Vault communicates zero, partial, and completed progression states.
- [x] Rating & Comment clearly explains that participation is required.

## Organizer Flow Checks

- [x] Organizer Dashboard starts with action-oriented shortcuts.
- [x] Create Exhibition supports draft and submit behavior.
- [x] Form Builder is scoped to supported field types and publish behavior.
- [x] Published Exhibition provides an operational bridge to review.
- [x] Submission Review contains decision and error states.
- [x] Attendance confirmation is explicitly connected to stamp issuance.

## Cross-Flow Checks

- [x] Visitor registration data has a downstream Organizer review destination.
- [x] Organizer attendance action unlocks Visitor stamp progression.
- [x] Comment/rating flow is gated by participation or attendance status.
- [x] No core outcome requires a hidden screen or undefined route.

## Remaining Implementation Gaps

1. Visitor registration endpoints are not exposed yet even though the Prisma model already exists.
2. Exhibition and registration status fields need stronger lifecycle support than the current scaffold exposes.
3. Profile retrieval/editing is still a planning-level requirement and needs a concrete API route.
