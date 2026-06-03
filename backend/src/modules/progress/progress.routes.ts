import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateQuery } from "../../shared/middleware/validate.js";
import * as progressController from "./progress.controller.js";
import { listDailyProgressQuerySchema, summaryProgressQuerySchema } from "./progress.dto.js";

export function createProgressRouter(): Router {
  const router = Router();
  router.get(
    "/progress/daily",
    requireAuth,
    validateQuery(listDailyProgressQuerySchema),
    progressController.listDailyProgress,
  );
  router.get(
    "/progress/summary",
    requireAuth,
    validateQuery(summaryProgressQuerySchema),
    progressController.getSummaryProgress,
  );
  return router;
}
