/**
 * Vitest setup: ensure required env exists before importing app modules.
 */
process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??=
  "mysql://health_fitness:health_fitness@127.0.0.1:3306/health_fitness_test";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-min-16-chars!!";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-min-16-chars!!";
