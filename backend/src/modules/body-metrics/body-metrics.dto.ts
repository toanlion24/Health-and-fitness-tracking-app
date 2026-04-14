import { z } from "zod";

export const listBodyMetricsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createBodyMetricBodySchema = z
  .object({
    recordedAt: z.string().datetime(),
    weightKg: z.number().min(20).max(400).nullable().optional(),
    bodyFatPct: z.number().min(1).max(70).nullable().optional(),
    waistCm: z.number().min(30).max(300).nullable().optional(),
    notes: z.string().max(512).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.weightKg == null &&
      data.bodyFatPct == null &&
      data.waistCm == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of weightKg, bodyFatPct, waistCm is required",
      });
    }
  });

export const patchBodyMetricBodySchema = z.object({
  recordedAt: z.string().datetime().optional(),
  weightKg: z.number().min(20).max(400).nullable().optional(),
  bodyFatPct: z.number().min(1).max(70).nullable().optional(),
  waistCm: z.number().min(30).max(300).nullable().optional(),
  notes: z.string().max(512).nullable().optional(),
});

export type ListBodyMetricsQuery = z.infer<typeof listBodyMetricsQuerySchema>;
export type CreateBodyMetricBody = z.infer<typeof createBodyMetricBodySchema>;
export type PatchBodyMetricBody = z.infer<typeof patchBodyMetricBodySchema>;
