import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

export type ScreenGradientVariant =
  | "auth"
  | "onboardingMint"
  | "onboardingBlue"
  | "onboardingCyan"
  | "result"
  | "homePremium"
  | "metricsDash"
  | "workoutList"
  | "flowMap"
  | "coachPulse";

const variantColors: Record<ScreenGradientVariant, readonly [string, string, ...string[]]> = {
  auth: ["#F0FDF4", "#EFF6FF", "#ECFEFF"],
  onboardingMint: ["#F8FAFC", "#ECFDF5"],
  onboardingBlue: ["#F8FAFC", "#EFF6FF"],
  onboardingCyan: ["#F8FAFC", "#ECFEFF"],
  result: ["#F0FDF4", "#F8FAFC", "#EFF6FF"],
  homePremium: ["#F8FAFC", "#ECFDF5", "#EFF6FF"],
  metricsDash: ["#F8FAFC", "#ECFEFF"],
  workoutList: ["#F8FAFC", "#F0F9FF", "#ECFEFF"],
  flowMap: ["#F8FAFC", "#ECFEFF"],
  coachPulse: ["#0B1220", "#0F172A"],
};

/** Matches gradient top stop — use behind SafeAreaView so corners stay seamless edge-to-edge */
export const variantSafeAreaBg: Record<ScreenGradientVariant, string> = {
  auth: variantColors.auth[0],
  onboardingMint: variantColors.onboardingMint[0],
  onboardingBlue: variantColors.onboardingBlue[0],
  onboardingCyan: variantColors.onboardingCyan[0],
  result: variantColors.result[0],
  homePremium: variantColors.homePremium[0],
  metricsDash: variantColors.metricsDash[0],
  workoutList: variantColors.workoutList[0],
  flowMap: variantColors.flowMap[0],
  coachPulse: variantColors.coachPulse[0],
};

type PhoneShellProps = {
  variant: ScreenGradientVariant;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PhoneShell({ variant, children, style }: PhoneShellProps): React.ReactElement {
  const colors = variantColors[variant];
  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={{ x: 0.08, y: 0 }}
      end={{ x: 0.92, y: 1 }}
      style={[{ flex: 1, borderRadius: 0, overflow: "hidden" }, style]}
    >
      <View style={{ flex: 1 }}>{children}</View>
    </LinearGradient>
  );
}
