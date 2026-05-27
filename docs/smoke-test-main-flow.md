# Smoke Test Main Flow

Date: 2026-05-27
Target: http://localhost:8082/

## Result

- Pass: Organizer created and published a new exhibition.
- Pass: Visitor registered successfully through the direct booking form.
- Pass: Organizer opened the review board and checked in the attendee.
- Pass: Visitor stamp appeared in Vault after check-in.

## Created Exhibition

- Title: Smoke Flow Atlas 1779842394311
- Venue: Cedar House Courtyard
- Session: Jun 10, 2026 · 11:00 AM - 12:15 PM

## Slide Assets

- `images/key-feature-direct-prebooking.png`
- `images/key-feature-stamps-digital-passport.png`
- `images/key-feature-map-location-web-fallback.png`

## Workflow Screens

Organizer:
- `images/workflow-organizer-01-dashboard.png`
- `images/workflow-organizer-02-editor.png`
- `images/workflow-organizer-03-form-builder.png`
- `images/workflow-organizer-04-ready-to-publish.png`
- `images/workflow-organizer-05-queue.png`
- `images/workflow-organizer-06-review-checkin.png`

Visitor:
- `images/workflow-visitor-01-gallery-future.png`
- `images/workflow-visitor-02-detail.png`
- `images/workflow-visitor-03-registration-confirmed.png`
- `images/workflow-visitor-04-vault-stamp.png`

## Note

- The web build does not render the embedded map. On web, the product intentionally shows a fallback message and venue address instead. `images/key-feature-map-location-web-fallback.png` is a temporary web-safe placeholder, not a true embedded map capture.