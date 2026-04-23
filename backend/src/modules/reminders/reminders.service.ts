import { ApiErrorCodes } from "@health-fitness/shared";
import { prisma } from "../../shared/db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import {
  computeNextTriggerAfterFire,
  computeNextTriggerUtc,
} from "./reminder-time.js";
import type { CreateReminderBody, PatchReminderBody } from "./reminders.dto.js";
import { serializeReminder } from "./reminders.serializer.js";

export async function listReminders(userId: number) {
  const rows = await prisma.reminder.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });
  return rows.map(serializeReminder);
}

export async function createReminder(userId: number, body: CreateReminderBody) {
  const nextTriggerAt =
    body.isEnabled === false
      ? null
      : computeNextTriggerUtc({
          timezone: body.timezone,
          localHour: body.localHour,
          localMinute: body.localMinute,
        });
  const row = await prisma.reminder.create({
    data: {
      userId,
      type: body.type,
      title: body.title,
      message: body.message ?? null,
      cronExpr: body.cronExpr ?? null,
      timezone: body.timezone,
      localHour: body.localHour,
      localMinute: body.localMinute,
      isEnabled: body.isEnabled ?? true,
      nextTriggerAt,
    },
  });
  return serializeReminder(row);
}

export async function patchReminder(
  userId: number,
  reminderId: number,
  body: PatchReminderBody,
) {
  const existing = await prisma.reminder.findFirst({
    where: { id: reminderId, userId },
  });
  if (!existing) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Reminder not found");
  }

  const nextTimezone = body.timezone ?? existing.timezone;
  const nextHour = body.localHour ?? existing.localHour;
  const nextMinute = body.localMinute ?? existing.localMinute;
  const nextEnabled = body.isEnabled ?? existing.isEnabled;

  const scheduleTouched =
    body.timezone !== undefined ||
    body.localHour !== undefined ||
    body.localMinute !== undefined ||
    body.isEnabled !== undefined;

  const data: {
    title?: string;
    message?: string | null;
    cronExpr?: string | null;
    timezone?: string;
    localHour?: number;
    localMinute?: number;
    isEnabled?: boolean;
    nextTriggerAt?: Date | null;
  } = {};

  if (body.title !== undefined) {
    data.title = body.title;
  }
  if (body.message !== undefined) {
    data.message = body.message;
  }
  if (body.cronExpr !== undefined) {
    data.cronExpr = body.cronExpr;
  }
  if (body.timezone !== undefined) {
    data.timezone = body.timezone;
  }
  if (body.localHour !== undefined) {
    data.localHour = body.localHour;
  }
  if (body.localMinute !== undefined) {
    data.localMinute = body.localMinute;
  }
  if (body.isEnabled !== undefined) {
    data.isEnabled = body.isEnabled;
  }

  if (scheduleTouched) {
    if (!nextEnabled) {
      data.nextTriggerAt = null;
    } else {
      data.nextTriggerAt = computeNextTriggerUtc({
        timezone: nextTimezone,
        localHour: nextHour,
        localMinute: nextMinute,
      });
    }
  }

  const row = await prisma.reminder.update({
    where: { id: reminderId },
    data,
  });
  return serializeReminder(row);
}

export async function deleteReminder(userId: number, reminderId: number) {
  const existing = await prisma.reminder.findFirst({
    where: { id: reminderId, userId },
  });
  if (!existing) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Reminder not found");
  }
  await prisma.reminder.delete({ where: { id: reminderId } });
}

/** Used by the worker after a push is sent. */
export async function advanceReminderAfterFire(reminderId: number): Promise<void> {
  const r = await prisma.reminder.findUnique({ where: { id: reminderId } });
  if (!r || !r.isEnabled) {
    return;
  }
  const firedAt = new Date();
  await prisma.reminder.update({
    where: { id: reminderId },
    data: {
      lastTriggeredAt: firedAt,
      nextTriggerAt: computeNextTriggerAfterFire({
        timezone: r.timezone,
        localHour: r.localHour,
        localMinute: r.localMinute,
        firedAt,
      }),
    },
  });
}
