import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/core/navigation/app-navigator";
import { registerExpoPushAndSync } from "./src/core/push/register-expo-push";
import { useAuthStore } from "./src/core/store/auth-store";
import { LoadingState } from "./src/core/ui-states/loading-state";

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      void registerExpoPushAndSync();
    }
  }, [user]);

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
