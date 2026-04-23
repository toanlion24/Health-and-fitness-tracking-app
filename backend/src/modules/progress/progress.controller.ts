import type { RequestHandler } from "express";
import type { AuthedRequest } from "../../shared/middleware/require-auth.js";
import type { ListDailyProgressQuery } from "./progress.dto.js";
import * as progressService from "./progress.service.js";

export const listDailyProgress: RequestHandler = async (
  req,
  res,
  next,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const result = await progressService.listDailyProgress(
      authed.user.id,
      req.query as unknown as ListDailyProgressQuery,
    );
    res.status(200).json({ items: result });
  } catch (err) {
    next(err);
  }
};
