import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthNavigator } from "./src/core/navigation/auth-navigator";
import { useAuthFonts } from "./src/features/auth/theme/fonts";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AuthNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
