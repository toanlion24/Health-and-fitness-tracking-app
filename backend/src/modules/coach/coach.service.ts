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

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && apiKey !== "your_gemini_api_key_here" && apiKey.trim() !== "";

  if (isKeyConfigured) {
    try {
      logger.info({ userId }, "Initializing Gemini API via native fetch...");
      const systemInstruction = `
You are "AI Health & Fitness Coach", a friendly, highly professional, encouraging, and certified personal trainer and dietitian.
You are helping the following user:
${userContextPrompt}

CRITICAL INSTRUCTIONS:
1. Choose Food & Nutrition Advice based on goals and calories.
2. Provide a 7-day program based on weekly workout target.
3. Use Markdown format. Use bold text for key highlights. Use section headers like "### ". Use lists with dashes "- ". Do NOT use nested lists.
4. Respond in the language that matches the user's latest query (English or Vietnamese).
`;

      const rawContents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // Sanitize history for Gemini: MUST start with 'user' and MUST strictly alternate roles
      const sanitizedContents: any[] = [];
      let expectedRole = "user";

      for (const msg of rawContents) {
        if (msg.role === expectedRole) {
          sanitizedContents.push(msg);
          expectedRole = expectedRole === "user" ? "model" : "user";
        } else {
          // If we encounter a consecutive message of the same role, append its text to the previous message
          if (sanitizedContents.length > 0) {
            const lastIdx = sanitizedContents.length - 1;
            sanitizedContents[lastIdx].parts[0].text += "\n\n" + msg.parts[0].text;
          }
        }
      }

      if (sanitizedContents.length > 0 && sanitizedContents[0].role === "model") {
        sanitizedContents.shift();
      }

      if (sanitizedContents.length === 0) {
        sanitizedContents.push({ role: "user", parts: [{ text: "Hello" }] });
      }

      const payload = {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: sanitizedContents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 3000,
        }
      };

      let replyText = "";
      let retries = 3;
      while (retries > 0) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const errText = await res.text();
            if (res.status === 503 || res.status === 429) {
              throw new Error(`overloaded: ${res.status} ${errText}`);
            }
            throw new Error(`failed: ${res.status} ${errText}`);
          }

          const data = await res.json() as any;
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            replyText = data.candidates[0].content.parts[0].text;
            break;
          } else {
            throw new Error("Invalid Gemini response format");
          }
        } catch (apiErr: any) {
          if (apiErr.message.includes("overloaded") && retries > 1) {
            logger.warn({ userId }, "Gemini overloaded, retrying in 2s...");
            retries--;
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          throw apiErr;
        }
      }

      if (replyText) {
        return replyText;
      }
    } catch (err) {
      logger.error({ err, userId }, "Failed calling Gemini API. Falling back to Heuristic Engine...");
    }
  }

  logger.info({ userId }, "Running Expert Heuristic Coach Engine...");
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
  const isVietnamese = lastUserMsg.includes("ăn") || lastUserMsg.includes("tập") || lastUserMsg.includes("lịch") || lastUserMsg.includes("chế độ") || lastUserMsg.includes("sức khỏe") || lastUserMsg.includes("chào");

  const wantsFood = lastUserMsg.includes("food") || lastUserMsg.includes("eat") || lastUserMsg.includes("diet") || lastUserMsg.includes("meal") || lastUserMsg.includes("nutrition") || lastUserMsg.includes("calorie") || lastUserMsg.includes("protein") || lastUserMsg.includes("ăn") || lastUserMsg.includes("bữa") || lastUserMsg.includes("dinh dưỡng");
  const wantsExercise = lastUserMsg.includes("schedule") || lastUserMsg.includes("exercise") || lastUserMsg.includes("workout") || lastUserMsg.includes("routine") || lastUserMsg.includes("week") || lastUserMsg.includes("split") || lastUserMsg.includes("plan") || lastUserMsg.includes("tập") || lastUserMsg.includes("lịch") || lastUserMsg.includes("thể dục") || lastUserMsg.includes("chương trình");

  if (wantsFood) {
    return generateHeuristicFoodAdvice(name, goalType, dailyKcalTarget, isVietnamese, weight, age);
  } else if (wantsExercise) {
    return generateHeuristicExerciseSchedule(name, goalType, weeklyWorkoutTarget, isVietnamese, weight, age, activityLevel);
  } else {
    return generateHeuristicGeneralGreeting(name, userContextPrompt, isVietnamese);
  }
}

