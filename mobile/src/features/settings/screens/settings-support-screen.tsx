import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GradientPrimaryButton } from "../../auth/components/gradient-primary-button";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { colors, layout, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

export function SettingsSupportScreen({ navigation }: ProfileStackScreenProps<"Support">): ReactElement {
  return (
    <OnboardingLayout variant="onboardingMint" contentInset={layout.contentPadSettingsDetail} scrollable keyboardAvoiding>
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
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>Support</Text>
        </View>

        <View style={card}>
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Help center</Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 20, letterSpacing: -1.2, color: colors.slate900 }}>FAQ</Text>
        </View>

        <View style={card}>
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Contact support</Text>
          <View style={pick}>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>Email form</Text>
            <MaterialCommunityIcons name="email-outline" size={18} color={colors.slate500} />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>Send feedback</Text>
          <TextInput
            multiline
            placeholder="Tell us what can be improved..."
            placeholderTextColor={colors.slate400}
            style={{
              minHeight: 88,
              borderRadius: radii.cardMd,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.slate200,
              backgroundColor: colors.slate100,
              padding: 12,
              fontFamily: font.medium,
              fontSize: 12,
              color: colors.slate900,
              textAlignVertical: "top",
            }}
          />
        </View>

        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label="Send" onPress={() => navigation.goBack()} height={56} />
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

const pick = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: radii.cardMd,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.slate100,
};
