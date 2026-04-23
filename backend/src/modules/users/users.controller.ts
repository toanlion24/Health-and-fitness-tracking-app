import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthedRequest } from "../../shared/middleware/require-auth.js";
import type { RegisterDeviceTokenBody } from "./users.dto.js";
import * as usersService from "./users.service.js";

export const getMe: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const result = await usersService.getMe(authed.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const patchProfile: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const result = await usersService.updateProfile(authed.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const putGoals: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const result = await usersService.putGoals(authed.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const postDeviceToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const body = req.body as RegisterDeviceTokenBody;
    const result = await usersService.registerDeviceToken(authed.user.id, body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
