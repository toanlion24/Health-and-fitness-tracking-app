import { loadEnv } from "../shared/config/env.js";
import { prisma } from "../shared/db/prisma.js";
import { getLogger } from "../shared/logger.js";
import { processDueRemindersBatch } from "../jobs/reminder-dispatch.js";

loadEnv();
const logger = getLogger();
const intervalMs = 30_000;

async function tick(): Promise<void> {
  await processDueRemindersBatch();
}

void (async () => {
  await prisma.$connect();
  logger.info({ intervalMs }, "reminder worker started");
  await tick();
  setInterval(() => {
    void tick().catch((err: unknown) => {
      logger.error({ err }, "reminder worker tick failed");
    });
  }, intervalMs);
})();
