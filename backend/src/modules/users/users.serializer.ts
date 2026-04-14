import type { Prisma } from "@prisma/client";
import type { UserGoalDto, UserProfileDto } from "@health-fitness/shared";

type ProfileRow = Prisma.UserProfileGetPayload<object>;
type GoalRow = Prisma.UserGoalGetPayload<object>;

export function serializeProfile(row: ProfileRow): UserProfileDto {
  return {
    userId: row.userId,
    fullName: row.fullName,
    gender: row.gender,
    dob: row.dob ? row.dob.toISOString().slice(0, 10) : null,
    heightCm: row.heightCm ? row.heightCm.toString() : null,
    activityLevel: row.activityLevel,
    timezone: row.timezone,
    locale: row.locale,
  };
}

export function serializeGoal(row: GoalRow): UserGoalDto {
  return {
    id: row.id,
    userId: row.userId,
    goalType: row.goalType,
    targetWeightKg: row.targetWeightKg ? row.targetWeightKg.toString() : null,
    weeklyWorkoutTarget: row.weeklyWorkoutTarget,
    dailyKcalTarget: row.dailyKcalTarget,
    startDate: row.startDate ? row.startDate.toISOString().slice(0, 10) : null,
    targetDate: row.targetDate ? row.targetDate.toISOString().slice(0, 10) : null,
    isActive: row.isActive,
  };
}
