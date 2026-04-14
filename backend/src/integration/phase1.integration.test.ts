/**
 * Integration tests against a real MySQL database (JWT + Prisma).
 *
 * Skipped unless `RUN_INTEGRATION=1` (avoids failing CI when `health_fitness_test`
 * is missing). To run locally:
 * - Create DB + migrate: same migrations as dev, pointed at your test database.
 * - `RUN_INTEGRATION=1 npm run test:integration` (see backend/package.json).
 */
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../shared/db/prisma.js";

const app = createApp();

function todayUtc(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("Phase 1 API (integration, DB)", () => {
  const email = `integration-${Date.now()}@test.local`;
  const password = "test-password-16chars";

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.exerciseCatalog.findFirstOrThrow();
  }, 60_000);

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it(
    "runs auth → workouts → nutrition → body-metrics flow",
    async () => {
      const reg = await request(app).post("/api/v1/auth/register").send({
        email,
        password,
      });
      expect(reg.status).toBe(201);
      const accessToken = reg.body.tokens.accessToken as string;
      expect(accessToken.length).toBeGreaterThan(10);

      const exRes = await request(app)
        .get("/api/v1/exercises")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(exRes.status).toBe(200);
      const exerciseId = exRes.body[0].id as number;

      const sRes = await request(app)
        .post("/api/v1/workout-sessions")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          sessionDate: todayUtc(),
          notes: "integration",
        });
      expect(sRes.status).toBe(201);
      const sessionId = sRes.body.id as number;

      const setRes = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/sets`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          exerciseId,
          setIndex: 1,
          actualReps: 8,
          actualWeightKg: 40,
        });
      expect(setRes.status).toBe(200);

      const doneRes = await request(app)
        .patch(`/api/v1/workout-sessions/${sessionId}/complete`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});
      expect(doneRes.status).toBe(200);
      expect(doneRes.body.status).toBe("completed");

      const foods = await request(app)
        .get("/api/v1/foods")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(foods.status).toBe(200);
      const foodId = foods.body[0].id as number;

      const mealRes = await request(app)
        .post("/api/v1/meal-logs")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          mealType: "lunch",
          loggedAt: new Date().toISOString(),
        });
      expect(mealRes.status).toBe(201);
      const mealId = mealRes.body.id as number;

      const itemRes = await request(app)
        .post(`/api/v1/meal-logs/${mealId}/items`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          foodId,
          quantity: 1,
        });
      expect(itemRes.status).toBe(201);

      const bmCreate = await request(app)
        .post("/api/v1/body-metrics")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          recordedAt: new Date().toISOString(),
          weightKg: 70.5,
        });
      expect(bmCreate.status).toBe(201);

      const bmList = await request(app)
        .get(`/api/v1/body-metrics?from=2020-01-01&to=${todayUtc()}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(bmList.status).toBe(200);
      expect(bmList.body.length).toBeGreaterThan(0);
    },
    60_000,
  );
});
