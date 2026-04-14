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
