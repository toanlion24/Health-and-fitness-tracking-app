import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import vi from "./locales/vi.json";

export type AppLocale = "en" | "vi";

export function getDeviceLocale(): AppLocale {
  try {
    const code = Localization.getLocales()[0]?.languageCode;
    return code === "vi" ? "vi" : "en";
  } catch {
    return "en";
  }
}

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: getDeviceLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export { i18n };
