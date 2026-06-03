import type { NextFunction, Request, RequestHandler, Response } from "express";
import * as exercisesService from "./exercises.service.js";
import type { ListExercisesQuery } from "./exercises.dto.js";

export const listExerciseCategories: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await exercisesService.fetchExerciseCategories();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

export const listExercises: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query as unknown as ListExercisesQuery;
    const result = await exercisesService.fetchExercises(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
