import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguageStore } from "../../../core/store/language-store";
import { GradientPrimaryButton } from "../../auth/components/gradient-primary-button";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { colors, iosCardShadow, layout, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

export function SettingsAppPreferencesScreen({ navigation }: ProfileStackScreenProps<"AppPreferences">): ReactElement {
  const { t } = useTranslation();
  const locale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);

  return (
    <OnboardingLayout variant="onboardingMint" contentInset={layout.contentPadSettingsDetail} scrollable>
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
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>{t("preferences.title")}</Text>
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
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("preferences.unitsHeading")}</Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 20, letterSpacing: -1.2, color: colors.slate900 }}>{t("preferences.unitsBody")}</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.slate500 }}>{t("preferences.unitsNote")}</Text>
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
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("preferences.themeHeading")}</Text>
          <View style={pick}>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>{t("settings.themeLight")}</Text>
            <MaterialCommunityIcons name="invert-colors" size={18} color={colors.slate500} />
          </View>
        </View>

        <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("preferences.languageHeading")}</Text>
        <View style={{ gap: 10 }}>
          <LanguageOption label={t("language.english")} selected={locale === "en"} onSelect={() => setLocale("en")} />
          <LanguageOption label={t("language.vietnamese")} selected={locale === "vi"} onSelect={() => setLocale("vi")} />
        </View>

        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label={t("preferences.save")} onPress={() => navigation.goBack()} height={56} />
      </View>
    </OnboardingLayout>
  );
}

function LanguageOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}): ReactElement {
  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        pick,
        selected && { borderWidth: 2, borderColor: colors.emerald600, backgroundColor: colors.white },
        pressed && { opacity: 0.92 },
      ]}
    >
      <Text style={{ fontFamily: font.extrabold, fontSize: 15, color: colors.slate900 }}>{label}</Text>
      {selected ? <MaterialCommunityIcons name="check-circle" size={22} color={colors.emerald600} /> : null}
    </Pressable>
  );
}

const pick = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: radii.cardMd,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.slate100,
};
