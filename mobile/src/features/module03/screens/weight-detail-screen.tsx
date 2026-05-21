import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { Module01Layout } from "../../module01/components/module01-layout";
import { WeightTrendCard } from "../components/progress-dashboard-widgets";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProgressStackScreenProps } from "../navigation/progress-stack-types";
import { useProgressDashboardStore } from "../store/progress-dashboard-store";

type Range = "week" | "month" | "year";

export function WeightDetailScreen({ navigation }: ProgressStackScreenProps<"WeightDetail">): ReactElement {
  const [range, setRange] = useState<Range>("week");

  const { summary, fetchSummary, phase } = useProgressDashboardStore();

  useEffect(() => {
    // Map "year" range to "month" in the mock backend summary service
    void fetchSummary(range === "year" ? "month" : range);
  }, [range]);

  const series = summary?.weight.series ?? [];
  const displayLogs = [...series].reverse();
  const isLoading = phase === "loading";

  return (
    <Module01Layout variant="metricsDash" contentInset={layout.contentPadProgressDetail} scrollable>
      <View style={{ width: "100%", gap: 18, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 26, color: colors.slate900 }}>Cân nặng</Text>
          <View style={{ flexDirection: "row", backgroundColor: colors.slate200, borderRadius: radii.btn, padding: 4, gap: 8 }}>
            {(
              [
                ["week", "Tuần"],
                ["month", "Tháng"],
                ["year", "Năm"],
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

        <WeightTrendCard series={series} chartHeight={220} />

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
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Nhật ký cân nặng</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.cyan600} />
          ) : displayLogs.length === 0 ? (
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate400, textAlign: "center", paddingVertical: 12 }}>
              Chưa ghi nhận cân nặng
            </Text>
          ) : (
            displayLogs.map((row, i) => {
              const formattedDate = new Date(row.date).toLocaleDateString("vi-VN", {
                weekday: "short",
                day: "numeric",
                month: "numeric",
              });
              return (
                <View
                  key={`${row.date}-${i}`}
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
                  <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate600 }}>{formattedDate}</Text>
                  <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate900 }}>{row.weightKg} kg</Text>
                </View>
              );
            })
          )}
        </View>

        <GradientPrimaryButton label="Ghi cân nặng" onPress={() => navigation.navigate("AddWeight")} height={54} />
      </View>
    </Module01Layout>
  );
}
