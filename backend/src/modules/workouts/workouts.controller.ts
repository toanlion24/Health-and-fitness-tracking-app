import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthedRequest } from "../../shared/middleware/require-auth.js";
import { parsePositiveIntParam } from "../../shared/http/parse-positive-int.js";
import * as workoutsService from "./workouts.service.js";
import type {
  ListExercisesQuery,
  ListWorkoutPlansQuery,
  ListWorkoutSessionsQuery,
} from "./workouts.dto.js";

export const listExercises: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = req.query as unknown as ListExercisesQuery;
    const result = await workoutsService.listExercises(q);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createWorkoutPlan: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const result = await workoutsService.createWorkoutPlan(
      authed.user.id,
      req.body,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const listWorkoutPlans: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const q = req.query as unknown as ListWorkoutPlansQuery;
    const include = q.include === "exercises";
    const result = await workoutsService.listWorkoutPlans(
      authed.user.id,
      include,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getWorkoutPlan: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const planId = parsePositiveIntParam(req.params.planId, "planId");
    const result = await workoutsService.getWorkoutPlan(authed.user.id, planId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const patchWorkoutPlan: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const planId = parsePositiveIntParam(req.params.planId, "planId");
    const result = await workoutsService.patchWorkoutPlan(
      authed.user.id,
      planId,
      req.body,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteWorkoutPlan: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const planId = parsePositiveIntParam(req.params.planId, "planId");
    await workoutsService.deleteWorkoutPlan(authed.user.id, planId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const createWorkoutSession: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const result = await workoutsService.createWorkoutSession(
      authed.user.id,
      req.body,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const listWorkoutSessions: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const q = req.query as unknown as ListWorkoutSessionsQuery;
    const result = await workoutsService.listWorkoutSessions(authed.user.id, q);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getWorkoutSession: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const sessionId = parsePositiveIntParam(
      req.params.sessionId,
      "sessionId",
    );
    const result = await workoutsService.getWorkoutSession(
      authed.user.id,
      sessionId,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const addWorkoutSet: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const sessionId = parsePositiveIntParam(
      req.params.sessionId,
      "sessionId",
    );
    const result = await workoutsService.addWorkoutSet(
      authed.user.id,
      sessionId,
      req.body,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const patchWorkoutSet: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const sessionId = parsePositiveIntParam(
      req.params.sessionId,
      "sessionId",
    );
    const setId = parsePositiveIntParam(req.params.setId, "setId");
    const result = await workoutsService.patchWorkoutSet(
      authed.user.id,
      sessionId,
      setId,
      req.body,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const completeWorkoutSession: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const sessionId = parsePositiveIntParam(
      req.params.sessionId,
      "sessionId",
    );
    const result = await workoutsService.completeWorkoutSession(
      authed.user.id,
      sessionId,
      req.body,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
