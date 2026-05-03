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
const STEPS_H = [52, 74, 66, 92, 80, 88, 70];

export function ActivityDetailScreen(_props: ProgressStackScreenProps<"ActivityDetail">): ReactElement {
  const [wm, setWm] = useState<"week" | "month">("week");
  const maxH = Math.max(...STEPS_H);

  return (
    <Module01Layout variant="metricsDash" contentInset={layout.contentPadProgressDetail} scrollable>
      <View style={{ width: "100%", gap: 18, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 26, color: colors.slate900 }}>Activity</Text>
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
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Steps trend</Text>
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
            {STEPS_H.map((h, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <LinearGradient
                  colors={["#60A5FA", "#2563EB"]}
                  style={{
                    width: "100%",
                    height: Math.max(10, (h / maxH) * 130),
                    borderRadius: 6,
                  }}
                />
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
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Workout history</Text>
          {["Upper · 42 min", "Run · 28 min", "Mobility · 18 min"].map((line) => (
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
