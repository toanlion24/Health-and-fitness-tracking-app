import { Component } from "react";
import type { ReactElement, ReactNode, ErrorInfo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthNavigator } from "./src/core/navigation/auth-navigator";
import { useAuthFonts } from "./src/features/auth/theme/fonts";

// ─── Error Boundary ──────────────────────────────────────────────────────────
type EBState = { hasError: boolean; error: Error | null };

class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: "#0F172A", padding: 24, justifyContent: "center" }}>
          <Text style={{ color: "#EF4444", fontSize: 20, fontWeight: "800", marginBottom: 12 }}>
            App Error
          </Text>
          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={{ color: "#F1F5F9", fontSize: 13, lineHeight: 19 }}>
              {String(this.state.error?.message || "Unknown error")}
            </Text>
            <Text style={{ color: "#64748B", fontSize: 11, lineHeight: 16, marginTop: 12 }}>
              {String(this.state.error?.stack || "").slice(0, 800)}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App(): ReactElement {
  const { t } = useTranslation();
  const fontsLoaded = useAuthFonts();
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator accessibilityLabel={t("a11y.loadingFonts")} />
      </View>
    );
  }
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AuthNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
