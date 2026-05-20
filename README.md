# Arthera Mobile Final Project

Arthera is a graduation project for gallery visitors and exhibition organizers. The repo is a pnpm monorepo with an Expo mobile app and a NestJS API.

## Stack

- Mobile: Expo React Native + Expo Go in `apps/mobile`
- Backend: NestJS + Prisma in `apps/api`
- Database: Neon Postgres via `DATABASE_URL`
- Planned hosting: Fly.io for the API, Cloudflare R2 for object storage
- Design authority: `project.pen`

## Workspace Structure

- `apps/mobile`: Expo app for visitor and organizer flows
- `apps/api`: NestJS API, auth bootstrap, and Prisma schema
- `.planning`: GSD roadmap, state, and phase plans

## Quick Start

1. Install dependencies.

```bash
pnpm install
```

2. Create local env files.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

3. Set the mobile API URL.

- For an Android emulator, `http://10.0.2.2:3000` usually reaches the local API.
- For Expo Go on a physical device, use your computer's LAN IP, for example `http://192.168.1.20:3000`.
- For a deployed backend on Fly, use your public HTTPS origin, for example `https://arthera-api.fly.dev`.

4. Start the stack from the repo root.

```bash
npm run dev
```

Use this instead when you want Expo Go to expose a QR code over a tunnel:

```bash
npm run dev:go
```

After `pnpm install`, you can use either `npm run ...` or `pnpm ...` at the repo root. The scripts themselves delegate to pnpm workspaces.

## Root Scripts

- `npm run dev`: run API and mobile together
- `npm run dev:go`: run API and mobile together with Expo tunnel mode for Expo Go scanning
- `npm run dev:api`: run only the NestJS API
- `npm run dev:mobile`: run only the Expo app
- `npm run build`: run all workspace build checks
- `npm run build:api`: build only the API
- `npm run build:mobile`: run the mobile TypeScript validation
- `npm run test`: run all unit and integration tests
- `npm run test:unit`: run API + mobile unit tests only
- `npm run test:integration`: run API + mobile integration tests only
- `npm run test:api`: run the full API test suite
- `npm run test:mobile`: run the full mobile test suite

## Environment Setup

### API envs used now

- `PORT`: NestJS server port, default `3000`
- `JWT_SECRET`: signing secret for the current auth session tokens
- `DATABASE_URL`: Neon Postgres connection string
- `ARTHERA_DEMO_VISITOR_PASSWORD`: optional seed password for `visitor@arthera.local`
- `ARTHERA_DEMO_ORGANIZER_PASSWORD`: optional seed password for `organizer@arthera.local`

### Mobile envs used now

- `EXPO_PUBLIC_API_URL`: base API origin used by the mobile fetch client. The app automatically appends `/api` when needed.

### Prepare now for upcoming deployment and storage phases

- Fly.io API hosting: `API_PUBLIC_URL`, `ALLOWED_ORIGINS`
- Google OAuth on the API side: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`
- Cloudflare R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_REGION`, `R2_ENDPOINT`, `R2_PUBLIC_BASE_URL`
- Google OAuth on Expo/mobile: `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

The current codebase only reads the Phase 1 envs directly. The Fly, R2, and Google OAuth values are documented now so deployment and later phases can use a stable naming scheme.

## Validation

Run the full repo validation from the root:

```bash
npm run build
npm run test
```

## Design Source

The product flow and screen direction are anchored to `project.pen`, including the login entry, organizer tools, stamp vault, gallery home, exhibition details, and discover map flow.
