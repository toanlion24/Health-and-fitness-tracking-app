import { ApiErrorCodes } from "@health-fitness/shared";
import type {
  WaterLogDto,
  DailyWaterSummaryDto,
  SleepLogDto,
  DailySleepSummaryDto,
} from "./serializer.js";
import type {
  LogWaterBody,
  GetWaterLogsQuery,
  UpdateWaterGoalBody,
  LogSleepBody,
  GetSleepLogsQuery,
  UpdateSleepGoalBody,
} from "./dto.js";
import { prisma } from "../../shared/db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import { DateTime } from "luxon";

// ============== WATER TRACKING ==============

export async function logWater(
  userId: number,
  body: LogWaterBody
): Promise<DailyWaterSummaryDto> {
  const now = DateTime.now();
  const today = now.toISODate();
  const loggedAt = now.toJSDate();

  if (!today) {
    throw new AppError(500, ApiErrorCodes.INTERNAL_ERROR, "Invalid date");
  }

  // Create water log entry
  await prisma.waterLog.create({
    data: {
      userId,
      amountMl: body.amountMl,
      loggedAt,
    },
  });

  // Update daily summary
  const summary = await prisma.dailyWaterSummary.upsert({
    where: {
      userId_date: {
        userId,
        date: DateTime.fromISO(today).toJSDate(),
      },
    },
    create: {
      userId,
      date: DateTime.fromISO(today).toJSDate(),
      totalMl: body.amountMl,
      goalMl: 2000,
      glassesCount: Math.ceil(body.amountMl / 250),
    },
    update: {
      totalMl: { increment: body.amountMl },
      glassesCount: { increment: Math.ceil(body.amountMl / 250) },
    },
  });

  return formatDailyWaterSummary(summary);
}

export async function getWaterLogs(
  userId: number,
  query: GetWaterLogsQuery
): Promise<WaterLogDto[]> {
  const take = query.limit ?? 50;
  const skip = query.offset ?? 0;

  const where: any = { userId };

  if (query.from) {
    where.loggedAt = {
      ...where.loggedAt,
      gte: new Date(query.from),
    };
  }
  if (query.to) {
    where.loggedAt = {
      ...where.loggedAt,
      lte: new Date(query.to),
    };
  }

  const logs = await prisma.waterLog.findMany({
    where,
    orderBy: { loggedAt: "desc" },
    take,
    skip,
  });

  return logs.map(formatWaterLog);
}

export async function getTodayWaterSummary(
  userId: number
): Promise<DailyWaterSummaryDto> {
  const today = DateTime.now().toISODate();
  if (!today) {
    throw new AppError(500, ApiErrorCodes.INTERNAL_ERROR, "Invalid date");
  }

  const summary = await prisma.dailyWaterSummary.findUnique({
    where: {
      userId_date: {
        userId,
        date: DateTime.fromISO(today).toJSDate(),
      },
    },
  });

  if (!summary) {
    return {
      date: today,
      totalMl: 0,
      goalMl: 2000,
      glassesCount: 0,
      percentage: 0,
    };
  }

  return formatDailyWaterSummary(summary);
}

export async function updateWaterGoal(
  userId: number,
  body: UpdateWaterGoalBody
): Promise<DailyWaterSummaryDto> {
  const today = DateTime.now().toISODate();
  if (!today) {
    throw new AppError(500, ApiErrorCodes.INTERNAL_ERROR, "Invalid date");
  }

  const summary = await prisma.dailyWaterSummary.upsert({
    where: {
      userId_date: {
        userId,
        date: DateTime.fromISO(today).toJSDate(),
      },
    },
    create: {
      userId,
      date: DateTime.fromISO(today).toJSDate(),
      totalMl: 0,
      goalMl: body.goalMl,
      glassesCount: 0,
    },
    update: {
      goalMl: body.goalMl,
    },
  });

  return formatDailyWaterSummary(summary);
}

// ============== SLEEP TRACKING ==============

export async function logSleep(
  userId: number,
  body: LogSleepBody
): Promise<SleepLogDto> {
  const sleepTime = new Date(body.sleepTime);
  const wakeTime = new Date(body.wakeTime);

  // Calculate duration
  let durationMinutes: number | null = null;
  if (wakeTime > sleepTime) {
    durationMinutes = Math.round((wakeTime.getTime() - sleepTime.getTime()) / 60000);
  }

  const sleepLog = await prisma.sleepLog.create({
    data: {
      userId,
      sleepTime,
      wakeTime,
      durationMinutes,
      quality: body.quality,
      notes: body.notes,
    },
  });

  // Update daily sleep summary
  const sleepDate = DateTime.fromJSDate(sleepTime).toISODate();
  if (sleepDate) {
    await updateDailySleepSummary(userId, sleepDate);
  }

  return formatSleepLog(sleepLog);
}

export async function getSleepLogs(
  userId: number,
  query: GetSleepLogsQuery
): Promise<SleepLogDto[]> {
  const take = query.limit ?? 50;
  const skip = query.offset ?? 0;

  const where: any = { userId };

  if (query.from) {
    where.sleepTime = {
      ...where.sleepTime,
      gte: new Date(query.from),
    };
  }
  if (query.to) {
    where.sleepTime = {
      ...where.sleepTime,
      lte: new Date(query.to),
    };
  }

  const logs = await prisma.sleepLog.findMany({
    where,
    orderBy: { sleepTime: "desc" },
    take,
    skip,
  });

  return logs.map(formatSleepLog);
}

