import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthedRequest } from "../../shared/middleware/require-auth.js";
import { parsePositiveIntParam } from "../../shared/http/parse-positive-int.js";
import * as bodyMetricsService from "./body-metrics.service.js";
import type { ListBodyMetricsQuery } from "./body-metrics.dto.js";

export const listBodyMetrics: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const q = req.query as unknown as ListBodyMetricsQuery;
    const result = await bodyMetricsService.listBodyMetrics(authed.user.id, q);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createBodyMetric: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const result = await bodyMetricsService.createBodyMetric(
      authed.user.id,
      req.body,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getBodyMetric: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.metricId, "metricId");
    const result = await bodyMetricsService.getBodyMetric(authed.user.id, id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const patchBodyMetric: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.metricId, "metricId");
    const result = await bodyMetricsService.patchBodyMetric(
      authed.user.id,
      id,
      req.body,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteBodyMetric: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.metricId, "metricId");
    await bodyMetricsService.deleteBodyMetric(authed.user.id, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
