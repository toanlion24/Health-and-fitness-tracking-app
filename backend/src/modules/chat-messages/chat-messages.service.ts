import { prisma } from "../../shared/db/prisma.js";
import type { ListChatMessagesQuery } from "./chat-messages.dto.js";
import { listStepLogs } from "../step-logs/step-logs.service.js";
import { listDailyProgress } from "../progress/progress.service.js";
import { listRunningSessions } from "../running-sessions/running-sessions.service.js";

export type ChatMessageDto = {
  id: number;
  role: string;
  content: string;
  metadata: string | null;
  createdAt: string;
};

function serializeMessage(row: {
  id: number;
  role: string;
  content: string;
  metadata: string | null;
  createdAt: Date;
}): ChatMessageDto {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listChatMessages(
  userId: number,
  query: ListChatMessagesQuery,
): Promise<ChatMessageDto[]> {
  const where = query.before ? { userId, createdAt: { lt: new Date(query.before) } } : { userId };

  const rows = await prisma.chatMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: query.limit,
  });

  return rows.map(serializeMessage).reverse();
}

export async function createUserMessage(
  userId: number,
  body: { content: string; metadata?: Record<string, unknown> },
): Promise<ChatMessageDto> {
  const row = await prisma.chatMessage.create({
    data: {
      userId,
      role: "user",
      content: body.content.trim(),
      metadata: body.metadata ? JSON.stringify(body.metadata) : null,
    },
  });
  return serializeMessage(row);
}

export async function createAssistantMessage(
  userId: number,
  content: string,
  metadata?: Record<string, unknown>,
): Promise<ChatMessageDto> {
  const row = await prisma.chatMessage.create({
    data: {
      userId,
      role: "assistant",
      content,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
  return serializeMessage(row);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekStart(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 6);
  return d.toISOString().slice(0, 10);
}

function monthStart(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 29);
  return d.toISOString().slice(0, 10);
}

function fmtNum(n: number): string {
  return n.toLocaleString("vi-VN");
}

function computeBmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

function computeBmr(weightKg: number, heightCm: number, age: number, gender: string): number {
  if (gender === "male") {
    return Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age);
  }
  if (gender === "female") {
    return Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age);
  }
  return Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age);
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function computeTdee(bmr: number, activityLevel: string | null): number {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel ?? "moderate"] ?? 1.55;
  return Math.round(bmr * mult);
}

