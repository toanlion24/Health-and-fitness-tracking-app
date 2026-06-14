import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as service from "./service.js";
import { AppError } from "../../shared/errors/app-error.js";

// ============== WATER ==============

export async function handleLogWater(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = z.object({
      amountMl: z.number().int().min(1).max(5000),
    }).parse(req.body);

    const result = await service.logWater(userId, body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetWaterLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const query = z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      offset: z.coerce.number().int().min(0).optional(),
    }).parse(req.query);

    const result = await service.getWaterLogs(userId, query);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function handleGetTodayWater(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await service.getTodayWaterSummary(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateWaterGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = z.object({
      goalMl: z.number().int().min(500).max(10000),
    }).parse(req.body);

    const result = await service.updateWaterGoal(userId, body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ============== SLEEP ==============

export async function handleLogSleep(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = z.object({
      sleepTime: z.string().datetime(),
      wakeTime: z.string().datetime(),
      quality: z.number().int().min(1).max(5).optional(),
      notes: z.string().max(512).optional(),
    }).parse(req.body);

    const result = await service.logSleep(userId, body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetSleepLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const query = z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      offset: z.coerce.number().int().min(0).optional(),
    }).parse(req.query);

    const result = await service.getSleepLogs(userId, query);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function handleGetTodaySleep(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await service.getTodaySleepSummary(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateSleepGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = z.object({
      sleepGoalMin: z.number().int().min(60).max(720),
    }).parse(req.body);

    const result = await service.updateSleepGoal(userId, body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteSleepLog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const sleepLogId = parseInt(req.params.sleepLogId, 10);
    if (isNaN(sleepLogId)) {
      throw new AppError(400, "INVALID_ID", "Invalid sleep log ID");
    }

    await service.deleteSleepLog(userId, sleepLogId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
