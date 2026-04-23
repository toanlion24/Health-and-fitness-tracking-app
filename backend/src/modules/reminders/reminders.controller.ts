import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthedRequest } from "../../shared/middleware/require-auth.js";
import { parsePositiveIntParam } from "../../shared/http/parse-positive-int.js";
import * as remindersService from "./reminders.service.js";
import type { CreateReminderBody, PatchReminderBody } from "./reminders.dto.js";

export const listReminders: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const items = await remindersService.listReminders(authed.user.id);
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
};

export const createReminder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const body = req.body as CreateReminderBody;
    const row = await remindersService.createReminder(authed.user.id, body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

export const patchReminder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.id, "id");
    const body = req.body as PatchReminderBody;
    const row = await remindersService.patchReminder(authed.user.id, id, body);
    res.status(200).json(row);
  } catch (err) {
    next(err);
  }
};

export const deleteReminder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const id = parsePositiveIntParam(req.params.id, "id");
    await remindersService.deleteReminder(authed.user.id, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