export async function getTodaySleepSummary(
  userId: number
): Promise<DailySleepSummaryDto> {
  const today = DateTime.now().toISODate();
  if (!today) {
    throw new AppError(500, ApiErrorCodes.INTERNAL_ERROR, "Invalid date");
  }

  const summary = await prisma.dailySleepSummary.findUnique({
    where: {
      userId_date: {
        userId,
        date: DateTime.fromISO(today).toJSDate(),
      },
    },
  });

  if (!summary) {
    return {
      date: today,
      totalSleepMin: 0,
      avgQuality: null,
      sleepGoalMin: 480,
      percentage: 0,
    };
  }

  return formatDailySleepSummary(summary);
}

export async function updateSleepGoal(
  userId: number,
  body: UpdateSleepGoalBody
): Promise<DailySleepSummaryDto> {
  const today = DateTime.now().toISODate();
  if (!today) {
    throw new AppError(500, ApiErrorCodes.INTERNAL_ERROR, "Invalid date");
  }

  const summary = await prisma.dailySleepSummary.upsert({
    where: {
      userId_date: {
        userId,
        date: DateTime.fromISO(today).toJSDate(),
      },
    },
    create: {
      userId,
      date: DateTime.fromISO(today).toJSDate(),
      totalSleepMin: 0,
      sleepGoalMin: body.sleepGoalMin,
    },
    update: {
      sleepGoalMin: body.sleepGoalMin,
    },
  });

  return formatDailySleepSummary(summary);
}

export async function deleteSleepLog(
  userId: number,
  sleepLogId: number
): Promise<void> {
  const log = await prisma.sleepLog.findFirst({
    where: { id: sleepLogId, userId },
  });

  if (!log) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Sleep log not found");
  }

  await prisma.sleepLog.delete({
    where: { id: sleepLogId },
  });

  // Recalculate daily summary
  const sleepDate = DateTime.fromJSDate(log.sleepTime).toISODate();
  if (sleepDate) {
    await updateDailySleepSummary(userId, sleepDate);
  }
}

// ============== HELPERS ==============

async function updateDailySleepSummary(userId: number, dateStr: string): Promise<void> {
  const startOfDay = DateTime.fromISO(dateStr).startOf("day").toJSDate();
  const endOfDay = DateTime.fromISO(dateStr).endOf("day").toJSDate();

  const logs = await prisma.sleepLog.findMany({
    where: {
      userId,
      sleepTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const totalSleepMin = logs.reduce((sum, log) => sum + (log.durationMinutes ?? 0), 0);
  const qualityValues = logs.map((l) => l.quality).filter((q): q is number => q !== null);
  const avgQuality = qualityValues.length > 0
    ? qualityValues.reduce((a, b) => a + b, 0) / qualityValues.length
    : null;

  await prisma.dailySleepSummary.upsert({
    where: {
      userId_date: { userId, date: startOfDay },
    },
    create: {
      userId,
      date: startOfDay,
      totalSleepMin,
      avgQuality,
      sleepGoalMin: 480,
    },
    update: {
      totalSleepMin,
      avgQuality,
    },
  });
}

function formatWaterLog(log: { id: number; amountMl: number; loggedAt: Date }): WaterLogDto {
  return {
    id: log.id,
    amountMl: log.amountMl,
    loggedAt: log.loggedAt.toISOString(),
  };
}

function formatDailyWaterSummary(
  summary: { date: Date; totalMl: number; goalMl: number; glassesCount: number }
): DailyWaterSummaryDto {
  return {
    date: DateTime.fromJSDate(summary.date).toISODate()!,
    totalMl: summary.totalMl,
    goalMl: summary.goalMl,
    glassesCount: summary.glassesCount,
    percentage: Math.min(100, Math.round((summary.totalMl / summary.goalMl) * 100)),
  };
}

function formatSleepLog(
  log: {
    id: number;
    sleepTime: Date;
    wakeTime: Date;
    durationMinutes: number | null;
    quality: number | null;
    notes: string | null;
  }
): SleepLogDto {
  return {
    id: log.id,
    sleepTime: log.sleepTime.toISOString(),
    wakeTime: log.wakeTime.toISOString(),
    durationMinutes: log.durationMinutes,
    quality: log.quality,
    notes: log.notes,
  };
}

function formatDailySleepSummary(
  summary: {
    date: Date;
    totalSleepMin: number;
    avgQuality: number | null;
    sleepGoalMin: number;
  }
): DailySleepSummaryDto {
  return {
    date: DateTime.fromJSDate(summary.date).toISODate()!,
    totalSleepMin: summary.totalSleepMin,
    avgQuality: summary.avgQuality,
    sleepGoalMin: summary.sleepGoalMin,
    percentage: Math.min(100, Math.round((summary.totalSleepMin / summary.sleepGoalMin) * 100)),
  };
}
