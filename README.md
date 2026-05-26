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
- `ARTHERA_PERSISTENCE_DRIVER`: optional override. Leave it empty for normal Prisma/Neon persistence, or set it to `memory` when you want to force fully local in-memory state even if `DATABASE_URL` exists.
- `ARTHERA_DEMO_VISITOR_PASSWORD`: optional seed password for `visitor@arthera.local`
- `ARTHERA_DEMO_ORGANIZER_PASSWORD`: optional seed password for `organizer@arthera.local`

### Mobile envs used now

- `EXPO_PUBLIC_API_URL`: base API origin used by the mobile fetch client. The app automatically appends `/api` when needed.

### Prepare now for deployment and storage phases

- Fly.io API hosting: `API_PUBLIC_URL`, `ALLOWED_ORIGINS`
- Google OAuth on the API side: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`
- Cloudflare R2: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_REGION`, `R2_ENDPOINT`
- Optional R2/public-CDN metadata: `R2_ACCOUNT_ID`, `R2_PUBLIC_BASE_URL`
- Google OAuth on Expo/mobile: `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

The API now persists its runtime state into Neon through Prisma whenever `DATABASE_URL` is present, so auth accounts, drafts, registrations, reviews, stamps, and comments survive process restarts. The Fly, R2, and Google OAuth values are documented now so deployment and later phases can use a stable naming scheme.

### Prisma bootstrap

- Initialize or refresh the Neon schema and baseline seed with `pnpm --filter @arthera/api prisma:bootstrap`
- The seed writes a full app-state snapshot to Neon so the existing mobile and API flows keep working without rewriting every business rule around raw SQL tables yet

## Production Delivery

### Fly.io API deployment

- The repo now includes [fly.toml](fly.toml) and [Dockerfile.fly](Dockerfile.fly) for a single production API environment on Fly.io.
- The deploy workflow is [deploy-api-fly.yml](.github/workflows/deploy-api-fly.yml) and triggers on pushes to `main` or `master` when API files change.
- The workflow expects these GitHub repository settings:
	- Secret: `FLY_API_TOKEN`
	- Secret: `DATABASE_URL`
	- Variable: `FLY_API_APP_NAME`
- Before Fly deploy, the workflow now runs `pnpm --filter @arthera/api prisma:bootstrap` so Neon schema and baseline data are created automatically for the single production environment.
- The Fly runtime itself needs these secrets set with `fly secrets set ...`:
	- `DATABASE_URL`
	- `JWT_SECRET`
	- `ARTHERA_DEMO_VISITOR_PASSWORD` optional
	- `ARTHERA_DEMO_ORGANIZER_PASSWORD` optional
- `PORT` is supplied by [fly.toml](fly.toml) as a non-secret runtime env and the health check hits `/api/health`.

### Expo / EAS mobile builds

- The Expo production build profile now lives in [apps/mobile/eas.json](apps/mobile/eas.json).
- The Expo project metadata now lives with the real app config in [apps/mobile/app.json](apps/mobile/app.json), not only in the accidental root-level `app.json` created earlier by `eas init`.
- The mobile release workflow is [mobile-production.yml](.github/workflows/mobile-production.yml) and is manual by design to avoid burning EAS quota on every commit.
- The workflow expects this GitHub repository secret:
	- `EXPO_TOKEN`
- The EAS `production` environment should contain these project variables:
	- `EXPO_PUBLIC_API_URL` required, for example `https://<your-fly-app>.fly.dev`
	- `EXPO_PUBLIC_API_ORIGIN` optional today, useful for future web/deep-link alignment
	- `EXPO_PUBLIC_APP_SCHEME` optional today, defaults to the static `arthera` scheme already committed in app config
	- `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` optional until real Google OAuth is wired
	- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` optional until real Google OAuth is wired
	- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` optional until real Google OAuth is wired
	- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` optional until real Google OAuth is wired

### Store credentials

- For EAS Build only, GitHub does not need your Android keystore or Apple certificates if you let Expo manage credentials.
- For later automatic store submission, prepare these outside the repo:
	- Google Play Developer account and service account JSON for Play submission
	- Apple Developer account and App Store Connect API key for TestFlight/App Store submission

## Fake Google Auth And Role Switching

- The current demo Google flow is intentionally fake: [LoginEntryScreen.tsx](apps/mobile/src/screens/LoginEntryScreen.tsx) sends the selected workspace role together with a demo Google identity to the backend bootstrap route.
- If the user does not type an email, the app now falls back to `demo.google@arthera.local`, so tapping the Google button is enough for demo access.
- Role selection at sign-in time still comes from the Visitor/Organizer workspace cards on the login screen.
- The app already supports switching the active role later from the profile screen without creating a second account.

## Asset And Storage Reality

- Cloudflare R2 is now wired into the runtime through `/api/assets/images` for upload and `/api/assets/object?key=...` for read-back.
- Organizer exhibition media uploads from the exhibition studio now write the selected image to R2 and append the returned asset path into `mediaUrls`.
- Visitor and organizer profile photo uploads now write to R2 and persist the avatar path in the Neon-backed runtime state.
- Visitor gallery cards, map cards, and exhibition detail screens now render the first uploaded exhibition image when a stored asset path is available.
- The API can proxy private R2 objects, so `R2_PUBLIC_BASE_URL` is optional unless you later move to a public CDN/domain strategy.

## Demo Script

- Use the role-by-role demo walkthrough in [docs/demo-script.md](docs/demo-script.md).

## Validation

Run the full repo validation from the root:

```bash
npm run build
npm run test
```

## Design Source

The product flow and screen direction are anchored to `project.pen`, including the login entry, organizer tools, stamp vault, gallery home, exhibition details, and discover map flow.
