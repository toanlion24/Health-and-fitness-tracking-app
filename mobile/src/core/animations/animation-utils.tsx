import type { ReactElement, ReactNode } from "react";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated";

export { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, Easing, interpolate, Extrapolation };
export type { SharedValue };

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const SPRING_CONFIG = {
  button: {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  },
  card: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  sheet: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
} as const;

export function useFadeIn(delayMs = 0): { opacity: SharedValue<number> } {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: ANIMATION_DURATION.slow }));
  }, [delayMs, opacity]);

  return { opacity };
}

export function useSlideInFromBottom(delayMs = 0): {
  translateY: SharedValue<number>;
  opacity: SharedValue<number>;
} {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: ANIMATION_DURATION.normal }));
    translateY.value = withDelay(delayMs, withSpring(0, SPRING_CONFIG.card));
  }, [delayMs, opacity, translateY]);

  return { translateY, opacity };
}

export function useScaleOnPress(): {
  scale: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
} {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, animatedStyle };
}

export function usePressScaleAnimation(
  onPressIn?: () => void,
  onPressOut?: () => void,
): {
  scale: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  handlePressIn: () => void;
  handlePressOut: () => void;
} {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (): void => {
    scale.value = withSpring(0.95, SPRING_CONFIG.button);
    onPressIn?.();
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, SPRING_CONFIG.button);
    onPressOut?.();
  };

  return { scale, animatedStyle, handlePressIn, handlePressOut };
}

export function useStaggeredFadeIn(count: number, baseDelayMs = 0, staggerMs = 80): {
  opacities: SharedValue<number>[];
  animatedStyles: ReturnType<typeof useAnimatedStyle>[];
} {
  const opacities = Array.from({ length: count }, () => useSharedValue(0));
  const animatedStyles = opacities.map((opacity) => {
    return useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));
  });

  useEffect(() => {
    opacities.forEach((opacity, index) => {
      opacity.value = withDelay(baseDelayMs + index * staggerMs, withTiming(1, { duration: ANIMATION_DURATION.normal }));
    });
  }, [baseDelayMs, staggerMs, opacities]);

  return { opacities, animatedStyles };
}

export function useShakeAnimation(): {
  shake: (callback?: () => void) => void;
  translateX: SharedValue<number>;
} {
  const translateX = useSharedValue(0);

  const shake = (callback?: () => void): void => {
    translateX.value = withTiming(-10, { duration: 50 }, () => {
      translateX.value = withTiming(10, { duration: 50 }, () => {
        translateX.value = withTiming(-8, { duration: 50 }, () => {
          translateX.value = withTiming(8, { duration: 50 }, () => {
            translateX.value = withTiming(-4, { duration: 50 }, () => {
              translateX.value = withTiming(4, { duration: 50 }, () => {
                translateX.value = withTiming(0, { duration: 50 }, () => {
                  callback?.();
                });
              });
            });
          });
        });
      });
    });
  };

  return { shake, translateX };
}

interface AnimatedEntryProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: object;
}

export function AnimatedFadeIn({ children, delay = 0, style }: AnimatedEntryProps): ReactElement {
  const { opacity, translateY } = useFadeSlideIn(delay);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

function useFadeSlideIn(delayMs: number): {
  opacity: SharedValue<number>;
  translateY: SharedValue<number>;
} {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: ANIMATION_DURATION.normal }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: ANIMATION_DURATION.normal }));
  }, [delayMs, opacity, translateY]);

  return { opacity, translateY };
}

export function useNumberAnimation(
  from: number,
  to: number,
  durationMs = 800,
  delayMs = 0,
): SharedValue<number> {
  const animatedValue = useSharedValue(from);

  useEffect(() => {
    animatedValue.value = withDelay(delayMs, withTiming(to, { duration: durationMs, easing: Easing.out(Easing.cubic) }));
  }, [from, to, durationMs, delayMs, animatedValue]);

  return animatedValue;
}

export function useProgressAnimation(
  progress: number,
  delayMs = 0,
): {
  width: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
} {
  const width = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  useEffect(() => {
    width.value = withDelay(delayMs, withTiming(progress, { duration: ANIMATION_DURATION.slow }));
  }, [progress, delayMs, width]);

  return { width, animatedStyle };
}
