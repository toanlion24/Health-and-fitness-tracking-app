import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { Module01Layout } from "../../module01/components/module01-layout";
import { useModule01Store } from "../../module01/store/module01-store";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

export function SettingsEditProfileScreen({ navigation }: ProfileStackScreenProps<"EditProfile">): ReactElement {
  const profile = useModule01Store();

  return (
    <Module01Layout variant="onboardingMint" contentInset={layout.contentPadSettingsDetail} scrollable keyboardAvoiding>
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
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>Edit Profile</Text>
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
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Display name</Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, letterSpacing: -0.4, color: colors.slate900 }}>
            Your profile
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: "#ECFDF5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="account" size={28} color="#0F766E" />
            </View>
            <Pressable
              style={{
                borderRadius: radii.cardMd,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate700 }}>Change photo</Text>
            </Pressable>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>Name</Text>
            <TextInput
              defaultValue="Your profile"
              placeholder="Display name"
              placeholderTextColor={colors.slate400}
              style={{
                borderRadius: radii.cardMd,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                backgroundColor: colors.slate100,
                paddingVertical: 10,
                paddingHorizontal: 12,
                fontFamily: font.medium,
                fontSize: 15,
                color: colors.slate900,
              }}
            />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>Age</Text>
            <TextInput
              defaultValue={String(profile.age)}
              keyboardType="number-pad"
              placeholder="Age"
              placeholderTextColor={colors.slate400}
              style={{
                borderRadius: radii.cardMd,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                backgroundColor: colors.slate100,
                paddingVertical: 10,
                paddingHorizontal: 12,
                fontFamily: font.medium,
                fontSize: 15,
                color: colors.slate900,
              }}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label="Save Profile" onPress={() => navigation.goBack()} height={56} />
      </View>
    </Module01Layout>
  );
}
