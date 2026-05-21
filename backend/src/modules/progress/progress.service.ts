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
    },
    include: {
      sets: {
        include: { exercise: true }
      }
    }
  });

  // Lấy cân nặng mới nhất của người dùng để tính Calo
  const latestWeightLog = await prisma.bodyMetricLog.findFirst({
    where: { userId, weightKg: { not: null } },
    orderBy: { recordedAt: "desc" },
  });
  const userWeight = latestWeightLog?.weightKg ? Number(latestWeightLog.weightKg) : 70;

  let totalWorkoutMinutes = 0;
  let totalKcalOut = 0;

  for (const s of sessions) {
    // 1. Tính tổng thời gian tập (từ set hoặc từ startedAt/endedAt)
    let sessionMins = 0;
    if (s.endedAt && s.startedAt) {
      sessionMins = Math.max(0, Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60_000));
    }
    totalWorkoutMinutes += sessionMins;

    // 2. Tính Calo đốt cháy dựa trên MET từng bài tập
    for (const set of s.sets) {
      const durationSec = set.actualDurationSec || 0;
      const met = set.exercise.met ? Number(set.exercise.met) : 5.0; // Mặc định MET=5.0 nếu thiếu
      
      if (durationSec > 0) {
        // Công thức: (Thời gian phút) * (MET * 3.5 * Cân nặng) / 200
        const kcal = (durationSec / 60) * (met * 3.5 * userWeight) / 200;
        totalKcalOut += Math.round(kcal);
      } else {
        // Nếu không có duration từng set, dùng duration tổng chia đều (ước tính)
        // Đây là fallback nếu user chỉ log reps/weight mà không log time từng set
      }
    }

    // Nếu tổng Calo Out vẫn bằng 0 (do không log duration từng set), dùng fallback dựa trên tổng thời gian session
    if (totalKcalOut === 0 && sessionMins > 0) {
       totalKcalOut += Math.round(sessionMins * (5.0 * 3.5 * userWeight) / 200);
    }
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

export async function getSummaryProgress(
  userId: number,
  period: "week" | "month",
) {
  const today = new Date();
  const daysBack = period === "week" ? 7 : 30;

  const toDate = today.toISOString().slice(0, 10);
  const fromDateObj = new Date(today);
  fromDateObj.setUTCDate(today.getUTCDate() - (daysBack - 1));
  const fromDate = fromDateObj.toISOString().slice(0, 10);

  const days = enumerateDays(fromDate, toDate);
  for (const d of days) {
    await recomputeDailyProgress(userId, d);
  }

  const from = new Date(`${fromDate}T00:00:00.000Z`);
  const to = new Date(`${toDate}T23:59:59.999Z`);

  const rows = await prisma.dailyProgress.findMany({
    where: { userId, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });

  // Tổng hợp
  const totalKcalIn = rows.reduce((s, r) => s + r.totalKcalIn, 0);
  const totalKcalOut = rows.reduce((s, r) => s + r.totalKcalOut, 0);
  const totalWorkoutMinutes = rows.reduce((s, r) => s + r.totalWorkoutMinutes, 0);
  const avgKcalIn = rows.length > 0 ? Math.round(totalKcalIn / rows.length) : 0;
  const avgWorkoutMins = rows.length > 0 ? Math.round(totalWorkoutMinutes / rows.length) : 0;

  // Lấy cân nặng mới nhất
  const latestWeight = await prisma.bodyMetricLog.findFirst({
    where: { userId, weightKg: { not: null } },
    orderBy: { recordedAt: "desc" },
  });
  const earliestWeight = await prisma.bodyMetricLog.findFirst({
    where: { userId, weightKg: { not: null }, recordedAt: { gte: from } },
    orderBy: { recordedAt: "asc" },
  });

  const weightChangeSeries = await prisma.bodyMetricLog.findMany({
    where: { userId, weightKg: { not: null }, recordedAt: { gte: from, lte: to } },
    orderBy: { recordedAt: "asc" },
    select: { recordedAt: true, weightKg: true },
  });

  return {
    period,
    fromDate,
    toDate,
    dailyItems: rows.map(serializeDailyProgress),
    totals: { totalKcalIn, totalKcalOut, totalWorkoutMinutes },
    averages: { avgKcalIn, avgWorkoutMins },
    weight: {
      currentKg: latestWeight?.weightKg ?? null,
      changeKg:
        latestWeight?.weightKg && earliestWeight?.weightKg
          ? Number(latestWeight.weightKg) - Number(earliestWeight.weightKg)
          : null,
      series: weightChangeSeries.map((w) => ({
        date: w.recordedAt.toISOString().slice(0, 10),
        weightKg: Number(w.weightKg),
      })),
    },
  };
}
