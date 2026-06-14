import { create } from "zustand";
import { api } from "@/core/api/client";

export interface DailyWaterSummary {
  date: string;
  totalMl: number;
  goalMl: number;
  glassesCount: number;
  percentage: number;
}

export interface WaterLog {
  id: number;
  amountMl: number;
  loggedAt: string;
}

interface WaterState {
  todaySummary: DailyWaterSummary | null;
  logs: WaterLog[];
  isLoading: boolean;
  error: string | null;

  fetchTodaySummary: () => Promise<void>;
  fetchLogs: (params?: { from?: string; to?: string }) => Promise<void>;
  logWater: (amountMl: number) => Promise<void>;
  updateGoal: (goalMl: number) => Promise<void>;
  reset: () => void;
}

const DEFAULT_GOAL = 2000;

export const useWaterStore = create<WaterState>((set, get) => ({
  todaySummary: null,
  logs: [],
  isLoading: false,
  error: null,

  fetchTodaySummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<DailyWaterSummary>("/water/today");
      set({ todaySummary: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch water summary",
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

      const response = await api.get<{ data: WaterLog[] }>(
        `/water/logs?${queryParams.toString()}`
      );
      set({ logs: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch water logs",
        isLoading: false
      });
    }
  },

  logWater: async (amountMl: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<DailyWaterSummary>("/water/log", {
        amountMl,
      });

      const todaySummary = response.data;

      // Add to logs
      const newLog: WaterLog = {
        id: Date.now(),
        amountMl,
        loggedAt: new Date().toISOString(),
      };

      set((state) => ({
        todaySummary,
        logs: [newLog, ...state.logs],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to log water",
        isLoading: false
      });
      throw error;
    }
  },

  updateGoal: async (goalMl: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<DailyWaterSummary>("/water/goal", {
        goalMl,
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
