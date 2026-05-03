import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getDeviceLocale, i18n, type AppLocale } from "../i18n";

type LanguageState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: getDeviceLocale(),
      setLocale: (locale) => {
        set({ locale });
        void i18n.changeLanguage(locale);
      },
    }),
    {
      name: "app-language",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state?.locale) {
          void i18n.changeLanguage(state.locale);
        }
      },
    }
  )
);
