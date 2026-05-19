import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Module01Layout } from "../../module01/components/module01-layout";
import { computeEnergyTargets, goalDailyCalories } from "../../module01/lib/metrics";
import { useModule01Store } from "../../module01/store/module01-store";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { MealSlot } from "../data/nutrition-demo";
import type { NutritionStackScreenProps } from "../navigation/nutrition-stack-types";
import { consumedToday, mealTotal, useNutritionLogStore } from "../store/nutrition-log-store";

const MEAL_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export function NutritionDashboardScreen({
  navigation,
}: NutritionStackScreenProps<"NutritionDashboard">): ReactElement {
  const insets = useSafeAreaInsets();
  const profile = useModule01Store();
  const goalFromProfile = goalDailyCalories(
    profile.goal,
    computeEnergyTargets(
      profile.gender,
      profile.age,
      profile.heightCm,
      profile.weightKg,
      profile.activity,
    ).tdee,
  );

  const goalKcal = useNutritionLogStore((s) => s.goalKcal);
  const setGoalKcal = useNutritionLogStore((s) => s.setGoalKcal);
  const waterL = useNutritionLogStore((s) => s.waterL);
  const waterGoalL = useNutritionLogStore((s) => s.waterGoalL);
  const bumpWater = useNutritionLogStore((s) => s.bumpWater);
  const breakfastTotal = useNutritionLogStore((s) => mealTotal(s, "breakfast"));
  const lunchTotal = useNutritionLogStore((s) => mealTotal(s, "lunch"));
  const dinnerTotal = useNutritionLogStore((s) => mealTotal(s, "dinner"));

  useEffect(() => {
    setGoalKcal(goalFromProfile);
  }, [goalFromProfile, setGoalKcal]);

  const consumed = useNutritionLogStore((s) => consumedToday(s));
  const remaining = Math.max(0, goalKcal - consumed);
  const ratio = goalKcal > 0 ? Math.min(1, consumed / goalKcal) : 0;
  const waterRatio = waterGoalL > 0 ? Math.min(1, waterL / waterGoalL) : 0;

  const tabBarOffset = 56 + insets.bottom;
  const fabBottom = tabBarOffset + 12;

  const openMeal = (meal: MealSlot): void => {
    navigation.navigate("MealDetail", { meal });
  };

  return (
    <Module01Layout
      variant="homePremium"
      contentInset={[14, 20, fabBottom + 72, 20]}
      scrollable={false}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spaceExtra }}
        >
          <View style={{ gap: 18 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.slate500 }}>
                  Today
                </Text>
                <Text
                  style={{
                    fontFamily: font.extrabold,
                    fontSize: 26,
                    letterSpacing: -0.6,
                    color: colors.slate900,
                  }}
                >
                  Nutrition
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate("BarcodeScan")}
                accessibilityRole="button"
                accessibilityLabel="Scan barcode"
                style={iconChip}
              >
                <MaterialCommunityIcons name="barcode-scan" size={22} color={colors.slate900} />
              </Pressable>
            </View>

            <View
              style={{
                borderRadius: radii.card,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                backgroundColor: colors.white,
                padding: 18,
                gap: 14,
                ...iosCardShadow,
              }}
            >
              <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>
                Daily calories
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: font.extrabold,
                      fontSize: 36,
                      letterSpacing: -1,
                      color: colors.slate900,
                    }}
                  >
                    {consumed.toLocaleString()}
                  </Text>
                  <Text style={{ fontFamily: font.medium, fontSize: 14, color: colors.slate500 }}>
                    of {goalKcal.toLocaleString()} kcal · {remaining.toLocaleString()} left
                  </Text>
                </View>
                <View
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: "#ECFDF5",
                  }}
                >
                  <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.emerald600 }}>
                    {Math.round(ratio * 100)}%
                  </Text>
                </View>
              </View>
              <View
                style={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: colors.slate100,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${ratio * 100}%`,
                    height: "100%",
                    backgroundColor: colors.emerald600,
                  }}
                />
              </View>
            </View>

            <Text
              style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700, marginTop: 4 }}
            >
              Meals
            </Text>

            <MealSummaryCard
              label={MEAL_LABEL.breakfast}
              kcal={breakfastTotal}
              onOpen={() => openMeal("breakfast")}
              onAdd={() => navigation.navigate("AddFood", { presetMeal: "breakfast" })}
            />
            <MealSummaryCard
              label={MEAL_LABEL.lunch}
              kcal={lunchTotal}
              onOpen={() => openMeal("lunch")}
              onAdd={() => navigation.navigate("AddFood", { presetMeal: "lunch" })}
            />
            <MealSummaryCard
              label={MEAL_LABEL.dinner}
              kcal={dinnerTotal}
              onOpen={() => openMeal("dinner")}
              onAdd={() => navigation.navigate("AddFood", { presetMeal: "dinner" })}
              emphasizeEmpty
            />

            <View
              style={{
                borderRadius: radii.card,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                backgroundColor: colors.white,
                padding: 18,
                ...iosCardShadow,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>
                  Water
                </Text>
                <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.cyan600 }}>
                  {waterL.toFixed(1)} / {waterGoalL.toFixed(1)} L
                </Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <View
                  style={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: colors.slate100,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${waterRatio * 100}%`,
                      height: "100%",
                      backgroundColor: colors.cyan600,
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  marginTop: 16,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Pressable
                  onPress={() => bumpWater(-0.25)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove water"
                  style={({ pressed }) => [waterBtnMinus, pressed && { opacity: 0.85 }]}
                >
                  <MaterialCommunityIcons name="minus" size={22} color={colors.slate900} />
                </Pressable>
                <Pressable
                  onPress={() => bumpWater(0.25)}
                  accessibilityRole="button"
                  accessibilityLabel="Add water"
                  style={({ pressed }) => [waterBtnPlus, pressed && { opacity: 0.9 }]}
                >
                  <MaterialCommunityIcons name="plus" size={22} color={colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        <Pressable
          onPress={() => navigation.navigate("AddFood")}
          accessibilityRole="button"
          accessibilityLabel="Log food"
          style={[
            fabStyle,
            {
              bottom: fabBottom,
              right: 20,
            },
          ]}
        >
          <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
        </Pressable>
      </View>
    </Module01Layout>
  );
}

const spaceExtra = 24;

const iconChip = {
  width: touch.min,
  height: touch.min,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  ...iosCardShadow,
};

const fabStyle = {
  position: "absolute" as const,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.emerald600,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  ...iosCardShadow,
  shadowColor: colors.emerald600,
  shadowOpacity: 0.35,
};

const waterBtnMinus = {
  width: touch.min,
  height: touch.min,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.slate200,
  backgroundColor: colors.slate100,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const waterBtnPlus = {
  width: touch.min,
  height: touch.min,
  borderRadius: 22,
  backgroundColor: colors.emerald600,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  ...iosCardShadow,
};

type MealSummaryProps = {
  label: string;
  kcal: number;
  onOpen: () => void;
  onAdd: () => void;
  emphasizeEmpty?: boolean;
};

function MealSummaryCard({
  label,
  kcal,
  onOpen,
  onAdd,
  emphasizeEmpty,
}: MealSummaryProps): ReactElement {
  const empty = kcal <= 0;
  return (
    <View
      style={[
        {
          borderRadius: radii.cardMd,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.slate200,
          backgroundColor: colors.white,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          ...iosCardShadow,
        },
        emphasizeEmpty && empty ? { borderStyle: "dashed" as const } : null,
      ]}
    >
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${empty ? "no foods logged" : `${kcal} calories`}`}
        style={{ flex: 1, gap: 4, paddingRight: 8 }}
      >
        <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>{label}</Text>
        <Text
          style={{
            fontFamily: font.medium,
            fontSize: 13,
            color: empty ? colors.slate400 : colors.slate600,
          }}
        >
          {empty ? "Tap to add foods" : `${kcal.toLocaleString()} kcal logged`}
        </Text>
      </Pressable>
      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel={`Quick add to ${label}`}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.slate100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name="plus" size={22} color={colors.emerald600} />
      </Pressable>
    </View>
  );
}
