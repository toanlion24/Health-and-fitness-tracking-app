import type { BodyMetricLogDto } from "@health-fitness/shared";
import { apiFetch } from "../../../core/api/client";

export async function fetchBodyMetrics(
  from: string,
  to: string,
): Promise<BodyMetricLogDto[]> {
  return apiFetch<BodyMetricLogDto[]>(
    `/api/v1/body-metrics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { auth: true },
  );
}

export async function createBodyMetric(body: {
  recordedAt: string;
  weightKg?: number | null;
  bodyFatPct?: number | null;
  waistCm?: number | null;
  notes?: string | null;
}): Promise<BodyMetricLogDto> {
  return apiFetch<BodyMetricLogDto>("/api/v1/body-metrics", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}
