import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getLogger } from "./shared/logger.js";
import { requestIdMiddleware } from "./shared/middleware/request-id.js";
import { errorHandlerMiddleware } from "./shared/middleware/error-handler.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { createBodyMetricsRouter } from "./modules/body-metrics/body-metrics.routes.js";
import { createNutritionRouter } from "./modules/nutrition/nutrition.routes.js";
import { createProgressRouter } from "./modules/progress/progress.routes.js";
import { createRemindersRouter } from "./modules/reminders/reminders.routes.js";
import { createUsersRouter } from "./modules/users/users.routes.js";
import { createWorkoutsRouter } from "./modules/workouts/workouts.routes.js";

export function createApp(): express.Express {
  const app = express();
  const logger = getLogger();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(requestIdMiddleware);
  app.use((req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      const level =
        res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
            ? "warn"
            : "info";
      logger[level](
        {
          method: req.method,
          path: req.url,
          status: res.statusCode,
          durationMs: Date.now() - started,
          requestId: req.requestId,
        },
        "request completed",
      );
    });
    next();
  });

  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/v1/auth", createAuthRouter());
  app.use("/api/v1", createUsersRouter());
  app.use("/api/v1", createWorkoutsRouter());
  app.use("/api/v1", createNutritionRouter());
  app.use("/api/v1", createBodyMetricsRouter());
  app.use("/api/v1", createProgressRouter());
  app.use("/api/v1", createRemindersRouter());

  app.use(errorHandlerMiddleware);
  return app;
}
