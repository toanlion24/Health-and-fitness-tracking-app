import { describe, expect, it, beforeEach } from "vitest";
import { useSleepStore, formatSleepDuration, getSleepQualityLabel, getSleepQualityColor } from "../../features/module02/store/sleep-store";

jest.mock("@/core/api/client", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockFetch = global.fetch as jest.Mock;

function setupFetch(data: unknown, ok = true) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 400,
    json: () => Promise.resolve(data),
  });
}

describe("Sleep Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSleepStore.getState().reset();
  });

  describe("initial state", () => {
    it("starts with null summary, empty logs, no loading, no error", () => {
      const state = useSleepStore.getState();
      expect(state.todaySummary).toBeNull();
      expect(state.logs).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("fetchTodaySummary", () => {
    it("populates todaySummary on success", async () => {
      const summary = {
        date: "2026-01-01",
        totalSleepMin: 420,
        avgQuality: 3.5,
        sleepGoalMin: 480,
        percentage: 87,
      };
      setupFetch(summary);

      await useSleepStore.getState().fetchTodaySummary();

      const state = useSleepStore.getState();
      expect(state.todaySummary?.totalSleepMin).toBe(420);
      expect(state.todaySummary?.avgQuality).toBe(3.5);
      expect(state.isLoading).toBe(false);
    });

    it("sets error on failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Network error" }),
      });

      await useSleepStore.getState().fetchTodaySummary();

      const state = useSleepStore.getState();
      expect(state.error).toContain("Network error");
      expect(state.isLoading).toBe(false);
    });
  });

  describe("fetchLogs", () => {
    it("sets logs from API response", async () => {
      const logs = {
        data: [
          {
            id: 1,
            sleepTime: "2026-01-01T22:00:00Z",
            wakeTime: "2026-01-02T06:30:00Z",
            durationMinutes: 510,
            quality: 4,
            notes: null,
          },
        ],
      };
      setupFetch(logs);

      await useSleepStore.getState().fetchLogs();

      expect(useSleepStore.getState().logs).toHaveLength(1);
    });

    it("appends date filters to request", async () => {
      setupFetch({ data: [] });

      await useSleepStore.getState().fetchLogs({ from: "2026-01-01", to: "2026-01-07" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("from=2026-01-01"),
        expect.any(Object)
      );
    });
  });

  describe("logSleep", () => {
    it("refetches summary and logs after logging", async () => {
      // First call: POST to logSleep
      setupFetch({ id: 1, sleepTime: "2026-01-01T22:00:00Z", wakeTime: "2026-01-02T06:00:00Z", durationMinutes: 480, quality: 4, notes: null });
      // Second call: GET today summary
      setupFetch({ date: "2026-01-01", totalSleepMin: 480, avgQuality: 4, sleepGoalMin: 480, percentage: 100 });
      // Third call: GET logs
      setupFetch({ data: [{ id: 1, durationMinutes: 480, quality: 4 }] });

      const store = useSleepStore.getState();
      await store.logSleep({
        sleepTime: "2026-01-01T22:00:00Z",
        wakeTime: "2026-01-02T06:00:00Z",
        quality: 4,
      });

      expect(store.todaySummary?.totalSleepMin).toBe(480);
      expect(store.logs).toHaveLength(1);
    });

    it("sets error on log failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Log failed" }),
      });

      const store = useSleepStore.getState();
      await expect(
        store.logSleep({
          sleepTime: "2026-01-01T22:00:00Z",
          wakeTime: "2026-01-02T06:00:00Z",
        }),
      ).rejects.toBeDefined();
      expect(store.error).toContain("Log failed");
    });
  });

  describe("deleteLog", () => {
    it("refetches summary and logs after deletion", async () => {
      // findFirst
      setupFetch({ id: 5 });
      // delete
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      // summary fetch
      setupFetch({ date: "2026-01-01", totalSleepMin: 0, avgQuality: null, sleepGoalMin: 480, percentage: 0 });
      // logs fetch
      setupFetch({ data: [] });

      const store = useSleepStore.getState();
      await store.deleteLog(5);

      expect(store.todaySummary?.totalSleepMin).toBe(0);
      expect(store.logs).toHaveLength(0);
    });

    it("throws and sets error on delete failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: "Not found" }),
      });

      const store = useSleepStore.getState();
      await expect(store.deleteLog(999)).rejects.toBeDefined();
      expect(store.error).toContain("Not found");
    });
  });

  describe("updateGoal", () => {
    it("updates todaySummary with new sleep goal", async () => {
      setupFetch({
        date: "2026-01-01",
        totalSleepMin: 0,
        avgQuality: null,
        sleepGoalMin: 420,
        percentage: 0,
      });

      await useSleepStore.getState().updateGoal(420);

      expect(useSleepStore.getState().todaySummary?.sleepGoalMin).toBe(420);
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", async () => {
      setupFetch({ date: "2026-01-01", totalSleepMin: 480, avgQuality: 4, sleepGoalMin: 480, percentage: 100 });
      await useSleepStore.getState().fetchTodaySummary();

      useSleepStore.getState().reset();

      const state = useSleepStore.getState();
      expect(state.todaySummary).toBeNull();
      expect(state.logs).toEqual([]);
      expect(state.error).toBeNull();
    });
  });
});

describe("Sleep helper functions", () => {
  describe("formatSleepDuration", () => {
    it("formats minutes to hours and minutes", () => {
      expect(formatSleepDuration(480)).toBe("8h 0m");
      expect(formatSleepDuration(90)).toBe("1h 30m");
      expect(formatSleepDuration(65)).toBe("1h 5m");
      expect(formatSleepDuration(0)).toBe("0h 0m");
    });
  });

  describe("getSleepQualityLabel", () => {
    it("returns correct label for each quality score", () => {
      expect(getSleepQualityLabel(1)).toBe("Poor");
      expect(getSleepQualityLabel(2)).toBe("Fair");
      expect(getSleepQualityLabel(3)).toBe("Good");
      expect(getSleepQualityLabel(4)).toBe("Great");
      expect(getSleepQualityLabel(5)).toBe("Excellent");
    });

    it("returns 'Not rated' for null", () => {
      expect(getSleepQualityLabel(null)).toBe("Not rated");
    });

    it("returns 'Unknown' for invalid scores", () => {
      expect(getSleepQualityLabel(0)).toBe("Unknown");
      expect(getSleepQualityLabel(6)).toBe("Unknown");
    });
  });

  describe("getSleepQualityColor", () => {
    it("returns color for each quality level", () => {
      expect(getSleepQualityColor(1)).toBe("#EF4444");
      expect(getSleepQualityColor(2)).toBe("#F59E0B");
      expect(getSleepQualityColor(3)).toBe("#10B981");
      expect(getSleepQualityColor(4)).toBe("#3B82F6");
      expect(getSleepQualityColor(5)).toBe("#8B5CF6");
    });

    it("returns grey for null", () => {
      expect(getSleepQualityColor(null)).toBe("#9CA3AF");
    });
  });
});
