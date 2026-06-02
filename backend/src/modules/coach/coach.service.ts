import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../../shared/db/prisma.js";
import { getLogger } from "../../shared/logger.js";
import { AppError } from "../../shared/errors/app-error.js";
import { ApiErrorCodes } from "@health-fitness/shared";
import type { ChatMessageDto } from "@health-fitness/shared";

const logger = getLogger();

export async function processCoachChat(
  userId: number,
  messages: Omit<ChatMessageDto, "id" | "createdAt">[],
): Promise<string> {
  // 1. Fetch user profile and goals for personalized context
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      goals: {
        where: { isActive: true },
        orderBy: { id: "desc" },
        take: 1,
      },
      bodyMetricLogs: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "User not found");
  }

  const profile = user.profile;
  const goal = user.goals[0];
  const lastMetric = user.bodyMetricLogs[0];

  // 2. Prepare user context variables
  const name = profile?.fullName || "Fitness Enthusiast";
  const gender = profile?.gender || "not specified";
  const height = profile?.heightCm ? `${profile.heightCm} cm` : "not specified";
  const weight = lastMetric?.weightKg ? `${lastMetric.weightKg} kg` : "not specified";
  const activityLevel = profile?.activityLevel || "moderately active";

  let age = "not specified";
  if (profile?.dob) {
    const birthDate = new Date(profile.dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    age = `${calculatedAge} years old`;
  }

  const goalType = goal?.goalType || "general fitness";
  const dailyKcalTarget = goal?.dailyKcalTarget || 2000;
  const weeklyWorkoutTarget = goal?.weeklyWorkoutTarget || 3;
  const targetWeight = goal?.targetWeightKg ? `${goal.targetWeightKg} kg` : "not specified";

  const userContextPrompt = `
User Context Profile:
- Name: ${name}
- Gender: ${gender}
- Age: ${age}
- Height: ${height}
- Current Weight: ${weight}
- Activity Level: ${activityLevel}
- Fitness Goal: ${goalType}
- Target Weight: ${targetWeight}
- Daily Caloric Target: ${dailyKcalTarget} kcal
- Weekly Exercise Target: ${weeklyWorkoutTarget} sessions per week
`;

  // 3. Check for Gemini API key configuration
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && apiKey !== "your_gemini_api_key_here" && apiKey.trim() !== "";

  if (isKeyConfigured) {
    try {
      logger.info({ userId }, "Initializing Gemini API for health coach...");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 1200,
        },
      });

      // Construct system instructions
      const systemInstruction = `
You are "Antigravity AI Health & Fitness Coach", a friendly, highly professional, encouraging, and certified personal trainer and dietitian.
You are helping the following user:
${userContextPrompt}

Your mission is to provide accurate, highly structured, evidence-based, and personalized health recommendations.

CRITICAL INSTRUCTIONS:
1. **Choose Food & Nutrition Advice**:
   - Give precise food recommendations that align with their goal (${goalType}) and daily calorie target (${dailyKcalTarget} kcal).
   - Divide recommendations into: Breakfast, Lunch, Dinner, and Snacking.
   - Specify healthy, accessible ingredients.
   - State estimated calories and approximate macros (Protein, Carbs, Fats) for each meal.
   
2. **Weekly Exercise Schedule**:
   - Provide a highly structured 7-day program (Day 1 through Day 7) optimized for their fitness goal (${goalType}) and weekly target (${weeklyWorkoutTarget} workouts).
   - Detail the training type, specific exercise names, target sets, reps, and which muscle groups are trained.
   - Include active recovery or rest days.

3. **Tone & Style**:
   - Be professional, warm, empathetic, and direct. Avoid excessive preambles or conversational fluff.
   - Use Markdown format for structural clarity.
   - Use **bold text** for key highlights, metrics, or food/exercise names (e.g. **Bench Press**, **Oatmeal**).
   - Use section headers like "### " (e.g. "### Day 1: Upper Body Focus").
   - Use lists with dashes "- " for items. Do NOT use nested lists.
   - Respond in the language that matches the user's latest query (English or Vietnamese).
`;

      const chatHistory = messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      // Pull latest message out as the prompt
      const latestMessage = chatHistory[chatHistory.length - 1];
      const previousHistory = chatHistory.slice(0, -1);

      const chatSession = model.startChat({
        history: previousHistory,
        systemInstruction: {
          role: "system",
          parts: [{ text: systemInstruction }],
        },
      });

      const responseResult = await chatSession.sendMessage(latestMessage.parts[0].text);
      const replyText = responseResult.response.text();

      if (replyText) {
        return replyText;
      }
    } catch (err) {
      logger.error({ err, userId }, "Failed calling Gemini API. Falling back to Heuristic Engine...");
    }
  }

  // 4. Fallback to high-quality Expert Heuristic Engine
  logger.info({ userId }, "Running Expert Heuristic Coach Engine...");
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
  const isVietnamese = lastUserMsg.includes("ăn") || lastUserMsg.includes("tập") || lastUserMsg.includes("lịch") || lastUserMsg.includes("chế độ") || lastUserMsg.includes("sức khỏe") || lastUserMsg.includes("chào");

  // Determine user intent
  const wantsFood = lastUserMsg.includes("food") || lastUserMsg.includes("eat") || lastUserMsg.includes("diet") || lastUserMsg.includes("meal") || lastUserMsg.includes("nutrition") || lastUserMsg.includes("calorie") || lastUserMsg.includes("protein") || lastUserMsg.includes("ăn") || lastUserMsg.includes("bữa") || lastUserMsg.includes("dinh dưỡng");
  const wantsExercise = lastUserMsg.includes("schedule") || lastUserMsg.includes("exercise") || lastUserMsg.includes("workout") || lastUserMsg.includes("routine") || lastUserMsg.includes("week") || lastUserMsg.includes("split") || lastUserMsg.includes("plan") || lastUserMsg.includes("tập") || lastUserMsg.includes("lịch") || lastUserMsg.includes("thể dục") || lastUserMsg.includes("chương trình");

  if (wantsFood) {
    return generateHeuristicFoodAdvice(name, goalType, dailyKcalTarget, isVietnamese);
  } else if (wantsExercise) {
    return generateHeuristicExerciseSchedule(name, goalType, weeklyWorkoutTarget, isVietnamese);
  } else {
    return generateHeuristicGeneralGreeting(name, userContextPrompt, isVietnamese);
  }
}

