/**
 * Running session API service.
 * Handles all running/running-related API calls.
 */
import type { RunningSessionDto } from "@health-fitness/shared";

const API_BASE = "http://localhost:3000/api/v1";

export async function listRunningSessions(accessToken: string): Promise<RunningSessionDto[]> {
  const res = await fetch(`${API_BASE}/running-sessions`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch running sessions");
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function getRunningSession(
  accessToken: string,
  sessionId: string,
): Promise<RunningSessionDto> {
  const res = await fetch(`${API_BASE}/running-sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch running session");
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function deleteRunningSession(
  accessToken: string,
  sessionId: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/running-sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to delete running session");
  }
}

export async function createRunningSession(
  accessToken: string,
  data: {
    totalDistanceM: number;
    totalDurationSec: number;
    avgPaceSecPerKm: number;
    maxPaceSecPerKm: number;
    kcalBurned: number;
    stepCount: number;
    elevationGainM: number;
    gpsPoints?: Array<{ lat: number; lng: number; timestamp: number }>;
  },
): Promise<RunningSessionDto> {
  const res = await fetch(`${API_BASE}/running-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create running session");
  }
  const json = await res.json();
  return json.data ?? json;
}
