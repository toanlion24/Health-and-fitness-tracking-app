import type {
  ExerciseDto,
  WorkoutPlanDetailDto,
  WorkoutPlanSummaryDto,
  WorkoutSessionDetailDto,
} from "@health-fitness/shared";
import { apiFetch } from "../../../core/api/client";

export async function fetchExercises(): Promise<ExerciseDto[]> {
  return apiFetch<ExerciseDto[]>("/api/v1/exercises", { auth: true });
}

export async function fetchWorkoutPlans(
  includeExercises: boolean,
): Promise<WorkoutPlanSummaryDto[] | WorkoutPlanDetailDto[]> {
  const q = includeExercises ? "?include=exercises" : "";
  return apiFetch(`/api/v1/workout-plans${q}`, { auth: true });
}

export async function createWorkoutSession(body: {
  planId?: number | null;
  sessionDate: string;
  notes?: string | null;
}): Promise<WorkoutSessionDetailDto> {
  return apiFetch<WorkoutSessionDetailDto>("/api/v1/workout-sessions", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export async function fetchWorkoutSession(
  sessionId: number,
): Promise<WorkoutSessionDetailDto> {
  return apiFetch<WorkoutSessionDetailDto>(
    `/api/v1/workout-sessions/${sessionId}`,
    { auth: true },
  );
}

export async function addWorkoutSet(
  sessionId: number,
  body: {
    exerciseId: number;
    setIndex: number;
    actualReps?: number | null;
    actualWeightKg?: number | null;
    rpe?: number | null;
  },
): Promise<WorkoutSessionDetailDto> {
  return apiFetch<WorkoutSessionDetailDto>(
    `/api/v1/workout-sessions/${sessionId}/sets`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    },
  );
}

export async function completeWorkoutSession(
  sessionId: number,
): Promise<WorkoutSessionDetailDto> {
  return apiFetch<WorkoutSessionDetailDto>(
    `/api/v1/workout-sessions/${sessionId}/complete`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({}),
    },
  );
}
