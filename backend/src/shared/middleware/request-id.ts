import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const headerId = req.header("x-request-id");
  const id = headerId && headerId.length > 0 ? headerId : uuidv4();
  res.setHeader("x-request-id", id);
  req.requestId = id;
  next();
}
