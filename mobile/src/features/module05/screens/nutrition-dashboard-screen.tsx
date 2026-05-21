import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { NutritionStackScreenProps } from "../navigation/nutrition-stack-types";
import { useNutritionApiStore, getTodayTotals, getMealKcal } from "../store/nutrition-api-store";
import type { MealType } from "../store/nutrition-api-store";

const MEAL_CONFIG: { type: MealType; label: string; icon: string; color: string }[] = [
  { type: "breakfast", label: "Breakfast", icon: "weather-sunny", color: "#F59E0B" },
  { type: "lunch", label: "Lunch", icon: "food", color: "#10B981" },
  { type: "dinner", label: "Dinner", icon: "weather-night", color: "#6366F1" },
  { type: "snack", label: "Snacks", icon: "food-apple", color: "#EC4899" },
];

export function NutritionDashboardScreen({ navigation }: NutritionStackScreenProps<"NutritionDashboard">): ReactElement {
  const insets = useSafeAreaInsets();
  const mealLogs = useNutritionApiStore((s) => s.mealLogs);
  const loadingLogs = useNutritionApiStore((s) => s.loadingLogs);
  const goalKcal = useNutritionApiStore((s) => s.goalKcal);
  const waterL = useNutritionApiStore((s) => s.waterL);
  const waterGoalL = useNutritionApiStore((s) => s.waterGoalL);
  const bumpWater = useNutritionApiStore((s) => s.bumpWater);
  const fetchTodayLogs = useNutritionApiStore((s) => s.fetchTodayLogs);
  const createMealLog = useNutritionApiStore((s) => s.createMealLog);

  useEffect(() => {
    void fetchTodayLogs();
  }, []);

  const totals = getTodayTotals(mealLogs);
  const consumed = totals.kcal;
  const remaining = Math.max(0, goalKcal - consumed);
  const ratio = goalKcal > 0 ? Math.min(1, consumed / goalKcal) : 0;
  const waterRatio = waterGoalL > 0 ? Math.min(1, waterL / waterGoalL) : 0;

  const tabBarOffset = 56 + insets.bottom;
  const fabBottom = tabBarOffset + 12;

  const handleOpenMeal = async (mealType: MealType): Promise<void> => {
    // Kiểm tra xem đã có meal log cho loại bữa ăn này chưa
    const existing = mealLogs.find((l) => l.mealType === mealType);
    if (existing) {
      navigation.navigate("MealDetail", { meal: mealType as "breakfast" | "lunch" | "dinner" });
    } else {
      // Tạo meal log mới
      await createMealLog(mealType);
      navigation.navigate("MealDetail", { meal: mealType as "breakfast" | "lunch" | "dinner" });
    }
  };

  return (
    <Module01Layout variant="homePremium" contentInset={[14, 20, fabBottom + 72, 20]} scrollable={false}>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={{ gap: 18 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.slate500 }}>Today</Text>
                <Text style={{ fontFamily: font.extrabold, fontSize: 26, letterSpacing: -0.6, color: colors.slate900 }}>Nutrition</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {loadingLogs && <ActivityIndicator color={colors.cyan600} />}
                <Pressable
                  onPress={() => void fetchTodayLogs()}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh logs"
                  style={iconChip}
                >
                  <MaterialCommunityIcons name="refresh" size={20} color={colors.slate900} />
                </Pressable>
              </View>
            </View>

            {/* Calo tổng hàng ngày */}
            <View style={{ borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.slate200, backgroundColor: colors.white, padding: 18, gap: 14, ...iosCardShadow }}>
              <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Daily calories</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.extrabold, fontSize: 36, letterSpacing: -1, color: colors.slate900 }}>
                    {consumed.toLocaleString()}
                  </Text>
                  <Text style={{ fontFamily: font.medium, fontSize: 14, color: colors.slate500 }}>
                    of {goalKcal.toLocaleString()} kcal · {remaining.toLocaleString()} left
                  </Text>
                </View>
                <View style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#ECFDF5" }}>
                  <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.emerald600 }}>{Math.round(ratio * 100)}%</Text>
                </View>
              </View>
              {/* Progress bar */}
              <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.slate100, overflow: "hidden" }}>
                <View style={{ width: `${ratio * 100}%`, height: "100%", backgroundColor: ratio >= 1 ? "#EF4444" : colors.emerald600 }} />
              </View>
              {/* Macros row */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <MacroChip label="Protein" value={`${totals.protein}g`} color="#6366F1" />
                <MacroChip label="Carbs" value={`${totals.carb}g`} color="#F59E0B" />
                <MacroChip label="Fat" value={`${totals.fat}g`} color="#EF4444" />
              </View>
            </View>

            {/* Bữa ăn */}
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Meals</Text>

            {MEAL_CONFIG.map(({ type, label, icon, color }) => {
              const kcal = getMealKcal(mealLogs, type);
              return (
                <MealSummaryCard
                  key={type}
                  label={label}
                  icon={icon}
                  color={color}
                  kcal={kcal}
                  onOpen={() => void handleOpenMeal(type)}
                  onAdd={() => navigation.navigate("AddFood", { presetMeal: type as "breakfast" | "lunch" | "dinner" })}
                />
              );
            })}

            {/* Nước uống */}
            <View style={{ borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.slate200, backgroundColor: colors.white, padding: 18, ...iosCardShadow }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Water</Text>
                <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.cyan600 }}>
                  {waterL.toFixed(1)} / {waterGoalL.toFixed(1)} L
                </Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.slate100, overflow: "hidden" }}>
                  <View style={{ width: `${waterRatio * 100}%`, height: "100%", backgroundColor: colors.cyan600 }} />
                </View>
              </View>
              <View style={{ marginTop: 16, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                <Pressable onPress={() => bumpWater(-0.25)} accessibilityRole="button" accessibilityLabel="Remove water" style={({ pressed }) => [waterBtnMinus, pressed && { opacity: 0.85 }]}>
                  <MaterialCommunityIcons name="minus" size={22} color={colors.slate900} />
                </Pressable>
                <Pressable onPress={() => bumpWater(0.25)} accessibilityRole="button" accessibilityLabel="Add water" style={({ pressed }) => [waterBtnPlus, pressed && { opacity: 0.9 }]}>
                  <MaterialCommunityIcons name="plus" size={22} color={colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* FAB */}
        <Pressable
          onPress={() => navigation.navigate("AddFood")}
          accessibilityRole="button"
          accessibilityLabel="Log food"
          style={[fabStyle, { bottom: fabBottom, right: 20 }]}
        >
          <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
        </Pressable>
      </View>
    </Module01Layout>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function MacroChip(props: { label: string; value: string; color: string }): ReactElement {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, backgroundColor: colors.slate50 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.slate500 }}>{props.label}</Text>
      <Text style={{ fontFamily: font.extrabold, fontSize: 14, color: props.color, marginTop: 2 }}>{props.value}</Text>
    </View>
  );
}

type MealSummaryProps = {
  label: string;
  icon: string;
  color: string;
  kcal: number;
  onOpen: () => void;
  onAdd: () => void;
};

function MealSummaryCard({ label, icon, color, kcal, onOpen, onAdd }: MealSummaryProps): ReactElement {
  const empty = kcal <= 0;
  return (
    <View style={{ borderRadius: radii.cardMd, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.slate200, backgroundColor: colors.white, paddingVertical: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", ...iosCardShadow }}>
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${label}, ${empty ? "no foods logged" : `${kcal} calories`}`} style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingRight: 8, gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${color}20`, alignItems: "center", justifyContent: "center" }}>
          <MaterialCommunityIcons name={icon as any} size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>{label}</Text>
          <Text style={{ fontFamily: font.medium, fontSize: 13, color: empty ? colors.slate400 : colors.slate600 }}>
            {empty ? "Tap to add foods" : `${kcal.toLocaleString()} kcal logged`}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={onAdd} accessibilityRole="button" accessibilityLabel={`Quick add to ${label}`} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center" }}>
        <MaterialCommunityIcons name="plus" size={22} color={colors.emerald600} />
      </Pressable>
    </View>
  );
}

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
