import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { uploadAvatar } from "../../shared/middleware/upload.middleware.js";
import { validateBody } from "../../shared/middleware/validate.js";
import * as usersController from "./users.controller.js";
import {
  putGoalsBodySchema,
  registerDeviceTokenBodySchema,
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
  router.post(
    "/me/device-tokens",
    requireAuth,
    validateBody(registerDeviceTokenBodySchema),
    usersController.postDeviceToken,
  );
  router.post(
    "/me/avatar",
    requireAuth,
    uploadAvatar.single("avatar"),
    usersController.postAvatar,
  );
  return router;
}
