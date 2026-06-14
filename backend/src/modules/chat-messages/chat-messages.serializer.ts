import type { ChatMessageDto } from "./serializer.js";

export function serializeChatMessage(row: {
  id: number;
  userId: number;
  role: string;
  content: string;
  createdAt: Date;
}): ChatMessageDto {
  return {
    id: row.id,
    role: row.role as "user" | "assistant",
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}
