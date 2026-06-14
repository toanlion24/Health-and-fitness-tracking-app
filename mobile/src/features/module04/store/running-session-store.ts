/**
 * Running session store and formatters.
 * Handles local state for running sessions.
 */
import { create } from "zustand";

export type RunningStatus = "idle" | "running" | "paused" | "completed";

export type RunningSessionStore = {
  status: RunningStatus;
  elapsedSec: number;
  distanceM: number;
  paceSecPerKm: number;
  kcalBurned: number;
  steps: number;
  startTime: number | null;
  gpsPoints: Array<{ lat: number; lng: number; timestamp: number }>;

  // Actions
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  completeRun: () => void;
  resetRun: () => void;
  updateStats: (data: {
    elapsedSec?: number;
    distanceM?: number;
    paceSecPerKm?: number;
    kcalBurned?: number;
    steps?: number;
  }) => void;
  addGpsPoint: (lat: number, lng: number) => void;
};

export const useRunningSessionStore = create<RunningSessionStore>((set) => ({
  status: "idle",
  elapsedSec: 0,
  distanceM: 0,
  paceSecPerKm: 0,
  kcalBurned: 0,
  steps: 0,
  startTime: null,
  gpsPoints: [],

  startRun: () =>
    set({
      status: "running",
      startTime: Date.now(),
    }),

  pauseRun: () => set({ status: "paused" }),

  resumeRun: () => set({ status: "running" }),

  completeRun: () => set({ status: "completed" }),

  resetRun: () =>
    set({
      status: "idle",
      elapsedSec: 0,
      distanceM: 0,
      paceSecPerKm: 0,
      kcalBurned: 0,
      steps: 0,
      startTime: null,
      gpsPoints: [],
    }),

  updateStats: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  addGpsPoint: (lat, lng) =>
    set((state) => ({
      gpsPoints: [
        ...state.gpsPoints,
        { lat, lng, timestamp: Date.now() },
      ],
    })),
}));

/**
 * Format distance from meters to km string.
 */
export function fmtDistance(meters: number): string {
  const km = meters / 1000;
  return km.toFixed(2) + " km";
}

/**
 * Format duration from seconds to mm:ss or hh:mm:ss string.
 */
export function fmtDuration(seconds: number): string {
  if (seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Format pace from seconds per km to min:sec/km string.
 */
export function fmtPace(secondsPerKm: number): string {
  if (secondsPerKm <= 0 || !isFinite(secondsPerKm)) return "—";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
