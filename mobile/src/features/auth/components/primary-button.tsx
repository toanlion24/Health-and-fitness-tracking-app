import type { ReactElement } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { font } from "../theme/fonts";
import { colors, gradients, radii, touch } from "../theme/tokens";

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Defaults to shared `touch.buttonHeight` for parity with social controls */
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  minHeight = touch.buttonHeight,
  style,
  testID,
}: PrimaryButtonProps): ReactElement {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.pressable,
        { minHeight },
        disabled ? styles.pressableDisabled : pressed && styles.pressablePressed,
        style,
      ]}
    >
      <LinearGradient
        colors={[...gradients.primaryBtn]}
        start={{ x: 0.02, y: 0.5 }}
        end={{ x: 0.98, y: 0.5 }}
        style={[styles.gradient, { minHeight }]}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    borderRadius: radii.btn,
    overflow: "hidden",
  },
  pressablePressed: {
    opacity: 0.92,
  },
  pressableDisabled: {
    opacity: 0.45,
  },
  gradient: {
    borderRadius: radii.btn,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: touch.min,
  },
  label: {
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.white,
  },
});
