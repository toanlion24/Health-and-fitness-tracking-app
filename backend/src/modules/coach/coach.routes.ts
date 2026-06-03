import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { handleCoachChat } from "./coach.controller.js";

export function createCoachRouter(): Router {
  const router = Router();

  // Protected chatbot dialogue endpoint
  router.post("/coach/chat", requireAuth as any, handleCoachChat as any);

  return router;
}
