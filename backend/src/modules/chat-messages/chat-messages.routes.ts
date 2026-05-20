import { Router } from "express";
import { handleAskChat } from "./chat-messages.controller.js";

export function createChatMessagesRouter(): Router {
  const router = Router();

  // Tạo endpoint: POST /ask
  // Khi ghép với app.ts, đường dẫn hoàn chỉnh sẽ là /api/chat/ask
  router.post("/ask", handleAskChat);

  return router;
}