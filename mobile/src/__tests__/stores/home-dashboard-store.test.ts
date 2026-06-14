import { describe, expect, it, beforeEach } from "vitest";
import type { ReadinessScore } from "../../features/module06/store/home-dashboard-store";
import { useHomeDashboardStore, computeReadiness } from "../../features/module06/store/home-dashboard-store";

const mockFetch = global.fetch as jest.Mock;

function setupFetch(data: unknown, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
}

describe("Home Dashboard Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("starts with null stats, empty pulse, zero streak", () => {
      const state = useHomeDashboardStore.getState();
      expect(state.stats).toBeNull();
      expect(state.todaySession).toBeNull();
      expect(state.streakDays).toBe(0);
      expect(state.weeklyPulse).toEqual([]);
      expect(state.readiness).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isRefreshing).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("load", () => {
    it("loads dashboard data and computes readiness on success", async () => {
      // Progress endpoint
      setupFetch({
        items: [{
          totalKcalIn: 1800,
          totalKcalOut: 300,
          totalWorkoutMinutes: 45,
        }],
      });
      // Sessions endpoint
      setupFetch({
        items: [
          { id: 1, sessionDate: "2026-01-01", status: "completed", startedAt: "2026-01-01T08:00:00Z", endedAt: "2026-01-01T09:00:00Z", planId: 1 },
        ],
      });
      // /me endpoint
      setupFetch({
        id: 1,
        email: "test@example.com",
        profile: { gender: "male" },
        goals: [{ isActive: true, dailyKcalTarget: 2000, weeklyWorkoutTarget: 3 }],
      });

      const store = useHomeDashboardStore.getState();
      await store.load();

      expect(store.stats).not.toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.readiness).not.toBeNull();
    });

    it("sets error and stops loading on fetch failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Server error" }),
      });

      const store = useHomeDashboardStore.getState();
      await store.load();

      expect(store.isLoading).toBe(false);
      expect(store.error).toContain("Không thể tải dữ liệu dashboard");
    });

    it("does not throw on non-Error exceptions", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Network failure"));

      const store = useHomeDashboardStore.getState();
      await store.load();

      expect(store.isLoading).toBe(false);
      expect(store.error).toContain("Không thể tải dữ liệu dashboard");
    });
  });

  describe("clearError", () => {
    it("sets error to null", async () => {
      mockFetch.mockRejectedValueOnce(new Error("test"));

      const store = useHomeDashboardStore.getState();
      await store.load();

      expect(store.error).not.toBeNull();

      store.clearError();

      expect(store.error).toBeNull();
    });
  });
});

describe("computeReadiness", () => {
  it("returns score capped between 0 and 100", () => {
    const result = computeReadiness({
      activeMinutes: 0,
      weeklyWorkoutCount: 0,
      kcalIn: 0,
      kcalOut: 0,
      dailyKcalTarget: null,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("awards activity bonus for 30+ active minutes", () => {
    const withActivity = computeReadiness({
      activeMinutes: 30,
      weeklyWorkoutCount: 0,
      kcalIn: 0,
      kcalOut: 0,
      dailyKcalTarget: null,
    });
    const withoutActivity = computeReadiness({
      activeMinutes: 0,
      weeklyWorkoutCount: 0,
      kcalIn: 0,
      kcalOut: 0,
      dailyKcalTarget: null,
    });
    expect(withActivity.score).toBeGreaterThan(withoutActivity.score);
  });

  it("awards weekly workout bonus for 3+ workouts", () => {
    const withWorkouts = computeReadiness({
      activeMinutes: 0,
      weeklyWorkoutCount: 3,
      kcalIn: 0,
      kcalOut: 0,
      dailyKcalTarget: null,
    });
    const without = computeReadiness({
      activeMinutes: 0,
      weeklyWorkoutCount: 0,
      kcalIn: 0,
      kcalOut: 0,
      dailyKcalTarget: null,
    });
    expect(withWorkouts.score).toBeGreaterThan(without.score);
  });

  it("awards nutrition balance bonus when within 10% of target", () => {
    const balanced = computeReadiness({
      activeMinutes: 0,
      weeklyWorkoutCount: 0,
      kcalIn: 2000,
      kcalOut: 0,
      dailyKcalTarget: 2000,
    });
    const imbalanced = computeReadiness({
      activeMinutes: 0,
      weeklyWorkoutCount: 0,
      kcalIn: 1000,
      kcalOut: 0,
      dailyKcalTarget: 2000,
    });
    expect(balanced.score).toBeGreaterThan(imbalanced.score);
  });

  it("returns 'Tuyệt vời!' label for score >= 85", () => {
    const result = computeReadiness({
      activeMinutes: 60,
      weeklyWorkoutCount: 5,
      kcalIn: 2000,
      kcalOut: 0,
      dailyKcalTarget: 2000,
    });
    expect(result.label).toBe("Tuyệt vời!");
  });

  it("returns 'Tốt' label for score 70-84", () => {
    const result = computeReadiness({
      activeMinutes: 30,
      weeklyWorkoutCount: 1,
      kcalIn: 0,
      kcalOut: 0,
      dailyKcalTarget: null,
    });
    expect(result.label).toBe("Tốt");
  });

  it("returns 'Trung bình' label for score 50-69", () => {
    const result = computeReadiness({
      activeMinutes: 10,
      weeklyWorkoutCount: 0,
      kcalIn: 0,
      kcalOut: 0,
      dailyKcalTarget: null,
    });
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThan(70);
    expect(result.label).toBe("Trung bình");
  });

  it("returns 'Cần cải thiện' label for score < 50", () => {
    const result = computeReadiness({
      activeMinutes: 0,
      weeklyWorkoutCount: 0,
      kcalIn: 0,
      kcalOut: 0,
      dailyKcalTarget: null,
    });
    expect(result.label).toBe("Cần cải thiện");
  });

  it("caps at 100 even with all bonuses", () => {
    const result = computeReadiness({
      activeMinutes: 999,
      weeklyWorkoutCount: 999,
      kcalIn: 2000,
      kcalOut: 0,
      dailyKcalTarget: 2000,
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("provides hint string in result", () => {
    const result = computeReadiness({
      activeMinutes: 60,
      weeklyWorkoutCount: 5,
      kcalIn: 2000,
      kcalOut: 0,
      dailyKcalTarget: 2000,
    });
    expect(typeof result.hint).toBe("string");
    expect(result.hint.length).toBeGreaterThan(0);
  });
});
