# Phase 1 Context: Route-to-Screen Contract and Design System

## Goal

Create the canonical route-to-screen contract for the full mobile app and define the shared high-fidelity Pen system that every new screen must follow.

## Inputs

- `apps/mobile/src/navigation/AppNavigator.tsx`
- implemented Visitor and Organizer screens under `apps/mobile/src/screens/`
- the 5 original high-fidelity sample frames in `project.pen`
- the archived v1.1 mid-fi board in `project.pen`

## Locked Decisions

- The current code is not the design source of truth yet; Pen must catch up first.
- Existing high-fidelity frames should be refined or derived from, not visually contradicted.
- Shared patterns must be explicit before new screens are drawn: top app bar, bottom nav, hero treatment, form blocks, list cards, state/notice modules.

## Expected Output

- Route inventory mapped to canonical high-fidelity Pen screens
- Keep/refine/derive decisions for the 5 original frames
- Shared design rules that phases 2 and 3 can apply without reopening visual direction