function generateHeuristicFoodAdvice(name: string, goalType: string, dailyKcalTarget: number, isVietnamese: boolean, weight: string, age: string): string {
  const proteinTarget = Math.round(dailyKcalTarget * 0.3 / 4);
  const carbTarget = Math.round(dailyKcalTarget * 0.45 / 4);
  const fatTarget = Math.round(dailyKcalTarget * 0.25 / 9);

  let breakfast = "";
  let lunch = "";
  let dinner = "";
  let snack = "";

  if (dailyKcalTarget < 1800) {
    breakfast = "**Greek Yogurt Bowl** (1 cup non-fat Greek yogurt, 1/2 cup berries) OR **Egg Whites** (3 egg whites, 1 slice whole-wheat toast).";
    lunch = "**Grilled Chicken Salad** (150g chicken breast, mixed greens, light vinaigrette).";
    snack = "1 medium **Apple** or a small handful of **Almonds** (20g).";
    dinner = "**Baked Cod or Tofu** (150g) with steamed asparagus and a small portion of quinoa (1/2 cup).";
  } else if (dailyKcalTarget > 2500) {
    breakfast = "**Oatmeal with Protein Powder** (1 cup oats, 1 scoop whey, peanut butter, banana) OR **Whole Eggs & Bacon** (3 eggs, 2 slices turkey bacon, 2 toasts).";
    lunch = "**Beef & Rice Bowl** (200g lean beef, 1.5 cups jasmine rice, broccoli, avocado).";
    snack = "**Protein Shake** with milk and a **Peanut Butter Sandwich**.";
    dinner = "**Salmon & Sweet Potato** (200g salmon, 1 large sweet potato, roasted veggies).";
  } else {
    breakfast = "**Greek Yogurt Bowl** with 1 cup plain non-fat Greek yogurt, 1/2 cup blueberries, and 1 tbsp honey. ";
    lunch = "**Grilled Chicken & Quinoa Salad** with 200g chicken breast, 1 cup cooked quinoa, mixed spinach, tomatoes, and cucumber.";
    snack = "1 medium **Apple** paired with 1.5 tbsp of **Almond Butter**.";
    dinner = "**Pan-Seared Salmon** (150g) served with 1 medium baked **Sweet Potato** and roasted green beans.";
  }

  if (isVietnamese) {
    let vnBreakfast = "";
    let vnLunch = "";
    let vnDinner = "";
    let vnSnack = "";

    if (dailyKcalTarget < 1800) {
      vnBreakfast = "**Cháo yến mạch** nấu thịt bằm hoặc **Phở gà nạc** (ít bánh).";
      vnLunch = "**Salad ức gà** (150g ức gà, xà lách, sốt mè rang ít béo).";
      vnSnack = "1 quả **táo** hoặc 1 hũ **sữa chua không đường**.";
      vnDinner = "**Cá hấp** (150g) ăn kèm nửa chén cơm gạo lứt và rau luộc.";
    } else if (dailyKcalTarget > 2500) {
      vnBreakfast = "**Phở bò** đủ tô (nhiều thịt) hoặc 4 quả trứng ốp la với bánh mì.";
      vnLunch = "**Cơm sườn nướng** (200g sườn nạc, 1.5 chén cơm, rau xào).";
      vnSnack = "**Sinh tố bơ** hoặc **bánh mì bơ đậu phộng**.";
      vnDinner = "**Bò xào hành tây** (200g thịt bò) với 1 chén cơm và canh rau.";
    } else {
      vnBreakfast = "**Phở gà nạc** hoặc **Cháo yến mạch** nấu với 150g ức gà xé.";
      vnLunch = "1 chén **cơm gạo lứt** (khoảng 150g), 200g **ức gà áp chảo** hoặc **cá hồi nướng**, 200g **bông cải xanh luộc**.";
      vnSnack = "1 hũ **sữa chua không đường** ăn kèm với một nắm nhỏ **hạt hạnh nhân**.";
      vnDinner = "150g **thịt bò nạc xào bông thiên lý** hoặc 150g **đậu hũ trắng sốt cà chua** thanh nhẹ.";
    }

    return `### 🥗 Thực Đơn Dinh Dưỡng Cho Bạn (${name} - ${age})

Dựa trên mục tiêu **${goalType}**, mức cân nặng hiện tại **${weight}** và chỉ tiêu tiêu thụ **${dailyKcalTarget} kcal/ngày**, dưới đây là gợi ý thực đơn lành mạnh dành riêng cho bạn:

**Chỉ tiêu dinh dưỡng hôm nay:**
- **Lượng calo:** ~${dailyKcalTarget} kcal
- **Protein (Đạm):** ~${proteinTarget}g (giúp phục hồi cơ bắp)
- **Carbs (Tinh bột):** ~${carbTarget}g (cung cấp năng lượng bền bỉ)
- **Fats (Chất béo tốt):** ~${fatTarget}g (hỗ trợ trao đổi chất)

---

### 🍳 Bữa Sáng (Khoảng 25% Calo)
- **Món ăn:** ${vnBreakfast}
- **Calo dự kiến:** ~${Math.round(dailyKcalTarget * 0.25)} kcal.

### 🍱 Bữa Trưa (Khoảng 40% Calo)
- **Món ăn:** ${vnLunch}
- **Calo dự kiến:** ~${Math.round(dailyKcalTarget * 0.40)} kcal.

### 🍓 Bữa Phụ Chiều (Khoảng 10% Calo)
- **Món ăn:** ${vnSnack}
- **Calo dự kiến:** ~${Math.round(dailyKcalTarget * 0.10)} kcal.

### 🍲 Bữa Tối (Khoảng 25% Calo)
- **Món ăn:** ${vnDinner}
- **Calo dự kiến:** ~${Math.round(dailyKcalTarget * 0.25)} kcal.`;
  }

  return `### 🥗 Personalized Nutrition & Meal Plan for ${name} (${age})

Based on your goal of **${goalType}**, current weight of **${weight}**, and daily target of **${dailyKcalTarget} kcal**, here is a custom-tailored meal guide using your exact data:

**Your Daily Macro Targets:**
- **Calories:** ~${dailyKcalTarget} kcal
- **Protein:** ~${proteinTarget}g (Crucial for muscle repair)
- **Carbohydrates:** ~${carbTarget}g (Fuel for your physical activity)
- **Fats:** ~${fatTarget}g (Essential for cellular health)

---

### 🍳 Breakfast (Approx. 25% of Daily Budget)
- **Option:** ${breakfast}
- **Estimated Nutrition:** ~${Math.round(dailyKcalTarget * 0.25)} kcal.

### 🍱 Lunch (Approx. 40% of Daily Budget)
- **Option:** ${lunch}
- **Estimated Nutrition:** ~${Math.round(dailyKcalTarget * 0.40)} kcal.

### 🍓 Mid-Day Snack (Approx. 10% of Daily Budget)
- **Option:** ${snack}
- **Estimated Nutrition:** ~${Math.round(dailyKcalTarget * 0.10)} kcal.

### 🍲 Dinner (Approx. 25% of Daily Budget)
- **Option:** ${dinner}
- **Estimated Nutrition:** ~${Math.round(dailyKcalTarget * 0.25)} kcal.`;
}

