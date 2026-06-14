import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthedRequest } from "../../shared/middleware/require-auth.js";
import * as chatMessagesService from "./chat-messages.service.js";
import type { ListChatMessagesQuery, SendChatMessageBody } from "./chat-messages.dto.js";

export const listChatMessages: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const query = req.query as unknown as ListChatMessagesQuery;
    const messages = await chatMessagesService.listChatMessages(authed.user.id, query);
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};

export const sendChatMessage: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authed = req as AuthedRequest;
    const body = req.body as SendChatMessageBody;
    const result = await chatMessagesService.sendChatMessage(authed.user.id, body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
