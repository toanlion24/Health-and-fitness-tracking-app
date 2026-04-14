import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("Phase 1 protected routes", () => {
  it("GET /api/v1/exercises without auth returns 401", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/exercises");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
    expect(res.body.requestId).toBeDefined();
  });

  it("GET /api/v1/foods without auth returns 401", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/foods");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/body-metrics without auth returns 401", async () => {
    const app = createApp();
    const res = await request(app).get(
      "/api/v1/body-metrics?from=2026-01-01&to=2026-01-31",
    );
    expect(res.status).toBe(401);
  });
});
