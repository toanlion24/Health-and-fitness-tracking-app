import type { ReactElement, ReactNode } from "react";
import { useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { ANIMATION_DURATION, SPRING_CONFIG } from "./animation-utils";

interface AnimatedScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  delay?: number;
  enableSlideIn?: boolean;
}

export function AnimatedScreen({
  children,
  style,
  delay = 0,
  enableSlideIn = true,
}: AnimatedScreenProps): ReactElement {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(enableSlideIn ? 30 : 0);
  const scale = useSharedValue(enableSlideIn ? 0.98 : 1);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_DURATION.slow }));
    if (enableSlideIn) {
      translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG.card));
      scale.value = withDelay(delay, withTiming(1, { duration: ANIMATION_DURATION.slow }));
    }
  }, [delay, enableSlideIn, opacity, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

interface StaggeredListProps {
  children: ReactElement[];
  style?: ViewStyle;
  baseDelay?: number;
  staggerMs?: number;
}

export function StaggeredList({
  children,
  style,
  baseDelay = 100,
  staggerMs = 80,
}: StaggeredListProps): ReactElement {
  return (
    <Animated.View style={[styles.listContainer, style]}>
      {children.map((child, index) => (
        <AnimatedItem
          key={child.key ?? index}
          delay={baseDelay + index * staggerMs}
        >
          {child}
        </AnimatedItem>
      ))}
    </Animated.View>
  );
}

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedItem({ children, delay = 0 }: AnimatedItemProps): ReactElement {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_DURATION.normal }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG.card));
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

interface PulseAnimationProps {
  children: ReactNode;
  active?: boolean;
}

export function PulseAnimation({ children, active = true }: PulseAnimationProps): ReactElement {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (active) {
      const runPulse = (): void => {
        pulse.value = withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }, () => {
          pulse.value = withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) });
        });
      };
      runPulse();
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [active, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    gap: 12,
  },
});
