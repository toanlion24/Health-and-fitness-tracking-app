import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateBody } from "../../shared/middleware/validate.js";
import * as usersController from "./users.controller.js";
import {
  putGoalsBodySchema,
  updateProfileBodySchema,
} from "./users.dto.js";

export function createUsersRouter(): Router {
  const router = Router();
  router.get("/me", requireAuth, usersController.getMe);
  router.patch(
    "/me/profile",
    requireAuth,
    validateBody(updateProfileBodySchema),
    usersController.patchProfile,
  );
  router.put(
    "/me/goals",
    requireAuth,
    validateBody(putGoalsBodySchema),
    usersController.putGoals,
  );
  return router;
}
