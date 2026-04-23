import { z } from "zod";

const reminderType = z.enum(["workout", "water", "meal", "sleep"]);

export const createReminderBodySchema = z.object({
  type: reminderType,
  title: z.string().min(1).max(255),
  message: z.string().max(512).optional().nullable(),
  cronExpr: z.string().max(128).optional().nullable(),
  timezone: z.string().min(1).max(64),
  localHour: z.coerce.number().int().min(0).max(23),
  localMinute: z.coerce.number().int().min(0).max(59),
  isEnabled: z.boolean().optional(),
});

export type CreateReminderBody = z.infer<typeof createReminderBodySchema>;

export const patchReminderBodySchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    message: z.string().max(512).optional().nullable(),
    cronExpr: z.string().max(128).optional().nullable(),
    timezone: z.string().min(1).max(64).optional(),
    localHour: z.coerce.number().int().min(0).max(23).optional(),
    localMinute: z.coerce.number().int().min(0).max(59).optional(),
    isEnabled: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required",
  });

export type PatchReminderBody = z.infer<typeof patchReminderBodySchema>;
