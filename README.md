# Health Fitness Monorepo

Phase 0 scaffold: React Native (Expo) + Express (TypeScript) + MySQL (Prisma) + shared types.

## Structure

- `mobile/` — Expo app (`src/features/*`, `src/core/*`)
- `backend/` — Express API (`src/modules/*`)
- `shared/` — shared TypeScript contracts (`@health-fitness/shared`)
- `worker/` — reserved for background jobs (not wired in Phase 0)

## Prerequisites

- Node.js 20+
- MySQL 8 (local install or Docker)

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
