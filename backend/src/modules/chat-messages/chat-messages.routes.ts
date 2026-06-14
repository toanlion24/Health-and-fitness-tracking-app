import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateBody, validateQuery } from "../../shared/middleware/validate.js";
import * as chatMessagesController from "./chat-messages.controller.js";
import {
  listChatMessagesQuerySchema,
  sendChatMessageBodySchema,
} from "./chat-messages.dto.js";

export function createChatMessagesRouter(): Router {
  const router = Router();

  router.get(
    "/chat/messages",
    requireAuth,
    validateQuery(listChatMessagesQuerySchema),
    chatMessagesController.listChatMessages,
  );

  router.post(
    "/chat/messages",
    requireAuth,
    validateBody(sendChatMessageBodySchema),
    chatMessagesController.sendChatMessage,
  );

  return router;
}
