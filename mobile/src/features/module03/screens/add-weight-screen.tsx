import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { Module01Layout } from "../../module01/components/module01-layout";
import { useModule01Store } from "../../module01/store/module01-store";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProgressStackScreenProps } from "../navigation/progress-stack-types";
import { useProgressDashboardStore } from "../store/progress-dashboard-store";

export function AddWeightScreen({ navigation }: ProgressStackScreenProps<"AddWeight">): ReactElement {
  const profile = useModule01Store();
  const setPhase = useProgressDashboardStore((s) => s.setPhase);
  const [kg, setKg] = useState(71.2);
  const step = 0.1;

  const onSave = (): void => {
    setPhase("ready");
    navigation.goBack();
  };

  const summary = `${profile.heightCm} cm · ${kg.toFixed(1)} kg`;

  return (
    <Module01Layout variant="onboardingMint" contentInset={layout.contentPadProgressAddWeight} scrollable={false}>
      <View style={{ flex: 1, width: "100%", gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>Add Weight</Text>
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
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Weight (kg)</Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 52, letterSpacing: -1.2, color: colors.slate900 }}>
            {kg.toFixed(1)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 8 }}>
            <Pressable
              onPress={() => setKg((k) => Math.max(30, Math.round((k - step) * 10) / 10))}
              style={stepBtn}
              accessibilityRole="button"
              accessibilityLabel="Decrease weight"
            >
              <Text style={stepTxt}>−</Text>
            </Pressable>
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.slate200, overflow: "hidden" }}>
              <View
                style={{
                  width: `${Math.min(100, Math.max(0, ((kg - 30) / (150 - 30)) * 100))}%` as `${number}%`,
                  height: "100%",
                  backgroundColor: colors.cyan600,
                }}
              />
            </View>
            <Pressable
              onPress={() => setKg((k) => Math.min(150, Math.round((k + step) * 10) / 10))}
              style={stepBtn}
              accessibilityRole="button"
              accessibilityLabel="Increase weight"
            >
              <Text style={stepTxt}>+</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={{
            borderRadius: radii.cardMd,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 16,
            gap: 10,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Date</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pick date"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: radii.cardMd,
              backgroundColor: colors.slate100,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.slate200,
            }}
          >
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>{summary}</Text>
            <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.slate500} />
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        <GradientPrimaryButton label="Save Weight" onPress={onSave} height={56} />
      </View>
    </Module01Layout>
  );
}

const stepBtn = {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: colors.slate200,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const stepTxt = {
  fontFamily: font.extrabold,
  fontSize: 22,
  color: colors.slate900,
};
