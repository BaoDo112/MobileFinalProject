# End-to-End Flow Map

## Visitor Main Flow

1. **Login Entry**
Action: register/login and choose Visitor role.
States: idle, validation error, auth success, auth failure.

2. **Gallery Home**
Action: browse present exhibitions by default, filter/sort as needed.
States: loading, empty results, filtered results, network error.

3. **Gallery Detail**
Action: inspect event information, open map, check artists, tap register.
States: full content, missing image, no registration available, map-open fallback.

4. **Event Registration**
Action: fill dynamic form and submit.
States: draft editing, invalid field, submit success, submit duplicate, event closed.

5. **Passport Vault**
Action: review unlocked and locked stamps.
States: zero stamps, some unlocked, milestone unlocked, all completed.

6. **Rating & Comment**
Action: rate and comment after participation.
States: locked until eligible, first submission, edit attempt, success, moderation/error fallback.

## Organizer Main Flow

1. **Login Entry**
Action: register/login and choose Organizer role.
States: idle, validation error, auth success, auth failure.

2. **Organizer Dashboard**
Action: see exhibition counts, shortcuts, and pending registrations.
States: first-time empty dashboard, active exhibitions, pending reviews, no submissions.

3. **Create/Edit Exhibition**
Action: enter title, type, bio, media, dates, and address.
States: draft, missing required field, saved draft, submitted, published, closed.

4. **Form Builder**
Action: add/edit/remove supported form fields and publish form schema.
States: blank form, editing, invalid field config, published form.

5. **Submission Review**
Action: review submissions, approve/reject, mark attendance.
States: empty queue, pending queue, filtered queue, approval success, rejection success, update failure.

## Cross-Screen State Matrix

| State Type | Where It Must Exist |
|------------|---------------------|
| Loading | Gallery Home, Gallery Detail, Event Registration, Dashboard, Submission Review |
| Empty | Gallery Home filters, Passport Vault, Dashboard, Submission Review |
| Validation Error | Login Entry, Event Registration, Create/Edit Exhibition, Form Builder |
| Success | Auth success, Registration success, Stamp unlocked, Exhibition saved/published, Review updated |
| System Error | Auth failure, content fetch failure, submission failure, publish failure |

## Flow Principle

Every core user outcome should be reachable without hidden navigation and recoverable when errors occur.
