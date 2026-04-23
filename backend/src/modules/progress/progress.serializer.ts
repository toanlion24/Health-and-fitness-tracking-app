import type { DailyProgress } from "@prisma/client";

export function serializeDailyProgress(row: DailyProgress): {
  id: number;
  userId: number;
  date: string;
  totalKcalIn: number;
  totalKcalOut: number;
  totalWorkoutMinutes: number;
  proteinG: string;
  carbG: string;
  fatG: string;
  goalScore: number | null;
  updatedAt: string;
} {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date.toISOString().slice(0, 10),
    totalKcalIn: row.totalKcalIn,
    totalKcalOut: row.totalKcalOut,
    totalWorkoutMinutes: row.totalWorkoutMinutes,
    proteinG: row.proteinG.toString(),
    carbG: row.carbG.toString(),
    fatG: row.fatG.toString(),
    goalScore: row.goalScore,
    updatedAt: row.updatedAt.toISOString(),
  };
}
