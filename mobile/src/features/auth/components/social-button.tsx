import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { font } from "../theme/fonts";
import { colors, radii, space, touch } from "../theme/tokens";

export type SocialVariant = "apple" | "google";

type SocialButtonProps = {
  variant: SocialVariant;
  onPress?: () => void;
  testID?: string;
};

const LABELS: Record<SocialVariant, string> = {
  apple: "Continue with Apple",
  google: "Continue with Google",
};

export function SocialButton({ variant, onPress, testID }: SocialButtonProps): ReactElement {
  const label = LABELS[variant];
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={
        Platform.OS === "android"
          ? { color: variant === "apple" ? colors.slate600 : colors.slate200 }
          : undefined
      }
      style={({ pressed }) => [
        styles.base,
        variant === "apple" ? styles.apple : styles.google,
        pressed && styles.pressed,
      ]}
    >
      {variant === "apple" ? (
        <>
          <MaterialCommunityIcons name="apple" size={22} color={colors.white} />
          <Text style={styles.labelApple}>Apple</Text>
        </>
      ) : (
        <>
          <View style={styles.googleMark}>
            <Text style={styles.googleMarkText}>G</Text>
          </View>
          <Text style={styles.labelGoogle}>Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    minHeight: touch.buttonHeight,
    borderRadius: radii.btn,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.s2,
    paddingHorizontal: touch.min,
  },
  apple: {
    backgroundColor: colors.slate900,
  },
  google: {
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.slate200,
  },
  pressed: {
    opacity: 0.9,
  },
  labelApple: {
    fontFamily: font.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
  },
  labelGoogle: {
    fontFamily: font.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.slate700,
  },
  googleMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.googleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  googleMarkText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.white,
  },
});
