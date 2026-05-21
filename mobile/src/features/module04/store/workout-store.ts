import { create } from "zustand";
import { fetchApi } from "../../../core/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExerciseItem = {
  id: number;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  met: number | null;
};

export type SessionSet = {
  setIndex: number;
  exerciseId: number;
  actualReps?: number | null;
  actualWeightKg?: number | null;
  actualDurationSec?: number | null;
};

export type ActiveSession = {
  sessionId: number;
  startedAt: string;
  exerciseName: string;
  exerciseId: number;
  sets: SessionSet[];
};

// ─── Store ────────────────────────────────────────────────────────────────────

type WorkoutState = {
  exercises: ExerciseItem[];
  loadingExercises: boolean;
  activeSession: ActiveSession | null;
  sessionStartedAt: Date | null;
  sessionCompleted: boolean;
  totalKcalBurned: number;
  totalDurationSec: number;

  fetchExercises: (query?: string, muscle?: string) => Promise<void>;
  startSession: (exerciseId: number, exerciseName: string, sessionDate: string) => Promise<void>;
  logSet: (set: Omit<SessionSet, "setIndex">) => Promise<void>;
  finishSession: () => Promise<void>;
  resetSession: () => void;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  exercises: [],
  loadingExercises: false,
  activeSession: null,
  sessionStartedAt: null,
  sessionCompleted: false,
  totalKcalBurned: 0,
  totalDurationSec: 0,

  fetchExercises: async (query = "", muscle = "") => {
    set({ loadingExercises: true });
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (query.trim()) params.append("q", query.trim());
      if (muscle.trim()) params.append("muscleGroup", muscle.trim());
      const res = await fetchApi(`/exercises?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as ExerciseItem[];
        set({ exercises: data });
      }
    } catch (e) {
      console.error("fetchExercises error:", e);
    } finally {
      set({ loadingExercises: false });
    }
  },

  startSession: async (exerciseId, exerciseName, sessionDate) => {
    try {
      const startedAt = new Date().toISOString();
      const res = await fetchApi("/workout-sessions", {
        method: "POST",
        body: JSON.stringify({ sessionDate, startedAt }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: number };
        set({
          activeSession: { sessionId: data.id, startedAt, exerciseName, exerciseId, sets: [] },
          sessionStartedAt: new Date(startedAt),
          sessionCompleted: false,
          totalKcalBurned: 0,
          totalDurationSec: 0,
        });
      }
    } catch (e) {
      console.error("startSession error:", e);
    }
  },

  logSet: async (setData) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const setIndex = activeSession.sets.length + 1;
    try {
      await fetchApi(`/workout-sessions/${activeSession.sessionId}/sets`, {
        method: "POST",
        body: JSON.stringify({ ...setData, setIndex }),
      });
      set((s) => ({
        activeSession: s.activeSession
          ? { ...s.activeSession, sets: [...s.activeSession.sets, { ...setData, setIndex }] }
          : null,
      }));
    } catch (e) {
      console.error("logSet error:", e);
    }
  },

  finishSession: async () => {
    const { activeSession, sessionStartedAt } = get();
    if (!activeSession) return;
    try {
      const endedAt = new Date().toISOString();
      await fetchApi(`/workout-sessions/${activeSession.sessionId}/complete`, {
        method: "PATCH",
        body: JSON.stringify({ endedAt }),
      });
      const durationSec = sessionStartedAt
        ? Math.round((Date.now() - sessionStartedAt.getTime()) / 1000)
        : 0;
      set({ sessionCompleted: true, totalDurationSec: durationSec });
    } catch (e) {
      console.error("finishSession error:", e);
    }
  },

  resetSession: () =>
    set({
      activeSession: null,
      sessionStartedAt: null,
      sessionCompleted: false,
      totalKcalBurned: 0,
      totalDurationSec: 0,
    }),
}));
