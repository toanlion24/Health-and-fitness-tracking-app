import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, type ReactElement } from "react";
import { ActivityIndicator, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { colors, iosCardShadow, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const DEMO_WEIGHT_KG = [70.4, 70.5, 70.65, 70.85, 70.95, 71.05, 71.2];
export const DEMO_CAL_BAR_H = [42, 68, 58, 74, 64, 84, 56];
export const DEMO_CAL_COLORS = ["#BFDBFE", "#7DD3FC", "#5EEAD4", "#22D3EE", "#38BDF8", "#10B981", "#93C5FD"] as const;

const MONTH_LABELS = ["1", "8", "15", "22", "30"] as const;
export const DEMO_WEIGHT_KG_MONTH = [
  73.2, 73.0, 72.8, 72.9, 72.5, 72.4, 72.6, 72.1, 72.0, 71.8, 
  71.9, 71.5, 71.3, 71.4, 71.0, 70.8, 70.9, 70.5, 70.3, 70.4, 
  70.0, 69.8, 69.9, 69.5, 69.3, 69.4, 69.0, 68.8, 68.9, 68.5
];
export const DEMO_CAL_BAR_H_MONTH = [
  40, 50, 60, 45, 70, 65, 55, 42, 52, 62, 
  47, 72, 67, 57, 44, 54, 64, 49, 74, 69, 
  59, 46, 56, 66, 51, 76, 71, 61, 48, 58
];

export type WeekMonth = "week" | "month";

export function ProgressDashboardHeader(props: {
  weekMonth: WeekMonth;
  onWeekMonthChange: (v: WeekMonth) => void;
}): ReactElement {
  const { weekMonth, onWeekMonthChange } = props;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <Text style={{ fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.8, color: "#0B1A33" }}>Progress</Text>
      <ProgressWeekMonthSegment value={weekMonth} onChange={onWeekMonthChange} />
    </View>
  );
}

export function ProgressWeekMonthSegment(props: {
  value: WeekMonth;
  onChange: (v: WeekMonth) => void;
}): ReactElement {
  const { value, onChange } = props;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.slate200,
        borderRadius: radii.pill,
        padding: 4,
        gap: 6,
      }}
    >
      <Pressable
        onPress={() => onChange("week")}
        accessibilityRole="button"
        accessibilityState={{ selected: value === "week" }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 10,
          backgroundColor: value === "week" ? colors.white : "transparent",
          borderWidth: value === "week" ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.slate200,
        })}
      >
        <Text
          style={{
            fontFamily: value === "week" ? font.bold : font.semibold,
            fontSize: 12,
            color: value === "week" ? colors.slate700 : colors.slate500,
          }}
        >
          Week
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("month")}
        accessibilityRole="button"
        accessibilityState={{ selected: value === "month" }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 10,
          backgroundColor: value === "month" ? colors.white : "transparent",
          borderWidth: value === "month" ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.slate200,
        })}
      >
        <Text
          style={{
            fontFamily: value === "month" ? font.bold : font.semibold,
            fontSize: 12,
            color: value === "month" ? colors.slate700 : colors.slate500,
          }}
        >
          Month
        </Text>
      </Pressable>
    </View>
  );
}

function ChartGrid(props: { height: number }): ReactElement {
  const { height } = props;
  const lines = 3;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: lines }, (_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (height / (lines + 1)) * (i + 1),
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.slate200,
          }}
        />
      ))}
    </View>
  );
}

function LineSegments(props: {
  chartW: number;
  chartH: number;
  values: readonly number[];
}): ReactElement | null {
  const { chartW, chartH, values } = props;
  if (chartW <= 0 || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padY = 14;
  const usableH = chartH - padY * 2;
  const n = values.length;
  const xs = values.map((_, i) => (n === 1 ? chartW / 2 : (i / (n - 1)) * (chartW - 32) + 16));
  const ys = values.map((v) => padY + ((max - v) / (max - min || 1)) * usableH);

  const segments: ReactElement[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const x1 = xs[i] ?? 0;
    const y1 = ys[i] ?? 0;
    const x2 = xs[i + 1] ?? 0;
    const y2 = ys[i + 1] ?? 0;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    segments.push(
      <LinearGradient
        key={`seg-${i}`}
        colors={["#10B981", "#0EA5E9"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: "absolute",
          left: cx - length / 2,
          top: cy - 1.5,
          width: length,
          height: 3,
          borderRadius: 2,
          transform: [{ rotate: `${angle}rad` }],
        }}
      />,
    );
  }

  const lastX = xs[n - 1] ?? 0;
  const lastY = ys[n - 1] ?? 0;
  const lastVal = values[n - 1] ?? 0;

  return (
    <>
      {segments}
      <View
        style={{
          position: "absolute",
          left: lastX - 8,
          top: lastY - 8,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: colors.white,
          borderWidth: 3,
          borderColor: colors.cyan600,
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 8,
          top: 12,
          backgroundColor: colors.slate900,
          paddingVertical: 5,
          paddingHorizontal: 8,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.white }}>{lastVal.toFixed(1)}kg</Text>
      </View>
    </>
  );
}

export function WeightTrendCard(props: {
  period?: WeekMonth;
  onPress?: () => void;
  title?: string;
  chartHeight?: number;
}): ReactElement {
  const { period = "week", title = "Weight trend", chartHeight = 168 } = props;
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent): void => {
    setW(e.nativeEvent.layout.width);
  };

  const isWeek = period === "week";
  const data = isWeek ? DEMO_WEIGHT_KG : DEMO_WEIGHT_KG_MONTH;
  const labels = isWeek ? DAYS : MONTH_LABELS;

  const cardStyle = {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 18,
    gap: 10,
    ...iosCardShadow,
  } as const;

  const body = (
    <>
      <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>
        {isWeek ? title : "Weight trend (30 Days)"}
      </Text>
      <View style={{ height: chartHeight, borderRadius: radii.pill, backgroundColor: colors.slate100, overflow: "hidden" }} onLayout={onLayout}>
        <ChartGrid height={chartHeight} />
        <LineSegments chartW={w} chartH={chartHeight} values={data} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {labels.map((d, index) => (
          <Text key={index} style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>
            {d}
          </Text>
        ))}
      </View>
    </>
  );

  if (props.onPress) {
    return (
      <Pressable
        onPress={props.onPress}
        accessibilityRole="button"
        accessibilityLabel="Weight trend, open details"
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.92 : 1 }]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{body}</View>;
}

