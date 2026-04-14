# Health Fitness Monorepo

Current scope: Phase 0 (auth, profile) + Phase 1 (workouts, nutrition, body metrics).

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
- `npm run dev:backend` — start API in watch mode
- `npm run dev:mobile` — start Expo
- `npm run test:backend` — run backend tests

## API docs

See `backend/openapi/openapi.yaml`.

## Additional docs

- Run guide: `docs/run-project-guide.md`

## Result Images

Two screenshots used for report:

![Result 1](image%20of%20results/z7724339420780_508df6150f285cde013626a4f369c707.jpg)
![Result 2](image%20of%20results/z7724339424752_6338ad113c96a3821c847349d326bafc.jpg)
