import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { MealSlot } from "../data/nutrition-demo";
import type { NutritionStackScreenProps } from "../navigation/nutrition-stack-types";
import { mealLines, mealTotal, useNutritionLogStore } from "../store/nutrition-log-store";

const TITLE: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export function NutritionMealDetailScreen({ navigation, route }: NutritionStackScreenProps<"MealDetail">): ReactElement {
  const meal = route.params.meal;
  const lines = useNutritionLogStore((s) => mealLines(s, meal));
  const total = useNutritionLogStore((s) => mealTotal(s, meal));
  const removeFromMeal = useNutritionLogStore((s) => s.removeFromMeal);

  return (
    <Module01Layout variant="metricsDash" contentInset={[12, 20, 28, 20]} scrollable={false}>
      <View style={{ flex: 1, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate900} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>{TITLE[meal]}</Text>
            <Text style={{ fontFamily: font.medium, fontSize: 14, color: colors.slate500 }}>{total.toLocaleString()} kcal total</Text>
          </View>
        </View>

        {lines.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingVertical: 40 }}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={44} color={colors.slate400} />
            <Text style={{ fontFamily: font.bold, fontSize: 17, color: colors.slate700 }}>Nothing logged yet</Text>
            <Pressable
              onPress={() => navigation.navigate("AddFood", { presetMeal: meal })}
              accessibilityRole="button"
              accessibilityLabel="Add food to this meal"
              style={{
                marginTop: 8,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: radii.btn,
                backgroundColor: colors.emerald600,
              }}
            >
              <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.white }}>Add food</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
              {lines.map((line) => (
                <View
                  key={line.id}
                  style={{
                    borderRadius: radii.cardMd,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.slate200,
                    backgroundColor: colors.white,
                    padding: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    ...iosCardShadow,
                  }}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate900 }}>{line.name}</Text>
                    {line.sub ? (
                      <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.slate500 }}>{line.sub}</Text>
                    ) : null}
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>{line.kcal} kcal</Text>
                    
                    <Pressable
                      onPress={() => removeFromMeal(meal, line.id)}
                      hitSlop={8}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : 1,
                        padding: 4,
                        backgroundColor: "#FEE2E2",
                        borderRadius: 8,
                      })}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color="#DC2626" />
                    </Pressable>
                  </View>

                </View>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => navigation.navigate("AddFood", { presetMeal: meal })}
              accessibilityRole="button"
              accessibilityLabel="Add more food"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: touch.buttonHeight,
                borderRadius: radii.btn,
                borderWidth: 1,
                borderColor: colors.emerald600,
                backgroundColor: colors.white,
              }}
            >
              <MaterialCommunityIcons name="plus" size={22} color={colors.emerald600} />
              <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.emerald600 }}>Add more</Text>
            </Pressable>
          </>
        )}
      </View>
    </Module01Layout>
  );
}

const backBtn = {
  width: touch.min,
  height: touch.min,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  ...iosCardShadow,
};
