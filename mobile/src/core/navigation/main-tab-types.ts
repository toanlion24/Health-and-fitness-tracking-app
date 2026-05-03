import type { NavigatorScreenParams } from "@react-navigation/native";
import type { ProfileStackParamList } from "../../features/module02/navigation/profile-stack-types";
import type { ProgressStackParamList } from "../../features/module03/navigation/progress-stack-types";
import type { NutritionStackParamList } from "../../features/module05/navigation/nutrition-stack-types";
import type { WorkoutStackParamList } from "../../features/module04/navigation/workout-stack-types";
import type { HomeStackParamList } from "../../features/module06/navigation/home-stack-types";

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Workout: NavigatorScreenParams<WorkoutStackParamList>;
  Nutrition: NavigatorScreenParams<NutritionStackParamList>;
  Progress: NavigatorScreenParams<ProgressStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};
