import { prisma } from "../../shared/db/prisma.js";
import type { ListChatMessagesQuery } from "./chat-messages.dto.js";
import { listStepLogs } from "../step-logs/step-logs.service.js";
import { listDailyProgress } from "../progress/progress.service.js";
import { listRunningSessions } from "../running-sessions/running-sessions.service.js";
import { askPuterAI } from "../../integration/puter.service.js";

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

  let streakDays = 0;
  const sortedDays = [...stepsWeekRows].sort((a, b) => b.date.localeCompare(a.date));
  for (const row of sortedDays) {
    if (row.stepCount >= 5000) {
      streakDays++;
    } else {
      break;
    }
  }

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
  const bmr = heightCm && weightKg && age ? computeBmr(weightKg, heightCm, age, gender ?? "male") : null;
  const tdee = bmr ? computeTdee(bmr, profileRow?.activityLevel ?? null) : null;

  const recentWorkouts = recentSessions.map((s) => ({
    name: s.plan?.name ?? "Tự do",
    date: s.sessionDate.toISOString().slice(0, 10),
    minutes: s.endedAt ? Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60_000) : 0,
  }));

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
    monthlySteps: weeklySteps,
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
  
  console.log("=== ĐÃ CHẠY VÀO HÀM AI GENERATE REPLY ===");
  console.log("User nhắn:", userMessage);

  const name = ctx.userName ? ` ${ctx.userName}` : "bạn";
  const pct = Math.round((ctx.stepsToday / 10000) * 100);

  const systemPrompt = `Bạn là Coach Kai, một huấn luyện viên sức khỏe và thể hình AI chuyên nghiệp, nhiệt tình và thấu hiểu.
  
Thông tin của học viên hiện tại:
- Tên:${name} (Tuổi: ${ctx.age ?? 'Chưa rõ'}, Giới tính: ${ctx.gender ?? 'Chưa rõ'})
- Thể trạng: Chiều cao ${ctx.heightCm ?? '?'}cm, Cân nặng ${ctx.weightKg ?? '?'}kg, BMI: ${ctx.bmi ?? '?'}.
- Mục tiêu: ${ctx.goalType ?? 'Chưa thiết lập'} (Cân nặng mục tiêu: ${ctx.targetWeightKg ?? '?'}kg, Năng lượng: ${ctx.dailyKcalTarget ?? '?'}kcal/ngày)

Thành tích hôm nay:
- Bước chân: ${fmtNum(ctx.stepsToday)} bước (Đạt ${pct}% mục tiêu). Chuỗi duy trì: ${ctx.streakDays} ngày.
- Dinh dưỡng: Nạp vào ${fmtNum(ctx.kcalIn)} kcal, Tiêu hao ${fmtNum(ctx.kcalOut)} kcal.
- Vận động: ${ctx.activeMinutes} phút.

Thành tích trong tuần:
- Tổng bước: ${fmtNum(ctx.weeklySteps)} bước.
- Số buổi tập: ${ctx.weeklyWorkoutCount} buổi (Mục tiêu: ${ctx.weeklyWorkoutTarget ?? '?'}).
- Chạy bộ: ${ctx.weeklyRunCount} buổi, tổng quãng đường ${(ctx.weeklyRunDistanceM / 1000).toFixed(1)} km.

Nhiệm vụ của bạn:
Dựa vào các chỉ số trên, hãy trả lời câu hỏi của người dùng. 
- Nếu họ hỏi số liệu cụ thể (ví dụ: "hôm nay tôi ăn bao nhiêu kcal"), hãy lấy số liệu trên để trả lời.
- Trả lời thật ngắn gọn, tự nhiên giống người thật, kèm theo lời động viên hoặc mẹo sức khỏe khoa học.
- TUYỆT ĐỐI KHÔNG liệt kê lại toàn bộ các số liệu trên nếu người dùng không hỏi.`;

  try {
    console.log("⏳ Đang gửi request lên Puter AI...");
    const replyContent = await askPuterAI(systemPrompt, userMessage);
    
    console.log("✅ Puter AI trả lời thành công:", replyContent);
    return { reply: replyContent };
  } catch (error) {
    console.error("❌ Lỗi khi gọi Puter AI:", error);
    return { reply: "Xin lỗi, hiện tại máy chủ AI đang nghỉ ngơi một chút. Bạn có thể thử lại sau nhé!" };
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