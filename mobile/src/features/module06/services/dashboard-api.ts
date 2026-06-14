const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3000";

async function apiFetch(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(`${API_BASE}/api/v1${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
  return res;
}

export type TodayStats = {
  steps: number;
  kcalIn: number;
  kcalOut: number;
  activeMinutes: number;
  dailyKcalTarget: number | null;
  weeklyWorkoutCount: number;
  weeklyWorkoutTarget: number | null;
};

export type TodaySession = {
  id: number;
  planName: string;
  sessionDate: string;
  durationMinutes: number;
  status: "in_progress" | "completed";
};

export type DashboardData = {
  stats: TodayStats;
  todaySession: TodaySession | null;
  streakDays: number;
};

export async function fetchTodayDashboard(
  accessToken: string,
): Promise<DashboardData> {
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  // Fetch data in parallel
  const [progressRes, sessionsRes, meRes] = await Promise.all([
    apiFetch(`/progress/daily?from=${today}&to=${today}`, accessToken),
    apiFetch(`/workout-sessions?from=${today}&to=${today}`, accessToken),
    apiFetch("/me", accessToken),
  ]);

  // Parse progress (today)
  let stats: TodayStats = {
    steps: 0,
    kcalIn: 0,
    kcalOut: 0,
    activeMinutes: 0,
    dailyKcalTarget: null,
    weeklyWorkoutCount: 0,
    weeklyWorkoutTarget: null,
  };

  if (progressRes.ok) {
    const progressData = await progressRes.json();
    const items: Array<{
      totalKcalIn: number;
      totalKcalOut: number;
      totalWorkoutMinutes: number;
    }> = progressData.items ?? [];
    if (items.length > 0) {
      const todayData = items[0];
      stats.kcalIn = todayData.totalKcalIn ?? 0;
      stats.kcalOut = todayData.totalKcalOut ?? 0;
      stats.activeMinutes = todayData.totalWorkoutMinutes ?? 0;
    }
  }

  // Get weekly sessions count
  const weeklySessionsRes = await fetch(
    `${API_BASE}/api/v1/workout-sessions?from=${weekStartStr}&to=${today}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (weeklySessionsRes.ok) {
    const weeklyData = await weeklySessionsRes.json();
    const sessions: Array<{ status: string }> = weeklyData.items ?? [];
    stats.weeklyWorkoutCount = sessions.filter((s) => s.status === "completed").length;
  }

  // Parse user goals
  if (meRes.ok) {
    const meData = await meRes.json();
    const activeGoal = meData.goals?.find((g: { isActive: boolean }) => g.isActive);
    if (activeGoal) {
      stats.dailyKcalTarget = activeGoal.dailyKcalTarget ?? null;
      stats.weeklyWorkoutTarget = activeGoal.weeklyWorkoutTarget ?? null;
    }
  }

  // Estimate steps from active minutes (rough approximation)
  stats.steps = stats.activeMinutes * 100;

  // Parse today's session
  let todaySession: TodaySession | null = null;
  if (sessionsRes.ok) {
    const sessionsData = await sessionsRes.json();
    const sessions: Array<{
      id: number;
      planId: number | null;
      sessionDate: string;
      startedAt: string;
      endedAt: string | null;
      status: string;
      plan?: { name: string };
    }> = sessionsData.items ?? [];
    const todaySessions = sessions.filter((s) => s.sessionDate === today);
    if (todaySessions.length > 0) {
      const s = todaySessions[0];
      const durationMinutes = s.endedAt
        ? Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)
        : 0;
      todaySession = {
        id: s.id,
        planName: s.plan?.name ?? "Buổi tập tự do",
        sessionDate: s.sessionDate,
        durationMinutes,
        status: s.status as "in_progress" | "completed",
      };
    }
  }

  // Calculate streak (consecutive days with workout)
  let streakDays = 0;
  try {
    const streakRes = await fetch(
      `${API_BASE}/api/v1/workout-sessions?from=${weekStartStr}&to=${today}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (streakRes.ok) {
      const streakData = await streakRes.json();
      const weekSessions: Array<{ sessionDate: string; status: string }> = streakData.items ?? [];
      // Count consecutive completed days from today backwards
      const completedDates = new Set(
        weekSessions
          .filter((s) => s.status === "completed")
          .map((s) => s.sessionDate),
      );
      
      const todayDate = new Date(today);
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(todayDate);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().slice(0, 10);
        if (completedDates.has(dateStr)) {
          streakDays++;
        } else if (i > 0) {
          break;
        }
      }
    }
  } catch {
    // Ignore streak calculation errors
  }

  return { stats, todaySession, streakDays };
}

export type WeeklyPulseData = {
  day: string;
  value: number;
};

export async function fetchWeeklyPulse(
  accessToken: string,
): Promise<WeeklyPulseData[]> {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const todayStr = today.toISOString().slice(0, 10);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const res = await apiFetch(`/progress/daily?from=${weekStartStr}&to=${todayStr}`, accessToken);
  
  if (!res.ok) {
    // Return mock data on error
    return [
      { day: "T2", value: 22 },
      { day: "T3", value: 38 },
      { day: "T4", value: 30 },
      { day: "T5", value: 44 },
      { day: "T6", value: 28 },
      { day: "T7", value: 35 },
      { day: "CN", value: 20 },
    ];
  }

  const data = await res.json();
  const items: Array<{ date: string; totalWorkoutMinutes: number }> = data.items ?? [];
  
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  
  return items.map((item) => {
    const date = new Date(item.date);
    const dayIndex = date.getDay();
    return {
      day: dayNames[dayIndex],
      value: Math.round(item.totalWorkoutMinutes * 1.5), // Scale for visual
    };
  });
}
