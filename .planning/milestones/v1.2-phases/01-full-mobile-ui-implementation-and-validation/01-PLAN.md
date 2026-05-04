# Plan 01-01: Rebuild Expo Mobile UI

## Outcome

Ship a high-fidelity Expo UI pass that covers login, discovery, detail, registration, feedback, passport, dashboard, exhibition editing, form builder, submission review, and profile states for both roles.

## Tasks

1. Replace the design tokens and screen shell so every screen inherits the same visual language.
2. Expand mock domain models to represent the missing registration, review, form-builder, and submission states.
3. Rebuild navigation with separate Visitor and Organizer tab shells plus focused stack screens.
4. Implement the missing screens and upgrade the existing ones from placeholder cards to full-flow UI.
5. Validate the edited surface with TypeScript/IDE diagnostics and refresh planning state.

## Validation Target

- `pnpm --filter @arthera/mobile exec tsc --noEmit -p tsconfig.json`
- IDE diagnostics for edited mobile files