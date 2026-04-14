import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getLogger } from "./shared/logger.js";
import { requestIdMiddleware } from "./shared/middleware/request-id.js";
import { errorHandlerMiddleware } from "./shared/middleware/error-handler.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { createUsersRouter } from "./modules/users/users.routes.js";

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

  app.use(errorHandlerMiddleware);
  return app;
}
