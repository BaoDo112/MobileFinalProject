# Role Scenarios and Scope Guardrails

## Shared Account Model

| Area | Visitor | Organizer | Shared Rule |
|------|---------|-----------|-------------|
| Authentication | Email/password | Email/password | One auth flow, role context stored in profile/session |
| Profile | View/edit basic profile | View/edit basic profile | Same profile shell with role-specific shortcuts |
| Notifications | Future scope | Future scope | Not in v1.1 planning deliverables |

## Visitor Core Scenarios

1. Visitor registers/logs in, lands on gallery home, filters results, opens a gallery, registers for event.
2. Visitor attends or is confirmed, receives stamp, then rates/comments on the gallery.
3. Visitor revisits app and sees vault progression and recent engagement history.

## Organizer Core Scenarios

1. Organizer logs in and lands on dashboard with active and draft exhibitions.
2. Organizer creates exhibition, fills metadata, adds media URLs, and defines registration form.
3. Organizer publishes exhibition and reviews registrations through a queue.

## Unlock and Permission Rules

- Rating and commenting are locked until a registration is approved or visit is confirmed.
- Stamp issuance is tied to attendance confirmation, not just viewing a gallery page.
- Organizers cannot publish a form without required contact fields.
- Visitors cannot edit organizer-owned exhibition data.

## Scope Guardrails

- No payment, ticket settlement, or invoice generation.
- No advanced CMS/web-admin dependency.
- No real-time messaging, live collaboration, or complex moderation dashboard.
- No QR/NFC implementation in the first executable milestone.