// --- HEURISTIC GENERATORS ---

function generateHeuristicFoodAdvice(name: string, goalType: string, dailyKcalTarget: number, isVietnamese: boolean): string {
  const proteinTarget = Math.round(dailyKcalTarget * 0.3 / 4);
  const carbTarget = Math.round(dailyKcalTarget * 0.45 / 4);
  const fatTarget = Math.round(dailyKcalTarget * 0.25 / 9);

  if (isVietnamese) {
    return `### 🥗 Thực Đơn Dinh Dưỡng Cho Bạn (${name})

Dựa trên mục tiêu **${goalType}** và chỉ tiêu tiêu thụ **${dailyKcalTarget} kcal/ngày**, dưới đây là gợi ý thực đơn lành mạnh dành riêng cho bạn:

**Chỉ tiêu dinh dưỡng hôm nay:**
- **Lượng calo:** ~${dailyKcalTarget} kcal
- **Protein (Đạm):** ~${proteinTarget}g (giúp phục hồi cơ bắp)
- **Carbs (Tinh bột):** ~${carbTarget}g (cung cấp năng lượng bền bỉ)
- **Fats (Chất béo tốt):** ~${fatTarget}g (hỗ trợ trao đổi chất)

---

### 🍳 Bữa Sáng (Khoảng 25% Calo)
- **Món ăn:** **Phở gà nạc** hoặc **Cháo yến mạch** nấu với 150g ức gà xé.
- **Tráng miệng:** 1 quả chuối tiêu chín.
- **Calo dự kiến:** ~${Math.round(dailyKcalTarget * 0.25)} kcal (Protein: ~30g, Carbs: ~50g, Fat: ~8g).
- **Mẹo tốt:** Uống thêm 300ml nước lọc ấm ngay sau khi thức dậy để thanh lọc cơ thể.

### 🍱 Bữa Trưa (Khoảng 40% Calo)
- **Món ăn:** 1 chén **cơm gạo lứt** (khoảng 150g), 200g **ức gà áp chảo** hoặc **cá hồi nướng**, 200g **bông cải xanh luộc**.
- **Chất béo tốt:** 1 muỗng dầu ô-liu rưới lên salad.
- **Calo dự kiến:** ~${Math.round(dailyKcalTarget * 0.40)} kcal (Protein: ~45g, Carbs: ~65g, Fat: ~12g).
- **Mẹo tốt:** Nhai thật kỹ để hỗ trợ quá trình tiêu hóa và hấp thụ dinh dưỡng tốt nhất.

### 🍓 Bữa Phụ Chiều (Khoảng 10% Calo)
- **Món ăn:** 1 hũ **sữa chua không đường** ăn kèm với một nắm nhỏ **hạt hạnh nhân** hoặc hạt điều (~30g).
- **Calo dự kiến:** ~${Math.round(dailyKcalTarget * 0.10)} kcal (Protein: ~8g, Carbs: ~12g, Fat: ~6g).

### 🍲 Bữa Tối (Khoảng 25% Calo)
- **Món ăn:** 150g **thịt bò nạc xào bông thiên lý** hoặc 150g **đậu hũ trắng sốt cà chua** thanh nhẹ, ăn kèm 1 củ **khoai lang luộc** nhỏ.
- **Calo dự kiến:** ~${Math.round(dailyKcalTarget * 0.25)} kcal (Protein: ~28g, Carbs: ~35g, Fat: ~9g).
- **Mẹo tốt:** Hãy cố gắng hoàn thành bữa tối trước 19:30 để dạ dày kịp nghỉ ngơi trước khi ngủ.`;
  }

  // English Version
  return `### 🥗 Personalized Nutrition & Meal Plan for ${name}

Based on your goal of **${goalType}** and your daily target of **${dailyKcalTarget} kcal**, here is a highly balanced, structured, and easy-to-follow meal guide:

**Your Daily Macro Targets:**
- **Calories:** ~${dailyKcalTarget} kcal
- **Protein:** ~${proteinTarget}g (Crucial for muscle repair and satiety)
- **Carbohydrates:** ~${carbTarget}g (Fuel for your brain and physical activity)
- **Fats:** ~${fatTarget}g (Essential for cellular and hormone health)

---

### 🍳 Breakfast (Approx. 25% of Daily Budget)
- **Option:** **Greek Yogurt Bowl** with 1 cup plain non-fat Greek yogurt, 1/2 cup blueberries, and 1 tbsp honey. Alternatively, 2 **Scrambled Eggs** with 2 slices of whole-wheat toast.
- **Beverage:** 1 large glass of water.
- **Estimated Nutrition:** ~${Math.round(dailyKcalTarget * 0.25)} kcal (Protein: ~28g, Carbs: ~35g, Fats: ~8g).
- **Coach Tip:** Start breakfast with adequate protein to kickstart metabolism and prevent mid-morning cravings.

### 🍱 Lunch (Approx. 40% of Daily Budget)
- **Option:** **Grilled Chicken & Quinoa Salad** with 200g chicken breast, 1 cup cooked quinoa, mixed spinach, tomatoes, and cucumber.
- **Healthy Fats:** 1 tbsp olive oil vinaigrette dressing.
- **Estimated Nutrition:** ~${Math.round(dailyKcalTarget * 0.40)} kcal (Protein: ~42g, Carbs: ~55g, Fats: ~11g).
- **Coach Tip:** Packing your own lunch prevents impulsive fast-food choices. Keep it colorful!

### 🍓 Mid-Day Snack (Approx. 10% of Daily Budget)
- **Option:** 1 medium **Apple** sliced, paired with 1.5 tbsp of **Almond Butter** or a handful of mixed raw nuts (30g).
- **Estimated Nutrition:** ~${Math.round(dailyKcalTarget * 0.10)} kcal (Protein: ~6g, Carbs: ~15g, Fats: ~8g).

### 🍲 Dinner (Approx. 25% of Daily Budget)
- **Option:** **Pan-Seared Salmon** (150g) or lean **Sirloin Steak**, served with 1 medium baked **Sweet Potato** and roasted green beans.
- **Estimated Nutrition:** ~${Math.round(dailyKcalTarget * 0.25)} kcal (Protein: ~32g, Carbs: ~30g, Fats: ~10g).
- **Coach Tip:** Eat a lighter dinner and avoid eating within 2 hours of sleep to improve sleep cycles and recovery.`;
}

