import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { GradientPrimaryButton } from "../../auth/components/gradient-primary-button";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { colors, layout, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";
import { useState } from "react";

export function SettingsPrivacyScreen({ navigation }: ProfileStackScreenProps<"PrivacySecurity">): ReactElement {
  const [loc, setLoc] = useState(true);
  const [health, setHealth] = useState(true);

  return (
    <OnboardingLayout variant="onboardingMint" contentInset={layout.contentPadSettingsDetail} scrollable>
      <View style={{ width: "100%", gap: 16, flex: 1 }}>
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
          <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.slate900 }}>Privacy & Security</Text>
        </View>

        <View style={card}>
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Location access</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: colors.emerald600 }}>{loc ? "ON" : "OFF"}</Text>
            <Switch value={loc} onValueChange={setLoc} trackColor={{ false: colors.slate200, true: colors.emerald600 }} />
          </View>
        </View>

        <View style={card}>
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Health data sync</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>{health ? "ON" : "OFF"}</Text>
            <Switch value={health} onValueChange={setHealth} trackColor={{ false: colors.slate200, true: colors.emerald600 }} />
          </View>
        </View>

        <Pressable style={[outlineBtn, { marginTop: 4 }]}>
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Download data</Text>
        </Pressable>
        <Pressable style={dangerBtn}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: "#BE123C" }}>Delete account</Text>
        </Pressable>

        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label="Save Privacy" onPress={() => navigation.goBack()} height={56} />
      </View>
    </OnboardingLayout>
  );
}

const card = {
  borderRadius: radii.card,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
  padding: 18,
  gap: 12,
} as const;

const outlineBtn = {
  alignItems: "center" as const,
  justifyContent: "center" as const,
  minHeight: 48,
  borderRadius: radii.pill,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
};

const dangerBtn = {
  alignItems: "center" as const,
  justifyContent: "center" as const,
  minHeight: 48,
  borderRadius: radii.pill,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: "#FECDD3",
  backgroundColor: "#FFF1F2",
};
