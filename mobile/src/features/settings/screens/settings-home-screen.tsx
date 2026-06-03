import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLanguageStore } from "../../../core/store/language-store";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { useOnboardingStore } from "../../auth/store/onboarding-store";
import { colors, iosCardShadow, layout, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import {
  SettingsDestructiveRow,
  SettingsNavRow,
  SettingsSectionTitle,
  SettingsValueRow,
} from "../components/settings-rows";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

export function SettingsHomeScreen({ navigation }: ProfileStackScreenProps<"SettingsHome">): ReactElement {
  const { t } = useTranslation();
  const locale = useLanguageStore((s) => s.locale);
  const profile = useOnboardingStore();
  const resetProfile = useOnboardingStore((s) => s.resetProfile);

  const onLogout = (): void => {
    resetProfile();
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const summary = t("settings.summary", {
    age: profile.age,
    weight: profile.weightKg,
    goal: t(`goal.${profile.goal}`),
  });
  const languageLabel = t(`language.display.${locale}`);

  return (
    <OnboardingLayout variant="onboardingMint" contentInset={layout.contentPadSettingsMain} scrollable>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
        <Text style={{ fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.8, color: colors.slate900 }}>
          {t("settings.title")}
        </Text>

        <Pressable
          onPress={() => navigation.navigate("EditProfile")}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          style={({ pressed }) => [styles.profileCard, { opacity: pressed ? 0.96 : 1 }]}
        >
          <LinearGradient
            colors={["#A7F3D0", "#BAE6FD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <MaterialCommunityIcons name="account" size={26} color="#0F766E" />
            </View>
          </LinearGradient>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: colors.slate900 }}>{t("settings.yourProfile")}</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>{summary}</Text>
            <Text style={{ fontFamily: font.bold, fontSize: 11, color: colors.cyan600 }}>{t("settings.tapToEdit")}</Text>
          </View>
        </Pressable>

        <View style={{ gap: 12 }}>
          <SettingsSectionTitle>{t("settings.sectionAccount")}</SettingsSectionTitle>
          <SettingsNavRow
            icon="account-edit"
            iconColor={colors.sky500}
            title={t("settings.editProfile")}
            onPress={() => navigation.navigate("EditProfile")}
            testID="settings-edit-profile"
          />
          <SettingsNavRow
            icon="lock-outline"
            iconColor={colors.sky500}
            title={t("settings.changePassword")}
            onPress={() => navigation.navigate("ChangePassword")}
          />
        </View>

        <View style={{ gap: 12 }}>
          <SettingsSectionTitle>{t("settings.sectionPreferences")}</SettingsSectionTitle>
          <SettingsValueRow
            icon="ruler"
            iconColor={colors.emerald600}
            title={t("settings.units")}
            value={t("settings.unitsValue")}
            onPress={() => navigation.navigate("AppPreferences")}
          />
          <SettingsValueRow
            icon="theme-light-dark"
            iconColor={colors.emerald600}
            title={t("settings.theme")}
            value={t("settings.themeLight")}
            onPress={() => navigation.navigate("AppPreferences")}
          />
          <SettingsValueRow
            icon="translate"
            iconColor={colors.emerald600}
            title={t("settings.language")}
            value={languageLabel}
            onPress={() => navigation.navigate("AppPreferences")}
          />
        </View>

        <View style={{ gap: 12 }}>
          <SettingsSectionTitle>{t("settings.sectionNotifications")}</SettingsSectionTitle>
          <SettingsNavRow
            icon="bell-outline"
            iconColor={colors.cyan600}
            title={t("settings.reminderSettings")}
            onPress={() => navigation.navigate("NotificationsSettings")}
          />
          <SettingsNavRow
            icon="heart-pulse"
            iconColor={colors.emerald600}
            title={t("settings.livePulse")}
            onPress={() => navigation.navigate("AiCoachPulse")}
          />
        </View>

        <View style={{ gap: 12 }}>
          <SettingsSectionTitle>{t("settings.sectionPrivacy")}</SettingsSectionTitle>
          <SettingsNavRow
            icon="shield-outline"
            iconColor="#6366F1"
            title={t("settings.privacySecurity")}
            onPress={() => navigation.navigate("PrivacySecurity")}
          />
        </View>

        <View style={{ gap: 12 }}>
          <SettingsSectionTitle>{t("settings.sectionSupport")}</SettingsSectionTitle>
          <SettingsNavRow
            icon="lifebuoy"
            iconColor={colors.sky500}
            title={t("settings.helpSupport")}
            onPress={() => navigation.navigate("Support")}
          />
        </View>

        <View style={{ gap: 12 }}>
          <SettingsSectionTitle>{t("settings.sectionOther")}</SettingsSectionTitle>
          <SettingsDestructiveRow icon="logout" title={t("settings.logout")} onPress={onLogout} />
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    ...iosCardShadow,
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 18,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
