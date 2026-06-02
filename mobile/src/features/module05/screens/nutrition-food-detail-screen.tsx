import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import { getFoodById } from "../data/nutrition-demo";
import type { MealSlot } from "../data/nutrition-demo";
import type { NutritionStackScreenProps } from "../navigation/nutrition-stack-types";
import { useNutritionApiStore } from "../store/nutrition-api-store";

export function NutritionFoodDetailScreen({ navigation, route }: NutritionStackScreenProps<"FoodDetail">): ReactElement {
  const foods = useNutritionApiStore((s) => s.foods);
  const foodItem = foods.find((f) => String(f.id) === String(route.params.foodId));
  
  const { FOOD_CATALOG } = require("../data/nutrition-demo");
  const staticFood = FOOD_CATALOG.find(
    (f: any) =>
      String(f.id) === String(route.params.foodId) ||
      (foodItem && f.name.toLowerCase() === foodItem.name.toLowerCase())
  );

  const food = foodItem
    ? {
        id: String(foodItem.id),
        name: foodItem.name,
        kcal: foodItem.kcalPerServing,
        serving: foodItem.servingUnit || "1 serving",
        protein: `${foodItem.proteinG}g`,
        carbs: `${foodItem.carbG}g`,
        fat: `${foodItem.fatG}g`,
        blurb: staticFood?.blurb || "No description available.",
      }
    : staticFood
    ? {
        id: staticFood.id,
        name: staticFood.name,
        kcal: staticFood.kcal,
        serving: staticFood.serving,
        protein: staticFood.protein,
        carbs: staticFood.carbs,
        fat: staticFood.fat,
        blurb: staticFood.blurb,
      }
    : null;

  const targetMeal: MealSlot = route.params.targetMeal ?? "lunch";
  const [qty, setQty] = useState(1);
  
  const addFoodToMeal = useNutritionApiStore((s) => s.addFoodToMeal);
  const createMealLog = useNutritionApiStore((s) => s.createMealLog);
  const mealLogs = useNutritionApiStore((s) => s.mealLogs);

  if (food == null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top", "left", "right", "bottom"]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
          <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate900 }}>Food not found.</Text>
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 15, color: colors.cyan600 }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalKcal = Math.round(food.kcal * qty);

  const confirm = async (): Promise<void> => {
    // Check if we have an existing log for today for this meal type
    const existingLogs = mealLogs.filter((l) => l.mealType === targetMeal);
    let mealLogId = existingLogs.length > 0 ? existingLogs[0]!.id : null;
    
    if (mealLogId == null) {
      mealLogId = await createMealLog(targetMeal as any);
    }
    
    if (mealLogId != null) {
      if (foodItem) {
        await addFoodToMeal(mealLogId, foodItem, qty);
      } else {
        const proteinNum = parseFloat(food.protein) || 0;
        const carbNum = parseFloat(food.carbs) || 0;
        const fatNum = parseFloat(food.fat) || 0;
        await useNutritionApiStore.getState().addCustomFoodToMeal(
          mealLogId,
          food.name,
          totalKcal,
          proteinNum,
          carbNum,
          fatNum
        );
      }
    }
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8 }}>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={iconBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate900} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, alignItems: "center", marginTop: 8 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 36,
              backgroundColor: "#ECFDF5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="food-apple" size={56} color={colors.emerald600} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 20 }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.8, color: colors.slate900 }}>{food.name}</Text>
          <Text style={{ fontFamily: font.medium, fontSize: 15, color: colors.slate600, lineHeight: 22 }}>{food.blurb}</Text>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <MacroChip label="Protein" value={food.protein} />
            <MacroChip label="Carbs" value={food.carbs} />
            <MacroChip label="Fat" value={food.fat} />
          </View>

          <View
            style={{
              marginTop: 16,
              borderRadius: radii.card,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.slate200,
              backgroundColor: colors.slate100,
              padding: 16,
              gap: 12,
              ...iosCardShadow,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Serving size</Text>
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.slate900 }}>{food.serving}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Calories</Text>
              <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate900 }}>{totalKcal} kcal</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <Pressable
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
                style={stepBtn}
              >
                <MaterialCommunityIcons name="minus" size={22} color={colors.slate900} />
              </Pressable>
              <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.slate900, minWidth: 40, textAlign: "center" }}>
                {qty}
              </Text>
              <Pressable
                onPress={() => setQty((q) => q + 1)}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
                style={stepBtn}
              >
                <MaterialCommunityIcons name="plus" size={22} color={colors.slate900} />
              </Pressable>
            </View>
            <Text style={{ fontFamily: font.medium, fontSize: 12, color: colors.slate500, textAlign: "center" }}>
              Logging to {mealLabel(targetMeal)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingBottom: 24,
          paddingTop: 12,
          backgroundColor: colors.white,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.slate200,
        }}
      >
        <GradientPrimaryButton label={`Add to ${mealLabel(targetMeal)}`} onPress={confirm} />
      </View>
    </SafeAreaView>
  );
}

function mealLabel(m: MealSlot): string {
  switch (m) {
    case "breakfast":
      return "breakfast";
    case "lunch":
      return "lunch";
    case "dinner":
      return "dinner";
    default:
      return "meal";
  }
}

const iconBtn = {
  width: touch.min,
  height: touch.min,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const stepBtn = {
  width: touch.min,
  height: touch.min,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

function MacroChip({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.slate100 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 11, color: colors.slate500 }}>{label}</Text>
      <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate900 }}>{value}</Text>
    </View>
  );
}
