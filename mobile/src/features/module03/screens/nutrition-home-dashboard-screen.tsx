import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MainTabParamList } from "../../../core/navigation/main-tab-types";
import { Module01Layout } from "../../module01/components/module01-layout";
import { computeEnergyTargets, goalDailyCalories } from "../../module01/lib/metrics";
import { useModule01Store } from "../../module01/store/module01-store";
import { colors, iosCardShadow, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";

/** Demo intake vs goal — replace with logged meals from API. */
const DEMO_CONSUMED = 1520;
const DEMO_STEPS = 8742;
const STEP_GOAL = 10000;

export function NutritionHomeDashboardScreen({
  navigation,
}: BottomTabScreenProps<MainTabParamList, "Nutrition">): ReactElement {
  const profile = useModule01Store();
  const { tdee } = computeEnergyTargets(
    profile.gender,
    profile.age,
    profile.heightCm,
    profile.weightKg,
    profile.activity,
  );
  const target = goalDailyCalories(profile.goal, tdee);
  const remaining = Math.max(0, target - DEMO_CONSUMED);
  const ratio = Math.min(1, DEMO_CONSUMED / target);
  const stepRatio = DEMO_STEPS / STEP_GOAL;

  const startWorkout = (): void => {
    navigation.navigate("Workout", { screen: "WorkoutList" });
  };

  return (
    <Module01Layout variant="homePremium" contentInset={[16, 20, 24, 20]} scrollable>
      <View style={{ width: "100%", gap: 20, flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 15, color: colors.slate500 }}>Hello, User</Text>
            <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.8, color: colors.slate900 }}>
              Ready to crush today
            </Text>
          </View>
          <LinearGradient
            colors={["#A7F3D0", "#BAE6FD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.white,
            }}
          >
            <MaterialCommunityIcons name="account" size={24} color="#0F766E" />
          </LinearGradient>
        </View>

        <View
          style={{
            borderRadius: 24,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 18,
            gap: 14,
            ...iosCardShadow,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Daily calories</Text>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>
              {DEMO_CONSUMED.toLocaleString()} / {target.toLocaleString()} kcal
            </Text>
          </View>
          <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.slate200, overflow: "hidden" }}>
            <LinearGradient
              colors={["#10B981", "#0EA5E9"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ height: 12, width: `${ratio * 100}%`, borderRadius: 6 }}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.emerald600 }}>
              {remaining.toLocaleString()} kcal remaining
            </Text>
            <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.cyan600 }}>On track</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            borderRadius: 20,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 16,
            ...iosCardShadow,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: "#ECFDF5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="walk" size={24} color={colors.emerald600} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate500 }}>Steps today</Text>
            <Text style={{ fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.7, color: colors.slate900 }}>
              {DEMO_STEPS.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.emerald600 }}>
              Goal {STEP_GOAL.toLocaleString()} · {Math.round(stepRatio * 100)}%
            </Text>
          </View>
        </View>

        <Pressable onPress={startWorkout} accessibilityRole="button" accessibilityLabel="Start workout">
          <LinearGradient
            colors={["#059669", "#0284C7"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              borderRadius: 22,
              height: 60,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <MaterialCommunityIcons name="play" size={22} color={colors.white} />
            <Text style={{ fontFamily: font.extrabold, fontSize: 17, color: colors.white }}>Start Workout</Text>
          </LinearGradient>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <SummaryMini icon="fire" iconColor={colors.orange500} value={`${DEMO_CONSUMED.toLocaleString()}`} label="Calories" />
          <SummaryMini icon="dumbbell" iconColor={colors.sky500} value="4" label="Workouts" />
          <SummaryMini icon="water" iconColor="#22C55E" value="1.8L" label="Water" />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
            borderRadius: radii.card,
            backgroundColor: "#ECFEFF",
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <MaterialCommunityIcons name="star-four-points-outline" size={16} color={colors.cyan600} />
          <Text style={{ flex: 1, fontFamily: font.semibold, fontSize: 12, color: "#0369A1", lineHeight: 17 }}>
            Great momentum! One more workout and you&apos;ll hit this week&apos;s target.
          </Text>
        </View>
      </View>
    </Module01Layout>
  );
}

function SummaryMini(props: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
}): ReactElement {
  const { icon, iconColor, value, label } = props;
  return (
    <View
      style={{
        flex: 1,
        borderRadius: radii.cardMd,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.slate200,
        backgroundColor: colors.white,
        paddingVertical: 14,
        paddingHorizontal: 12,
        gap: 8,
        ...iosCardShadow,
      }}
    >
      <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
      <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: colors.slate900 }}>{value}</Text>
      <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500 }}>{label}</Text>
    </View>
  );
}
