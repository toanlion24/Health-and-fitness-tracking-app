import type { ReactElement } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme/tokens";
import { font } from "../theme/fonts";

type OnboardingHeaderProps = {
  stepLabel: string;
  onBack?: () => void;
};

export function OnboardingHeader({ stepLabel, onBack }: OnboardingHeaderProps): ReactElement {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center" }}
      >
        <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
      </Pressable>
      <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>{stepLabel}</Text>
      <View style={{ width: 28, height: 28 }} />
    </View>
  );
}
