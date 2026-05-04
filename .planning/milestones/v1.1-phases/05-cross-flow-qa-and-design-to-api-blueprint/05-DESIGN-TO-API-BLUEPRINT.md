# Design-to-API Blueprint

All routes below assume the existing Nest global prefix: `/api`.

## Shared and Visitor Mapping

| Screen / State | Endpoint | Status | Request Shape | Response Shape | Notes |
|----------------|----------|--------|---------------|----------------|-------|
| Login Entry -> auth success | `POST /api/auth/login` | Existing | `{ email, role }` | `AuthResponse { token, role, email }` | Current scaffold already matches the simplified auth design |
| Profile summary | `GET /api/users/me` | New | Auth header only | `{ id, email, fullName, role }` | Can be served from `User` model with minimal controller/service work |
| Gallery Home list | `GET /api/galleries?status=PRESENT` | Existing, extend | query: `status` today; later add `district`, `type`, `date`, `organizer` | `GallerySummary[]` | Keep filter expansion on the same endpoint |
| Gallery Detail | `GET /api/galleries/:id` | Existing | path `id` | detailed gallery payload | Existing detail route should become richer, not replaced |
| Event Registration submit | `POST /api/exhibitions/:id/registrations` | New | `{ visitorId, payload }` | `{ id, exhibitionId, visitorId, status }` | Prisma `ExhibitionRegistration` already exists and can back this directly |
| Passport Vault list | `GET /api/stamps?ownerId=:userId` | Existing | query `ownerId` | `Stamp[]` | Fits the planned vault screen |
| Rating/Comment list | `GET /api/comments?galleryId=:galleryId` | Existing | query `galleryId` | `Comment[]` | Use gallery context to show recent feedback |
| Rating/Comment create | `POST /api/comments` | Existing, enforce gating | `{ galleryId, authorId, rating, content }` | created comment | Later service validation should enforce eligibility |

## Organizer Mapping

| Screen / State | Endpoint | Status | Request Shape | Response Shape | Notes |
|----------------|----------|--------|---------------|----------------|-------|
| Organizer Dashboard list | `GET /api/exhibitions?organizerId=:userId` | Existing | query `organizerId` | `Exhibition[]` | Existing scaffold already supports organizer-scoped listing |
| Create Exhibition | `POST /api/exhibitions` | Existing | `ExhibitionPayload` | created exhibition | Current payload already includes `mediaUrls` and optional `formSchema` |
| Edit Exhibition | `PATCH /api/exhibitions/:id` | New | partial exhibition fields | updated exhibition | Needed for draft-to-published lifecycle and quick corrections |
| Form Builder save | `PATCH /api/exhibitions/:id` | Extend | `{ formSchema }` or partial payload | updated exhibition | Keep form schema nested on `Exhibition` for v1 simplicity |
| Submission Review list | `GET /api/exhibitions/:id/registrations` | New | path `id` | `ExhibitionRegistration[]` | Uses existing relation already in Prisma schema |
| Registration decision | `PATCH /api/registrations/:id/status` | New | `{ status, note? }` | updated registration | Supports approved/rejected/attended transitions |
| Stamp issuance after attendance | `POST /api/stamps/issue` | Existing | `{ ownerId, galleryId, title }` | created stamp | Trigger after registration status becomes attended |

## Minimal Data Model Evolution

### Recommended Schema Deltas

1. Add `status` to `Exhibition` using `DRAFT | SUBMITTED | PUBLISHED | CLOSED`.
2. Add `status` to `ExhibitionRegistration` using `PENDING | APPROVED | REJECTED | ATTENDED`.
3. Add optional timestamps such as `reviewedAt` and `attendedAt` to `ExhibitionRegistration`.
4. Keep `formSchema` on `Exhibition` for v1 instead of creating a separate form-builder subsystem.

### Why These Deltas Are Enough

- They unlock all planned wireframe states without introducing an oversized domain model.
- They preserve compatibility with the current controller layout.
- They keep Visitor and Organizer coupling understandable for a semester project.
