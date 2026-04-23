import { Decimal } from "@prisma/client/runtime/library";
import { ApiErrorCodes } from "@health-fitness/shared";
import { prisma } from "../../shared/db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import { computeGoalScore } from "./progress-calc.js";
import type { ListDailyProgressQuery } from "./progress.dto.js";
import { serializeDailyProgress } from "./progress.serializer.js";

function dayRangeUtc(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  return { start, end };
}

function parseDayDate(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

function enumerateDays(from: string, to: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export async function recomputeDailyProgress(
  userId: number,
  day: string,
): Promise<void> {
  const { start, end } = dayRangeUtc(day);
  const sessionDate = parseDayDate(day);

  const meals = await prisma.mealLog.findMany({
    where: {
      userId,
      loggedAt: { gte: start, lte: end },
    },
    include: { items: true },
  });

  let totalKcalIn = 0;
  let protein = new Decimal(0);
  let carb = new Decimal(0);
  let fat = new Decimal(0);
  for (const m of meals) {
    for (const i of m.items) {
      totalKcalIn += i.kcal;
      protein = protein.add(i.proteinG);
      carb = carb.add(i.carbG);
      fat = fat.add(i.fatG);
    }
  }

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      sessionDate,
      status: "completed",
      endedAt: { not: null },
    },
  });

  let totalWorkoutMinutes = 0;
  let totalKcalOut = 0;
  for (const s of sessions) {
    if (!s.endedAt) {
      continue;
    }
    const mins = Math.max(
      0,
      Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60_000),
    );
    totalWorkoutMinutes += mins;
    totalKcalOut += Math.round(mins * 7);
  }

  const goal = await prisma.userGoal.findFirst({
    where: { userId, isActive: true },
    orderBy: { id: "desc" },
  });

  const goalScore = computeGoalScore({
    totalKcalIn,
    dailyKcalTarget: goal?.dailyKcalTarget ?? null,
    totalWorkoutMinutes,
    weeklyWorkoutTarget: goal?.weeklyWorkoutTarget ?? null,
  });

  await prisma.dailyProgress.upsert({
    where: {
      userId_date: {
        userId,
        date: sessionDate,
      },
    },
    create: {
      userId,
      date: sessionDate,
      totalKcalIn,
      totalKcalOut,
      totalWorkoutMinutes,
      proteinG: protein,
      carbG: carb,
      fatG: fat,
      goalScore,
    },
    update: {
      totalKcalIn,
      totalKcalOut,
      totalWorkoutMinutes,
      proteinG: protein,
      carbG: carb,
      fatG: fat,
      goalScore,
    },
  });
}

export async function listDailyProgress(
  userId: number,
  query: ListDailyProgressQuery,
) {
  const from = new Date(`${query.from}T00:00:00.000Z`);
  const to = new Date(`${query.to}T00:00:00.000Z`);
  const dayMs = 86400000;
  const maxDays = 120;
  if (from > to) {
    throw new AppError(
      400,
      ApiErrorCodes.VALIDATION_ERROR,
      "`from` must be on or before `to`",
    );
  }
  if (to.getTime() - from.getTime() > maxDays * dayMs) {
    throw new AppError(
      400,
      ApiErrorCodes.VALIDATION_ERROR,
      "Date range must be at most 120 days",
    );
  }

  const days = enumerateDays(query.from, query.to);
  for (const d of days) {
    await recomputeDailyProgress(userId, d);
  }

  const rows = await prisma.dailyProgress.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    orderBy: { date: "asc" },
  });

  return rows.map(serializeDailyProgress);
}
