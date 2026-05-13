# Arthera Mobile Final Project

Arthera is a graduation mobile project for gallery visitors and exhibition organizers.

## Stack

- Mobile: Expo React Native + Expo Go (`apps/mobile`)
- Backend: NestJS + Prisma (`apps/api`)
- Database: Neon (PostgreSQL via `DATABASE_URL`)
- CI/CD: GitHub Actions (`.github/workflows/ci.yml`)

## Workspace Structure

- `apps/mobile`: React Native app with visitor and organizer UI flows
- `apps/api`: NestJS API with Prisma schema and feature modules
- `.planning`: GSD planning artifacts (project, requirements, roadmap, phases)

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Setup API env:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Run backend:

```bash
pnpm dev:api
```

4. Run mobile app:

```bash
pnpm dev:mobile
```

## Design Source

The initial screen direction is based on `project.pen` (Pencil design draft), mapped to these screens:

- Login Entry
- Organizer Tools
- Stamp Vault
- Gallery Home
- Exhibition Details

### Recent Updates
- Mapped 'Discover' tab to a dedicated DiscoverMapScreen UI utilizing react-native-maps. Implemented Google Map style interface as conceptualized in the design system.
