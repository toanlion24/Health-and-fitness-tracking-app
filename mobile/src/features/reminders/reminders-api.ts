import type { ReminderDto } from "@health-fitness/shared";
import { apiFetch } from "../../core/api/client";

export async function fetchReminders(): Promise<ReminderDto[]> {
  const res = await apiFetch<{ items: ReminderDto[] }>("/api/v1/reminders", {
    auth: true,
  });
  return res.items;
}

export async function createReminder(body: {
  type: "workout" | "water" | "meal" | "sleep";
  title: string;
  message?: string | null;
  timezone: string;
  localHour: number;
  localMinute: number;
}): Promise<ReminderDto> {
  return apiFetch<ReminderDto>("/api/v1/reminders", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export async function patchReminder(
  id: number,
  body: Partial<{
    title: string;
    message: string | null;
    timezone: string;
    localHour: number;
    localMinute: number;
    isEnabled: boolean;
  }>,
): Promise<ReminderDto> {
  return apiFetch<ReminderDto>(`/api/v1/reminders/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  });
}

export async function deleteReminder(id: number): Promise<void> {
  await apiFetch(`/api/v1/reminders/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
