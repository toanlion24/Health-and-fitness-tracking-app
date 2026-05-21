import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import {
  CaloriesWeekCard,
  ProgressDashboardEmpty,
  ProgressDashboardHeader,
  ProgressDashboardLoading,
  ProgressDashboardPartial,
  SummaryStatRow,
  WeightTrendCard,
} from "../components/progress-dashboard-widgets";
import { useProgressDashboardStore } from "../store/progress-dashboard-store";
import { colors, layout } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProgressStackScreenProps } from "../navigation/progress-stack-types";

export function MetricsDashboardScreen({ navigation }: ProgressStackScreenProps<"MetricsDashboard">): ReactElement {
  const phase = useProgressDashboardStore((s) => s.phase);
  const weekMonth = useProgressDashboardStore((s) => s.weekMonth);
  const setWeekMonth = useProgressDashboardStore((s) => s.setWeekMonth);

  return (
    <Module01Layout variant="metricsDash" contentInset={layout.contentPadProgressMetrics} scrollable>
      <View style={{ width: "100%", gap: 16, flex: 1 }}>
        <ProgressDashboardHeader weekMonth={weekMonth} onWeekMonthChange={setWeekMonth} />

        {phase === "loading" ? (
          <ProgressDashboardLoading />
        ) : phase === "empty" ? (
          <View style={{ flex: 1, minHeight: 400, justifyContent: "center" }}>
            <ProgressDashboardEmpty onAddFirstLog={() => navigation.navigate("AddWeight")} />
          </View>
        ) : phase === "partial" ? (
          <ProgressDashboardPartial />
        ) : (
          <>
            <WeightTrendCard 
              period={weekMonth} 
              onPress={() => navigation.navigate("WeightDetail")} 
            />
            
            <CaloriesWeekCard 
              period={weekMonth} 
              onPress={() => navigation.navigate("CaloriesDetail")} 
            />
            <SummaryStatRow />

            <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate600 }}>Tap charts to explore details</Text>

            <Pressable
              onPress={() => navigation.navigate("ActivityDetail")}
              accessibilityRole="button"
              accessibilityLabel="Activity and steps detail"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 12,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name="run" size={20} color={colors.cyan600} />
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.cyan600 }}>Activity & steps</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.cyan600} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("HealthMetricsDetail")}
              accessibilityRole="button"
              accessibilityLabel="Open body metrics and calorie targets"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name="human-male-height" size={20} color={colors.slate600} />
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.slate700 }}>
                Body metrics & calorie targets
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.slate400} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("AppFlowMap")}
              accessibilityRole="button"
              accessibilityLabel="Open app navigation overview"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name="map-outline" size={18} color={colors.cyan600} />
              <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.cyan600 }}>Navigation overview</Text>
            </Pressable>
          </>
        )}
      </View>
    </Module01Layout>
  );
}
