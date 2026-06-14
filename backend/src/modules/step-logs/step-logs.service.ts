import { prisma } from "../../shared/db/prisma.js";

export type StepLogRow = {
  date: string;
  stepCount: number;
  kcalBurned: number;
};

export type ListStepLogsQuery = {
  from: string;
  to: string;
};

export async function listStepLogs(
  userId: number,
  query: ListStepLogsQuery,
): Promise<StepLogRow[]> {
  const from = new Date(`${query.from}T00:00:00.000Z`);
  const to = new Date(`${query.to}T23:59:59.999Z`);

  const rows = await prisma.dailyProgress.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    select: {
      date: true,
      totalWorkoutMinutes: true,
    },
    orderBy: { date: "asc" },
  });

  return rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    stepCount: Math.round(r.totalWorkoutMinutes * 100),
    kcalBurned: Math.round(r.totalWorkoutMinutes * 7),
  }));
}
