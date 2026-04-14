import { z } from "zod";

const goalTypeEnum = z.enum(["weight_loss", "muscle_gain", "maintenance"]);

export const updateProfileBodySchema = z.object({
  fullName: z.string().max(255).nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  heightCm: z.number().min(50).max(260).nullable().optional(),
  activityLevel: z.string().min(1).max(64).nullable().optional(),
  timezone: z.string().min(1).max(64).nullable().optional(),
  locale: z.string().min(2).max(16).nullable().optional(),
});

export const putGoalsBodySchema = z.object({
  goalType: goalTypeEnum,
  targetWeightKg: z.number().min(20).max(400).nullable().optional(),
  weeklyWorkoutTarget: z.number().int().min(0).max(14).nullable().optional(),
  dailyKcalTarget: z.number().int().min(500).max(20000).nullable().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type PutGoalsBody = z.infer<typeof putGoalsBodySchema>;
