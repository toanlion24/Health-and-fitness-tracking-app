import { describe, expect, it, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import {
  listBodyMetrics,
  createBodyMetric,
  getBodyMetric,
  patchBodyMetric,
  deleteBodyMetric,
} from "./body-metrics.service.js";
import { AppError } from "../../shared/errors/app-error.js";

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    bodyMetricLog: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Body Metrics Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── listBodyMetrics ───────────────────────────────────────────────────────

  describe("listBodyMetrics", () => {
    it("returns metrics within date range ordered ascending", async () => {
      const rows = [
        {
          id: 1,
          userId: 1,
          recordedAt: new Date("2026-01-01T10:00:00Z"),
          weightKg: new Decimal("75.5"),
          bodyFatPct: null,
          waistCm: null,
          notes: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          recordedAt: new Date("2026-01-05T10:00:00Z"),
          weightKg: new Decimal("74.8"),
          bodyFatPct: new Decimal("18.0"),
          waistCm: new Decimal("80.0"),
          notes: "After vacation",
          createdAt: new Date(),
        },
      ];
      vi.mocked(mockPrisma.bodyMetricLog.findMany).mockResolvedValue(rows as any);

      const result = await listBodyMetrics(1, {
        from: "2026-01-01",
        to: "2026-01-31",
      });

      expect(result).toHaveLength(2);
      expect(result[0].weightKg).toBe("75.5");
      expect(result[1].bodyFatPct).toBe("18");
      expect(mockPrisma.bodyMetricLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          recordedAt: {
            gte: new Date("2026-01-01T00:00:00.000Z"),
            lte: new Date("2026-01-31T23:59:59.999Z"),
          },
        },
        orderBy: { recordedAt: "asc" },
      });
    });

    it("returns empty array when no metrics in range", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.findMany).mockResolvedValue([]);

      const result = await listBodyMetrics(1, {
        from: "2026-01-01",
        to: "2026-01-31",
      });

      expect(result).toEqual([]);
    });

    it("serializes Decimal fields to strings", async () => {
      const rows = [
        {
          id: 1,
          userId: 1,
          recordedAt: new Date("2026-01-01T10:00:00Z"),
          weightKg: new Decimal("80.00"),
          bodyFatPct: new Decimal("20.50"),
          waistCm: new Decimal("85.5"),
          notes: null,
          createdAt: new Date(),
        },
      ];
      vi.mocked(mockPrisma.bodyMetricLog.findMany).mockResolvedValue(rows as any);

      const result = await listBodyMetrics(1, {
        from: "2026-01-01",
        to: "2026-01-31",
      });

      expect(typeof result[0].weightKg).toBe("string");
      expect(result[0].weightKg).toBe("80");
    });
  });

  // ─── createBodyMetric ──────────────────────────────────────────────────────

  describe("createBodyMetric", () => {
    it("creates metric with all fields", async () => {
      const now = new Date("2026-01-01T10:00:00Z");
      vi.mocked(mockPrisma.bodyMetricLog.create).mockResolvedValue({
        id: 1,
        userId: 5,
        recordedAt: now,
        weightKg: new Decimal("72.5"),
        bodyFatPct: new Decimal("15.0"),
        waistCm: new Decimal("78.0"),
        notes: "Morning weigh-in",
        createdAt: now,
      } as any);

      const result = await createBodyMetric(5, {
        recordedAt: "2026-01-01T10:00:00.000Z",
        weightKg: 72.5,
        bodyFatPct: 15.0,
        waistCm: 78.0,
        notes: "Morning weigh-in",
      });

      expect(result.weightKg).toBe("72.5");
      expect(result.bodyFatPct).toBe("15");
      expect(result.waistCm).toBe("78");
      expect(mockPrisma.bodyMetricLog.create).toHaveBeenCalledWith({
        data: {
          userId: 5,
          recordedAt: expect.any(Date),
          weightKg: expect.any(Decimal),
          bodyFatPct: expect.any(Decimal),
          waistCm: expect.any(Decimal),
          notes: "Morning weigh-in",
        },
      });
    });

    it("creates metric with only weightKg when other fields omitted", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.create).mockResolvedValue({
        id: 2,
        userId: 5,
        recordedAt: new Date(),
        weightKg: new Decimal("71.0"),
        bodyFatPct: null,
        waistCm: null,
        notes: null,
        createdAt: new Date(),
      } as any);

      const result = await createBodyMetric(5, {
        recordedAt: "2026-01-01T10:00:00.000Z",
        weightKg: 71.0,
      });

      expect(result.weightKg).toBe("71");
      expect(result.bodyFatPct).toBeNull();
      expect(result.waistCm).toBeNull();
    });

    it("handles null values explicitly passed for optional fields", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.create).mockResolvedValue({
        id: 3,
        userId: 5,
        recordedAt: new Date(),
        weightKg: null,
        bodyFatPct: new Decimal("20.0"),
        waistCm: null,
        notes: null,
        createdAt: new Date(),
      } as any);

      const result = await createBodyMetric(5, {
        recordedAt: "2026-01-01T10:00:00.000Z",
        bodyFatPct: 20.0,
      });

      expect(result.weightKg).toBeNull();
      expect(result.bodyFatPct).toBe("20");
      expect(result.waistCm).toBeNull();
    });
  });

  // ─── getBodyMetric ─────────────────────────────────────────────────────────

  describe("getBodyMetric", () => {
    it("returns metric when found for user", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        recordedAt: new Date(),
        weightKg: new Decimal("70.0"),
        bodyFatPct: null,
        waistCm: null,
        notes: null,
        createdAt: new Date(),
      } as any);

      const result = await getBodyMetric(1, 1);

      expect(result.id).toBe(1);
      expect(result.weightKg).toBe("70");
    });

    it("throws 404 when metric not found", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);

      await expect(getBodyMetric(1, 999)).rejects.toThrow(AppError);
    });
  });

  // ─── patchBodyMetric ───────────────────────────────────────────────────────

  describe("patchBodyMetric", () => {
    it("updates weightKg when provided", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        recordedAt: new Date(),
        weightKg: new Decimal("70.0"),
        bodyFatPct: null,
        waistCm: null,
        notes: null,
        createdAt: new Date(),
      } as any);
      vi.mocked(mockPrisma.bodyMetricLog.update).mockResolvedValue({
        id: 1,
        userId: 1,
        recordedAt: new Date(),
        weightKg: new Decimal("69.5"),
        bodyFatPct: null,
        waistCm: null,
        notes: null,
        createdAt: new Date(),
      } as any);

      const result = await patchBodyMetric(1, 1, { weightKg: 69.5 });

      expect(mockPrisma.bodyMetricLog.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          weightKg: expect.any(Decimal),
        },
      });
    });

    it("can set weightKg back to null", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        recordedAt: new Date(),
        weightKg: new Decimal("70.0"),
        bodyFatPct: null,
        waistCm: null,
        notes: null,
        createdAt: new Date(),
      } as any);
      vi.mocked(mockPrisma.bodyMetricLog.update).mockResolvedValue({
        id: 1,
        userId: 1,
        recordedAt: new Date(),
        weightKg: null,
        bodyFatPct: null,
        waistCm: null,
        notes: null,
        createdAt: new Date(),
      } as any);

      await patchBodyMetric(1, 1, { weightKg: null });

      expect(mockPrisma.bodyMetricLog.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { weightKg: null },
      });
    });

    it("returns existing without update when no fields provided", async () => {
      const existing = {
        id: 1,
        userId: 1,
        recordedAt: new Date(),
        weightKg: new Decimal("70.0"),
        bodyFatPct: null,
        waistCm: null,
        notes: null,
        createdAt: new Date(),
      };
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(existing as any);

      await patchBodyMetric(1, 1, {});

      expect(mockPrisma.bodyMetricLog.update).not.toHaveBeenCalled();
    });

    it("throws 404 when metric not found", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);

      await expect(patchBodyMetric(1, 999, { weightKg: 68 })).rejects.toThrow(
        AppError,
      );
    });
  });

  // ─── deleteBodyMetric ───────────────────────────────────────────────────────

  describe("deleteBodyMetric", () => {
    it("deletes metric and returns void on success", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.deleteMany).mockResolvedValue({ count: 1 });

      await expect(deleteBodyMetric(1, 5)).resolves.toBeUndefined();
      expect(mockPrisma.bodyMetricLog.deleteMany).toHaveBeenCalledWith({
        where: { id: 5, userId: 1 },
      });
    });

    it("throws 404 when metric not found", async () => {
      vi.mocked(mockPrisma.bodyMetricLog.deleteMany).mockResolvedValue({ count: 0 });

      await expect(deleteBodyMetric(1, 999)).rejects.toThrow(AppError);
    });
  });
});