export function CaloriesWeekCard(props: { period?: WeekMonth; onPress?: () => void }): ReactElement {
  const { period = "week" } = props;
  const isWeek = period === "week";
  
  const data = isWeek ? DEMO_CAL_BAR_H : DEMO_CAL_BAR_H_MONTH;
  const maxH = Math.max(...data);
  const barMax = 108;
  const cardStyle = {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 18,
    gap: 10,
    ...iosCardShadow,
  } as const;

  const inner = (
    <>
      <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>
        {isWeek ? "Calories this week" : "Calories this month"}
      </Text>
      <View
        style={{
          height: 140,
          borderRadius: radii.pill,
          backgroundColor: colors.slate100,
          padding: 14,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: isWeek ? 8 : 2,
        }}
      >
        {data.map((h, i) => {
          const bh = Math.max(8, (h / maxH) * barMax);
          const isLast = i === data.length - 1;
          
          const barColor = isLast
            ? (["#10B981", "#0EA5E9"] as const)
            : isWeek 
              ? ([DEMO_CAL_COLORS[i] ?? "#93C5FD", DEMO_CAL_COLORS[i] ?? "#93C5FD"] as const)
              : (["#BFDBFE", "#BFDBFE"] as const); 
          return (
            <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <LinearGradient
                colors={barColor}
                style={{
                  width: "100%",
                  height: bh,
                  borderRadius: 5,
                }}
              />
            </View>
          );
        })}
      </View>
    </>
  );

  if (props.onPress) {
    return (
      <Pressable
        onPress={props.onPress}
        accessibilityRole="button"
        accessibilityLabel="Calories, open details"
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.92 : 1 }]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{inner}</View>;
}

export function SummaryStatRow(props: { muted?: boolean }): ReactElement {
  const { muted } = props;
  return (
    <View style={{ flexDirection: "row", gap: 10, opacity: muted ? 0.55 : 1 }}>
      <View
        style={{
          flex: 1,
          borderRadius: radii.btn,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.slate200,
          backgroundColor: colors.white,
          paddingVertical: 12,
          paddingHorizontal: 10,
          gap: 6,
        }}
      >
        <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.slate500 }}>Current</Text>
        <Text style={{ fontFamily: font.extrabold, fontSize: 18, color: colors.slate900 }}>71.2 kg</Text>
      </View>
      <View
        style={{
          flex: 1,
          borderRadius: radii.btn,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.slate200,
          backgroundColor: colors.white,
          paddingVertical: 12,
          paddingHorizontal: 10,
          gap: 6,
        }}
      >
        <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.slate500 }}>Change</Text>
        <Text style={{ fontFamily: font.extrabold, fontSize: 18, color: colors.emerald600 }}>-2.0 kg</Text>
      </View>
      <View
        style={{
          flex: 1,
          borderRadius: radii.btn,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.slate200,
          backgroundColor: colors.white,
          paddingVertical: 12,
          paddingHorizontal: 10,
          gap: 6,
        }}
      >
        <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.slate500 }}>Avg cal</Text>
        <Text style={{ fontFamily: font.extrabold, fontSize: 18, color: colors.slate900 }}>2,045</Text>
      </View>
    </View>
  );
}

export function ProgressDashboardLoading(): ReactElement {
  return (
    <View style={{ width: "100%", gap: 14, flex: 1, alignItems: "center", paddingTop: 24 }}>
      <ActivityIndicator color={colors.cyan600} />
      <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>Loading analytics…</Text>
      <View style={{ width: "100%", gap: 12, marginTop: 8 }}>
        <View style={{ height: 120, borderRadius: radii.card, backgroundColor: colors.slate200, opacity: 0.5 }} />
        <View style={{ height: 120, borderRadius: radii.card, backgroundColor: colors.slate200, opacity: 0.45 }} />
        <View style={{ height: 56, borderRadius: radii.card, backgroundColor: colors.slate200, opacity: 0.4 }} />
      </View>
    </View>
  );
}

export function ProgressDashboardEmpty(props: {
  onAddFirstLog: () => void;
}): ReactElement {
  return (
    <View style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center", gap: 14, paddingVertical: 32 }}>
      <View
        style={{
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: "#ECFEFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name="chart-line-variant" size={42} color={colors.cyan600} />
      </View>
      <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.slate900 }}>No progress data yet</Text>
      <Text
        style={{
          fontFamily: font.semibold,
          fontSize: 13,
          lineHeight: 20,
          color: colors.slate500,
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        Add your first weight entry to start seeing trends.
      </Text>
      <GradientPrimaryButton label="Add first log" onPress={props.onAddFirstLog} height={48} />
    </View>
  );
}

export function ProgressDashboardPartial(): ReactElement {
  return (
    <View style={{ width: "100%", gap: 16, flex: 1, opacity: 0.92 }}>
      <WeightTrendCard />
      <CaloriesWeekCard />
      <SummaryStatRow muted />
    </View>
  );
}