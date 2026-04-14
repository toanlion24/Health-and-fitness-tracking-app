import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateBody, validateQuery } from "../../shared/middleware/validate.js";
import * as workoutsController from "./workouts.controller.js";
import {
  addWorkoutSetBodySchema,
  completeWorkoutSessionBodySchema,
  createWorkoutPlanBodySchema,
  createWorkoutSessionBodySchema,
  listExercisesQuerySchema,
  listWorkoutPlansQuerySchema,
  listWorkoutSessionsQuerySchema,
  patchWorkoutPlanBodySchema,
  patchWorkoutSetBodySchema,
} from "./workouts.dto.js";

export function createWorkoutsRouter(): Router {
  const router = Router();

  router.get(
    "/exercises",
    requireAuth,
    validateQuery(listExercisesQuerySchema),
    workoutsController.listExercises,
  );

  router.get(
    "/workout-plans",
    requireAuth,
    validateQuery(listWorkoutPlansQuerySchema),
    workoutsController.listWorkoutPlans,
  );
  router.post(
    "/workout-plans",
    requireAuth,
    validateBody(createWorkoutPlanBodySchema),
    workoutsController.createWorkoutPlan,
  );
  router.get("/workout-plans/:planId", requireAuth, workoutsController.getWorkoutPlan);
  router.patch(
    "/workout-plans/:planId",
    requireAuth,
    validateBody(patchWorkoutPlanBodySchema),
    workoutsController.patchWorkoutPlan,
  );
  router.delete(
    "/workout-plans/:planId",
    requireAuth,
    workoutsController.deleteWorkoutPlan,
  );

  router.get(
    "/workout-sessions",
    requireAuth,
    validateQuery(listWorkoutSessionsQuerySchema),
    workoutsController.listWorkoutSessions,
  );
  router.post(
    "/workout-sessions",
    requireAuth,
    validateBody(createWorkoutSessionBodySchema),
    workoutsController.createWorkoutSession,
  );
  router.patch(
    "/workout-sessions/:sessionId/complete",
    requireAuth,
    validateBody(completeWorkoutSessionBodySchema),
    workoutsController.completeWorkoutSession,
  );
  router.post(
    "/workout-sessions/:sessionId/sets",
    requireAuth,
    validateBody(addWorkoutSetBodySchema),
    workoutsController.addWorkoutSet,
  );
  router.patch(
    "/workout-sessions/:sessionId/sets/:setId",
    requireAuth,
    validateBody(patchWorkoutSetBodySchema),
    workoutsController.patchWorkoutSet,
  );
  router.get(
    "/workout-sessions/:sessionId",
    requireAuth,
    workoutsController.getWorkoutSession,
  );

  return router;
}
