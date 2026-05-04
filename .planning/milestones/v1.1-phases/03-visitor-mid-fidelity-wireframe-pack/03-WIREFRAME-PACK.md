# Visitor Wireframe Pack

## Board Reference

- Pencil file: `d:\2026\MobileFinalProject\project.pen`
- Master board: `TJjfV` (`v1.1 Mid-Fi Wireframes`)

## Visitor Screens

| Screen | Node ID | Purpose | Covers | Key States |
|--------|---------|---------|--------|------------|
| V01 Login Entry | `B55iQ` | Authenticate and confirm Visitor role | AUTH-01, AUTH-02 | idle, validation error, auth failure, auth success |
| V02 Gallery Home | `cIdOg` | Browse exhibitions and apply filters | GALL-01, GALL-02 | loading, filtered list, empty results, network error |
| V03 Gallery Detail | `JmIps` | Explain exhibition details and support decision-making | GALL-03 | content loaded, missing image, no seats, map fallback |
| V04 Event Registration | `wo1U0` | Collect visitor details using a dynamic form | GALL-04 | draft, invalid field, duplicate registration, success |
| V05 Passport Vault | `VG64H` | Show progression and unlocked/locked stamp states | PASS-01, PASS-02 | zero stamps, partial progress, milestone unlocked, complete set |
| V06 Rating & Comment | `gR9Ca` | Capture post-visit satisfaction and written feedback | COMM-01, COMM-02 | locked, first review, success, moderation fallback |

## Visitor UX Rules Locked in Wireframes

- Filters are always visible and reversible.
- Registration stays tied to the exhibition detail context.
- Review actions remain locked until participation is confirmed.
- Stamp progression is visible even when the vault is partially empty.
