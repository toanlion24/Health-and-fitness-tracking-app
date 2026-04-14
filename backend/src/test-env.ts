/**
 * Vitest setup: ensure required env exists before importing app modules.
 * Override `DATABASE_URL` in the shell when pointing at a dedicated test DB.
 * Integration tests (`RUN_INTEGRATION=1`) expect a migrated schema + seed data.
 */
process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??=
  "mysql://health_fitness:health_fitness@127.0.0.1:3306/health_fitness_test";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-min-16-chars!!";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-min-16-chars!!";
