/**
 * Dev-only seed: one user you can use to sign in on mobile/web.
 * Run from backend/: `npm run db:seed` (requires DATABASE_URL + migrations applied).
 *
 * Credentials (do not use in production):
 *   Email:    dev@local.test
 *   Password: DevPass12345
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEV_EMAIL = "dev@local.test";
const DEV_PASSWORD = "DevPass12345";
const BCRYPT_ROUNDS = 12;

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: DEV_EMAIL },
    create: {
      email: DEV_EMAIL,
      passwordHash,
      profile: { create: {} },
    },
    update: {
      passwordHash,
      status: "active",
    },
  });

  console.log(`Seed OK: sign in with email "${DEV_EMAIL}" and password "${DEV_PASSWORD}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
