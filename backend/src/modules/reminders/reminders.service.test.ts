import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  listReminders,
  createReminder,
  patchReminder,
  deleteReminder,
  advanceReminderAfterFire,
} from "./reminders.service.js";
import { AppError } from "../../shared/errors/app-error.js";

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    reminder: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Reminders Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── listReminders ─────────────────────────────────────────────────────────

  describe("listReminders", () => {
    it("returns all reminders for user in descending order", async () => {
      const rows = [
        {
          id: 2,
          userId: 1,
          type: "workout",
          title: "Morning workout",
          message: "Time to train",
          cronExpr: null,
          timezone: "Asia/Ho_Chi_Minh",
          localHour: 7,
          localMinute: 0,
          isEnabled: true,
          nextTriggerAt: new Date("2026-01-02T00:00:00Z"),
          lastTriggeredAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 1,
          userId: 1,
          type: "water",
          title: "Drink water",
          message: "Stay hydrated",
          cronExpr: null,
          timezone: "Asia/Ho_Chi_Minh",
          localHour: 9,
          localMinute: 0,
          isEnabled: true,
          nextTriggerAt: new Date("2026-01-01T02:00:00Z"),
          lastTriggeredAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(mockPrisma.reminder.findMany).mockResolvedValue(rows as any);

      const result = await listReminders(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
      expect(mockPrisma.reminder.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { id: "desc" },
      });
    });

    it("returns empty array when user has no reminders", async () => {
      vi.mocked(mockPrisma.reminder.findMany).mockResolvedValue([]);

      const result = await listReminders(1);

      expect(result).toEqual([]);
    });
  });

  // ─── createReminder ────────────────────────────────────────────────────────

  describe("createReminder", () => {
    it("creates enabled reminder with computed nextTriggerAt", async () => {
      vi.mocked(mockPrisma.reminder.create).mockResolvedValue({
        id: 1,
        userId: 1,
        type: "workout",
        title: "Morning workout",
        message: null,
        cronExpr: null,
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 7,
        localMinute: 0,
        isEnabled: true,
        nextTriggerAt: new Date("2026-01-02T00:00:00Z"),
        lastTriggeredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await createReminder(1, {
        type: "workout",
        title: "Morning workout",
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 7,
        localMinute: 0,
      });

      expect(result.isEnabled).toBe(true);
      expect(result.nextTriggerAt).not.toBeNull();
      expect(mockPrisma.reminder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 1,
          type: "workout",
          title: "Morning workout",
          isEnabled: true,
          nextTriggerAt: expect.any(Date),
        }),
      });
    });

    it("creates disabled reminder with null nextTriggerAt", async () => {
      vi.mocked(mockPrisma.reminder.create).mockResolvedValue({
        id: 2,
        userId: 1,
        type: "water",
        title: "Drink water",
        message: null,
        cronExpr: null,
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 10,
        localMinute: 0,
        isEnabled: false,
        nextTriggerAt: null,
        lastTriggeredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await createReminder(1, {
        type: "water",
        title: "Drink water",
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 10,
        localMinute: 0,
        isEnabled: false,
      });

      expect(result.isEnabled).toBe(false);
      expect(result.nextTriggerAt).toBeNull();
    });
  });

  // ─── patchReminder ────────────────────────────────────────────────────────

  describe("patchReminder", () => {
    it("updates title and recomputes nextTriggerAt when time is also changed", async () => {
      const existing = {
        id: 1,
        userId: 1,
        type: "workout",
        title: "Morning workout",
        message: null,
        cronExpr: null,
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 7,
        localMinute: 0,
        isEnabled: true,
        nextTriggerAt: new Date("2026-01-02T00:00:00Z"),
        lastTriggeredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockPrisma.reminder.findFirst).mockResolvedValue(existing as any);
      vi.mocked(mockPrisma.reminder.update).mockResolvedValue({
        ...existing,
        title: "Evening workout",
        localHour: 8,
      } as any);

      await patchReminder(1, 1, { title: "Evening workout", localHour: 8 });

      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          title: "Evening workout",
          localHour: 8,
          nextTriggerAt: expect.any(Date),
        }),
      });
    });

    it("does not change nextTriggerAt when only title is updated", async () => {
      const existing = {
        id: 1,
        userId: 1,
        type: "workout",
        title: "Morning workout",
        message: null,
        cronExpr: null,
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 7,
        localMinute: 0,
        isEnabled: true,
        nextTriggerAt: new Date("2026-01-02T00:00:00Z"),
        lastTriggeredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockPrisma.reminder.findFirst).mockResolvedValue(existing as any);
      vi.mocked(mockPrisma.reminder.update).mockResolvedValue({
        ...existing,
        title: "Evening workout",
      } as any);

      await patchReminder(1, 1, { title: "Evening workout" });

      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          title: "Evening workout",
        }),
      });
    });

    it("sets nextTriggerAt to null when disabling", async () => {
      const existing = {
        id: 1,
        userId: 1,
        type: "workout",
        title: "Morning workout",
        message: null,
        cronExpr: null,
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 7,
        localMinute: 0,
        isEnabled: true,
        nextTriggerAt: new Date(),
        lastTriggeredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockPrisma.reminder.findFirst).mockResolvedValue(existing as any);
      vi.mocked(mockPrisma.reminder.update).mockResolvedValue({
        ...existing,
        isEnabled: false,
        nextTriggerAt: null,
      } as any);

      await patchReminder(1, 1, { isEnabled: false });

      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          isEnabled: false,
          nextTriggerAt: null,
        }),
      });
    });

    it("recomputes nextTriggerAt when local time changes while enabled", async () => {
      const existing = {
        id: 1,
        userId: 1,
        type: "workout",
        title: "Morning workout",
        message: null,
        cronExpr: null,
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 7,
        localMinute: 0,
        isEnabled: true,
        nextTriggerAt: new Date(),
        lastTriggeredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockPrisma.reminder.findFirst).mockResolvedValue(existing as any);
      vi.mocked(mockPrisma.reminder.update).mockResolvedValue({
        ...existing,
        localHour: 8,
      } as any);

      await patchReminder(1, 1, { localHour: 8 });

      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          localHour: 8,
          nextTriggerAt: expect.any(Date),
        }),
      });
    });

    it("throws 404 when reminder not found", async () => {
      vi.mocked(mockPrisma.reminder.findFirst).mockResolvedValue(null);

      await expect(
        patchReminder(1, 999, { title: "New title" }),
      ).rejects.toThrow(AppError);
    });
  });

  // ─── deleteReminder ────────────────────────────────────────────────────────

  describe("deleteReminder", () => {
    it("deletes reminder and returns void on success", async () => {
      vi.mocked(mockPrisma.reminder.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
      } as any);
      vi.mocked(mockPrisma.reminder.delete).mockResolvedValue({} as any);

      await expect(deleteReminder(1, 1)).resolves.toBeUndefined();
      expect(mockPrisma.reminder.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("throws 404 when reminder not found", async () => {
      vi.mocked(mockPrisma.reminder.findFirst).mockResolvedValue(null);

      await expect(deleteReminder(1, 999)).rejects.toThrow(AppError);
    });
  });

  // ─── advanceReminderAfterFire ──────────────────────────────────────────────

  describe("advanceReminderAfterFire", () => {
    it("updates lastTriggeredAt and nextTriggerAt after fire", async () => {
      vi.mocked(mockPrisma.reminder.findUnique).mockResolvedValue({
        id: 1,
        userId: 1,
        type: "water",
        title: "Drink water",
        message: null,
        cronExpr: null,
        timezone: "Asia/Ho_Chi_Minh",
        localHour: 9,
        localMinute: 0,
        isEnabled: true,
        nextTriggerAt: new Date(),
        lastTriggeredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(mockPrisma.reminder.update).mockResolvedValue({} as any);

      await advanceReminderAfterFire(1);

      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          lastTriggeredAt: expect.any(Date),
          nextTriggerAt: expect.any(Date),
        },
      });
    });

    it("does nothing when reminder not found", async () => {
      vi.mocked(mockPrisma.reminder.findUnique).mockResolvedValue(null);

      await expect(advanceReminderAfterFire(999)).resolves.toBeUndefined();
      expect(mockPrisma.reminder.update).not.toHaveBeenCalled();
    });

    it("does nothing when reminder is disabled", async () => {
      vi.mocked(mockPrisma.reminder.findUnique).mockResolvedValue({
        id: 1,
        userId: 1,
        isEnabled: false,
      } as any);

      await expect(advanceReminderAfterFire(1)).resolves.toBeUndefined();
      expect(mockPrisma.reminder.update).not.toHaveBeenCalled();
    });
  });
});
