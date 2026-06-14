import { prisma } from "../../shared/db/prisma.js";

export type RunningSessionRow = {
  status: string;
  sessionDate: string;
  totalDistanceM: number;
  totalDurationSec: number;
  kcalBurned: number;
  avgPaceSecPerKm: number;
};

export type ListRunningSessionsQuery = {
  from: string;
  to: string;
};

export async function listRunningSessions(
  userId: number,
  query: ListRunningSessionsQuery,
): Promise<RunningSessionRow[]> {
  const from = new Date(`${query.from}T00:00:00.000Z`);
  const to = new Date(`${query.to}T23:59:59.999Z`);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      sessionDate: { gte: from, lte: to },
    },
    include: {
      plan: {
        select: { name: true },
      },
    },
    orderBy: { sessionDate: "desc" },
  });

  return sessions.map((s) => {
    const durationSec = s.endedAt
      ? Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 1000)
      : 0;

    const isRunning =
      s.plan?.name?.toLowerCase().includes("chạy") ||
      s.plan?.name?.toLowerCase().includes("run") ||
      s.plan?.name?.toLowerCase().includes("jog") ||
      s.plan?.name?.toLowerCase().includes("cardio");

    const distanceM = isRunning ? Math.round(durationSec * 2) : 0;
    const kcalBurned = Math.round(durationSec * 0.1);
    const avgPaceSecPerKm = distanceM > 0 ? Math.round(durationSec / (distanceM / 1000)) : 0;

    return {
      status: s.status,
      sessionDate: s.sessionDate.toISOString().slice(0, 10),
      totalDistanceM: distanceM,
      totalDurationSec: durationSec,
      kcalBurned,
      avgPaceSecPerKm,
    };
  });
}
