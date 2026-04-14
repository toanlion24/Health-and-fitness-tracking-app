import { Decimal } from "@prisma/client/runtime/library";
import { ApiErrorCodes } from "@health-fitness/shared";
import type { BodyMetricLogDto } from "@health-fitness/shared";
import { prisma } from "../../shared/db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import { serializeBodyMetric } from "./body-metrics.serializer.js";
import type {
  CreateBodyMetricBody,
  ListBodyMetricsQuery,
  PatchBodyMetricBody,
} from "./body-metrics.dto.js";

function rangeFromDates(from: string, to: string): { start: Date; end: Date } {
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T23:59:59.999Z`);
  return { start, end };
}

export async function listBodyMetrics(
  userId: number,
  query: ListBodyMetricsQuery,
): Promise<BodyMetricLogDto[]> {
  const { start, end } = rangeFromDates(query.from, query.to);
  const rows = await prisma.bodyMetricLog.findMany({
    where: {
      userId,
      recordedAt: { gte: start, lte: end },
    },
    orderBy: { recordedAt: "asc" },
  });
  return rows.map(serializeBodyMetric);
}

export async function createBodyMetric(
  userId: number,
  body: CreateBodyMetricBody,
): Promise<BodyMetricLogDto> {
  const row = await prisma.bodyMetricLog.create({
    data: {
      userId,
      recordedAt: new Date(body.recordedAt),
      weightKg:
        body.weightKg === undefined || body.weightKg === null
          ? null
          : new Decimal(body.weightKg.toString()),
      bodyFatPct:
        body.bodyFatPct === undefined || body.bodyFatPct === null
          ? null
          : new Decimal(body.bodyFatPct.toString()),
      waistCm:
        body.waistCm === undefined || body.waistCm === null
          ? null
          : new Decimal(body.waistCm.toString()),
      notes: body.notes ?? null,
    },
  });
  return serializeBodyMetric(row);
}

export async function getBodyMetric(
  userId: number,
  id: number,
): Promise<BodyMetricLogDto> {
  const row = await prisma.bodyMetricLog.findFirst({
    where: { id, userId },
  });
  if (!row) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Body metric not found");
  }
  return serializeBodyMetric(row);
}

export async function patchBodyMetric(
  userId: number,
  id: number,
  body: PatchBodyMetricBody,
): Promise<BodyMetricLogDto> {
  const existing = await prisma.bodyMetricLog.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Body metric not found");
  }

  const data: {
    recordedAt?: Date;
    weightKg?: Decimal | null;
    bodyFatPct?: Decimal | null;
    waistCm?: Decimal | null;
    notes?: string | null;
  } = {};
  if (body.recordedAt !== undefined) {
    data.recordedAt = new Date(body.recordedAt);
  }
  if (body.weightKg !== undefined) {
    data.weightKg =
      body.weightKg === null ? null : new Decimal(body.weightKg.toString());
  }
  if (body.bodyFatPct !== undefined) {
    data.bodyFatPct =
      body.bodyFatPct === null
        ? null
        : new Decimal(body.bodyFatPct.toString());
  }
  if (body.waistCm !== undefined) {
    data.waistCm =
      body.waistCm === null ? null : new Decimal(body.waistCm.toString());
  }
  if (body.notes !== undefined) {
    data.notes = body.notes;
  }

  if (Object.keys(data).length === 0) {
    return getBodyMetric(userId, id);
  }

  const row = await prisma.bodyMetricLog.update({
    where: { id },
    data,
  });
  return serializeBodyMetric(row);
}

export async function deleteBodyMetric(
  userId: number,
  id: number,
): Promise<void> {
  const res = await prisma.bodyMetricLog.deleteMany({
    where: { id, userId },
  });
  if (res.count === 0) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Body metric not found");
  }
}
