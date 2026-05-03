import type { ReactElement } from "react";
import { createStackNavigator, type StackNavigationOptions } from "@react-navigation/stack";
import { NutritionAddFoodScreen } from "../screens/nutrition-add-food-screen";
import { NutritionBarcodeScreen } from "../screens/nutrition-barcode-screen";
import { NutritionDashboardScreen } from "../screens/nutrition-dashboard-screen";
import { NutritionFoodDetailScreen } from "../screens/nutrition-food-detail-screen";
import { NutritionMealDetailScreen } from "../screens/nutrition-meal-detail-screen";
import type { NutritionStackParamList } from "./nutrition-stack-types";

const Stack = createStackNavigator<NutritionStackParamList>();

const options: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: "horizontal",
  cardOverlayEnabled: true,
  cardStyle: { backgroundColor: "transparent" },
};

export function NutritionStackNavigator(): ReactElement {
  return (
    <Stack.Navigator initialRouteName="NutritionDashboard" screenOptions={options}>
      <Stack.Screen name="NutritionDashboard" component={NutritionDashboardScreen} />
      <Stack.Screen name="AddFood" component={NutritionAddFoodScreen} />
      <Stack.Screen name="FoodDetail" component={NutritionFoodDetailScreen} />
      <Stack.Screen name="MealDetail" component={NutritionMealDetailScreen} />
      <Stack.Screen name="BarcodeScan" component={NutritionBarcodeScreen} />
    </Stack.Navigator>
  );
}
