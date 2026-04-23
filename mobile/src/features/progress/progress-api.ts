import type { DailyProgressDto } from "@health-fitness/shared";
import { apiFetch } from "../../core/api/client";

export async function fetchDailyProgressRange(
  from: string,
  to: string,
): Promise<DailyProgressDto[]> {
  const qs = new URLSearchParams({ from, to });
  const res = await apiFetch<{ items: DailyProgressDto[] }>(
    `/api/v1/progress/daily?${qs.toString()}`,
    { auth: true },
  );
  return res.items;
}
