export interface WaterLogDto {
  id: number;
  amountMl: number;
  loggedAt: string;
}

export interface DailyWaterSummaryDto {
  date: string;
  totalMl: number;
  goalMl: number;
  glassesCount: number;
  percentage: number;
}

export interface SleepLogDto {
  id: number;
  sleepTime: string;
  wakeTime: string;
  durationMinutes: number | null;
  quality: number | null;
  notes: string | null;
}

export interface DailySleepSummaryDto {
  date: string;
  totalSleepMin: number;
  avgQuality: number | null;
  sleepGoalMin: number;
  percentage: number;
}
