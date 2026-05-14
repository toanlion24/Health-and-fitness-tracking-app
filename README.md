# Health Fitness Monorepo

Mobile: auth and onboarding, then main tabs (Home, Workout, Nutrition, Progress, Profile) with feature stacks wired in `mobile/src/core/navigation`. Backend covers workouts, nutrition, body metrics, progress, reminders, and auth under `/api/v1`. For a maintained list of screens and files, see [`docs/file-links-and-functions.md`](docs/file-links-and-functions.md).

## Structure

- `mobile/` — Expo app (`src/features/*`, `src/core/*`)
- `backend/` — Express API (`src/modules/*`)
- `shared/` — shared TypeScript contracts (`@health-fitness/shared`)
- `worker/` — reserved for background jobs (not wired in Phase 0)

## Prerequisites

- Node.js 20+
- MySQL 8 (local install or Docker)

## Tech Stack Versions

This section lists the versions currently used in this repository so everyone can align local setup quickly.

### Runtime and workspace

- Node.js: `>=20` (from root `engines`)
- npm workspaces: `mobile`, `backend`, `shared`
- Docker Compose: used to run MySQL locally (`docker compose up -d mysql`)

### Backend (`backend/`)

- TypeScript: `~5.9.2`
- Express: `^4.21.2`
- Prisma ORM and Client: `^6.19.0`
- MySQL: `8.x` (from local install or Docker image in `docker-compose.yml`)
- Validation: Zod `^3.24.2`
- Auth: jsonwebtoken `^9.0.2`, bcrypt `^5.1.1`
- Logger: pino `^9.6.0`
- Test: Vitest `^3.0.2`, Supertest `^7.0.0`

### Mobile (`mobile/`)

- Expo SDK: `~54.0.33`
- React: `19.1.0`
- React Native: `0.81.5`
- React Navigation: `@react-navigation/native ^7.2.2`, `@react-navigation/stack ^7.4.10`
- State management: Zustand `^5.0.12`
- Secure token storage: `expo-secure-store ~15.0.8`
- Web support: `react-dom 19.1.0`, `react-native-web ^0.21.0`

### Shared package (`shared/`)

- Package: `@health-fitness/shared` (workspace package)
- TypeScript: `~5.9.2`

## Database (Docker)

```bash
docker compose up -d mysql
```

Copy `backend/.env.example` to `backend/.env` and adjust `DATABASE_URL` if needed.

Run migrations:

```bash
cd backend
npx prisma migrate deploy
```

## Backend

```bash
npm run dev:backend
```

Health check: `GET http://127.0.0.1:3000/api/v1/health`

## Mobile

Copy `mobile/.env.example` to `mobile/.env` (Expo reads env at build time).

```bash
npm run dev:mobile
```

On Android emulator, `127.0.0.1` points to the emulator itself. Use `10.0.2.2` (Android) or your LAN IP for a machine-hosted API.

## Scripts

- `npm run build:shared` — build shared package
- `npm run lint` — run lint for backend/mobile/shared
- `npm run typecheck` — run TypeScript checks for all workspaces
- `npm run format:check` — check formatting with Prettier
- `npm run dev:backend` — start API in watch mode
- `npm run dev:mobile` — start Expo
- `npm run test:backend` — run backend tests

Pre-commit hook is enabled with Husky + lint-staged:

- staged files are formatted by Prettier
- TypeScript source in `backend/src`, `mobile/src`, `shared/src` is linted before commit

## API docs

See `backend/openapi/openapi.yaml`.

## DB migration v1

Baseline migration notes and commands:

- `backend/prisma/MIGRATION_V1.md`

## Additional docs

- **Chức năng & cài đặt (tiếng Việt):** [`docs/CHUC_NANG_VA_CAI_DAT.md`](docs/CHUC_NANG_VA_CAI_DAT.md)
- Run guide: [`docs/run-project-guide.md`](docs/run-project-guide.md)
- Screen and file map: [`docs/file-links-and-functions.md`](docs/file-links-and-functions.md)
