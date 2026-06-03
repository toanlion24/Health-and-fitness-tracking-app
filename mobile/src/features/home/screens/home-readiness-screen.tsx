import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { colors, layout, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { HomeStackScreenProps } from "../navigation/home-stack-types";

export function HomeReadinessScreen({ navigation }: HomeStackScreenProps<"HomeReadiness">): ReactElement {
  const { t } = useTranslation();
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
            {t("home.readinessTitle")}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.score}>87</Text>
          <Text style={styles.sub}>{t("home.readinessSub")}</Text>
        </View>

        <View style={styles.glass}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="weather-night" size={20} color="#5EEAD4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.k}>{t("home.readinessSleep")}</Text>
              <Text style={styles.v}>{t("home.readinessSleepBody")}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <MaterialCommunityIcons name="heart-pulse" size={20} color="#22D3EE" />
            <View style={{ flex: 1 }}>
              <Text style={styles.k}>{t("home.readinessHrv")}</Text>
              <Text style={styles.v}>{t("home.readinessHrvBody")}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <MaterialCommunityIcons name="run" size={20} color="#34D399" />
            <View style={{ flex: 1 }}>
              <Text style={styles.k}>{t("home.readinessLoad")}</Text>
              <Text style={styles.v}>{t("home.readinessLoadBody")}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footnote}>{t("home.readinessFootnote")}</Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    fontFamily: font.extrabold,
    fontSize: 22,
    color: colors.white,
  },
  card: {
    borderRadius: radii.card,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(45,212,191,0.45)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    gap: 8,
  },
  score: {
    fontFamily: font.extrabold,
    fontSize: 48,
    color: colors.white,
    letterSpacing: -1.5,
  },
  sub: {
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.slate400,
    textAlign: "center",
  },
  glass: {
    borderRadius: radii.card,
    padding: 16,
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(34,211,238,0.3)",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  k: {
    fontFamily: font.extrabold,
    fontSize: 13,
    color: colors.white,
  },
  v: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.slate400,
    lineHeight: 18,
  },
  footnote: {
    fontFamily: font.semibold,
    fontSize: 11,
    color: colors.slate500,
  },
});
