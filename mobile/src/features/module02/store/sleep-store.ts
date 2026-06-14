import { create } from "zustand";
import { api } from "@/core/api/client";

export interface DailySleepSummary {
  date: string;
  totalSleepMin: number;
  avgQuality: number | null;
  sleepGoalMin: number;
  percentage: number;
}

export interface SleepLog {
  id: number;
  sleepTime: string;
  wakeTime: string;
  durationMinutes: number | null;
  quality: number | null;
  notes: string | null;
}

interface SleepState {
  todaySummary: DailySleepSummary | null;
  logs: SleepLog[];
  isLoading: boolean;
  error: string | null;

  fetchTodaySummary: () => Promise<void>;
  fetchLogs: (params?: { from?: string; to?: string }) => Promise<void>;
  logSleep: (data: {
    sleepTime: string;
    wakeTime: string;
    quality?: number;
    notes?: string;
  }) => Promise<void>;
  deleteLog: (sleepLogId: number) => Promise<void>;
  updateGoal: (sleepGoalMin: number) => Promise<void>;
  reset: () => void;
}

export function formatSleepDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function getSleepQualityLabel(quality: number | null): string {
  if (quality === null) return "Not rated";
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  return labels[quality] || "Unknown";
}

export function getSleepQualityColor(quality: number | null): string {
  if (quality === null) return "#9CA3AF";
  const colors = ["", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];
  return colors[quality] || "#9CA3AF";
}

export const useSleepStore = create<SleepState>((set) => ({
  todaySummary: null,
  logs: [],
  isLoading: false,
  error: null,

  fetchTodaySummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<DailySleepSummary>("/sleep/today");
      set({ todaySummary: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch sleep summary",
        isLoading: false
      });
    }
  },

  fetchLogs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.from) queryParams.set("from", params.from);
      if (params?.to) queryParams.set("to", params.to);

      const response = await api.get<{ data: SleepLog[] }>(
        `/sleep/logs?${queryParams.toString()}`
      );
      set({ logs: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch sleep logs",
        isLoading: false
      });
    }
  },

  logSleep: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post<SleepLog>("/sleep/log", data);

      // Refetch today's summary
      const summaryResponse = await api.get<DailySleepSummary>("/sleep/today");

      // Refetch logs
      const logsResponse = await api.get<{ data: SleepLog[] }>("/sleep/logs");

      set({
        todaySummary: summaryResponse.data,
        logs: logsResponse.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to log sleep",
        isLoading: false
      });
      throw error;
    }
  },

  deleteLog: async (sleepLogId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/sleep/${sleepLogId}`);

      // Refetch summaries
      const summaryResponse = await api.get<DailySleepSummary>("/sleep/today");
      const logsResponse = await api.get<{ data: SleepLog[] }>("/sleep/logs");

      set({
        todaySummary: summaryResponse.data,
        logs: logsResponse.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete sleep log",
        isLoading: false
      });
      throw error;
    }
  },

  updateGoal: async (sleepGoalMin: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<DailySleepSummary>("/sleep/goal", {
        sleepGoalMin,
      });
      set({ todaySummary: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to update goal",
        isLoading: false
      });
      throw error;
    }
  },

  reset: () => {
    set({
      todaySummary: null,
      logs: [],
      isLoading: false,
      error: null,
    });
  },
}));
