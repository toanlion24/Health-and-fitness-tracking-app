/**
 * Cross-layer API contracts (types only). Runtime code lives in backend/mobile.
 */

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
  requestId: string;
};

export const ApiErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthUserDto = {
  id: number;
  email: string;
  status: string;
};

export type RegisterResponseDto = {
  user: AuthUserDto;
  tokens: AuthTokens;
};

export type LoginResponseDto = RegisterResponseDto;

export type RefreshResponseDto = {
  tokens: AuthTokens;
};

/** Serialized profile (dates/decimal as strings for JSON). */
export type UserProfileDto = {
  userId: number;
  fullName: string | null;
  gender: string | null;
  dob: string | null;
  heightCm: string | null;
  activityLevel: string | null;
  timezone: string | null;
  locale: string | null;
};

export type UserGoalDto = {
  id: number;
  userId: number;
  goalType: string;
  targetWeightKg: string | null;
  weeklyWorkoutTarget: number | null;
  dailyKcalTarget: number | null;
  startDate: string | null;
  targetDate: string | null;
  isActive: boolean;
};

export type MeResponseDto = {
  id: number;
  email: string;
  status: string;
  profile: UserProfileDto | null;
  goals: UserGoalDto[];
};

export type UpdateProfileBodyDto = {
  fullName?: string | null;
  gender?: string | null;
  dob?: string | null;
  heightCm?: number | null;
  activityLevel?: string | null;
  timezone?: string | null;
  locale?: string | null;
};

export type PutGoalsBodyDto = {
  goalType: string;
  targetWeightKg?: number | null;
  weeklyWorkoutTarget?: number | null;
  dailyKcalTarget?: number | null;
  startDate?: string | null;
  targetDate?: string | null;
  isActive?: boolean;
};

/** Phase 1 — workouts */
export type ExerciseDto = {
  id: number;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  met: string | null;
};

export type WorkoutPlanExerciseDto = {
  id: number;
  planId: number;
  exercise: ExerciseDto;
  sortOrder: number;
  targetSets: number | null;
  targetReps: number | null;
  targetWeightKg: string | null;
  restSec: number | null;
};

export type WorkoutPlanSummaryDto = {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutPlanDetailDto = WorkoutPlanSummaryDto & {
  exercises: WorkoutPlanExerciseDto[];
};

export type WorkoutSessionSetDto = {
  id: number;
  sessionId: number;
  exercise: ExerciseDto;
  setIndex: number;
  actualReps: number | null;
  actualWeightKg: string | null;
  actualDurationSec: number | null;
  rpe: number | null;
  createdAt: string;
};

export type WorkoutSessionSummaryDto = {
  id: number;
  userId: number;
  planId: number | null;
  sessionDate: string;
  startedAt: string;
  endedAt: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

export type WorkoutSessionDetailDto = WorkoutSessionSummaryDto & {
  sets: WorkoutSessionSetDto[];
};

/** Phase 1 — nutrition */
export type FoodDto = {
  id: number;
  userId: number | null;
  name: string;
  kcalPerServing: number;
  proteinG: string;
  carbG: string;
  fatG: string;
  servingUnit: string | null;
};

export type MealLogItemDto = {
  id: number;
  mealLogId: number;
  foodId: number | null;
  customFoodName: string | null;
  quantity: string;
  unit: string | null;
  kcal: number;
  proteinG: string;
  carbG: string;
  fatG: string;
};

export type MealLogDto = {
  id: number;
  userId: number;
  mealType: string;
  loggedAt: string;
  notes: string | null;
  createdAt: string;
  items: MealLogItemDto[];
};

/** Phase 1 — body metrics */
export type BodyMetricLogDto = {
  id: number;
  userId: number;
  recordedAt: string;
  weightKg: string | null;
  bodyFatPct: string | null;
  waistCm: string | null;
  notes: string | null;
  createdAt: string;
};
