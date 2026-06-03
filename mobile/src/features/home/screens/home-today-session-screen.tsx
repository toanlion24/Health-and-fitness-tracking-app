import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { colors, layout, radii, touch } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { HomeStackScreenProps } from "../navigation/home-stack-types";

export function HomeTodaySessionScreen({ navigation }: HomeStackScreenProps<"HomeTodaySession">): ReactElement {
  const { t } = useTranslation();
  const tabNav = navigation.getParent();

  const goWorkoutPlan = (): void => {
    tabNav?.navigate("Workout", { screen: "WorkoutPlan" });
  };

  const goWorkoutList = (): void => {
    tabNav?.navigate("Workout", { screen: "WorkoutList" });
  };

  return (
    <OnboardingLayout variant="coachPulse" statusBarLight contentInset={layout.contentPadSettingsDetail} scrollable>
      <View style={{ width: "100%", gap: 16, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.goBack")}
            hitSlop={12}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
          </Pressable>
          <Text style={styles.title} numberOfLines={2}>
            {t("home.sessionTitle")}
          </Text>
        </View>

        <LinearGradient
          colors={["rgba(16,185,129,0.22)", "rgba(14,165,233,0.14)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEyebrow}>{t("home.sessionEyebrow")}</Text>
          <Text style={styles.heroTitle}>{t("home.sessionHeadline")}</Text>
          <Text style={styles.heroBody}>{t("home.sessionBody")}</Text>
          <View style={styles.meta}>
            <MetaChip icon="timer-outline" label={t("home.sessionDuration")} />
            <MetaChip icon="fire" label={t("home.sessionBurn")} />
          </View>
        </LinearGradient>

        <Pressable
          onPress={goWorkoutPlan}
          accessibilityRole="button"
          accessibilityLabel={t("home.sessionStartCta")}
          style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.92 : 1 }]}
        >
          <LinearGradient colors={["#059669", "#0284C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGrad}>
            <MaterialCommunityIcons name="play" size={22} color={colors.white} />
            <Text style={styles.primaryTxt}>{t("home.sessionStartCta")}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={goWorkoutList}
          accessibilityRole="button"
          accessibilityLabel={t("home.sessionSwapCta")}
          style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.94 : 1 }]}
        >
          <Text style={styles.secondaryTxt}>{t("home.sessionSwapCta")}</Text>
          <MaterialCommunityIcons name="swap-horizontal" size={20} color="#E2E8F0" />
        </Pressable>

        <Text style={styles.note}>{t("home.sessionNote")}</Text>
      </View>
    </OnboardingLayout>
  );
}

function MetaChip(props: { icon: ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string }): ReactElement {
  const { icon, label } = props;
  return (
    <View style={styles.chip}>
      <MaterialCommunityIcons name={icon} size={16} color="#94A3B8" />
      <Text style={styles.chipTxt}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    fontFamily: font.extrabold,
    fontSize: 22,
    color: colors.white,
  },
  hero: {
    borderRadius: radii.card,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#22D3EE",
    gap: 10,
  },
  heroEyebrow: {
    fontFamily: font.bold,
    fontSize: 11,
    color: "#5EEAD4",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: font.extrabold,
    fontSize: 18,
    color: colors.white,
  },
  heroBody: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.slate400,
    lineHeight: 19,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.35)",
  },
  chipTxt: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.slate400,
  },
  primaryBtn: {
    borderRadius: radii.btn,
    overflow: "hidden",
    minHeight: touch.buttonHeight - 4,
  },
  primaryGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryTxt: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: colors.white,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.btn,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.45)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  secondaryTxt: {
    fontFamily: font.extrabold,
    fontSize: 15,
    color: "#E2E8F0",
  },
  note: {
    fontFamily: font.semibold,
    fontSize: 11,
    color: colors.slate500,
    lineHeight: 16,
  },
});
