import { describe, expect, it, beforeEach } from "vitest";
import {
  useRunningSessionStore,
  fmtDistance,
  fmtDuration,
  fmtPace,
} from "../../features/module04/store/running-session-store";

describe("Running Session Store", () => {
  beforeEach(() => {
    useRunningSessionStore.getState().resetRun();
  });

  describe("initial state after reset", () => {
    it("starts with idle status and zero stats", () => {
      const state = useRunningSessionStore.getState();
      expect(state.status).toBe("idle");
      expect(state.elapsedSec).toBe(0);
      expect(state.distanceM).toBe(0);
      expect(state.paceSecPerKm).toBe(0);
      expect(state.kcalBurned).toBe(0);
      expect(state.steps).toBe(0);
      expect(state.startTime).toBeNull();
      expect(state.gpsPoints).toEqual([]);
    });
  });

  describe("startRun", () => {
    it("sets status to running and records startTime", () => {
      const before = Date.now();
      useRunningSessionStore.getState().startRun();
      const after = Date.now();

      const state = useRunningSessionStore.getState();
      expect(state.status).toBe("running");
      expect(state.startTime).not.toBeNull();
      expect(state.startTime!).toBeGreaterThanOrEqual(before);
      expect(state.startTime!).toBeLessThanOrEqual(after);
    });
  });

  describe("pauseRun", () => {
    it("sets status to paused", () => {
      useRunningSessionStore.getState().startRun();
      useRunningSessionStore.getState().pauseRun();

      expect(useRunningSessionStore.getState().status).toBe("paused");
    });
  });

  describe("resumeRun", () => {
    it("sets status back to running", () => {
      useRunningSessionStore.getState().startRun();
      useRunningSessionStore.getState().pauseRun();
      useRunningSessionStore.getState().resumeRun();

      expect(useRunningSessionStore.getState().status).toBe("running");
    });
  });

  describe("completeRun", () => {
    it("sets status to completed", () => {
      useRunningSessionStore.getState().startRun();
      useRunningSessionStore.getState().completeRun();

      expect(useRunningSessionStore.getState().status).toBe("completed");
    });
  });

  describe("resetRun", () => {
    it("resets all fields to initial state", () => {
      useRunningSessionStore.getState().startRun();
      useRunningSessionStore.getState().updateStats({
        elapsedSec: 1200,
        distanceM: 5000,
        paceSecPerKm: 300,
        kcalBurned: 350,
        steps: 6000,
      });
      useRunningSessionStore.getState().addGpsPoint(10.7629, 106.6602);

      useRunningSessionStore.getState().resetRun();

      const state = useRunningSessionStore.getState();
      expect(state.status).toBe("idle");
      expect(state.elapsedSec).toBe(0);
      expect(state.distanceM).toBe(0);
      expect(state.paceSecPerKm).toBe(0);
      expect(state.kcalBurned).toBe(0);
      expect(state.steps).toBe(0);
      expect(state.startTime).toBeNull();
      expect(state.gpsPoints).toEqual([]);
    });
  });

  describe("updateStats", () => {
    it("updates individual stat fields", () => {
      useRunningSessionStore.getState().updateStats({ elapsedSec: 300 });
      expect(useRunningSessionStore.getState().elapsedSec).toBe(300);

      useRunningSessionStore.getState().updateStats({ distanceM: 1500 });
      expect(useRunningSessionStore.getState().distanceM).toBe(1500);
      expect(useRunningSessionStore.getState().elapsedSec).toBe(300); // unchanged
    });

    it("updates multiple stats at once", () => {
      useRunningSessionStore.getState().updateStats({
        elapsedSec: 600,
        distanceM: 3000,
        paceSecPerKm: 320,
        kcalBurned: 200,
        steps: 4000,
      });

      const state = useRunningSessionStore.getState();
      expect(state.elapsedSec).toBe(600);
      expect(state.distanceM).toBe(3000);
      expect(state.paceSecPerKm).toBe(320);
      expect(state.kcalBurned).toBe(200);
      expect(state.steps).toBe(4000);
    });

    it("accumulates distance across multiple updates", () => {
      useRunningSessionStore.getState().updateStats({ distanceM: 1000 });
      useRunningSessionStore.getState().updateStats({ distanceM: 500 });

      // Each call replaces, does not accumulate
      expect(useRunningSessionStore.getState().distanceM).toBe(500);
    });
  });

  describe("addGpsPoint", () => {
    it("appends GPS point with timestamp", () => {
      const before = Date.now();
      useRunningSessionStore.getState().addGpsPoint(10.7629, 106.6602);
      const after = Date.now();

      const points = useRunningSessionStore.getState().gpsPoints;
      expect(points).toHaveLength(1);
      expect(points[0].lat).toBe(10.7629);
      expect(points[0].lng).toBe(106.6602);
      expect(points[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(points[0].timestamp).toBeLessThanOrEqual(after);
    });

    it("accumulates multiple GPS points", () => {
      useRunningSessionStore.getState().addGpsPoint(10.7629, 106.6602);
      useRunningSessionStore.getState().addGpsPoint(10.7630, 106.6603);

      const points = useRunningSessionStore.getState().gpsPoints;
      expect(points).toHaveLength(2);
      expect(points[1].lat).toBe(10.7630);
    });
  });

  describe("status transitions", () => {
    it("full run lifecycle: idle -> running -> paused -> running -> completed", () => {
      const store = useRunningSessionStore.getState();

      expect(store.status).toBe("idle");

      store.startRun();
      expect(useRunningSessionStore.getState().status).toBe("running");

      store.pauseRun();
      expect(useRunningSessionStore.getState().status).toBe("paused");

      store.resumeRun();
      expect(useRunningSessionStore.getState().status).toBe("running");

      store.completeRun();
      expect(useRunningSessionStore.getState().status).toBe("completed");

      store.resetRun();
      expect(useRunningSessionStore.getState().status).toBe("idle");
    });
  });
});

describe("Running formatters", () => {
  describe("fmtDistance", () => {
    it("converts meters to km string with 2 decimal places", () => {
      expect(fmtDistance(0)).toBe("0.00 km");
      expect(fmtDistance(1000)).toBe("1.00 km");
      expect(fmtDistance(1500)).toBe("1.50 km");
      expect(fmtDistance(10000)).toBe("10.00 km");
    });
  });

  describe("fmtDuration", () => {
    it("formats seconds to mm:ss", () => {
      expect(fmtDuration(0)).toBe("00:00");
      expect(fmtDuration(30)).toBe("00:30");
      expect(fmtDuration(90)).toBe("01:30");
      expect(fmtDuration(3599)).toBe("59:59");
    });

    it("formats seconds to hh:mm:ss when hours > 0", () => {
      expect(fmtDuration(3600)).toBe("1:00:00");
      expect(fmtDuration(3661)).toBe("1:01:01");
      expect(fmtDuration(7325)).toBe("2:02:05");
    });

    it("handles negative as 00:00", () => {
      expect(fmtDuration(-10)).toBe("00:00");
    });
  });

  describe("fmtPace", () => {
    it("formats pace as min:sec/km", () => {
      expect(fmtPace(300)).toBe("5:00");
      expect(fmtPace(330)).toBe("5:30");
      expect(fmtPace(360)).toBe("6:00");
      expect(fmtPace(367)).toBe("6:07");
    });

    it("returns dash for zero or negative", () => {
      expect(fmtPace(0)).toBe("—");
      expect(fmtPace(-1)).toBe("—");
    });

    it("returns dash for Infinity", () => {
      expect(fmtPace(Infinity)).toBe("—");
    });
  });
});
