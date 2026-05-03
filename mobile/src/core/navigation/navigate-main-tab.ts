import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { MainTabParamList } from "./main-tab-types";

/**
 * Navigate to a root tab and optional nested stack screen.
 * Use from any screen whose direct parent navigator is the main bottom tab
 * (e.g. Home / Workout / … stack root), where `navigation.getParent()` is the tab navigator.
 */
export function navigateMainTab(
  navigation: NavigationProp<ParamListBase>,
  tab: keyof MainTabParamList,
  nested?: { screen: string; params?: Record<string, unknown> }
): void {
  const tabNav = navigation.getParent() as NavigationProp<MainTabParamList> | undefined;
  if (!tabNav) {
    return;
  }
  if (nested) {
    tabNav.navigate(tab, { screen: nested.screen, params: nested.params } as never);
  } else {
    tabNav.navigate(tab as never);
  }
}
