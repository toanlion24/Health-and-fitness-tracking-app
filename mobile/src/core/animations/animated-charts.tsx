import type { ReactElement } from "react";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ANIMATION_DURATION, SPRING_CONFIG } from "./animation-utils";
import { colors, radii } from "../../features/module01/theme/tokens";

interface AnimatedStatCardProps {
  label: string;
  value: string;
  suffix?: string;
  borderColor: string;
  delay?: number;
  onPress?: () => void;
}

export function AnimatedStatCard({
  label,
  value,
  suffix,
  borderColor,
  delay = 0,
}: AnimatedStatCardProps): ReactElement {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_DURATION.normal }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG.card));
    scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG.card));
  }, [delay, opacity, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.statCard, { borderColor }, animatedStyle]}
    >
      <Animated.Text style={styles.statLabel}>{label}</Animated.Text>
      <Animated.Text style={styles.statValue}>{value}</Animated.Text>
      {suffix ? <Animated.Text style={styles.statSuffix}>{suffix}</Animated.Text> : null}
    </Animated.View>
  );
}

interface AnimatedProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  delay?: number;
  animated?: boolean;
}

export function AnimatedProgressBar({
  progress,
  color = colors.cyan600,
  height = 8,
  delay = 0,
  animated = true,
}: AnimatedProgressBarProps): ReactElement {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressValue.value = withDelay(delay, withTiming(progress, {
        duration: ANIMATION_DURATION.slow,
        easing: Easing.out(Easing.cubic),
      }));
    } else {
      progressValue.value = progress;
    }
  }, [progress, delay, animated, progressValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progressValue.value * 100))}%`,
  }));

  return (
    <View style={[styles.progressContainer, { height }]}>
      <Animated.View
        style={[
          styles.progressBar,
          { backgroundColor: color, height },
          animatedStyle,
        ]}
      />
    </View>
  );
}

interface AnimatedBarChartProps {
  data: number[];
  maxValue: number;
  colors?: string[];
  delay?: number;
  barWidth?: number;
  gap?: number;
}

export function AnimatedBarChart({
  data,
  maxValue,
  colors: barColors,
  delay = 0,
  barWidth = 32,
}: AnimatedBarChartProps): ReactElement {
  return (
    <View style={styles.barChartContainer}>
      {data.map((value, index) => {
        const targetHeight = (value / maxValue) * 120;
        const color = barColors?.[index] ?? colors.cyan600;

        return (
          <AnimatedBar
            key={index}
            targetHeight={targetHeight}
            color={color}
            delay={delay + index * 60}
            width={barWidth}
          />
        );
      })}
    </View>
  );
}

interface AnimatedBarProps {
  targetHeight: number;
  color: string;
  delay?: number;
  width?: number;
}

export function AnimatedBar({
  targetHeight,
  color,
  delay = 0,
  width = 32,
}: AnimatedBarProps): ReactElement {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(delay, withSpring(targetHeight, SPRING_CONFIG.card));
  }, [targetHeight, delay, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <View style={[styles.barWrapper, { width }]}>
      <Animated.View style={[styles.bar, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: radii.cardMd,
    padding: 14,
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
  },
  statLabel: {
    fontFamily: "System",
    fontWeight: "700",
    fontSize: 10,
    color: colors.slate400,
  },
  statValue: {
    fontFamily: "System",
    fontWeight: "800",
    fontSize: 20,
    color: colors.white,
  },
  statSuffix: {
    fontFamily: "System",
    fontWeight: "600",
    fontSize: 10,
    color: colors.slate500,
  },
  progressContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    borderRadius: 4,
  },
  barChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 5,
    minHeight: 4,
  },
});
