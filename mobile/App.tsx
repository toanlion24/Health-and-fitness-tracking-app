import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/core/navigation/app-navigator";
import { useAuthStore } from "./src/core/store/auth-store";
import { LoadingState } from "./src/core/ui-states/loading-state";

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {status === "loading" ? (
        <LoadingState message="Starting..." />
      ) : (
        <AppNavigator />
      )}
    </SafeAreaProvider>
  );
}
