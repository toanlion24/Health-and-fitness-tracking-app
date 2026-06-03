import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { GradientPrimaryButton } from "../../auth/components/gradient-primary-button";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import {
  bmiCategory,
  computeBmi,
  computeEnergyTargets,
  goalDailyCalories,
  recommendationCopy,
} from "../../auth/lib/metrics";
import { useOnboardingStore } from "../../auth/store/onboarding-store";
import { colors, iosCardShadow, layout, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { ProgressStackScreenProps } from "../navigation/progress-stack-types";

function bmiMarkerRatio(bmi: number): number {
  const min = 16;
  const max = 35;
  return Math.min(1, Math.max(0, (bmi - min) / (max - min)));
}

/** Former Progress home: BMI / BMR / TDEE / targets — reachable from the new Progress dashboard. */
export function HealthMetricsDetailScreen({
  navigation,
}: ProgressStackScreenProps<"HealthMetricsDetail">): ReactElement {
  const profile = useOnboardingStore();
  const bmi = computeBmi(profile.heightCm, profile.weightKg);
  const cat = bmiCategory(bmi);
  const { bmr, tdee } = computeEnergyTargets(
    profile.gender,
    profile.age,
    profile.heightCm,
    profile.weightKg,
    profile.activity,
  );
  const goalKcal = goalDailyCalories(profile.goal, tdee);
  const rec = recommendationCopy(profile.goal, tdee);
  const marker = bmiMarkerRatio(bmi);

  const onApply = (): void => {
    Alert.alert(
      "Recommendation saved",
      `Your daily target is about ${goalKcal.toLocaleString()} kcal based on your profile and goal.`,
    );
  };

  return (
    <OnboardingLayout variant="metricsDash" contentInset={layout.contentPadProgressMetrics} scrollable>
      <View style={{ width: "100%", gap: 16, flex: 1 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to Progress"
          hitSlop={12}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            opacity: pressed ? 0.75 : 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          })}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate900} />
          <Text style={{ fontFamily: font.semibold, fontSize: 15, color: colors.slate700 }}>Progress</Text>
        </Pressable>

        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 12, letterSpacing: 0.8, color: colors.slate500 }}>
            HEALTH OVERVIEW
          </Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.7, color: colors.slate900 }}>
            Your body metrics
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.slate500, maxWidth: 340 }}>
            Clear numbers to guide nutrition and training decisions.
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate("AppFlowMap")}
          accessibilityRole="button"
          accessibilityLabel="Open app navigation overview"
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            opacity: pressed ? 0.85 : 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          })}
        >
          <MaterialCommunityIcons name="map-outline" size={18} color={colors.cyan600} />
          <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.cyan600 }}>Navigation overview</Text>
        </Pressable>

        <View
          style={{
            borderRadius: radii.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 18,
            gap: 12,
            ...iosCardShadow,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 48, letterSpacing: -1.5, color: colors.slate900 }}>
              {bmi.toFixed(1)}
            </Text>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>BMI</Text>
              <Text
                style={{
                  fontFamily: font.semibold,
                  fontSize: 13,
                  color: cat.tone === "healthy" ? colors.emerald600 : "#D97706",
                }}
              >
                {cat.label}
              </Text>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <View style={{ height: 14, borderRadius: 7, backgroundColor: colors.slate200, overflow: "hidden" }}>
              <LinearGradient
                colors={["#FCD34D", "#10B981", "#FB7185"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ height: 14, width: "100%", opacity: 0.28 }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 3,
                  marginLeft: -1.5,
                  left: `${marker * 100}%` as `${number}%`,
                  backgroundColor: colors.slate900,
                  borderRadius: 2,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>Under</Text>
              <Text style={{ fontFamily: font.semibold, fontSize: 10, color: colors.emerald600 }}>Healthy</Text>
              <Text style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>Over</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
              paddingVertical: 16,
              paddingHorizontal: 14,
              gap: 8,
              ...iosCardShadow,
            }}
          >
            <MaterialCommunityIcons name="fire" size={22} color={colors.orange500} />
            <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.8, color: colors.slate900 }}>
              {bmr.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.slate500 }}>BMR · kcal/day</Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
              paddingVertical: 16,
              paddingHorizontal: 14,
              gap: 8,
              ...iosCardShadow,
            }}
          >
            <MaterialCommunityIcons name="speedometer" size={22} color={colors.sky500} />
            <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.8, color: colors.slate900 }}>
              {tdee.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.slate500 }}>TDEE · kcal/day</Text>
          </View>
        </View>

        <View
          style={{
            borderRadius: radii.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 18,
            gap: 12,
            ...iosCardShadow,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate500 }}>Calorie target</Text>
          </View>
          <Text style={{ fontFamily: font.extrabold, fontSize: 36, letterSpacing: -1, color: colors.slate900 }}>
            {goalKcal.toLocaleString()} kcal/day
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.slate600 }}>{rec}</Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
            <MaterialCommunityIcons name="star-four-points-outline" size={18} color={colors.sky500} />
            <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.slate600 }}>
              Targets stay aligned with your onboarding goal ({profile.goal}) and activity level.
            </Text>
          </View>
        </View>

        <GradientPrimaryButton label="Apply recommendation" onPress={onApply} height={56} />
      </View>
    </OnboardingLayout>
  );
}
