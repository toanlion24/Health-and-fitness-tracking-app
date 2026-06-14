import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  listChatMessages,
  sendChatMessage,
} from "./chat-messages.service.js";

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    chatMessage: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Chat Messages Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Note: ChatMessage Prisma model does not exist yet in schema.prisma.
  // These tests describe the expected behavior and will pass once the model
  // is added with fields: id, userId, role, content, createdAt.

  describe("listChatMessages", () => {
    it("returns messages for user ordered by newest first", async () => {
      const rows = [
        {
          id: 2,
          userId: 1,
          role: "assistant",
          content: "Hello! How can I help?",
          createdAt: new Date("2026-01-01T10:00:00Z"),
        },
        {
          id: 1,
          userId: 1,
          role: "user",
          content: "I need workout advice",
          createdAt: new Date("2026-01-01T09:00:00Z"),
        },
      ];
      vi.mocked(mockPrisma.chatMessage.findMany).mockResolvedValue(rows as any);

      const result = await listChatMessages(1, {});

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe("assistant");
      expect(result[1].role).toBe("user");
      expect(mockPrisma.chatMessage.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    });

    it("applies date filter when before is provided", async () => {
      vi.mocked(mockPrisma.chatMessage.findMany).mockResolvedValue([]);

      await listChatMessages(1, { before: "2026-01-01", limit: 10 });

      expect(mockPrisma.chatMessage.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          createdAt: { lt: expect.any(Date) },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    });

    it("serializes createdAt to ISO string", async () => {
      const rows = [
        {
          id: 1,
          userId: 1,
          role: "user",
          content: "Hello",
          createdAt: new Date("2026-01-01T12:00:00Z"),
        },
      ];
      vi.mocked(mockPrisma.chatMessage.findMany).mockResolvedValue(rows as any);

      const result = await listChatMessages(1, {});

      expect(result[0].createdAt).toBe("2026-01-01T12:00:00.000Z");
    });

    it("returns empty array when user has no messages", async () => {
      vi.mocked(mockPrisma.chatMessage.findMany).mockResolvedValue([]);

      const result = await listChatMessages(1, {});

      expect(result).toEqual([]);
    });
  });

  describe("sendChatMessage", () => {
    it("creates user and assistant messages and returns both serialized", async () => {
      const now = new Date();
      vi.mocked(mockPrisma.chatMessage.findMany).mockResolvedValueOnce([
        {
          id: 1,
          userId: 5,
          role: "user",
          content: "I want to lose weight",
          createdAt: now,
        },
      ] as any);

      vi.mocked(mockPrisma.chatMessage.create)
        .mockResolvedValueOnce({
          id: 1,
          userId: 5,
          role: "user",
          content: "I want to lose weight",
          createdAt: now,
        } as any)
        .mockResolvedValueOnce({
          id: 2,
          userId: 5,
          role: "assistant",
          content: "Here is a plan...",
          createdAt: now,
        } as any);

      const result = await sendChatMessage(5, {
        content: "I want to lose weight",
      });

      expect(result.userMessage.id).toBe(1);
      expect(result.userMessage.role).toBe("user");
      expect(result.userMessage.content).toBe("I want to lose weight");
      expect(result.assistantMessage.id).toBe(2);
      expect(result.assistantMessage.role).toBe("assistant");
      expect(result.assistantMessage.content).toBe("Here is a plan...");
      expect(mockPrisma.chatMessage.create).toHaveBeenCalledTimes(2);
    });

    it("returns serialized messages with ISO createdAt", async () => {
      const now = new Date("2026-01-01T08:30:00Z");
      vi.mocked(mockPrisma.chatMessage.findMany).mockResolvedValueOnce([
        {
          id: 1,
          userId: 3,
          role: "user",
          content: "Hello coach",
          createdAt: now,
        },
      ] as any);

      vi.mocked(mockPrisma.chatMessage.create)
        .mockResolvedValueOnce({
          id: 1,
          userId: 3,
          role: "user",
          content: "Hello coach",
          createdAt: now,
        } as any)
        .mockResolvedValueOnce({
          id: 2,
          userId: 3,
          role: "assistant",
          content: "Hello! How can I help?",
          createdAt: now,
        } as any);

      const result = await sendChatMessage(3, { content: "Hello coach" });

      expect(result.userMessage.createdAt).toBe("2026-01-01T08:30:00.000Z");
      expect(result.assistantMessage.createdAt).toBe("2026-01-01T08:30:00.000Z");
    });
  });
});
