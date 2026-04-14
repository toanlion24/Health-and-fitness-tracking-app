import type { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appTheme } from "../theme/app-theme";

type ChromeProps = { children: ReactNode };

/** Safe area + app background. Use under FlatList or custom layouts. */
export function ScreenChrome({ children }: ChromeProps) {
  return (
    <SafeAreaView style={styles.chrome} edges={["left", "right", "bottom"]}>
      {children}
    </SafeAreaView>
  );
}

type ScrollProps = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
} & Pick<ScrollViewProps, "keyboardShouldPersistTaps">;

/** Scrollable screen with padding + optional pull-to-refresh. */
export function ScreenScroll({
  children,
  refreshing = false,
  onRefresh,
  keyboardShouldPersistTaps = "handled",
}: ScrollProps) {
  return (
    <ScreenChrome>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  chrome: {
    flex: 1,
    backgroundColor: appTheme.colors.bg,
  },
  scroll: { flex: 1 },
  scrollInner: {
    padding: appTheme.space.md,
    paddingBottom: appTheme.space.xl,
  },
});
