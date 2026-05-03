import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

const MIN_PASSWORD_LEN = 8;

export function SettingsChangePasswordScreen({ navigation }: ProfileStackScreenProps<"ChangePassword">): ReactElement {
  const { t } = useTranslation();
  const [current, setCurrent] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorKey, setErrorKey] = useState<"empty" | "format" | "mismatch" | null>(null);

  const onUpdate = (): void => {
    if (!current.trim() || !nextPw.trim() || !confirm.trim()) {
      setErrorKey("empty");
      return;
    }
    if (nextPw.length < MIN_PASSWORD_LEN) {
      setErrorKey("format");
      return;
    }
    if (nextPw !== confirm) {
      setErrorKey("mismatch");
      return;
    }
    setErrorKey(null);
    navigation.goBack();
  };

  const errorMessage =
    errorKey === "empty"
      ? t("changePasswordScreen.errorEmpty")
      : errorKey === "format"
        ? t("changePasswordScreen.errorInvalidFormat")
        : errorKey === "mismatch"
          ? t("changePasswordScreen.errorMismatch")
          : null;

  return (
    <Module01Layout variant="onboardingMint" contentInset={layout.contentPadSettingsDetail} scrollable keyboardAvoiding>
      <View style={{ width: "100%", gap: 16, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.goBack")}
            hitSlop={12}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>
            {t("changePasswordScreen.title")}
          </Text>
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
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("changePasswordScreen.currentPassword")}</Text>
          <TextInput
            secureTextEntry
            value={current}
            onChangeText={(v) => {
              setCurrent(v);
              setErrorKey(null);
            }}
            placeholder="••••••••"
            placeholderTextColor={colors.slate400}
            style={inp}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
          />
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("changePasswordScreen.newPassword")}</Text>
          <TextInput
            secureTextEntry
            value={nextPw}
            onChangeText={(v) => {
              setNextPw(v);
              setErrorKey(null);
            }}
            placeholder="••••••••"
            placeholderTextColor={colors.slate400}
            style={inp}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
          />
          <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>{t("changePasswordScreen.confirmPassword")}</Text>
          <TextInput
            secureTextEntry
            value={confirm}
            onChangeText={(v) => {
              setConfirm(v);
              setErrorKey(null);
            }}
            placeholder="••••••••"
            placeholderTextColor={colors.slate400}
            style={inp}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
          />
        </View>

        {errorMessage ? (
          <View style={errorBanner} accessibilityRole="alert">
            <MaterialCommunityIcons name="alert-circle" size={16} color="#BE123C" />
            <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: "#BE123C", flex: 1 }}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label={t("changePasswordScreen.updateCta")} onPress={onUpdate} height={56} />
      </View>
    </Module01Layout>
  );
}

const inp = {
  borderRadius: radii.cardMd,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.slate100,
  paddingVertical: 10,
  paddingHorizontal: 12,
  fontFamily: font.medium,
  fontSize: 15,
  color: colors.slate900,
} as const;

const errorBanner = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 8,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: radii.cardMd,
  backgroundColor: "#FFF1F2",
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: "#FECDD3",
};
