import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthedRequest } from "../../shared/middleware/require-auth.js";
import { parsePositiveIntParam } from "../../shared/http/parse-positive-int.js";
import * as nutritionService from "./nutrition.service.js";
import type { ListFoodsQuery, ListMealLogsQuery } from "./nutrition.dto.js";

export const listFoods: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const q = req.query as unknown as ListFoodsQuery;
    const result = await nutritionService.listFoods(authed.user.id, q);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createMealLog: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const result = await nutritionService.createMealLog(authed.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const listMealLogs: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const q = req.query as unknown as ListMealLogsQuery;
    const result = await nutritionService.listMealLogsForDate(authed.user.id, q);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getMealLog: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.mealLogId, "mealLogId");
    const result = await nutritionService.getMealLog(authed.user.id, id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const patchMealLog: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.mealLogId, "mealLogId");
    const result = await nutritionService.patchMealLog(
      authed.user.id,
      id,
      req.body,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteMealLog: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.mealLogId, "mealLogId");
    await nutritionService.deleteMealLog(authed.user.id, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const addMealLogItem: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.mealLogId, "mealLogId");
    const result = await nutritionService.addMealLogItem(
      authed.user.id,
      id,
      req.body,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const patchMealLogItem: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const mealLogId = parsePositiveIntParam(req.params.mealLogId, "mealLogId");
    const itemId = parsePositiveIntParam(req.params.itemId, "itemId");
    const result = await nutritionService.patchMealLogItem(
      authed.user.id,
      mealLogId,
      itemId,
      req.body,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteMealLogItem: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const mealLogId = parsePositiveIntParam(req.params.mealLogId, "mealLogId");
    const itemId = parsePositiveIntParam(req.params.itemId, "itemId");
    await nutritionService.deleteMealLogItem(authed.user.id, mealLogId, itemId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
