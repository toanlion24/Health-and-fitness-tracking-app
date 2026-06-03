import type { ReactElement, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PhoneShell, type ScreenGradientVariant, variantSafeAreaBg } from "./phone-shell";
import { contentHorizontalGutter, layout, space } from "../theme/tokens";

type OnboardingLayoutProps = {
  variant: ScreenGradientVariant;
  children: ReactNode;
  contentInset?: readonly [number, number, number, number];
  scrollable?: boolean;
  /** Use light status-bar symbols on dark backgrounds (e.g. `coachPulse`). */
  statusBarLight?: boolean;
  /** Shifts form content when the keyboard is visible (pair with ScrollView) */
  keyboardAvoiding?: boolean;
  /** Passed to KeyboardAvoidingView (iOS header overlap, etc.) */
  keyboardVerticalOffset?: number;
};

export function OnboardingLayout({
  variant,
  children,
  contentInset = layout.contentPadOnboarding,
  scrollable = true,
  keyboardAvoiding = false,
  keyboardVerticalOffset = 0,
  statusBarLight = false,
}: OnboardingLayoutProps): ReactElement {
  const { width: windowWidth } = useWindowDimensions();
  const [pt, pr, pb, pl] = contentInset;
  const hPad = Math.max(pr, pl, contentHorizontalGutter(windowWidth));
  /** iOS: extra rhythm below safe-area top so headers never crowd the Dynamic Island. */
  const topPad = pt + (Platform.OS === "ios" ? layout.iosTopAir : 0);
  /** Extra scroll tail on iOS so last controls sit comfortably above the home indicator */
  const scrollBottomPad = space.s4 + space.s2 + (Platform.OS === "ios" ? space.s2 : 0);
  const safeBg = variantSafeAreaBg[variant];
  const body = (
    <View style={{ flex: 1, paddingTop: topPad, paddingRight: hPad, paddingBottom: pb, paddingLeft: hPad }}>{children}</View>
  );
  const scrollBody = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: scrollBottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {body}
    </ScrollView>
  ) : (
    body
  );
  const wrapped =
    keyboardAvoiding && scrollable ? (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {scrollBody}
      </KeyboardAvoidingView>
    ) : (
      scrollBody
    );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: safeBg }} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style={statusBarLight ? "light" : "dark"} />
      <View style={{ flex: 1, width: "100%" }}>
        <PhoneShell variant={variant} style={{ flex: 1 }}>
          {wrapped}
        </PhoneShell>
      </View>
    </SafeAreaView>
  );
}
