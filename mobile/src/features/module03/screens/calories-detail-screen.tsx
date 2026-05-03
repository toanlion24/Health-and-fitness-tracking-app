import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { ProgressWeekMonthSegment } from "../components/progress-dashboard-widgets";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProgressStackScreenProps } from "../navigation/progress-stack-types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const CONSUMED_H = [56, 82, 74, 88, 70, 90, 68];
const BURNED_H = [40, 52, 48, 56, 44, 58, 42];

export function CaloriesDetailScreen(_props: ProgressStackScreenProps<"CaloriesDetail">): ReactElement {
  const [wm, setWm] = useState<"week" | "month">("week");
  const maxH = Math.max(...CONSUMED_H, ...BURNED_H);

  return (
    <Module01Layout variant="metricsDash" contentInset={layout.contentPadProgressDetail} scrollable>
      <View style={{ width: "100%", gap: 18, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 26, color: colors.slate900 }}>Calories</Text>
          <ProgressWeekMonthSegment value={wm} onChange={setWm} />
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
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Calories consumed vs burned</Text>
          <View
            style={{
              height: 160,
              borderRadius: radii.cardMd,
              backgroundColor: colors.slate100,
              padding: 16,
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            {DAYS.map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: 3,
                  height: "100%",
                }}
              >
                <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <LinearGradient
                    colors={["#0EA5E9", "#0284C7"]}
                    style={{
                      width: "100%",
                      height: Math.max(10, ((CONSUMED_H[i] ?? 0) / maxH) * 130),
                      borderRadius: 6,
                      opacity: 0.95,
                    }}
                  />
                </View>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <LinearGradient
                    colors={["#94A3B8", "#64748B"]}
                    style={{
                      width: "100%",
                      height: Math.max(8, ((BURNED_H[i] ?? 0) / maxH) * 130),
                      borderRadius: 6,
                      opacity: 0.85,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {DAYS.map((d) => (
              <Text key={d} style={{ fontFamily: font.regular, fontSize: 11, color: colors.slate400 }}>
                {d}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 16, paddingTop: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cyan600 }} />
              <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate600 }}>Consumed</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.slate500 }} />
              <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate600 }}>Burned</Text>
            </View>
          </View>
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
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Daily breakdown</Text>
          {["Today · 1,860 kcal", "Yesterday · 1,920 kcal", "Wed · 1,780 kcal"].map((line) => (
            <Pressable
              key={line}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: radii.cardMd,
                backgroundColor: colors.slate100,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
              }}
            >
              <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate700 }}>{line}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.slate400} />
            </Pressable>
          ))}
        </View>
      </View>
    </Module01Layout>
  );
}
