import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateBody, validateQuery } from "../../shared/middleware/validate.js";
import * as bodyMetricsController from "./body-metrics.controller.js";
import {
  createBodyMetricBodySchema,
  listBodyMetricsQuerySchema,
  patchBodyMetricBodySchema,
} from "./body-metrics.dto.js";

export function createBodyMetricsRouter(): Router {
  const router = Router();

  router.get(
    "/body-metrics",
    requireAuth,
    validateQuery(listBodyMetricsQuerySchema),
    bodyMetricsController.listBodyMetrics,
  );
  router.post(
    "/body-metrics",
    requireAuth,
    validateBody(createBodyMetricBodySchema),
    bodyMetricsController.createBodyMetric,
  );
  router.get(
    "/body-metrics/:metricId",
    requireAuth,
    bodyMetricsController.getBodyMetric,
  );
  router.patch(
    "/body-metrics/:metricId",
    requireAuth,
    validateBody(patchBodyMetricBodySchema),
    bodyMetricsController.patchBodyMetric,
  );
  router.delete(
    "/body-metrics/:metricId",
    requireAuth,
    bodyMetricsController.deleteBodyMetric,
  );

  return router;
}
