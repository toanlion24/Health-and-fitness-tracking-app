import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Text, View } from "react-native";
import type { Module01StackScreenProps } from "../../../core/navigation/module01-types";
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { Module01Layout } from "../components/module01-layout";
import { computeBmi, bmiCategory, computeEnergyTargets, recommendationCopy } from "../lib/metrics";
import { useModule01Store } from "../store/module01-store";
import { colors, layout } from "../theme/tokens";
import { font } from "../theme/fonts";

function bmiMarkerRatio(bmi: number): number {
  const min = 16;
  const max = 35;
  return Math.min(1, Math.max(0, (bmi - min) / (max - min)));
}

export function OnboardingResultScreen({ navigation }: Module01StackScreenProps<"OnboardingResult">): ReactElement {
  const profile = useModule01Store();
  const bmi = computeBmi(profile.heightCm, profile.weightKg);
  const cat = bmiCategory(bmi);
  const { bmr, tdee } = computeEnergyTargets(
    profile.gender,
    profile.age,
    profile.heightCm,
    profile.weightKg,
    profile.activity,
  );
  const rec = recommendationCopy(profile.goal, tdee);
  const marker = bmiMarkerRatio(bmi);

  return (
    <Module01Layout variant="result" contentInset={layout.contentPadResult} scrollable>
      <View style={{ width: "100%", gap: 20, flex: 1 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 13, letterSpacing: 0.8, color: colors.slate500 }}>Your metrics</Text>
        <Text
          style={{
            fontFamily: font.extrabold,
            fontSize: 24,
            letterSpacing: -0.6,
            color: colors.slate900,
            maxWidth: 350,
          }}
        >
          Based on your profile
        </Text>

        <View
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            paddingVertical: 24,
            paddingHorizontal: 22,
            gap: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", width: "100%" }}>
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
            <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.slate200, overflow: "hidden" }}>
              <LinearGradient
                colors={["#FCD34D", "#10B981", "#FB7185"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ height: 12, width: "100%", opacity: 0.25 }}
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Text style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>Under</Text>
              <Text style={{ fontFamily: font.semibold, fontSize: 10, color: colors.emerald600 }}>Healthy</Text>
              <Text style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>Over</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 14, width: "100%" }}>
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
              paddingVertical: 20,
              paddingHorizontal: 18,
              gap: 8,
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
              borderWidth: 1,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
              paddingVertical: 20,
              paddingHorizontal: 18,
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="speedometer" size={22} color={colors.sky500} />
            <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.8, color: colors.slate900 }}>
              {tdee.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.slate500 }}>TDEE · kcal/day</Text>
          </View>
        </View>

        <View style={{ gap: 10, paddingTop: 4, width: "100%" }}>
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            <MaterialCommunityIcons name="star-four-points-outline" size={20} color={colors.sky500} />
            <Text
              style={{
                flex: 1,
                fontFamily: font.regular,
                fontSize: 14,
                lineHeight: 21,
                color: colors.slate600,
                maxWidth: 300,
              }}
            >
              {rec}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 12 }} />
        <GradientPrimaryButton label="Continue to app" height={56} onPress={() => navigation.replace("MainTabs")} />
      </View>
    </Module01Layout>
  );
}
