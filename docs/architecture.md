# Health Fitness App Architecture

## Scope
Production-oriented MVP in 3-4 months:
- Mobile: React Native + Expo + TypeScript
- API: Node.js + Express + TypeScript
- Database: MySQL 8
- Async jobs: Redis queue + worker

## High-Level Design
- `mobile`: user interactions, local cache, offline draft queue.
- `backend`: REST API, auth, domain services, validation.
- `worker`: reminder dispatch and progress aggregation jobs.
- `mysql`: source of truth for users, logs, goals, reminders.
- `redis`: queue and ephemeral task state.

## Domain Modules
- `auth`: register/login/refresh/logout.
- `users`: profile and goals management.
- `workouts`: plans, sessions, sets, history.
- `nutrition`: meal logs, food catalog, macro totals.
- `body-metrics`: weight and body composition logs.
- `progress`: daily aggregation and trend views.
- `reminders`: schedule and delivery lifecycle.

## Backend Folder Blueprint
```txt
backend/
  src/
    modules/
      auth/
      users/
      workouts/
      nutrition/
      body-metrics/
      progress/
      reminders/
    jobs/
    shared/
      config/
      errors/
      logger/
      middleware/
      validation/
```

## Mobile Folder Blueprint
```txt
mobile/
  src/
    features/
      auth/
      workouts/
      nutrition/
      metrics/
      progress/
      reminders/
    core/
      api/
      navigation/
      storage/
      ui-states/
```

## API Principles
- Prefix all routes with `/api/v1`.
- Validate input before service execution.
- Enforce a single error response contract:
  - `code`
  - `message`
  - `details` (optional)
  - `requestId`
- Keep controllers thin and side-effect free except request orchestration.

## Data Principles
- MySQL stores canonical business data.
- Use normalized tables with explicit foreign keys and indices.
- Aggregate data into `daily_progress` via worker job, not during every request.
- Keep audit-friendly timestamps (`created_at`, `updated_at`) on mutable entities.

## Reliability and Security
- JWT access token + refresh token rotation.
- Hash passwords with bcrypt or argon2.
- Rate-limit auth and write-heavy endpoints.
- Use env-based configuration and secret management.
- Add structured logs and trace ids for API and workers.

## Scale Path After MVP
- Add health provider adapters (Apple Health/Google Fit) as separate modules.
- Add read optimization (materialized summary tables or cache) for dashboard-heavy usage.
- Split reminders/progress into dedicated services only when monolith throughput becomes a bottleneck.
