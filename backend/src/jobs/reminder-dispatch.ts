import Expo, { type ExpoPushMessage } from "expo-server-sdk";
import { advanceReminderAfterFire } from "../modules/reminders/reminders.service.js";
import { prisma } from "../shared/db/prisma.js";
import { getLogger } from "../shared/logger.js";

const expo = new Expo();

/**
 * Polls due reminders, sends Expo push notifications, then advances schedule.
 * Intended to be run on an interval from the reminder worker process.
 */
export async function processDueRemindersBatch(): Promise<void> {
  const logger = getLogger();
  const now = new Date();
  const due = await prisma.reminder.findMany({
    where: {
      isEnabled: true,
      nextTriggerAt: { lte: now },
    },
    take: 100,
    orderBy: { nextTriggerAt: "asc" },
  });

  for (const r of due) {
    const tokens = await prisma.deviceToken.findMany({
      where: { userId: r.userId, isActive: true },
    });

    const messages: ExpoPushMessage[] = [];
    for (const t of tokens) {
      if (!Expo.isExpoPushToken(t.expoPushToken)) {
        continue;
      }
      messages.push({
        to: t.expoPushToken,
        sound: "default",
        title: r.title,
        body: r.message ?? "",
        data: { reminderId: r.id, type: r.type },
      });
    }

    if (messages.length > 0) {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (err) {
          logger.error({ err, reminderId: r.id }, "expo push send failed");
        }
      }
    }

    await advanceReminderAfterFire(r.id);
  }
}
