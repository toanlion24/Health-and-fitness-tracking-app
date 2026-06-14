import { describe, expect, it, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import {
  recomputeDailyProgress,
  listDailyProgress,
  getSummaryProgress,
} from "./progress.service.js";
import { AppError } from "../../shared/errors/app-error.js";

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    mealLog: { findMany: vi.fn() },
    workoutSession: { findMany: vi.fn() },
    bodyMetricLog: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    userGoal: { findFirst: vi.fn() },
    dailyProgress: { upsert: vi.fn(), findMany: vi.fn() },
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Progress Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── recomputeDailyProgress ─────────────────────────────────────────────────

  describe("recomputeDailyProgress", () => {
    it("computes kcal in from meal log items", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([
        {
          id: 1,
          items: [
            { id: 1, kcal: 300, proteinG: new Decimal("20"), carbG: new Decimal("30"), fatG: new Decimal("10") },
            { id: 2, kcal: 200, proteinG: new Decimal("15"), carbG: new Decimal("25"), fatG: new Decimal("5") },
          ],
        },
      ] as any);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);

      await recomputeDailyProgress(1, "2026-01-01");

      expect(mockPrisma.dailyProgress.upsert).toHaveBeenCalledWith({
        where: { userId_date: { userId: 1, date: expect.any(Date) } },
        create: expect.objectContaining({
          totalKcalIn: 500,
        }),
        update: expect.objectContaining({
          totalKcalIn: 500,
        }),
      });
    });

    it("accumulates macros from all meal items", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([
        {
          id: 1,
          items: [
            { kcal: 300, proteinG: new Decimal("20"), carbG: new Decimal("30"), fatG: new Decimal("10") },
          ],
        },
        {
          id: 2,
          items: [
            { kcal: 400, proteinG: new Decimal("10"), carbG: new Decimal("50"), fatG: new Decimal("15") },
          ],
        },
      ] as any);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);

      await recomputeDailyProgress(1, "2026-01-01");

      const upsertCall = vi.mocked(mockPrisma.dailyProgress.upsert).mock.calls[0][0];
      expect(upsertCall.create.totalKcalIn).toBe(700);
      expect(upsertCall.create.proteinG.toString()).toBe("30");
      expect(upsertCall.create.carbG.toString()).toBe("80");
      expect(upsertCall.create.fatG.toString()).toBe("25");
    });

    it("uses default weight 70kg when no body metric log exists", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);

      await recomputeDailyProgress(1, "2026-01-01");

      expect(mockPrisma.dailyProgress.upsert).toHaveBeenCalled();
    });

    it("uses latest weight from body metric log for kcal out calculation", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([
        {
          id: 1,
          sessionDate: new Date("2026-01-01"),
          startedAt: new Date("2026-01-01T08:00:00Z"),
          endedAt: new Date("2026-01-01T08:30:00Z"),
          status: "completed",
          sets: [],
        },
      ] as any);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue({
        weightKg: new Decimal("80.0"),
      } as any);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);

      await recomputeDailyProgress(1, "2026-01-01");

      const upsertCall = vi.mocked(mockPrisma.dailyProgress.upsert).mock.calls[0][0];
      expect(upsertCall.create.totalKcalOut).toBeGreaterThan(0);
    });

    it("calculates workout minutes from session start/end times", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([
        {
          id: 1,
          sessionDate: new Date("2026-01-01"),
          startedAt: new Date("2026-01-01T09:00:00Z"),
          endedAt: new Date("2026-01-01T09:45:00Z"),
          status: "completed",
          sets: [],
        },
      ] as any);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);

      await recomputeDailyProgress(1, "2026-01-01");

      const upsertCall = vi.mocked(mockPrisma.dailyProgress.upsert).mock.calls[0][0];
      expect(upsertCall.create.totalWorkoutMinutes).toBe(45);
    });

    it("includes active user goal in goal score computation", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue({
        dailyKcalTarget: 2000,
        weeklyWorkoutTarget: 3,
        isActive: true,
      } as any);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);

      await recomputeDailyProgress(1, "2026-01-01");

      const upsertCall = vi.mocked(mockPrisma.dailyProgress.upsert).mock.calls[0][0];
      expect(upsertCall.create.goalScore).not.toBeNull();
    });

    it("uses upsert to create or update daily progress", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);

      await recomputeDailyProgress(1, "2026-01-01");

      expect(mockPrisma.dailyProgress.upsert).toHaveBeenCalledTimes(1);
      const call = vi.mocked(mockPrisma.dailyProgress.upsert).mock.calls[0][0];
      expect(call.where).toEqual({ userId_date: { userId: 1, date: expect.any(Date) } });
    });
  });

  // ─── listDailyProgress ─────────────────────────────────────────────────────

  describe("listDailyProgress", () => {
    it("returns progress for each day in range", async () => {
      vi.mocked(mockPrisma.dailyProgress.findMany).mockResolvedValue([
        {
          id: 1,
          userId: 1,
          date: new Date("2026-01-01"),
          totalKcalIn: 2000,
          totalKcalOut: 300,
          totalWorkoutMinutes: 45,
          proteinG: new Decimal("80"),
          carbG: new Decimal("200"),
          fatG: new Decimal("60"),
          goalScore: 85,
          updatedAt: new Date(),
        },
      ] as any);

      const result = await listDailyProgress(1, {
        from: "2026-01-01",
        to: "2026-01-03",
      });

      expect(result).toHaveLength(1);
      expect(result[0].totalKcalIn).toBe(2000);
    });

    it("throws 400 when from > to", async () => {
      await expect(
        listDailyProgress(1, { from: "2026-01-05", to: "2026-01-01" }),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when range exceeds 120 days", async () => {
      await expect(
        listDailyProgress(1, { from: "2026-01-01", to: "2026-06-01" }),
      ).rejects.toThrow(AppError);
    });

    it("recomputes each day before returning results", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.dailyProgress.findMany).mockResolvedValue([]);

      await listDailyProgress(1, {
        from: "2026-01-01",
        to: "2026-01-03",
      });

      expect(mockPrisma.dailyProgress.upsert).toHaveBeenCalledTimes(3);
    });
  });

  // ─── getSummaryProgress ────────────────────────────────────────────────────

  describe("getSummaryProgress", () => {
    it("returns weekly summary with correct totals", async () => {
      // Use mockImplementation to ensure mocks survive vi.clearAllMocks()
      vi.mocked(mockPrisma.mealLog.findMany).mockImplementation(() => Promise.resolve([]));
      vi.mocked(mockPrisma.workoutSession.findMany).mockImplementation(() => Promise.resolve([]));
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockImplementation(() => Promise.resolve(null));
      vi.mocked(mockPrisma.bodyMetricLog.findMany).mockImplementation(() => Promise.resolve([]));
      vi.mocked(mockPrisma.userGoal.findFirst).mockImplementation(() => Promise.resolve(null));
      vi.mocked(mockPrisma.dailyProgress.upsert).mockImplementation(() => Promise.resolve({} as any));
      vi.mocked(mockPrisma.dailyProgress.findMany).mockImplementation(() => Promise.resolve([
        {
          id: 1,
          userId: 1,
          date: new Date("2026-01-01"),
          totalKcalIn: 2000,
          totalKcalOut: 300,
          totalWorkoutMinutes: 45,
          proteinG: new Decimal("80"),
          carbG: new Decimal("200"),
          fatG: new Decimal("60"),
          goalScore: 85,
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          date: new Date("2026-01-02"),
          totalKcalIn: 1800,
          totalKcalOut: 200,
          totalWorkoutMinutes: 30,
          proteinG: new Decimal("70"),
          carbG: new Decimal("180"),
          fatG: new Decimal("50"),
          goalScore: 78,
          updatedAt: new Date(),
        },
      ] as any));

      const result = await getSummaryProgress(1, "week");

      expect(result.period).toBe("week");
      expect(result.totals.totalKcalIn).toBe(3800);
      expect(result.totals.totalWorkoutMinutes).toBe(75);
      expect(result.averages.avgKcalIn).toBe(1900);
      expect(result.averages.avgWorkoutMins).toBe(38);
    });

    it("returns weight change from earliest to latest in period", async () => {
      // RecomputeDailyProgress is called 7 times, then getSummaryProgress needs specific weights
      // Use mockImplementation to handle multiple calls with specific return values
      let callCount = 0;
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.dailyProgress.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findMany).mockResolvedValue([
        { recordedAt: new Date("2026-01-01"), weightKg: new Decimal("73.5") },
        { recordedAt: new Date("2026-01-05"), weightKg: new Decimal("75.0") },
      ] as any);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockImplementation(() => {
        callCount++;
        // First 7 calls: recomputeDailyProgress (null, weight doesn't matter there)
        if (callCount <= 7) {
          return Promise.resolve({ weightKg: new Decimal("75.0") } as any);
        }
        // 8th call: getSummaryProgress latest (75.0)
        if (callCount === 8) {
          return Promise.resolve({ weightKg: new Decimal("75.0") } as any);
        }
        // 9th call: getSummaryProgress earliest (73.5)
        return Promise.resolve({ weightKg: new Decimal("73.5") } as any);
      });

      const result = await getSummaryProgress(1, "week");

      expect(result.weight.currentKg).toBe(75.0);
      expect(result.weight.changeKg).toBe(1.5);
      expect(result.weight.series).toHaveLength(2);
    });

    it("returns null weight when no body metric logs exist", async () => {
      vi.mocked(mockPrisma.dailyProgress.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.bodyMetricLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);

      const result = await getSummaryProgress(1, "week");

      expect(result.weight.currentKg).toBeNull();
      expect(result.weight.changeKg).toBeNull();
    });

    it("uses 30-day range for month period", async () => {
      vi.mocked(mockPrisma.dailyProgress.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.bodyMetricLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);

      await getSummaryProgress(1, "month");

      expect(mockPrisma.dailyProgress.upsert).toHaveBeenCalled();
    });

    it("returns empty dailyItems when no progress records exist", async () => {
      vi.mocked(mockPrisma.dailyProgress.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.workoutSession.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.bodyMetricLog.findFirst).mockResolvedValue(null);
      vi.mocked(mockPrisma.bodyMetricLog.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.userGoal.findFirst).mockResolvedValue(null);

      const result = await getSummaryProgress(1, "week");

      expect(result.dailyItems).toHaveLength(0);
      expect(result.totals.totalKcalIn).toBe(0);
      expect(result.totals.totalWorkoutMinutes).toBe(0);
    });
  });
});
