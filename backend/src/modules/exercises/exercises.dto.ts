import { z } from "zod";

// ─── Query Schemas ────────────────────────────────────────────────────────────

export const listExerciseCategoriesQuerySchema = z.object({}).strict();

export const listExercisesQuerySchema = z.object({
  category: z.coerce.number().int().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  language: z.coerce.number().int().positive().default(2), // 2 = English
});

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;

// ─── Response Zod Schemas & DTOs ──────────────────────────────────────────────

export const wgerExerciseCategoryDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});
export type WgerExerciseCategoryDto = z.infer<typeof wgerExerciseCategoryDtoSchema>;

export const wgerExerciseDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  category: wgerExerciseCategoryDtoSchema,
  muscles: z.array(z.object({
    id: z.number().int(),
    name: z.string(),
    name_en: z.string(),
  })),
  muscles_secondary: z.array(z.object({
    id: z.number().int(),
    name: z.string(),
    name_en: z.string(),
  })),
  equipment: z.array(z.object({
    id: z.number().int(),
    name: z.string(),
  })),
  images: z.array(z.object({
    id: z.number().int(),
    image: z.string().url(),
    is_main: z.boolean(),
  })),
});
export type WgerExerciseDto = z.infer<typeof wgerExerciseDtoSchema>;