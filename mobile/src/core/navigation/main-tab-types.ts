import type { NavigatorScreenParams } from "@react-navigation/native";
import type { ProfileStackParamList } from "../../features/settings/navigation/profile-stack-types";
import type { ProgressStackParamList } from "../../features/metrics/navigation/progress-stack-types";
import type { NutritionStackParamList } from "../../features/nutrition/navigation/nutrition-stack-types";
import type { WorkoutStackParamList } from "../../features/workouts/navigation/workout-stack-types";
import type { HomeStackParamList } from "../../features/home/navigation/home-stack-types";

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Workout: NavigatorScreenParams<WorkoutStackParamList>;
  Nutrition: NavigatorScreenParams<NutritionStackParamList>;
  Progress: NavigatorScreenParams<ProgressStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};
