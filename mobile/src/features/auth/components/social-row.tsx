import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import { font } from "../theme/fonts";
import { colors, space } from "../theme/tokens";
import { SocialButton } from "./social-button";

type SocialRowProps = {
  onApple?: () => void;
  onGoogle?: () => void;
};

export function SocialRow({ onApple, onGoogle }: SocialRowProps): ReactElement {
  return (
    <View style={styles.row} accessibilityLabel="Sign in with a social account">
      <SocialButton variant="apple" onPress={onApple} testID="social-apple" />
      <SocialButton variant="google" onPress={onGoogle} testID="social-google" />
    </View>
  );
}

const lineColor = colors.slate200;

export function OrDivider(): ReactElement {
  return (
    <View
      style={styles.dividerWrap}
      accessibilityRole="text"
      accessibilityLabel="or continue with"
    >
      <View style={styles.line} />
      <Text style={styles.dividerLabel}>or continue with</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    gap: space.s2,
  },
  dividerWrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: space.s2,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: lineColor,
  },
  dividerLabel: {
    fontFamily: font.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.slate500,
  },
});
