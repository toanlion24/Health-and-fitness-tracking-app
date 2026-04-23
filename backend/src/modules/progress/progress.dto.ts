import { z } from "zod";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const listDailyProgressQuerySchema = z.object({
  from: dateStr,
  to: dateStr,
});

export type ListDailyProgressQuery = z.infer<typeof listDailyProgressQuerySchema>;
