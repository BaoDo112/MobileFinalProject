# Organizer Wireframe Pack

## Board Reference

- Pencil file: `d:\2026\MobileFinalProject\project.pen`
- Master board: `TJjfV` (`v1.1 Mid-Fi Wireframes`)

## Organizer Screens

| Screen | Node ID | Purpose | Covers | Key States |
|--------|---------|---------|--------|------------|
| O01 Organizer Dashboard | `zTHfB` | Show drafts, active exhibitions, and pending work | ORG-03 | first-time empty, active list, pending reviews, fetch error |
| O02 Create Exhibition | `jXv35` | Capture exhibition metadata and submission intent | ORG-01 | draft, invalid required field, saved, submitted |
| O03 Form Builder | `CzTuC` | Build the visitor registration schema | ORG-02 | blank form, editing, invalid config, published |
| O04 Published Exhibition | `I0P1cA` | Confirm a live exhibition and expose quick actions | ORG-01, ORG-02 | published, edit pending, closed, publish failure |
| O05 Submission Review | `Vz41P` | Review and update visitor registration states | ORG-03 | empty queue, pending list, decision success, update error |
| O06 Attendance & Stamp Trigger | `Ejnry` | Confirm attendance and unlock the Visitor stamp path | ORG-03, PASS-01 | pending attendance, attended, duplicate update, sync error |

## Organizer UX Rules Locked in Wireframes

- Dashboard starts action-first instead of report-heavy.
- Form building stays constrained to a small supported field library.
- Review and attendance remain separate but adjacent operational steps.
- Stamp issuance is modeled as a downstream result of attendance confirmation.
