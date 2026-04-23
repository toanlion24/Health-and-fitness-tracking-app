import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiFetch } from "../api/client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function platformLabel(): "ios" | "android" | "web" {
  if (Platform.OS === "ios") {
    return "ios";
  }
  if (Platform.OS === "android") {
    return "android";
  }
  return "web";
}

/**
 * Requests notification permission and registers the Expo push token with the API.
 * No-ops on failure (simulator, web, or denied permission).
 */
export async function registerExpoPushAndSync(): Promise<void> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    if (final !== "granted") {
      return;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenResponse.data;

    await apiFetch<{ ok: true }>("/api/v1/me/device-tokens", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        expoPushToken,
        platform: platformLabel(),
      }),
    });
  } catch {
    // Physical device + EAS project may be required for a valid token.
  }
}
