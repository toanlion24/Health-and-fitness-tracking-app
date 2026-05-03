import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

const PULSE_BARS = [22, 38, 30, 44, 28];

export function AiCoachPulseScreen({ navigation }: ProfileStackScreenProps<"AiCoachPulse">): ReactElement {
  const { t } = useTranslation();
  return (
    <Module01Layout
      variant="coachPulse"
      statusBarLight
      contentInset={[10, 20, 24, 20]}
      scrollable
    >
      <View style={{ width: "100%", gap: 14, flex: 1 }}>
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
          <Text style={styles.screenTitle} numberOfLines={2}>
            {t("pulse.title")}
          </Text>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.coachEyebrow}>{t("pulse.coachEyebrow")}</Text>
          <Text style={styles.coachTitle}>{t("pulse.coachTitle")}</Text>
          <Text style={styles.coachBody}>{t("pulse.coachBody")}</Text>
        </View>

        <LinearGradient colors={["#1E293B", "#0F172A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pulseCard}>
          <Text style={styles.pulseLabel}>{t("pulse.liveEnergy")}</Text>
          <View style={styles.barRow}>
            {PULSE_BARS.map((h, i) => (
              <LinearGradient
                key={`bar-${String(i)}`}
                colors={["#22D3EE", "#10B981"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[styles.bar, { height: h }]}
              />
            ))}
          </View>
        </LinearGradient>

        <View style={styles.feedCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <Text style={styles.feedTitle}>{t("pulse.proactiveTitle")}</Text>
            <MaterialCommunityIcons name="dumbbell" size={20} color="#34D399" />
          </View>
          <Text style={styles.feedBody}>{t("pulse.proactiveBody")}</Text>
        </View>

        <View style={[styles.feedCard, styles.feedCardMuted]}>
          <Text style={styles.feedTitle}>{t("pulse.contextTitle")}</Text>
          <Text style={styles.feedBody}>{t("pulse.contextBody")}</Text>
        </View>

        <LinearGradient colors={["rgba(15,23,42,0.92)", "rgba(30,41,59,0.88)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dock}>
          <MaterialCommunityIcons name="star-four-points" size={22} color="#5EEAD4" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.dockTitle}>{t("pulse.dockTitle")}</Text>
            <Text style={styles.dockSub}>{t("pulse.dockSub")}</Text>
          </View>
          <View style={styles.dockDot} />
        </LinearGradient>
      </View>
    </Module01Layout>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    flex: 1,
    fontFamily: font.extrabold,
    fontSize: 28,
    letterSpacing: -0.8,
    color: colors.white,
  },
  glassCard: {
    borderRadius: radii.cardMd,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(34,211,238,0.55)",
    backgroundColor: "rgba(255,255,255,0.08)",
    gap: 6,
  },
  coachEyebrow: {
    fontFamily: font.extrabold,
    fontSize: 12,
    color: "#5EEAD4",
  },
  coachTitle: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: colors.white,
  },
  coachBody: {
    fontFamily: font.semibold,
    fontSize: 10,
    color: colors.slate400,
    lineHeight: 15,
  },
  pulseCard: {
    borderRadius: radii.card,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#22D3EE",
    gap: 12,
  },
  pulseLabel: {
    fontFamily: font.extrabold,
    fontSize: 11,
    color: colors.slate400,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 52,
    gap: 5,
  },
  bar: {
    width: 10,
    borderRadius: 5,
  },
  feedCard: {
    borderRadius: 20,
    padding: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(52,211,153,0.6)",
    backgroundColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  feedCardMuted: {
    borderColor: "rgba(14,165,233,0.45)",
  },
  feedTitle: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: colors.white,
    flex: 1,
  },
  feedBody: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.slate400,
    lineHeight: 17,
  },
  dock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(45,212,191,0.7)",
  },
  dockTitle: {
    fontFamily: font.extrabold,
    fontSize: 11,
    color: colors.white,
  },
  dockSub: {
    fontFamily: font.semibold,
    fontSize: 10,
    color: colors.slate400,
    lineHeight: 14,
  },
  dockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22D3EE",
  },
});
