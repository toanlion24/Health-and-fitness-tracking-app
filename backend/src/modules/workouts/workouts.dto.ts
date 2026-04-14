import { z } from "zod";

const planExerciseInput = z.object({
  exerciseId: z.number().int().positive(),
  sortOrder: z.number().int().min(0).optional(),
  targetSets: z.number().int().min(1).max(50).nullable().optional(),
  targetReps: z.number().int().min(1).max(200).nullable().optional(),
  targetWeightKg: z.number().min(0).max(1000).nullable().optional(),
  restSec: z.number().int().min(0).max(600).nullable().optional(),
});

export const createWorkoutPlanBodySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(512).nullable().optional(),
  exercises: z.array(planExerciseInput).max(100).optional(),
});

export const patchWorkoutPlanBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(512).nullable().optional(),
  exercises: z.array(planExerciseInput).max(100).optional(),
});

export const listExercisesQuerySchema = z.object({
  muscleGroup: z.string().max(128).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).max(10_000).optional(),
});

export const createWorkoutSessionBodySchema = z.object({
  planId: z.number().int().positive().nullable().optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(512).nullable().optional(),
  startedAt: z.string().datetime().optional(),
});

export const listWorkoutSessionsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const addWorkoutSetBodySchema = z.object({
  exerciseId: z.number().int().positive(),
  setIndex: z.number().int().min(1).max(100),
  actualReps: z.number().int().min(0).max(500).nullable().optional(),
  actualWeightKg: z.number().min(0).max(1000).nullable().optional(),
  actualDurationSec: z.number().int().min(0).max(86_400).nullable().optional(),
  rpe: z.number().int().min(1).max(10).nullable().optional(),
});

export const patchWorkoutSetBodySchema = z.object({
  actualReps: z.number().int().min(0).max(500).nullable().optional(),
  actualWeightKg: z.number().min(0).max(1000).nullable().optional(),
  actualDurationSec: z.number().int().min(0).max(86_400).nullable().optional(),
  rpe: z.number().int().min(1).max(10).nullable().optional(),
});

export const completeWorkoutSessionBodySchema = z.object({
  endedAt: z.string().datetime().optional(),
});

export const listWorkoutPlansQuerySchema = z.object({
  include: z.enum(["exercises"]).optional(),
});

export type CreateWorkoutPlanBody = z.infer<typeof createWorkoutPlanBodySchema>;
export type PatchWorkoutPlanBody = z.infer<typeof patchWorkoutPlanBodySchema>;
export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;
export type CreateWorkoutSessionBody = z.infer<
  typeof createWorkoutSessionBodySchema
>;
export type ListWorkoutSessionsQuery = z.infer<
  typeof listWorkoutSessionsQuerySchema
>;
export type AddWorkoutSetBody = z.infer<typeof addWorkoutSetBodySchema>;
export type PatchWorkoutSetBody = z.infer<typeof patchWorkoutSetBodySchema>;
export type CompleteWorkoutSessionBody = z.infer<
  typeof completeWorkoutSessionBodySchema
>;

export type ListWorkoutPlansQuery = z.infer<typeof listWorkoutPlansQuerySchema>;
