import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiErrorCodes } from "@health-fitness/shared";
import { AppError } from "../errors/app-error.js";
import { getLogger } from "../logger.js";

export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId ?? "unknown";
  const logger = getLogger();

  if (err instanceof ZodError) {
    res.status(400).json({
      code: ApiErrorCodes.VALIDATION_ERROR,
      message: "Invalid request",
      details: err.flatten(),
      requestId,
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn({ err, requestId }, err.message);
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details,
      requestId,
    });
    return;
  }

  logger.error({ err, requestId }, "Unhandled error");
  res.status(500).json({
    code: ApiErrorCodes.INTERNAL_ERROR,
    message: "Internal server error",
    requestId,
  });
}
