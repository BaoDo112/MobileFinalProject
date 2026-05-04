# Requirement Matrix: Arthera v1.1

## Shared Account and Profile

| ID | Requirement | Acceptance Criteria | Edge States | Notes |
|----|-------------|---------------------|-------------|-------|
| AUTH-01 | User can register or login with email/password | Given a new or existing user, when valid credentials are provided, then the app creates or restores a session | invalid password, duplicate email, offline state | Keep one unified auth model for both roles |
| AUTH-02 | User role is persisted in session | Given the user selected Visitor or Organizer, when the app restarts, then the role context is preserved until explicitly switched | stale token, missing role, forced logout | Role switch can live in profile/settings |
| AUTH-03 | User can view basic profile after login | Given an authenticated user, when profile is opened, then they see name, email, role, optional bio/avatar placeholder | incomplete profile, no avatar | Profile editing can stay lightweight |

## Visitor Discovery and Registration

| ID | Requirement | Acceptance Criteria | Edge States | Notes |
|----|-------------|---------------------|-------------|-------|
| GALL-01 | Visitor can browse past/present/future galleries | Given gallery data exists, when Visitor opens home, then galleries are grouped or filterable by timeline state | no galleries, only one state available | Default tab highlights present galleries |
| GALL-02 | Visitor can sort/filter by district, date, time, artist/organizer, type | Given multiple galleries exist, when filter controls change, then the list updates without confusion | empty results, conflicting filters, reset filters | Keep filter model simple and chip-based |
| GALL-03 | Visitor can inspect gallery details | Given a gallery card, when tapped, then details show type, bio, address, images, artists/organizers, and duration | missing images, missing map app, very long bio | Address should deep-link to Google Maps |
| GALL-04 | Visitor can submit event registration | Given an open exhibition form, when required fields are valid, then registration is saved and success feedback appears | invalid field, closed event, duplicate registration | Use dynamic schema from Organizer setup |

## Visitor Engagement and Passport

| ID | Requirement | Acceptance Criteria | Edge States | Notes |
|----|-------------|---------------------|-------------|-------|
| COMM-01 | Visitor can submit rating after participation | Given a verified registration or visit, when Visitor selects rating, then rating is stored | not eligible yet, already rated, event closed | Simple 1-5 star scale |
| COMM-02 | Visitor can submit and read comments | Given a gallery detail page, when Visitor opens discussion, then recent comments and comment form states are visible | no comments, blocked comment, edit pending | Keep moderation lightweight in v1 |
| PASS-01 | Visitor receives a digital stamp after confirmed visit | Given visit confirmation exists, when stamp issuance runs, then a new stamp appears in the vault | duplicate stamp, unconfirmed visit | No QR/NFC dependency in v1 |
| PASS-02 | Visitor can view collected stamps in vault | Given one or more stamps exist, when vault opens, then progress and locked/unlocked states are clear | zero stamps, all unlocked, partial progress | Visual progression matters for delight |

## Organizer Workflows

| ID | Requirement | Acceptance Criteria | Edge States | Notes |
|----|-------------|---------------------|-------------|-------|
| ORG-01 | Organizer can register an exhibition | Given Organizer opens create flow, when required metadata and media references are valid, then exhibition is saved as draft or submitted | missing cover image, invalid address, incomplete timings | Status lifecycle starts from draft |
| ORG-02 | Organizer can create a registration form | Given an exhibition exists, when Organizer adds supported field types, then a form schema is saved | too many fields, invalid field settings, removed required field | Supported field types stay constrained for feasibility |
| ORG-03 | Organizer can review registrations | Given submissions exist, when Organizer opens review queue, then registrations can be filtered and status updated | no submissions, canceled visitor, export later | Review statuses: pending, approved, rejected, attended |

## Foundation

| ID | Requirement | Acceptance Criteria | Edge States | Notes |
|----|-------------|---------------------|-------------|-------|
| INFRA-01 | Mobile app baseline exists | Given the repo is set up, when mobile app runs, then primary navigation and token system exist | package install issues | Already scaffolded in v1.0 |
| INFRA-02 | API baseline exists | Given API is started, when health and starter endpoints are called, then responses are returned | env missing, prisma generate skipped | Already scaffolded in v1.0 |
| INFRA-03 | CI baseline exists | Given code changes are pushed, when CI runs, then lint/test/build pipeline executes | missing secrets not required for baseline | Already scaffolded in v1.0 |

## Design Constraints for This Milestone

- Keep all primary flows under 4 taps from entry to main outcome.
- Prefer bottom navigation and obvious CTAs over hidden menus.
- Use English UI copy for wireframe pack consistency.
- Preserve room for future features by using modular screen sections instead of overly specialized layouts.
