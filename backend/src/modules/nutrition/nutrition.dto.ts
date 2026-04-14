import { z } from "zod";

export const listFoodsQuerySchema = z.object({
  q: z.string().max(255).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const createMealLogBodySchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  loggedAt: z.string().datetime(),
  notes: z.string().max(512).nullable().optional(),
});

export const listMealLogsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const patchMealLogBodySchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  loggedAt: z.string().datetime().optional(),
  notes: z.string().max(512).nullable().optional(),
});

export const addMealLogItemBodySchema = z
  .object({
    foodId: z.number().int().positive().optional(),
    customFoodName: z.string().min(1).max(255).optional(),
    quantity: z.number().positive(),
    unit: z.string().max(64).optional(),
    kcal: z.number().int().min(0).max(20000).optional(),
    proteinG: z.number().min(0).max(2000).optional(),
    carbG: z.number().min(0).max(2000).optional(),
    fatG: z.number().min(0).max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.foodId != null) {
      return;
    }
    if (!data.customFoodName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customFoodName"],
        message: "Required when foodId is omitted",
      });
    }
    if (
      data.kcal == null ||
      data.proteinG == null ||
      data.carbG == null ||
      data.fatG == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["kcal"],
        message: "kcal, proteinG, carbG, fatG required for custom items",
      });
    }
  });

export const patchMealLogItemBodySchema = z.object({
  quantity: z.number().positive().optional(),
  unit: z.string().max(64).nullable().optional(),
  kcal: z.number().int().min(0).max(20000).optional(),
  proteinG: z.number().min(0).max(2000).optional(),
  carbG: z.number().min(0).max(2000).optional(),
  fatG: z.number().min(0).max(2000).optional(),
});

export type ListFoodsQuery = z.infer<typeof listFoodsQuerySchema>;
export type CreateMealLogBody = z.infer<typeof createMealLogBodySchema>;
export type ListMealLogsQuery = z.infer<typeof listMealLogsQuerySchema>;
export type PatchMealLogBody = z.infer<typeof patchMealLogBodySchema>;
export type AddMealLogItemBody = z.infer<typeof addMealLogItemBodySchema>;
export type PatchMealLogItemBody = z.infer<typeof patchMealLogItemBodySchema>;
