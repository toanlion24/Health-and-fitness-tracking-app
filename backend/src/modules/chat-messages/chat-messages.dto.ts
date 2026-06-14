import { z } from "zod";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .optional();

export const listChatMessagesQuerySchema = z.object({
  before: dateStr,
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListChatMessagesQuery = z.infer<typeof listChatMessagesQuerySchema>;

export const sendChatMessageBodySchema = z.object({
  content: z.string().min(1).max(2000),
});

export type SendChatMessageBody = z.infer<typeof sendChatMessageBodySchema>;
