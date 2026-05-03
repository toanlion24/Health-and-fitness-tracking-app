import { Platform } from "react-native";

export const colors = {
  slate900: "#0F172A",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  white: "#FFFFFF",
  cyan600: "#0284C7",
  emerald600: "#059669",
  orange500: "#F97316",
  sky500: "#0EA5E9",
  googleBlue: "#4285F4",
};

export const gradients = {
  authScreen: ["#F0FDF4", "#EFF6FF", "#ECFEFF"] as const,
  onboardingMint: ["#F8FAFC", "#ECFDF5"] as const,
  onboardingBlue: ["#F8FAFC", "#EFF6FF"] as const,
  onboardingCyan: ["#F8FAFC", "#ECFEFF"] as const,
  resultScreen: ["#F0FDF4", "#F8FAFC", "#EFF6FF"] as const,
  primaryBtn: ["#059669", "#0284C7"] as const,
  logoCircle: ["#10B981", "#0EA5E9"] as const,
};

/** Soft elevation for cards — reads well on iOS with layered shadows */
export const iosCardShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 14,
      }
    : { elevation: 3 };

export const radii = {
  phone: 40,
  input: 18,
  btn: 20,
  card: 22,
  cardMd: 18,
  pill: 14,
  logo: 24,
};

/** 8pt spacing scale: 8, 16, 24, 32, 40 */
export const space = {
  s1: 8,
  s2: 16,
  s3: 24,
  s4: 32,
  s5: 40,
} as const;

/** Minimum touch targets (HIG) and shared control sizes */
export const touch = {
  min: 44,
  /** HIG minimum 44; comfortable tap + icon row */
  inputMinHeight: 48,
  buttonHeight: 52,
} as const;

export const semantic = {
  error: "#DC2626",
  focusBorder: colors.cyan600,
} as const;

export const layout = {
  statusBarPadH: 28,
  /** Added to content top padding on iOS inside `Module01Layout` (extra air below Dynamic Island / notch). */
  iosTopAir: 12,
  /** Base insets [top, right, bottom, left]; horizontal floored by `contentHorizontalGutter`. SafeAreaView owns notch; these are inner margins. */
  contentPadAuth: [28, 24, 24, 24] as const,
  /** Onboarding steps — top pairs with `iosTopAir` on iOS. */
  contentPadOnboarding: [22, 24, 28, 24] as const,
  /** Result / metrics summaries */
  contentPadResult: [18, 24, 24, 24] as const,
  /**
   * Progress tab → `MetricsDashboard` (`MetricsDashboardScreen`).
   * Aligns with `gui3.pen` Progress — Dashboard — Module: body padding after the (now empty) 62pt status strip.
   * On iOS, `Module01Layout` adds `iosTopAir` on top of index 0; system safe area is separate (SafeAreaView).
   */
  contentPadProgressMetrics: [10, 20, 22, 20] as const,
  /**
   * Progress tab → `AppFlowMap` (`AppFlowMapScreen`). Slightly larger top inset than metrics for the back row + title block.
   */
  contentPadProgressFlowMap: [16, 20, 24, 20] as const,
  /** Progress detail flows (`gui3.pen`: `bp` padding on Weight / Calories / Activity screens). */
  contentPadProgressDetail: [6, 20, 12, 20] as const,
  /** Add weight screen (`gui3.pen`: `bodyA`). */
  contentPadProgressAddWeight: [8, 20, 24, 20] as const,
  /** Profile tab — Settings main (`gui3.pen` Module 07: `etefb` body). */
  contentPadSettingsMain: [10, 20, 22, 20] as const,
  /** Profile tab — settings sub-screens (`gui3.pen`: `bodyA`). */
  contentPadSettingsDetail: [8, 20, 24, 20] as const,
  /** Home tab — dashboard (`gui3.pen`: Home — Dashboard · Premium body rhythm). */
  contentPadHome: [8, 20, 20, 20] as const,
  /** Signup / login hero */
  authLogoSize: 72,
  authHeroMaxCopyWidth: 340,
};

/**
 * Comfortable horizontal margins inside the shell for Apple phones and iPad.
 * SafeAreaView already applies device safe areas; this adds inner breathing room.
 */
export function contentHorizontalGutter(windowWidth: number): number {
  if (windowWidth >= 768) {
    return 40;
  }
  if (windowWidth >= 428) {
    return 32;
  }
  if (windowWidth >= 390) {
    return 28;
  }
  return 24;
}

/** Max width of the gradient shell: readable on iPad without stretching edge-to-edge on phones. */
export function module01ShellMaxWidth(windowWidth: number): number {
  if (windowWidth >= 768) {
    return Math.min(520, windowWidth - 72);
  }
  return Math.min(430, windowWidth - 28);
}