function generateHeuristicExerciseSchedule(name: string, goalType: string, weeklyWorkoutTarget: number, isVietnamese: boolean): string {
  if (isVietnamese) {
    return `### 🏋️ Lịch Trình Tập Luyện Hàng Tuần Cho Bạn (${name})

Chào bạn! Lịch trình này được tối ưu hóa đặc biệt theo mục tiêu **${goalType}** với cường độ **${weeklyWorkoutTarget} buổi tập/tuần** nhằm đảm bảo hiệu quả tối đa và thời gian phục hồi cơ bắp hợp lý.

---

### 📅 Lịch Tập 7 Ngày Chi Tiết

### ### Ngày 1: Tập Sức Mạnh Thân Trên (Upper Body Focus)
- **Kiểu tập:** Kháng lực nâng tạ.
- **Các bài tập:**
  - **Bench Press (Đẩy ngực ngang):** 3 hiệp x 8-10 lần (nghỉ 90 giây).
  - **Bent-over Row (Kéo lưng với thanh đòn):** 3 hiệp x 8-10 lần (nghỉ 90 giây).
  - **Overhead Press (Đẩy vai đứng):** 3 hiệp x 10 lần (nghỉ 75 giây).
  - **Lat Pulldown (Kéo xô rộng tay):** 3 hiệp x 12 lần (nghỉ 75 giây).
- **Mẹo phục hồi:** Thực hiện xoay khớp vai kỹ lưỡng trước khi bắt đầu và căng cơ ngực/lưng 5 phút sau tập.

### ### Ngày 2: Nghỉ ngơi tích cực (Active Recovery)
- **Kiểu tập:** Đi bộ thư giãn nhẹ nhàng hoặc tập căng cơ linh hoạt (Yoga nhẹ).
- **Mục tiêu:** Thúc đẩy tuần hoàn máu giúp giảm nhức mỏi cơ từ Ngày 1.

### ### Ngày 3: Sức Mạnh Thân Dưới (Lower Body Focus)
- **Kiểu tập:** Kháng lực đùi & mông.
- **Các bài tập:**
  - **Barbell Squat (Gánh đùi sau):** 4 hiệp x 8 lần (nghỉ 2 phút).
  - **Romanian Deadlift (Căng đùi sau):** 3 hiệp x 10 lần (nghỉ 90 giây).
  - **Dumbbell Lunges (Bước chùng chân):** 3 hiệp x 12 lần mỗi bên (nghỉ 60 giây).
  - **Calf Raises (Nhón gót kiểng chân):** 3 hiệp x 15 lần (nghỉ 45 giây).
- **Mẹo phục hồi:** Uống tối thiểu 2 lít nước trong hôm nay để hỗ trợ quá trình sửa chữa mô cơ đùi.

### ### Ngày 4: Nghỉ hoàn toàn (Rest Day)
- **Mục tiêu:** Hãy để hệ thần kinh trung ương và cơ bắp thư giãn hoàn toàn.

### ### Ngày 5: Sức Bền & Thể Lực (Full-Body Conditioning)
- **Kiểu tập:** HIIT hoặc Full Body Circuit nhẹ nhàng.
- **Các bài tập:**
  - **Goblet Squat:** 3 hiệp x 12 lần.
  - **Push-ups (Chống đẩy):** 3 hiệp x tối đa có thể.
  - **Kettlebell Swing (hoặc Dumbbell Swing):** 3 hiệp x 15 lần.
  - **Plank (Giữ bụng):** 3 hiệp x 45-60 giây.
- **Mẹo tốt:** Hoàn thành liên tục các bài tập trong 1 hiệp rồi mới nghỉ 2 phút để đẩy cao nhịp tim.

### ### Ngày 6: Nghỉ ngơi & Giãn cơ toàn thân
- **Mục tiêu:** Tập giãn cơ sâu các nhóm cơ lớn giúp tăng độ dẻo dai.

### ### Ngày 7: Nghỉ hoàn toàn
- **Mục tiêu:** Thư giãn và nạp năng lượng đầy đủ sẵn sàng bước vào chu kỳ tập tiếp theo vào đầu tuần sau!`;
  }

  // English Version
  return `### 🏋️ Your 7-Day Personalized Weekly Workout Split for ${name}

Hello! This custom-tailored plan is engineered for your **${goalType}** goal, aiming for **${weeklyWorkoutTarget} high-quality training sessions** per week to optimize progress and physical recovery.

---

### 📅 The 7-Day Schedule

### ### Day 1: Upper Body Strength & Power
- **Workout Type:** Resistance training (focusing on Chest, Back, and Shoulders).
- **Exercise Routine:**
  - **Dumbbell Bench Press:** 3 sets x 8-10 reps (90 sec rest).
  - **Lat Pulldown (or Pull-ups):** 3 sets x 8-10 reps (90 sec rest).
  - **Seated Dumbbell Shoulder Press:** 3 sets x 10 reps (75 sec rest).
  - **Seated Cable Row:** 3 sets x 12 reps (75 sec rest).
- **Coach Tip:** Warm up your rotator cuffs thoroughly for 5 minutes before starting heavier pushes.

### ### Day 2: Active Recovery & Mobility
- **Workout Type:** Gentle walking (30-40 mins) or mobility and light yoga stretches.
- **Goal:** Flush lactic acid and increase blood flow without putting heavy load on joints.

### ### Day 3: Lower Body Hypertrophy
- **Workout Type:** Resistance training (focusing on Quads, Glutes, and Hamstrings).
- **Exercise Routine:**
  - **Barbell Back Squat:** 4 sets x 8 reps (120 sec rest).
  - **Romanian Deadlift:** 3 sets x 10 reps (90 sec rest).
  - **Leg Press (or Dumbbell Goblet Squat):** 3 sets x 12 reps (75 sec rest).
  - **Standing Calf Raise:** 3 sets x 15 reps (60 sec rest).
- **Coach Tip:** Keep your core tightly braced during squats to support lower back safety.

### ### Day 4: Full Rest & Rejuvenation
- **Goal:** Allow the central nervous system to reset. Ensure proper protein intake today to heal muscle tissues!

### ### Day 5: Full Body Functional Conditioning
- **Workout Type:** Caloric burn and core conditioning circuit.
- **Exercise Routine:**
  - **Dumbbell Thrusters:** 3 sets x 12 reps.
  - **Push-ups:** 3 sets x max reps.
  - **Dumbbell Goblet Squat:** 3 sets x 15 reps.
  - **Plank Hold:** 3 sets x 60 seconds.
- **Coach Tip:** Perform these as a circuit (one after another), then rest 2 minutes. Repeat for 3 rounds.

### ### Day 6: Light Cardio & Deep Stretch
- **Workout Type:** Light jogging or steady-state cycling (20-30 mins) followed by full-body static stretches.

### ### Day 7: Full Rest & Nutrition Prep
- **Goal:** Relax, take a relaxing bath, and prepare your meals and mindset for the upcoming week!`;
}

