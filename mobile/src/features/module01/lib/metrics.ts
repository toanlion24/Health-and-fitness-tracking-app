import type { ActivityLevel, Gender, Goal } from "../store/module01-store";

export function computeBmi(heightCm: number, weightKg: number): number {
  const h = heightCm / 100;
  if (h <= 0) return 0;
  return weightKg / (h * h);
}

export function bmiCategory(bmi: number): { label: string; tone: "healthy" | "warn" } {
  if (bmi < 18.5) return { label: "Underweight range", tone: "warn" };
  if (bmi < 25) return { label: "Healthy range", tone: "healthy" };
  if (bmi < 30) return { label: "Overweight range", tone: "warn" };
  return { label: "Obese range", tone: "warn" };
}

function bmrMifflin(gender: Gender, age: number, heightCm: number, weightKg: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "female") return base - 161;
  if (gender === "male") return base + 5;
  return base - 78;
}

function activityFactor(level: ActivityLevel): number {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "very":
      return 1.725;
  }
}

export function computeEnergyTargets(
  gender: Gender,
  age: number,
  heightCm: number,
  weightKg: number,
  activity: ActivityLevel,
): { bmr: number; tdee: number } {
  const bmr = Math.round(bmrMifflin(gender, age, heightCm, weightKg));
  const tdee = Math.round(bmr * activityFactor(activity));
  return { bmr, tdee };
}

/** Daily calorie target aligned with goal (demo heuristic; tune with coaching logic later). */
export function goalDailyCalories(goal: Goal, tdee: number): number {
  switch (goal) {
    case "lose":
      return Math.max(1200, Math.round(tdee - 350));
    case "gain":
      return Math.round(tdee + 250);
    case "maintain":
      return Math.round(tdee);
  }
}

export function recommendationCopy(goal: Goal, tdee: number): string {
  const rounded = Math.round(tdee / 50) * 50;
  switch (goal) {
    case "lose":
      return `Eat around ${rounded.toLocaleString()} kcal/day to lean out steadily while keeping protein high. We'll adjust weekly based on your weight trend.`;
    case "gain":
      return `Aim for roughly ${(rounded + 250).toLocaleString()} kcal/day with structured strength training and ample protein. We'll tune this as you progress.`;
    case "maintain":
      return `Stay near ${rounded.toLocaleString()} kcal/day while matching your activity. Small tweaks week to week keep you stable without guesswork.`;
  }
}
