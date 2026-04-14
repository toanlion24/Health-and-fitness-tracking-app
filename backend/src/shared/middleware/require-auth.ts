import type { NextFunction, Request, Response } from "express";
import { ApiErrorCodes } from "@health-fitness/shared";
import { AppError } from "../errors/app-error.js";
import { verifyAccessToken } from "../auth/jwt.js";

export type AuthedRequest = Request & {
  requestId: string;
  user: { id: number; email: string };
};

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    next(
      new AppError(401, ApiErrorCodes.UNAUTHORIZED, "Missing bearer token"),
    );
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyAccessToken(token);
    (req as AuthedRequest).user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(
      new AppError(401, ApiErrorCodes.UNAUTHORIZED, "Invalid access token"),
    );
  }
}