function generateHeuristicGeneralGreeting(name: string, userContextPrompt: string, isVietnamese: boolean): string {
  if (isVietnamese) {
    return `### 👋 Xin Chào ${name}! Tôi Là Huấn Luyện Viên AI Của Bạn

Tôi có thể giúp gì cho hành trình tập luyện của bạn hôm nay? Tôi đã nhận được các chỉ số cơ bản của bạn:

**Hồ Sơ Của Bạn:**
- **Mục tiêu:** ${goalTypeFriendly(userContextPrompt, true)}
- **Lượng calo cần nạp:** ~${extractCalorieString(userContextPrompt)} kcal/ngày
- **Số buổi tập tối thiểu:** ${extractWorkoutTarget(userContextPrompt)} buổi/tuần

Dưới đây là 2 nhóm câu hỏi bạn có thể đặt cho tôi để đạt hiệu quả cao nhất:
1. **Lịch tập luyện:** Bạn hãy hỏi *"Lên cho tôi lịch tập thể dục một tuần"* hoặc *"Lịch tập cho người muốn giảm cân"*.
2. **Chế độ ăn uống:** Bạn hãy hỏi *"Hôm nay ăn gì lành mạnh?"* hoặc *"Gợi ý thực đơn ăn uống để xây dựng cơ bắp"*.

Hãy gõ câu hỏi xuống dưới và gửi cho tôi nhé!`;
  }

  // English
  return `### 👋 Hello ${name}! I'm Your AI Coach

Welcome to your personalized coaching space! I've loaded your tracking metrics and fitness configuration:

**Your Fitness Profile Summary:**
- **Primary Goal:** ${goalTypeFriendly(userContextPrompt, false)}
- **Recommended Intake:** ~${extractCalorieString(userContextPrompt)} kcal/day
- **Workout Target:** ${extractWorkoutTarget(userContextPrompt)} days/week

Here are the best ways I can help you today. Try asking me:
1. **Weekly Workout Scheduling**: Type *"Create an exercise plan for a week"* or *"Design a fat-loss workout routine"*.
2. **Food Selections & Recipes**: Type *"Help me choose healthy food"* or *"Suggest a diet plan under my calorie target"*.

What shall we work on today? Write your message below to get started!`;
}

function goalTypeFriendly(prompt: string, isVietnamese: boolean): string {
  if (prompt.includes("lose_weight")) {
    return isVietnamese ? "Giảm cân & Đốt mỡ" : "Weight Loss & Fat Burning";
  }
  if (prompt.includes("build_muscle")) {
    return isVietnamese ? "Tăng cơ & Sức mạnh" : "Muscle Building & Strength";
  }
  return isVietnamese ? "Giữ dáng & Khỏe mạnh" : "General Fitness & Health";
}

function extractCalorieString(prompt: string): string {
  const match = prompt.match(/Daily Caloric Target: (\d+)/);
  return match ? match[1] : "2000";
}

function extractWorkoutTarget(prompt: string): string {
  const match = prompt.match(/Weekly Exercise Target: (\d+)/);
  return match ? match[1] : "3";
}
