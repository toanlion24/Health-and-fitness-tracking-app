import type { ChatMessageDto } from "./serializer.js";
import type { ListChatMessagesQuery, SendChatMessageBody } from "./dto.js";
import { prisma } from "../../shared/db/prisma.js";
import { processCoachChat } from "../coach/coach.service.js";

function serializeMessage(row: {
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

export async function listChatMessages(
  userId: number,
  query: ListChatMessagesQuery,
): Promise<ChatMessageDto[]> {
  const take = query.limit ?? 20;
  const where: { userId: number; createdAt?: { lt?: Date } } = { userId };

  if (query.before) {
    where.createdAt = { lt: new Date(`${query.before}T23:59:59.999Z`) };
  }

  const rows = await prisma.chatMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });

  return rows.map(serializeMessage);
}

export type SendChatMessageResult = {
  userMessage: ChatMessageDto;
  assistantMessage: ChatMessageDto;
};

export async function sendChatMessage(
  userId: number,
  body: SendChatMessageBody,
): Promise<SendChatMessageResult> {
  const userMessage = await prisma.chatMessage.create({
    data: {
      userId,
      role: "user",
      content: body.content,
    },
  });

  const recentMessages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { role: true, content: true },
  });

  const reply = await processCoachChat(userId, recentMessages);

  const assistantMessage = await prisma.chatMessage.create({
    data: {
      userId,
      role: "assistant",
      content: reply,
    },
  });

  return {
    userMessage: serializeMessage(userMessage),
    assistantMessage: serializeMessage(assistantMessage),
  };
}
