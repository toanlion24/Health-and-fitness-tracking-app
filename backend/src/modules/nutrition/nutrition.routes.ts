import { Router } from "express";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateBody, validateQuery } from "../../shared/middleware/validate.js";
import * as nutritionController from "./nutrition.controller.js";
import {
  addMealLogItemBodySchema,
  createMealLogBodySchema,
  listFoodsQuerySchema,
  listMealLogsQuerySchema,
  patchMealLogBodySchema,
  patchMealLogItemBodySchema,
} from "./nutrition.dto.js";

export function createNutritionRouter(): Router {
  const router = Router();

  router.get(
    "/foods",
    requireAuth,
    validateQuery(listFoodsQuerySchema),
    nutritionController.listFoods,
  );

  router.post(
    "/meal-logs",
    requireAuth,
    validateBody(createMealLogBodySchema),
    nutritionController.createMealLog,
  );
  router.get(
    "/meal-logs",
    requireAuth,
    validateQuery(listMealLogsQuerySchema),
    nutritionController.listMealLogs,
  );
  router.get(
    "/meal-logs/:mealLogId",
    requireAuth,
    nutritionController.getMealLog,
  );
  router.patch(
    "/meal-logs/:mealLogId",
    requireAuth,
    validateBody(patchMealLogBodySchema),
    nutritionController.patchMealLog,
  );
  router.delete(
    "/meal-logs/:mealLogId",
    requireAuth,
    nutritionController.deleteMealLog,
  );
  router.post(
    "/meal-logs/:mealLogId/items",
    requireAuth,
    validateBody(addMealLogItemBodySchema),
    nutritionController.addMealLogItem,
  );
  router.patch(
    "/meal-logs/:mealLogId/items/:itemId",
    requireAuth,
    validateBody(patchMealLogItemBodySchema),
    nutritionController.patchMealLogItem,
  );
  router.delete(
    "/meal-logs/:mealLogId/items/:itemId",
    requireAuth,
    nutritionController.deleteMealLogItem,
  );

  return router;
}
