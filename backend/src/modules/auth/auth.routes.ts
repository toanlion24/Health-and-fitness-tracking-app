import { Router } from "express";
import { validateBody } from "../../shared/middleware/validate.js";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "./auth.dto.js";
import * as authController from "./auth.controller.js";

export function createAuthRouter(): Router {
  const router = Router();

  router.post(
    "/register",
    validateBody(registerBodySchema),
    authController.register,
  );
  router.post("/login", validateBody(loginBodySchema), authController.login);
  router.post(
    "/refresh",
    validateBody(refreshBodySchema),
    authController.refresh,
  );
  router.post(
    "/logout",
    requireAuth,
    validateBody(refreshBodySchema),
    authController.logout,
  );

  return router;
}
