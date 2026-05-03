import { create } from "zustand";

/** Mirrors Progress dashboard states in `gui3.pen` (Module 06). */
export type ProgressDashboardPhase = "loading" | "empty" | "partial" | "ready";

type ProgressDashboardState = {
  phase: ProgressDashboardPhase;
  weekMonth: "week" | "month";
  setPhase: (phase: ProgressDashboardPhase) => void;
  setWeekMonth: (v: "week" | "month") => void;
};

export const useProgressDashboardStore = create<ProgressDashboardState>((set) => ({
  phase: "ready",
  weekMonth: "week",
  setPhase: (phase) => set({ phase }),
  setWeekMonth: (weekMonth) => set({ weekMonth }),
}));
