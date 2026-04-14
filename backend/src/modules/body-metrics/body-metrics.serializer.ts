import type { Prisma } from "@prisma/client";
import type { BodyMetricLogDto } from "@health-fitness/shared";

type Row = Prisma.BodyMetricLogGetPayload<object>;

export function serializeBodyMetric(row: Row): BodyMetricLogDto {
  return {
    id: row.id,
    userId: row.userId,
    recordedAt: row.recordedAt.toISOString(),
    weightKg: row.weightKg ? row.weightKg.toString() : null,
    bodyFatPct: row.bodyFatPct ? row.bodyFatPct.toString() : null,
    waistCm: row.waistCm ? row.waistCm.toString() : null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}
