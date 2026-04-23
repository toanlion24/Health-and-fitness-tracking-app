import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateBody } from "../../shared/middleware/validate.js";
import * as remindersController from "./reminders.controller.js";
import {
  createReminderBodySchema,
  patchReminderBodySchema,
} from "./reminders.dto.js";

export function createRemindersRouter(): Router {
  const router = Router();

  router.get("/reminders", requireAuth, remindersController.listReminders);
  router.post(
    "/reminders",
    requireAuth,
    validateBody(createReminderBodySchema),
    remindersController.createReminder,
  );
  router.patch(
    "/reminders/:id",
    requireAuth,
    validateBody(patchReminderBodySchema),
    remindersController.patchReminder,
  );
  router.delete(
    "/reminders/:id",
    requireAuth,
    remindersController.deleteReminder,
  );

  return router;
}
