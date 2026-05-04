# Information Architecture Map

## Screen Inventory

| Bucket | Screen | Purpose | Covers |
|--------|--------|---------|--------|
| Shared | Login Entry | Register/login and pick role context | AUTH-01, AUTH-02 |
| Shared | Profile | Basic user account summary and role tools | AUTH-03 |
| Visitor | Gallery Home | Browse, filter, and sort exhibitions | GALL-01, GALL-02 |
| Visitor | Gallery Detail | Inspect artwork/event details | GALL-03 |
| Visitor | Event Registration | Submit attendance form | GALL-04 |
| Visitor | Passport Vault | See stamp progress and achievements | PASS-01, PASS-02 |
| Visitor | Rating & Comment | Leave post-visit feedback | COMM-01, COMM-02 |
| Organizer | Organizer Dashboard | Entry point for managing exhibitions and submissions | ORG-03 |
| Organizer | Create/Edit Exhibition | Define exhibition metadata and media | ORG-01 |
| Organizer | Form Builder | Build registration schema | ORG-02 |
| Organizer | Submission Review | Approve/reject/mark attendance | ORG-03 |

## Navigation Tree

```text
App Entry
└── Login Entry
    ├── Visitor Shell
    │   ├── Gallery Home
    │   │   └── Gallery Detail
    │   │       ├── Event Registration
    │   │       └── Rating & Comment
    │   ├── Passport Vault
    │   └── Profile
    └── Organizer Shell
        ├── Organizer Dashboard
        │   ├── Create/Edit Exhibition
        │   │   └── Form Builder
        │   └── Submission Review
        └── Profile
```

## Architectural Notes

- Visitor shell should keep the most common outcomes visible from first launch.
- Organizer shell should land on action-oriented dashboard cards instead of dense navigation menus.
- Rating & Comment is a child flow from attended gallery context, not a primary tab.
- Form Builder is nested under a specific exhibition, not global settings.
