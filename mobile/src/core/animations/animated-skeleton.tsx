import type { ReactElement } from "react";
import { useEffect } from "react";
import { StyleSheet, View, ViewStyle, DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { colors } from "../../features/module01/theme/tokens";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps): ReactElement {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps): ReactElement {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Skeleton width={100} height={16} />
        <Skeleton width={60} height={16} borderRadius={8} />
      </View>
      <Skeleton width="100%" height={100} borderRadius={12} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Skeleton width="80%" height={14} />
        <Skeleton width="60%" height={14} />
      </View>
    </View>
  );
}

interface SkeletonListItemProps {
  style?: ViewStyle;
}

export function SkeletonListItem({ style }: SkeletonListItemProps): ReactElement {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton width={48} height={48} borderRadius={12} />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={12} />
      </View>
      <Skeleton width={60} height={20} borderRadius={10} />
    </View>
  );
}

interface SkeletonChartProps {
  style?: ViewStyle;
}

export function SkeletonChart({ style }: SkeletonChartProps): ReactElement {
  return (
    <View style={[styles.chart, style]}>
      <View style={styles.chartBars}>
        {[65, 80, 55, 90, 70, 85, 60].map((h, i) => (
          <Skeleton
            key={i}
            width={32}
            height={h}
            borderRadius={4}
          />
        ))}
      </View>
      <View style={styles.chartLabels}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((_, i) => (
          <Skeleton key={i} width={28} height={10} />
        ))}
      </View>
    </View>
  );
}

interface SkeletonStatsRowProps {
  count?: number;
  style?: ViewStyle;
}

export function SkeletonStatsRow({ count = 3, style }: SkeletonStatsRowProps): ReactElement {
  return (
    <View style={[styles.statsRow, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.statItem}>
          <Skeleton width={60} height={12} />
          <Skeleton width={80} height={24} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

interface SkeletonTextProps {
  lines?: number;
  style?: ViewStyle;
}

export function SkeletonText({ lines = 3, style }: SkeletonTextProps): ReactElement {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? "60%" : "100%"}
          height={14}
          style={styles.textLine}
        />
      ))}
    </View>
  );
}

interface ShimmerOverlayProps {
  visible?: boolean;
  children: ReactElement;
}

export function ShimmerOverlay({ visible = true, children }: ShimmerOverlayProps): ReactElement {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [visible, shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-200, 400]);
    return {
      transform: [{ translateX }],
    };
  });

  if (!visible) {
    return children;
  }

  return (
    <View style={styles.shimmerContainer}>
      {children}
      <Animated.View style={[styles.shimmerOverlay, animatedStyle]} />
    </View>
  );
}

interface PulsingDotProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function PulsingDot({
  size = 8,
  color = colors.cyan600,
  style,
}: PulsingDotProps): ReactElement {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const runPulse = (): void => {
      scale.value = withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }, () => {
        scale.value = withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) });
      });
      opacity.value = withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }, () => {
        opacity.value = withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) });
      });
    };

    const interval = setInterval(runPulse, 1600);
    return () => clearInterval(interval);
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulsingDot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.slate200,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardImage: {
    marginVertical: 8,
  },
  cardBody: {
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  listItemContent: {
    flex: 1,
    gap: 6,
  },
  chart: {
    gap: 16,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    gap: 8,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    gap: 8,
  },
  textContainer: {
    gap: 8,
  },
  textLine: {
    marginBottom: 4,
  },
  shimmerContainer: {
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: colors.slate200,
    opacity: 0.3,
  },
  pulsingDot: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});
