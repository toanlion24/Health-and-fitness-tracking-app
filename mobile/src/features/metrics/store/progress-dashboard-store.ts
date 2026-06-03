import { create } from "zustand";
import { fetchApi } from "../../../core/lib/api";

export type ProgressDashboardPhase = "loading" | "empty" | "partial" | "ready";

export type DailyProgressItem = {
  date: string;
  totalKcalIn: number;
  totalKcalOut: number;
  totalWorkoutMinutes: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  goalScore: number | null;
};

export type WeightPoint = { date: string; weightKg: number };

export type ProgressSummary = {
  period: "week" | "month";
  fromDate: string;
  toDate: string;
  dailyItems: DailyProgressItem[];
  totals: { totalKcalIn: number; totalKcalOut: number; totalWorkoutMinutes: number };
  averages: { avgKcalIn: number; avgWorkoutMins: number };
  weight: {
    currentKg: number | null;
    changeKg: number | null;
    series: WeightPoint[];
  };
};

type ProgressDashboardState = {
  phase: ProgressDashboardPhase;
  weekMonth: "week" | "month";
  summary: ProgressSummary | null;
  error: string | null;
  setPhase: (phase: ProgressDashboardPhase) => void;
  setWeekMonth: (v: "week" | "month") => void;
  fetchSummary: (period: "week" | "month") => Promise<void>;
};

export const useProgressDashboardStore = create<ProgressDashboardState>((set, get) => ({
  phase: "loading",
  weekMonth: "week",
  summary: null,
  error: null,
  setPhase: (phase) => set({ phase }),
  setWeekMonth: (weekMonth) => {
    set({ weekMonth, phase: "loading" });
    void get().fetchSummary(weekMonth);
  },
  fetchSummary: async (period: "week" | "month") => {
    set({ phase: "loading", error: null });
    try {
      const res = await fetchApi(`/progress/summary?period=${period}`);
      if (!res.ok) {
        set({ phase: "empty", error: "Không thể tải dữ liệu" });
        return;
      }
      const data = (await res.json()) as ProgressSummary;
      const hasData = data.dailyItems.some(
        (d) => d.totalKcalIn > 0 || d.totalWorkoutMinutes > 0,
      );
      const hasWeight = (data.weight.series?.length ?? 0) > 0;

      if (!hasData && !hasWeight) {
        set({ summary: data, phase: "empty" });
      } else if (!hasData || !hasWeight) {
        set({ summary: data, phase: "partial" });
      } else {
        set({ summary: data, phase: "ready" });
      }
    } catch (e) {
      console.error("Progress summary fetch error:", e);
      set({ phase: "empty", error: "Lỗi kết nối" });
    }
  },
}));
