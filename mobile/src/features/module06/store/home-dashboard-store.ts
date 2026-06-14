import { create } from "zustand";
import { useAuthStore } from "../../../core/store/auth-store";
import {
  fetchTodayDashboard,
  fetchWeeklyPulse,
  type DashboardData,
  type WeeklyPulseData,
} from "../services/dashboard-api";

export type ReadinessScore = {
  score: number;
  label: string;
  hint: string;
};

function computeReadiness(stats: {
  activeMinutes: number;
  weeklyWorkoutCount: number;
  kcalIn: number;
  kcalOut: number;
  dailyKcalTarget: number | null;
}): ReadinessScore {
  // Simple readiness calculation based on activity and nutrition balance
  let score = 70; // Base score

  // Activity bonus (up to +15)
  if (stats.activeMinutes >= 30) score += 15;
  else if (stats.activeMinutes >= 20) score += 10;
  else if (stats.activeMinutes >= 10) score += 5;

  // Weekly workout bonus (up to +10)
  if (stats.weeklyWorkoutCount >= 5) score += 10;
  else if (stats.weeklyWorkoutCount >= 3) score += 7;
  else if (stats.weeklyWorkoutCount >= 1) score += 3;

  // Nutrition balance bonus/penalty (up to +/-5)
  if (stats.dailyKcalTarget) {
    const balance = stats.kcalIn - stats.kcalOut;
    const targetBalance = stats.dailyKcalTarget;
    if (Math.abs(balance - targetBalance) < targetBalance * 0.1) {
      score += 5; // Great balance
    } else if (Math.abs(balance) < targetBalance * 0.2) {
      score += 2; // OK balance
    } else {
      score -= 3; // Poor balance
    }
  }

  // Cap at 0-100
  score = Math.max(0, Math.min(100, score));

  // Generate label and hint
  let label: string;
  let hint: string;

  if (score >= 85) {
    label = "Tuyệt vời!";
    hint = "Bạn đang có ngày tuyệt vời!";
  } else if (score >= 70) {
    label = "Tốt";
    hint = "Ngủ + HRV ổn";
  } else if (score >= 50) {
    label = "Trung bình";
    hint = "Cố gắng thêm hoạt động nhé";
  } else {
    label = "Cần cải thiện";
    hint = "Hãy bắt đầu vận động";
  }

  return { score, label, hint };
}

export type HomeDashboardState = {
  // Data
  stats: DashboardData["stats"] | null;
  todaySession: DashboardData["todaySession"];
  streakDays: number;
  weeklyPulse: WeeklyPulseData[];
  readiness: ReadinessScore | null;
  
  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
};

export const useHomeDashboardStore = create<HomeDashboardState>((set, get) => ({
  stats: null,
  todaySession: null,
  streakDays: 0,
  weeklyPulse: [],
  readiness: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  load: async () => {
    const accessToken = useAuthStore.getState().getAccessToken();
    if (!accessToken) {
      set({ isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const [dashboardData, pulseData] = await Promise.all([
        fetchTodayDashboard(accessToken),
        fetchWeeklyPulse(accessToken),
      ]);

      const readiness = computeReadiness({
        activeMinutes: dashboardData.stats.activeMinutes,
        weeklyWorkoutCount: dashboardData.stats.weeklyWorkoutCount,
        kcalIn: dashboardData.stats.kcalIn,
        kcalOut: dashboardData.stats.kcalOut,
        dailyKcalTarget: dashboardData.stats.dailyKcalTarget,
      });

      set({
        stats: dashboardData.stats,
        todaySession: dashboardData.todaySession,
        streakDays: dashboardData.streakDays,
        weeklyPulse: pulseData,
        readiness,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Không thể tải dữ liệu dashboard",
      });
    }
  },

  refresh: async () => {
    set({ isRefreshing: true });
    await get().load();
    set({ isRefreshing: false });
  },

  clearError: () => set({ error: null }),
}));
