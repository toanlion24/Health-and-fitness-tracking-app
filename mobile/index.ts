import "react-native-gesture-handler";
import { Alert } from "react-native";
import { registerRootComponent } from "expo";

// Global JS error handler — shows errors as Alert so you can screenshot them
const defaultHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  try {
    Alert.alert(
      isFatal ? "Fatal Error" : "Error",
      String(error?.message || error) + "\n\n" + String(error?.stack || "").slice(0, 500),
    );
  } catch {}
  defaultHandler(error, isFatal);
});

try {
  require("./src/core/i18n");
} catch (e) {
  console.warn("i18n init failed:", e);
}
import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
