import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateQuery } from "../../shared/middleware/validate.js";
import * as exercisesController from "./exercises.controller.js";
import { listExercisesQuerySchema } from "./exercises.dto.js";

export function createExercisesRouter(): Router {
  const router = Router();

  // GET /exercises/categories — list all exercise categories from Wger
  router.get(
    "/exercises/categories",
    requireAuth,
    exercisesController.listExerciseCategories,
  );

  // GET /exercises — list exercises with optional ?category=&page=&limit=
  router.get(
    "/exercises",
    requireAuth,
    validateQuery(listExercisesQuerySchema),
    exercisesController.listExercises,
  );

  return router;
}
