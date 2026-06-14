import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  logWater,
  getWaterLogs,
  getTodayWaterSummary,
  updateWaterGoal,
  logSleep,
  getSleepLogs,
  getTodaySleepSummary,
  updateSleepGoal,
  deleteSleepLog,
} from "./service.js";
import { AppError } from "../../shared/errors/app-error.js";

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    waterLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    dailyWaterSummary: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    sleepLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    dailySleepSummary: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Water-Sleep Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════
  // WATER TRACKING
  // ═══════════════════════════════════════════════════════════════════

  describe("logWater", () => {
    it("creates a water log entry and upserts daily summary", async () => {
      vi.mocked(mockPrisma.waterLog.create).mockResolvedValue({ id: 1 } as any);
      vi.mocked(mockPrisma.dailyWaterSummary.upsert).mockResolvedValue({
        id: 1,
        userId: 1,
        date: new Date(),
        totalMl: 250,
        goalMl: 2000,
        glassesCount: 1,
      } as any);

      const result = await logWater(1, { amountMl: 250 });

      expect(mockPrisma.waterLog.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          amountMl: 250,
          loggedAt: expect.any(Date),
        },
      });
      expect(mockPrisma.dailyWaterSummary.upsert).toHaveBeenCalled();
      expect(result.totalMl).toBe(250);
    });

    it("increments totalMl on subsequent logs", async () => {
      vi.mocked(mockPrisma.waterLog.create).mockResolvedValue({ id: 2 } as any);
      vi.mocked(mockPrisma.dailyWaterSummary.upsert).mockResolvedValue({
        id: 1,
        userId: 1,
        date: new Date(),
        totalMl: 500,
        goalMl: 2000,
        glassesCount: 2,
      } as any);

      const result = await logWater(1, { amountMl: 250 });

      const upsertCall = vi.mocked(mockPrisma.dailyWaterSummary.upsert).mock.calls[0][0];
      expect(upsertCall.update.totalMl.increment).toBe(250);
      expect(result.totalMl).toBe(500);
    });

    it("computes glassesCount correctly for 250ml glasses", async () => {
      vi.mocked(mockPrisma.waterLog.create).mockResolvedValue({ id: 3 } as any);
      vi.mocked(mockPrisma.dailyWaterSummary.upsert).mockResolvedValue({
        id: 1,
        userId: 1,
        date: new Date(),
        totalMl: 750,
        goalMl: 2000,
        glassesCount: 3,
      } as any);

      await logWater(1, { amountMl: 500 });

      const upsertCall = vi.mocked(mockPrisma.dailyWaterSummary.upsert).mock.calls[0][0];
      expect(upsertCall.update.glassesCount.increment).toBe(2);
    });
  });

  describe("getWaterLogs", () => {
    it("returns water logs with default pagination", async () => {
      const logs = [
        { id: 2, userId: 1, amountMl: 250, loggedAt: new Date() },
        { id: 1, userId: 1, amountMl: 200, loggedAt: new Date() },
      ];
      vi.mocked(mockPrisma.waterLog.findMany).mockResolvedValue(logs as any);

      const result = await getWaterLogs(1, {});

      expect(result).toHaveLength(2);
      expect(result[0].amountMl).toBe(250);
      expect(mockPrisma.waterLog.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { loggedAt: "desc" },
        take: 50,
        skip: 0,
      });
    });

    it("applies date filters when from/to provided", async () => {
      vi.mocked(mockPrisma.waterLog.findMany).mockResolvedValue([]);

      await getWaterLogs(1, { from: "2026-01-01", to: "2026-01-31" });

      expect(mockPrisma.waterLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          loggedAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: { loggedAt: "desc" },
        take: 50,
        skip: 0,
      });
    });
  });

  describe("getTodayWaterSummary", () => {
    it("returns existing summary with percentage", async () => {
      vi.mocked(mockPrisma.dailyWaterSummary.findUnique).mockResolvedValue({
        date: new Date(),
        totalMl: 1500,
        goalMl: 2000,
        glassesCount: 6,
      } as any);

      const result = await getTodayWaterSummary(1);

      expect(result.totalMl).toBe(1500);
      expect(result.goalMl).toBe(2000);
      expect(result.percentage).toBe(75);
    });

    it("returns zero summary when no data for today", async () => {
      vi.mocked(mockPrisma.dailyWaterSummary.findUnique).mockResolvedValue(null);

      const result = await getTodayWaterSummary(1);

      expect(result.totalMl).toBe(0);
      expect(result.goalMl).toBe(2000);
      expect(result.glassesCount).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe("updateWaterGoal", () => {
    it("updates goalMl on existing summary", async () => {
      vi.mocked(mockPrisma.dailyWaterSummary.upsert).mockResolvedValue({
        date: new Date(),
        totalMl: 0,
        goalMl: 3000,
        glassesCount: 0,
      } as any);

      const result = await updateWaterGoal(1, { goalMl: 3000 });

      expect(result.goalMl).toBe(3000);
    });

    it("creates summary with new goal when none exists", async () => {
      vi.mocked(mockPrisma.dailyWaterSummary.upsert).mockResolvedValue({
        date: new Date(),
        totalMl: 0,
        goalMl: 2500,
        glassesCount: 0,
      } as any);

      await updateWaterGoal(1, { goalMl: 2500 });

      expect(mockPrisma.dailyWaterSummary.upsert).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // SLEEP TRACKING
  // ═══════════════════════════════════════════════════════════════════

  describe("logSleep", () => {
    it("creates sleep log with computed duration", async () => {
      const sleepTime = "2026-01-01T22:00:00.000Z";
      const wakeTime = "2026-01-02T06:30:00.000Z";
      vi.mocked(mockPrisma.sleepLog.create).mockResolvedValue({
        id: 1,
        userId: 1,
        sleepTime: new Date(sleepTime),
        wakeTime: new Date(wakeTime),
        durationMinutes: 510,
        quality: 4,
        notes: null,
      } as any);
      vi.mocked(mockPrisma.sleepLog.findMany).mockResolvedValue([
        {
          id: 1,
          durationMinutes: 510,
          quality: 4,
        },
      ] as any);
      vi.mocked(mockPrisma.dailySleepSummary.upsert).mockResolvedValue({
        date: new Date(),
        totalSleepMin: 510,
        avgQuality: 4,
        sleepGoalMin: 480,
      } as any);

      const result = await logSleep(1, {
        sleepTime,
        wakeTime,
        quality: 4,
      });

      expect(result.durationMinutes).toBe(510);
      expect(result.quality).toBe(4);
    });

    it("sets durationMinutes to null when wakeTime is before sleepTime", async () => {
      vi.mocked(mockPrisma.sleepLog.create).mockResolvedValue({
        id: 1,
        userId: 1,
        sleepTime: new Date("2026-01-01T06:00:00Z"),
        wakeTime: new Date("2026-01-01T22:00:00Z"),
        durationMinutes: null,
        quality: null,
        notes: null,
      } as any);
      vi.mocked(mockPrisma.sleepLog.findMany).mockResolvedValue([] as any);
      vi.mocked(mockPrisma.dailySleepSummary.upsert).mockResolvedValue({
        date: new Date(),
        totalSleepMin: 0,
        avgQuality: null,
        sleepGoalMin: 480,
      } as any);

      const result = await logSleep(1, {
        sleepTime: "2026-01-01T06:00:00.000Z",
        wakeTime: "2026-01-01T22:00:00.000Z",
      });

      expect(result.durationMinutes).toBeNull();
    });
  });

  describe("getSleepLogs", () => {
    it("returns sleep logs with default pagination", async () => {
      const logs = [
        {
          id: 2,
          userId: 1,
          sleepTime: new Date(),
          wakeTime: new Date(),
          durationMinutes: 480,
          quality: 4,
          notes: null,
        },
      ];
      vi.mocked(mockPrisma.sleepLog.findMany).mockResolvedValue(logs as any);

      const result = await getSleepLogs(1, {});

      expect(result).toHaveLength(1);
      expect(mockPrisma.sleepLog.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { sleepTime: "desc" },
        take: 50,
        skip: 0,
      });
    });

    it("applies date range filters", async () => {
      vi.mocked(mockPrisma.sleepLog.findMany).mockResolvedValue([]);

      await getSleepLogs(1, { from: "2026-01-01", to: "2026-01-31" });

      expect(mockPrisma.sleepLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          sleepTime: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: { sleepTime: "desc" },
        take: 50,
        skip: 0,
      });
    });
  });

  describe("getTodaySleepSummary", () => {
    it("returns existing summary with percentage", async () => {
      vi.mocked(mockPrisma.dailySleepSummary.findUnique).mockResolvedValue({
        date: new Date(),
        totalSleepMin: 420,
        avgQuality: 3.5,
        sleepGoalMin: 480,
      } as any);

      const result = await getTodaySleepSummary(1);

      expect(result.totalSleepMin).toBe(420);
      expect(result.sleepGoalMin).toBe(480);
      expect(result.percentage).toBe(88);
    });

    it("returns zero summary with default goal when no data", async () => {
      vi.mocked(mockPrisma.dailySleepSummary.findUnique).mockResolvedValue(null);

      const result = await getTodaySleepSummary(1);

      expect(result.totalSleepMin).toBe(0);
      expect(result.sleepGoalMin).toBe(480);
      expect(result.percentage).toBe(0);
      expect(result.avgQuality).toBeNull();
    });
  });

  describe("updateSleepGoal", () => {
    it("updates sleep goal on existing summary", async () => {
      vi.mocked(mockPrisma.dailySleepSummary.upsert).mockResolvedValue({
        date: new Date(),
        totalSleepMin: 0,
        avgQuality: null,
        sleepGoalMin: 420,
      } as any);

      const result = await updateSleepGoal(1, { sleepGoalMin: 420 });

      expect(result.sleepGoalMin).toBe(420);
    });
  });

  describe("deleteSleepLog", () => {
    it("deletes sleep log and recalculates summary", async () => {
      vi.mocked(mockPrisma.sleepLog.findFirst).mockResolvedValue({
        id: 5,
        userId: 1,
        sleepTime: new Date("2026-01-01T22:00:00Z"),
      } as any);
      vi.mocked(mockPrisma.sleepLog.delete).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.sleepLog.findMany).mockResolvedValue([] as any);
      vi.mocked(mockPrisma.dailySleepSummary.upsert).mockResolvedValue({
        date: new Date(),
        totalSleepMin: 0,
        avgQuality: null,
        sleepGoalMin: 480,
      } as any);

      await expect(deleteSleepLog(1, 5)).resolves.toBeUndefined();

      expect(mockPrisma.sleepLog.delete).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(mockPrisma.dailySleepSummary.upsert).toHaveBeenCalled();
    });

    it("throws 404 when sleep log not found", async () => {
      vi.mocked(mockPrisma.sleepLog.findFirst).mockResolvedValue(null);

      await expect(deleteSleepLog(1, 999)).rejects.toThrow(AppError);
    });
  });
});
