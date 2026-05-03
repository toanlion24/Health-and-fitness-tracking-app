import type { StackScreenProps } from "@react-navigation/stack";
import type { MealSlot } from "../data/nutrition-demo";

export type NutritionStackParamList = {
  NutritionDashboard: undefined;
  AddFood: { presetMeal?: MealSlot } | undefined;
  FoodDetail: { foodId: string; targetMeal?: MealSlot };
  MealDetail: { meal: MealSlot };
  BarcodeScan: undefined;
};

export type NutritionStackScreenProps<T extends keyof NutritionStackParamList> = StackScreenProps<NutritionStackParamList, T>;
