import type { Reminder } from "@prisma/client";

export function serializeReminder(row: Reminder) {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    message: row.message,
    cronExpr: row.cronExpr,
    timezone: row.timezone,
    localHour: row.localHour,
    localMinute: row.localMinute,
    isEnabled: row.isEnabled,
    nextTriggerAt: row.nextTriggerAt?.toISOString() ?? null,
    lastTriggeredAt: row.lastTriggeredAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
