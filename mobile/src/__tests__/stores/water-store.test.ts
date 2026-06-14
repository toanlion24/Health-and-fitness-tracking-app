import { describe, expect, it, jest, beforeEach } from "vitest";
import { useWaterStore } from "../../features/module02/store/water-store";

jest.mock("@/core/api/client", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockFetch = global.fetch as jest.Mock;

function buildFetchResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    data,
    json: () => Promise.resolve(data),
  });
}

function setupFetch(data: unknown, ok = true) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 400,
    json: () => Promise.resolve(data),
  });
}

describe("Water Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWaterStore.getState().reset();
  });

  describe("initial state", () => {
    it("starts with null summary, empty logs, no loading, no error", () => {
      const state = useWaterStore.getState();
      expect(state.todaySummary).toBeNull();
      expect(state.logs).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("fetchTodaySummary", () => {
    it("sets todaySummary and stops loading on success", async () => {
      const summary = {
        date: "2026-01-01",
        totalMl: 1500,
        goalMl: 2000,
        glassesCount: 6,
        percentage: 75,
      };
      setupFetch(summary);

      const store = useWaterStore.getState();
      await store.fetchTodaySummary();

      expect(store.todaySummary).toEqual(summary);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it("sets error and stops loading on failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Server error" }),
      });

      const store = useWaterStore.getState();
      await store.fetchTodaySummary();

      expect(store.todaySummary).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toContain("Server error");
    });
  });

  describe("fetchLogs", () => {
    it("populates logs array from API response", async () => {
      const logs = {
        data: [
          { id: 1, amountMl: 250, loggedAt: "2026-01-01T08:00:00Z" },
          { id: 2, amountMl: 500, loggedAt: "2026-01-01T10:00:00Z" },
        ],
      };
      setupFetch(logs);

      const store = useWaterStore.getState();
      await store.fetchLogs({ from: "2026-01-01", to: "2026-01-01" });

      expect(store.logs).toHaveLength(2);
      expect(store.isLoading).toBe(false);
    });

    it("sets error on fetch failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Bad request" }),
      });

      const store = useWaterStore.getState();
      await store.fetchLogs();

      expect(store.error).toContain("Bad request");
    });

    it("appends date filters to query string", async () => {
      setupFetch({ data: [] });

      await useWaterStore.getState().fetchLogs({ from: "2026-01-01", to: "2026-01-07" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("from=2026-01-01"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("to=2026-01-07"),
        expect.any(Object)
      );
    });
  });

  describe("logWater", () => {
    it("updates todaySummary and prepends new log on success", async () => {
      const summary = {
        date: "2026-01-01",
        totalMl: 500,
        goalMl: 2000,
        glassesCount: 2,
        percentage: 25,
      };
      setupFetch(summary);

      const store = useWaterStore.getState();
      await store.logWater(250);

      expect(store.todaySummary).toEqual(summary);
      expect(store.logs[0].amountMl).toBe(250);
      expect(store.isLoading).toBe(false);
    });

    it("re-throws error and keeps loading false on failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Failed" }),
      });

      const store = useWaterStore.getState();
      await expect(store.logWater(250)).rejects.toBeDefined();
      expect(store.isLoading).toBe(false);
    });
  });

  describe("updateGoal", () => {
    it("updates todaySummary with new goal", async () => {
      const summary = {
        date: "2026-01-01",
        totalMl: 0,
        goalMl: 3000,
        glassesCount: 0,
        percentage: 0,
      };
      setupFetch(summary);

      const store = useWaterStore.getState();
      await store.updateGoal(3000);

      expect(store.todaySummary?.goalMl).toBe(3000);
    });
  });

  describe("reset", () => {
    it("clears all state to initial values", async () => {
      const summary = { date: "2026-01-01", totalMl: 500, goalMl: 2000, glassesCount: 2, percentage: 25 };
      setupFetch(summary);
      await useWaterStore.getState().fetchTodaySummary();

      useWaterStore.getState().reset();

      const state = useWaterStore.getState();
      expect(state.todaySummary).toBeNull();
      expect(state.logs).toEqual([]);
      expect(state.error).toBeNull();
    });
  });
});
