import type { ReactElement } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { Module01Layout } from "../../module01/components/module01-layout";
import { WeightTrendCard } from "../components/progress-dashboard-widgets";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProgressStackScreenProps } from "../navigation/progress-stack-types";

type Range = "week" | "month" | "year";

export function WeightDetailScreen({ navigation }: ProgressStackScreenProps<"WeightDetail">): ReactElement {
  const [range, setRange] = useState<Range>("week");

  return (
    <Module01Layout variant="metricsDash" contentInset={layout.contentPadProgressDetail} scrollable>
      <View style={{ width: "100%", gap: 18, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 26, color: colors.slate900 }}>Weight</Text>
          <View style={{ flexDirection: "row", backgroundColor: colors.slate200, borderRadius: radii.btn, padding: 4, gap: 8 }}>
            {(
              [
                ["week", "Week"],
                ["month", "Month"],
                ["year", "Year"],
              ] as const
            ).map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => setRange(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: range === key }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: range === key ? colors.white : "transparent",
                  borderWidth: range === key ? StyleSheet.hairlineWidth : 0,
                  borderColor: colors.slate200,
                }}
              >
                <Text
                  style={{
                    fontFamily: range === key ? font.bold : font.semibold,
                    fontSize: 12,
                    color: range === key ? colors.slate700 : colors.slate500,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <WeightTrendCard title="Weight overview" chartHeight={220} />

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
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Weight logs</Text>
          {[
            { d: "Sun · Today", v: "71.2 kg" },
            { d: "Sat", v: "71.1 kg" },
            { d: "Fri", v: "71.0 kg" },
          ].map((row) => (
            <View
              key={row.d}
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
              <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate600 }}>{row.d}</Text>
              <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate900 }}>{row.v}</Text>
            </View>
          ))}
        </View>

        <GradientPrimaryButton label="Add weight" onPress={() => navigation.navigate("AddWeight")} height={54} />
      </View>
    </Module01Layout>
  );
}