function generateHeuristicExerciseSchedule(name: string, goalType: string, weeklyWorkoutTarget: number, isVietnamese: boolean, weight: string, age: string, activityLevel: string): string {
  let isSedentary = activityLevel.toLowerCase().includes("sedentary") || activityLevel.toLowerCase().includes("low");

  if (isVietnamese) {
    let vnRoutines = {
      day1: isSedentary ? "Đi bộ nhanh (30 phút) và giãn cơ cơ bản." : "**Dumbbell Bench Press:** 3 hiệp x 8-10 lần (nghỉ 90 giây).\n- **Lat Pulldown:** 3 hiệp x 12 lần (nghỉ 75 giây).",
      day3: isSedentary ? "Tập Bodyweight Squats (3 hiệp x 12 lần) và Lunge tại chỗ." : "**Barbell Squat:** 4 hiệp x 8 lần (nghỉ 2 phút).\n- **Romanian Deadlift:** 3 hiệp x 10 lần (nghỉ 90 giây).",
      day5: isSedentary ? "Đạp xe tĩnh (20 phút) hoặc bơi lội nhẹ." : "**Goblet Squat:** 3 hiệp x 12 lần.\n- **Push-ups (Chống đẩy):** 3 hiệp x tối đa.\n- **Plank:** 3 hiệp x 45-60 giây."
    };

    return `### 🏋️ Lịch Trình Tập Luyện Hàng Tuần Cho Bạn (${name} - ${age})

Chào bạn! Lịch trình này được thiết kế riêng dựa trên mức độ vận động **${activityLevel}** và cân nặng **${weight}** của bạn. Mục tiêu **${goalType}** với cường độ **${weeklyWorkoutTarget} buổi tập/tuần**.

---

### 📅 Lịch Tập 7 Ngày Chi Tiết

### Ngày 1: Tập Sức Mạnh Thân Trên
- ${vnRoutines.day1}

### Ngày 2: Nghỉ ngơi tích cực
- Đi bộ thư giãn nhẹ nhàng hoặc tập căng cơ linh hoạt.

### Ngày 3: Sức Mạnh Thân Dưới
- ${vnRoutines.day3}

### Ngày 4: Nghỉ hoàn toàn
- Hãy để hệ thần kinh trung ương và cơ bắp thư giãn.

### Ngày 5: Sức Bền & Thể Lực
- ${vnRoutines.day5}

### Ngày 6: Giãn cơ toàn thân
- Tập giãn cơ sâu các nhóm cơ lớn giúp tăng độ dẻo dai.

### Ngày 7: Nghỉ hoàn toàn
- Thư giãn và nạp năng lượng đầy đủ sẵn sàng bước vào chu kỳ tập tiếp theo!`;
  }

  let enRoutines = {
    day1: isSedentary ? "Brisk walking (30 mins) and basic dynamic stretching." : "**Dumbbell Bench Press:** 3 sets x 8-10 reps (90 sec rest).\n  - **Lat Pulldown (or Pull-ups):** 3 sets x 8-10 reps.\n  - **Seated Dumbbell Shoulder Press:** 3 sets x 10 reps.",
    day3: isSedentary ? "Bodyweight Squats (3 sets x 12 reps) and stationary lunges." : "**Barbell Back Squat:** 4 sets x 8 reps (120 sec rest).\n  - **Romanian Deadlift:** 3 sets x 10 reps.\n  - **Leg Press:** 3 sets x 12 reps.",
    day5: isSedentary ? "Stationary cycling (20 mins) or light swimming." : "**Dumbbell Thrusters:** 3 sets x 12 reps.\n  - **Push-ups:** 3 sets x max reps.\n  - **Plank Hold:** 3 sets x 60 seconds."
  };

  return `### 🏋️ Your 7-Day Personalized Weekly Workout Split

Hello ${name}! As a ${age} individual with an activity level of **${activityLevel}**, this custom plan is engineered specifically for your **${goalType}** goal. We are aiming for **${weeklyWorkoutTarget} high-quality training sessions** per week tailored to your current weight of **${weight}**.

---

### Day 1: Upper Body Strength & Power
- **Workout Type:** Resistance training
- **Routine:**
  - ${enRoutines.day1}

### Day 2: Active Recovery & Mobility
- **Workout Type:** Gentle walking (30-40 mins) or mobility stretches.
- **Goal:** Flush lactic acid and increase blood flow.

### Day 3: Lower Body Hypertrophy
- **Workout Type:** Resistance training
- **Routine:**
  - ${enRoutines.day3}

### Day 4: Full Rest & Rejuvenation
- **Goal:** Allow the central nervous system to reset. 

### Day 5: Full Body Functional Conditioning
- **Workout Type:** Caloric burn and core circuit.
- **Routine:**
  - ${enRoutines.day5}

### Day 6: Light Cardio & Deep Stretch
- **Workout Type:** Light jogging or steady-state cycling (20-30 mins).

### Day 7: Full Rest & Nutrition Prep
- **Goal:** Relax and prepare your mindset for the upcoming week!`;
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