async function buildContext(userId: number): Promise<{
  stepsToday: number;
  kcalFromSteps: number;
  kcalIn: number;
  kcalOut: number;
  activeMinutes: number;
  weeklySteps: number;
  monthlySteps: number;
  weeklyWorkoutCount: number;
  avgStepsPerDay: number;
  streakDays: number;
  userName: string | null;
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  dailyKcalTarget: number | null;
  weeklyWorkoutTarget: number | null;
  goalType: string | null;
  targetWeightKg: number | null;
  recentWorkouts: { name: string; date: string; minutes: number }[];
  waterGlasses: number;
  // Running data
  weeklyRunCount: number;
  weeklyRunDistanceM: number;
  weeklyRunDurationSec: number;
  weeklyRunKcal: number;
  lastRunDate: string | null;
  lastRunDistanceM: number;
  lastRunPace: number;
  lastRunDurationSec: number;
}> {
  const today = todayDate();
  const wStart = weekStart();
  const _mStart = monthStart();

  // Fetch all data in parallel
  const [
    stepsTodayRows,
    stepsWeekRows,
    progressRows,
    profileRow,
    bodyMetricRow,
    goalRow,
    recentSessions,
    weeklyRunningSessions,
  ] = await Promise.all([
    listStepLogs(userId, { from: today, to: today }),
    listStepLogs(userId, { from: wStart, to: today }),
    listDailyProgress(userId, { from: wStart, to: today }),
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.bodyMetricLog.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.userGoal.findFirst({
      where: { userId, isActive: true },
      orderBy: { id: "desc" },
    }),
    prisma.workoutSession.findMany({
      where: {
        userId,
        sessionDate: { gte: new Date(`${wStart}T00:00:00.000Z`) },
        status: "completed",
      },
      orderBy: { sessionDate: "desc" },
      take: 5,
    }),
    listRunningSessions(userId, { from: wStart, to: today }),
  ]);

  const stepsToday = stepsTodayRows[0]?.stepCount ?? 0;
  const kcalFromSteps = stepsTodayRows[0]?.kcalBurned ?? 0;
  const todayProgress = progressRows.find((p) => p.date === today);
  const kcalIn = todayProgress?.totalKcalIn ?? 0;
  const kcalOut = (todayProgress?.totalKcalOut ?? 0) + kcalFromSteps;
  const activeMinutes = todayProgress?.totalWorkoutMinutes ?? 0;

  const weeklySteps = stepsWeekRows.reduce((sum, r) => sum + r.stepCount, 0);
  const weeklyWorkoutCount = recentSessions.length;

  const dayCount = Math.max(1, stepsWeekRows.length);
  const avgStepsPerDay = Math.round(weeklySteps / dayCount);

  // Streak: consecutive days with >= 5000 steps
  let streakDays = 0;
  const sortedDays = [...stepsWeekRows].sort((a, b) => b.date.localeCompare(a.date));
  for (const row of sortedDays) {
    if (row.stepCount >= 5000) {
      streakDays++;
    } else {
      break;
    }
  }

  // Compute health stats
  const heightCm = profileRow?.heightCm ? Number(profileRow.heightCm) : null;
  const weightKg = bodyMetricRow?.weightKg ? Number(bodyMetricRow.weightKg) : null;
  let age: number | null = null;
  if (profileRow?.dob) {
    const birthDate = new Date(profileRow.dob);
    const todayObj = new Date();
    age = Math.floor((todayObj.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
  const gender = profileRow?.gender ?? null;
  const bmi = heightCm && weightKg ? Math.round(computeBmi(weightKg, heightCm) * 10) / 10 : null;
  const bmr =
    heightCm && weightKg && age ? computeBmr(weightKg, heightCm, age, gender ?? "male") : null;
  const tdee = bmr ? computeTdee(bmr, profileRow?.activityLevel ?? null) : null;

  // Recent workouts
  const recentWorkouts = recentSessions.map((s) => ({
    name: s.plan?.name ?? "Tự do",
    date: s.sessionDate.toISOString().slice(0, 10),
    minutes: s.endedAt ? Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60_000) : 0,
  }));

  // Running data (completed sessions this week)
  const completedRuns = weeklyRunningSessions.filter((r) => r.status === "completed");
  const weeklyRunCount = completedRuns.length;
  const weeklyRunDistanceM = completedRuns.reduce((sum, r) => sum + r.totalDistanceM, 0);
  const weeklyRunDurationSec = completedRuns.reduce((sum, r) => sum + r.totalDurationSec, 0);
  const weeklyRunKcal = completedRuns.reduce((sum, r) => sum + r.kcalBurned, 0);
  const lastRun = weeklyRunningSessions[0] ?? null;

  return {
    stepsToday,
    kcalFromSteps,
    kcalIn,
    kcalOut,
    activeMinutes,
    weeklySteps,
    monthlySteps: weeklySteps, // approximate — fetch month if needed
    weeklyWorkoutCount,
    avgStepsPerDay,
    streakDays,
    userName: profileRow?.fullName ?? null,
    age,
    gender,
    heightCm,
    weightKg,
    bmi,
    bmr,
    tdee,
    dailyKcalTarget: goalRow?.dailyKcalTarget ? Number(goalRow.dailyKcalTarget) : null,
    weeklyWorkoutTarget: goalRow?.weeklyWorkoutTarget ?? null,
    goalType: goalRow?.goalType ?? null,
    targetWeightKg: goalRow?.targetWeightKg ? Number(goalRow.targetWeightKg) : null,
    recentWorkouts,
    waterGlasses: 0,
    weeklyRunCount,
    weeklyRunDistanceM,
    weeklyRunDurationSec,
    weeklyRunKcal,
    lastRunDate: lastRun?.sessionDate ?? null,
    lastRunDistanceM: lastRun?.totalDistanceM ?? 0,
    lastRunPace: lastRun?.avgPaceSecPerKm ?? 0,
    lastRunDurationSec: lastRun?.totalDurationSec ?? 0,
  };
}

type Intent =
  | "greeting"
  | "steps"
  | "calories"
  | "workout"
  | "running"
  | "nutrition"
  | "water"
  | "weight"
  | "sleep"
  | "reminder"
  | "goal"
  | "summary"
  | "motivation"
  | "health_tip"
  | "weekly_summary"
  | "bmi"
  | "unknown";

function detectIntent(text: string): Intent {
  const lower = text.toLowerCase();
  if (/^(xin chao|chao|hi|hey|hello|chào|helo|good morning|good afternoon)/.test(lower))
    return "greeting";
  if (/buoc|step|đi bộ|đi bước|đi bao nhiêu/.test(lower)) return "steps";
  if (/calo|kcal|năng lượng|đốt|tiêu thụ/.test(lower)) return "calories";
  if (/tập|workout|exercise|luyện|thể dục|gym/.test(lower)) return "workout";
  if (/chạy|running|runner|jog|marathon|5k|10k|chạy bộ|đi bộ chạy/.test(lower)) return "running";
  if (/ăn|uống|thức ăn|dinh dưỡng|bữa/.test(lower)) return "nutrition";
  if (/nuoc|nước|uống nước|khát/.test(lower)) return "water";
  if (/cân|nặng|weight|giảm cân|tăng cân/.test(lower)) return "weight";
  if (/giấc ngủ|ngủ|sleep|nghỉ ngơi/.test(lower)) return "sleep";
  if (/nhắc|tạo reminder/.test(lower)) return "reminder";
  if (/mục tiêu|goal|target/.test(lower)) return "goal";
  if (/tổng|hôm nay|trạng thái|daily|báo cáo/.test(lower)) return "summary";
  if (/động lực|motivation|khuyến khích|cố gắng/.test(lower)) return "motivation";
  if (/mẹo|lời khuyên|tip|health|bí quyết/.test(lower)) return "health_tip";
  if (/tuần|weekly|tuan|7 ngày/.test(lower)) return "weekly_summary";
  if (/bmi|chỉ số|nhiet bmi/.test(lower)) return "bmi";
  return "unknown";
}

async function generateReply(
  userMessage: string,
  ctx: Awaited<ReturnType<typeof buildContext>>,
): Promise<{ reply: string; extraStats?: Record<string, unknown> }> {
  const intent = detectIntent(userMessage);
  const name = ctx.userName ? ` ${ctx.userName}` : "";
  const pct = Math.round((ctx.stepsToday / 10000) * 100);
  const deficit = ctx.kcalIn - ctx.kcalOut;

  switch (intent) {
    case "greeting": {
      const hour = new Date().getHours();
      const timeGreeting =
        hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
      const workoutNote =
        ctx.weeklyWorkoutCount > 0
          ? ` Tuần này bạn đã tập ${ctx.weeklyWorkoutCount} buổi!`
          : " Hôm nay bạn chưa tập luyện, sẵn sàng chưa?";
      return {
        reply:
          `${timeGreeting}${name}! Mình là Coach Kai 👋 ` +
          `Hôm nay bạn đã đi ${fmtNum(ctx.stepsToday)} bước (${pct}% mục tiêu).` +
          workoutNote +
          ` Bạn cần mình hỗ trợ gì?`,
      };
    }

    case "steps": {
      const emoji = pct >= 100 ? "🎉" : pct >= 70 ? "💪" : "🚶";
      const missing = Math.max(0, 10000 - ctx.stepsToday);
      let body = `${emoji} Hôm nay bạn đã đi ${fmtNum(ctx.stepsToday)} bước (${pct}% mục tiêu 10,000).`;
      if (pct < 100) {
        body += ` Còn thiếu ${fmtNum(missing)} bước nữa nhé!`;
      } else {
        body += " Bạn đã đạt mục tiêu rồi, tuyệt vời!";
      }
      body += ` Đi bộ tiêu tốn khoảng ${fmtNum(ctx.kcalFromSteps)} kcal.`;
      if (ctx.avgStepsPerDay > 0) {
        body += ` Trung bình tuần này ${fmtNum(ctx.avgStepsPerDay)} bước/ngày.`;
      }
      if (ctx.streakDays > 1) {
        body += ` 🔥 Chuỗi ${ctx.streakDays} ngày liên tiếp đạt mục tiêu!`;
      }
      return { reply: body };
    }

    case "calories": {
      let body = `📊 Hôm nay:\n`;
      body += `- Năng lượng nạp vào: ${fmtNum(ctx.kcalIn)} kcal`;
      if (ctx.dailyKcalTarget) {
        const diff = ctx.kcalIn - ctx.dailyKcalTarget;
        body += ` / ${fmtNum(ctx.dailyKcalTarget)} kcal (${diff > 0 ? `+${fmtNum(diff)}` : fmtNum(diff)} kcal)`;
      } else {
        body += ` kcal`;
      }
      body += `\n- Tiêu thụ: ${fmtNum(ctx.kcalOut)} kcal`;
      body += `\n  (trong đó ${fmtNum(ctx.kcalFromSteps)} kcal từ đi bộ)`;
      if (ctx.dailyKcalTarget) {
        const balance = ctx.kcalIn - ctx.kcalOut;
        if (balance > 0) {
          body += `\n✅ Thặng dư ${fmtNum(balance)} kcal — phù hợp nếu bạn đang giảm cân.`;
        } else if (balance < -200) {
          body += `\n⚠️ Thiếu hụt ${fmtNum(Math.abs(balance))} kcal — hãy bổ sung dinh dưỡng!`;
        } else {
          body += `\n⚖️ Cân bằng năng lượng tốt!`;
        }
      } else if (deficit > 0) {
        body += `\n✅ Thặng dư ${fmtNum(deficit)} kcal hôm nay.`;
      } else {
        body += `\n⚠️ Bạn đã ăn nhiều hơn tiêu thụ, cố gắng vận động thêm nhé!`;
      }
      return { reply: body };
    }

    case "workout": {
      let body = `🏋️ Hôm nay bạn tập ${ctx.activeMinutes} phút. `;
      if (ctx.weeklyWorkoutCount > 0) {
        body += `Tuần này đã có ${ctx.weeklyWorkoutCount} buổi tập.`;
        if (ctx.recentWorkouts.length > 0) {
          body += `\nBuổi gần nhất: ${ctx.recentWorkouts[0].name} (${ctx.recentWorkouts[0].minutes} phút).`;
        }
      } else {
        body +=
          ctx.stepsToday < 5000
            ? "Bắt đầu với cardio nhẹ như đi bộ 15 phút nhé!"
            : "Bạn đã đi bộ nhiều rồi, có thể thêm buổi tập sức mạnh!";
      }
      if (ctx.weeklyWorkoutTarget) {
        const remaining = Math.max(0, ctx.weeklyWorkoutTarget - ctx.weeklyWorkoutCount);
        if (remaining > 0) {
          body += ` Còn ${remaining} buổi để đạt mục tiêu tuần này.`;
        } else {
          body += " 🎉 Bạn đã hoàn thành mục tiêu tập luyện tuần này!";
        }
      }
      return { reply: body };
    }

    case "running": {
      let body = "🏃 **Chạy bộ & Chạy**\n";
      if (ctx.weeklyRunCount === 0) {
        body += `Tuần này bạn chưa có buổi chạy nào.\n`;
        body += `Mục tiêu khuyến khích: ít nhất 2-3 buổi chạy mỗi tuần, mỗi buổi 20-40 phút.`;
        if (ctx.stepsToday < 3000) {
          body += ` Hãy bắt đầu với 10 phút chạy chậm hoặc đi bộ nhanh!`;
        }
      } else {
        const runKm = (ctx.weeklyRunDistanceM / 1000).toFixed(1);
        const runMins = Math.round(ctx.weeklyRunDurationSec / 60);
        body += `Tuần này: **${ctx.weeklyRunCount} buổi** chạy\n`;
        body += `- Tổng quãng đường: **${runKm} km**\n`;
        body += `- Tổng thời gian: **${runMins} phút**\n`;
        body += `- Tổng kcal tiêu thụ: **${fmtNum(ctx.weeklyRunKcal)} kcal**\n`;
        if (ctx.lastRunDate) {
          const pace =
            ctx.lastRunPace > 0
              ? `${Math.floor(ctx.lastRunPace / 60)}'${String(Math.round(ctx.lastRunPace % 60)).padStart(2, "0")}" /km`
              : "—";
          const distKm = (ctx.lastRunDistanceM / 1000).toFixed(2);
          body += `\n**Buổi gần nhất** (${ctx.lastRunDate}):\n`;
          body += `- Quãng đường: ${distKm} km\n`;
          body += `- Pace: ${pace}\n`;
          body += `- Thời gian: ${Math.round(ctx.lastRunDurationSec / 60)} phút\n`;
          if (ctx.lastRunPace > 0) {
            if (ctx.lastRunPace < 360) {
              body += `💨 Pace rất tốt! Bạn đang chạy ở tốc độ cao.`;
            } else if (ctx.lastRunPace < 420) {
              body += `⚡ Pace khá tốt! Tiếp tục duy trì.`;
            } else {
              body += `🏃 Pace phù hợp để tập aerobic và đốt cháy mỡ.`;
            }
          }
        }
        const avgKm =
          ctx.weeklyRunCount > 0
            ? (ctx.weeklyRunDistanceM / 1000 / ctx.weeklyRunCount).toFixed(1)
            : "0";
        body += `\n📊 Trung bình: ${avgKm} km/buổi.`;
      }
      return { reply: body };
    }

    case "nutrition": {
      let body = `🍽️ Hôm nay bạn đã ăn ${fmtNum(ctx.kcalIn)} kcal.`;
      if (ctx.dailyKcalTarget) {
        if (ctx.kcalIn < ctx.dailyKcalTarget * 0.7) {
          body += " Lượng kcal khá thấp, hãy đảm bảo đủ năng lượng cho cơ thể nhé!";
        } else if (ctx.kcalIn > ctx.dailyKcalTarget * 1.2) {
          body += " Lượng kcal khá cao. Cố gắng kiểm soát bữa ăn tối nhé!";
        } else {
          body += " Lượng kcal khá cân đối!";
        }
      }
      if (ctx.weightKg) {
        body += ` Cân nặng hiện tại: ${ctx.weightKg} kg.`;
      }
      return { reply: body };
    }

    case "water":
      return {
        reply:
          `💧 Nhắc nhở uống nước! Mỗi ngày nên uống 2-3 lít nước (~8-10 ly). ` +
          `Bạn đã đi ${fmtNum(ctx.stepsToday)} bước hôm nay — ` +
          `sau khi vận động hãy bổ sung nước ngay nhé! ` +
          `Mẹo: đặt reminder mỗi 2 tiếng hoặc dùng app theo dõi lượng nước uống.`,
      };

    case "sleep":
      return {
        reply:
          `😴 Giấc ngủ quan trọng cho việc phục hồi. ` +
          `Hãy ngủ đủ 7-8 tiếng mỗi đêm và tránh dùng điện thoại trước khi ngủ. ` +
          `Ngủ đúng giờ và thức dậy đúng giờ giúp cải thiện chất lượng giấc ngủ.`,
      };

    case "weight": {
      let body = `⚖️ Theo dữ liệu hiện tại:`;
      if (ctx.weightKg) {
        body += ` Cân nặng: ${ctx.weightKg} kg.`;
      }
      if (ctx.targetWeightKg && ctx.weightKg) {
        const diff = ctx.weightKg - ctx.targetWeightKg;
        if (Math.abs(diff) < 0.5) {
          body += " Bạn đã gần đạt mục tiêu cân nặng!";
        } else if (diff > 0) {
          body += ` Còn ${fmtNum(diff)} kg nữa để đạt mục tiêu.`;
        } else {
          body += ` Bạn đang nhẹ hơn mục tiêu ${fmtNum(Math.abs(diff))} kg!`;
        }
      }
      if (ctx.bmi) {
        const bmiLabel =
          ctx.bmi < 18.5
            ? "thiếu cân"
            : ctx.bmi < 25
              ? "bình thường"
              : ctx.bmi < 30
                ? "thừa cân"
                : "béo phì";
        body += ` Chỉ số BMI: ${ctx.bmi} (${bmiLabel}).`;
      }
      body +=
        " Hãy kết hợp tập luyện đều đặn và ăn uống cân bằng để đạt mục tiêu!" +
        (ctx.goalType ? ` Mục tiêu hiện tại: ${ctx.goalType}.` : "");
      return { reply: body };
    }

    case "bmi": {
      let body = `📐 BMI (Chỉ số khối cơ thể):\n`;
      if (ctx.weightKg && ctx.heightCm && ctx.bmi) {
        const bmiLabel =
          ctx.bmi < 18.5
            ? "Thiếu cân"
            : ctx.bmi < 25
              ? "Bình thường"
              : ctx.bmi < 30
                ? "Thừa cân"
                : "Béo phì";
        body += `- Cân nặng: ${ctx.weightKg} kg\n- Chiều cao: ${ctx.heightCm} cm\n- BMI: ${ctx.bmi} (${bmiLabel})`;
        if (ctx.age) {
          body += `\n- Tuổi: ${ctx.age}`;
        }
      } else {
        body +=
          "Mình chưa có đủ dữ liệu để tính BMI. " +
          "Hãy cập nhật cân nặng và chiều cao trong profile để mình tính chỉ số chính xác nhé!";
      }
      if (ctx.bmr) {
        body += `\n- BMR (năng lượng nền): ${fmtNum(ctx.bmr)} kcal/ngày`;
      }
      if (ctx.tdee) {
        body += `\n- TDEE (năng lượng duy trì): ${fmtNum(ctx.tdee)} kcal/ngày`;
      }
      return { reply: body };
    }

    case "reminder":
      return {
        reply:
          `🔔 Bạn muốn tạo reminder? Mình gợi ý:\n` +
          `- 💧 Nhắc uống nước mỗi 2 tiếng\n` +
          `- 🏃 Nhắc tập thể dục buổi sáng\n` +
          `- 😴 Nhắc ngủ đúng giờ\n` +
          `Bạn muốn thiết lập reminder nào? Mình sẽ hướng dẫn tạo trong ứng dụng nhé!`,
      };

    case "goal": {
      let body = `🎯 Mục tiêu hiện tại của bạn:`;
      if (ctx.goalType) {
        body += ` "${ctx.goalType}"`;
      } else {
        body += " chưa thiết lập.";
      }
      body += "\n";
      if (ctx.dailyKcalTarget) {
        body += `- Năng lượng hàng ngày: ${fmtNum(ctx.dailyKcalTarget)} kcal\n`;
      }
      if (ctx.weeklyWorkoutTarget) {
        body += `- Tập luyện: ${ctx.weeklyWorkoutTarget} buổi/tuần\n`;
      }
      if (ctx.targetWeightKg) {
        body += `- Cân nặng mục tiêu: ${ctx.targetWeightKg} kg\n`;
      }
      if (!ctx.goalType && !ctx.dailyKcalTarget && !ctx.weeklyWorkoutTarget) {
        body +=
          "Hãy thiết lập mục tiêu trong phần Cài đặt > Mục tiêu để mình theo dõi và hỗ trợ bạn nhé!";
      } else {
        body += `Tuần này bạn đã đi ${fmtNum(ctx.weeklySteps)} bước! Tiếp tục cố gắng nhé!`;
      }
      return { reply: body };
    }

    case "weekly_summary": {
      const avg = Math.round(ctx.weeklySteps / 7);
      let body = `📋 Tổng kết tuần này:\n`;
      body += `- Tổng bước chân: ${fmtNum(ctx.weeklySteps)} bước\n`;
      body += `- Trung bình: ${fmtNum(avg)} bước/ngày\n`;
      body += `- Buổi tập: ${ctx.weeklyWorkoutCount} buổi`;
      if (ctx.weeklyWorkoutTarget) {
        body += ` / ${ctx.weeklyWorkoutTarget} mục tiêu`;
      }
      body += `\n`;
      if (ctx.streakDays > 0) {
        body += `🔥 Chuỗi ${ctx.streakDays} ngày đạt mục tiêu!\n`;
      }
      if (avg >= 8000) {
        body += "Tuần này bạn rất nỗ lực! 🎉";
      } else if (avg >= 5000) {
        body += "Bạn đang tiến bộ tốt, cố gắng thêm nhé!";
      } else {
        body += "Hãy tăng thêm hoạt động tuần tới nhé, bạn làm được!";
      }
      return { reply: body };
    }

    case "summary": {
      const stepsPct2 = Math.round((ctx.stepsToday / 10000) * 100);
      const deficit2 = ctx.kcalIn - ctx.kcalOut;
      const msg =
        deficit2 > 0
          ? `✅ Thặng dư ${fmtNum(deficit2)} kcal — phù hợp nếu giảm cân.`
          : deficit2 < -200
            ? `⚠️ Thiếu hụt ${fmtNum(Math.abs(deficit2))} kcal — hãy bổ sung dinh dưỡng!`
            : `⚖️ Cân bằng năng lượng tốt!`;
      let body = `📋 Tổng kết hôm nay${name}:\n`;
      body += `- Bước chân: ${fmtNum(ctx.stepsToday)} / 10,000 (${stepsPct2}%)\n`;
      body += `- Calories nạp vào: ${fmtNum(ctx.kcalIn)} kcal`;
      if (ctx.dailyKcalTarget) {
        body += ` / ${fmtNum(ctx.dailyKcalTarget)} kcal`;
      }
      body += `\n- Calories tiêu thụ: ${fmtNum(ctx.kcalOut)} kcal\n`;
      body += `- Thời gian tập: ${ctx.activeMinutes} phút\n`;
      body += `- Buổi tập tuần này: ${ctx.weeklyWorkoutCount}`;
      if (ctx.weeklyWorkoutTarget) {
        body += ` / ${ctx.weeklyWorkoutTarget} mục tiêu`;
      }
      body += `\n${msg}`;
      return { reply: body };
    }

    case "motivation": {
      const motivators = [
        `💪 Mỗi ngày tập luyện là một ngày bạn mạnh hơn! Không cần hoàn hảo, chỉ cần bắt đầu!`,
        `🔥 Kiên trì là chìa khóa! ${ctx.streakDays > 0 ? `Bạn đang có chuỗi ${ctx.streakDays} ngày — giữ vững nhé!` : "Hãy bắt đầu chuỗi của bạn hôm nay!"}`,
        `🌟 Thay đổi nhỏ mỗi ngày tạo nên khác biệt lớn. Bạn đang làm rất tốt!${ctx.weeklySteps > 30000 ? " Tuần này bạn rất nỗ lực!" : ""}`,
        `🏆 Mục tiêu không phải là vận động nhiều nhất, mà là vận động đều đặn nhất. Cố lên${name}!`,
        `⚡ Sức khỏe là tài sản quý nhất. Hãy chăm sóc bản thân mỗi ngày nhé${name}!`,
      ];
      const idx = Math.floor(Math.random() * motivators.length);
      return { reply: motivators[idx] };
    }

    case "health_tip": {
      const tips = [
        `🥗 Ăn nhiều rau xanh và protein giúp no lâu hơn và kiểm soát cân nặng hiệu quả.`,
        `💧 Uống một ly nước trước bữa ăn 30 phút giúp giảm lượng thức ăn nạp vào.`,
        `🏃 Đi bộ sau bữa tối 15-20 phút giúp tiêu hóa tốt hơn và giảm đường huyết.`,
        `😴 Ngủ đủ 7-8 tiếng mỗi đêm giúp hormone gherlin (đói) giảm và leptin (no) tăng.`,
        `🧘 Thiền 5-10 phút mỗi ngày giúp giảm stress và cải thiện chất lượng giấc ngủ.`,
        `🍎 Thay snacks bằng trái cây hoặc hạt giúp kiểm soát năng lượng tốt hơn trong ngày.`,
        `📏 Đo cân và ghi chép tiến độ mỗi tuần giúp bạn theo dõi và duy trì động lực.`,
      ];
      const idx = Math.floor(Math.random() * tips.length);
      return { reply: tips[idx] };
    }

    default: {
      let body = `Cảm ơn bạn${name}! `;
      body += `Hôm nay bạn đã đi ${fmtNum(ctx.stepsToday)} bước (${pct}% mục tiêu) `;
      body += `và ăn ${fmtNum(ctx.kcalIn)} kcal. `;
      if (ctx.stepsToday < 5000) {
        body += "Hãy tăng thêm vận động nhé!";
      } else {
        body += "Tiếp tục duy trì như vậy!";
      }
      body +=
        "\n\nBạn có muốn hỏi về bước chân, calories, luyện tập, mục tiêu hay mẹo sức khỏe không?";
      return { reply: body };
    }
  }
}

export async function sendChatMessage(
  userId: number,
  userContent: string,
): Promise<{ userMessage: ChatMessageDto; assistantMessage: ChatMessageDto }> {
  const trimmed = userContent.trim();
  if (!trimmed) throw new Error("Message content cannot be empty");

  const [userMessage, ctx] = await Promise.all([
    createUserMessage(userId, { content: trimmed }),
    buildContext(userId),
  ]);

  const { reply, extraStats } = await generateReply(trimmed, ctx);
  const intent = detectIntent(trimmed);

  const assistantMessage = await createAssistantMessage(userId, reply, {
    intent,
    stepsToday: ctx.stepsToday,
    kcalFromSteps: ctx.kcalFromSteps,
    kcalIn: ctx.kcalIn,
    kcalOut: ctx.kcalOut,
    weeklySteps: ctx.weeklySteps,
    streakDays: ctx.streakDays,
    weeklyWorkoutCount: ctx.weeklyWorkoutCount,
    ...extraStats,
  });

  return { userMessage, assistantMessage };
}
