import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import type { Goal } from "../store/module01-store";
import { colors, gradients, radii } from "../theme/tokens";
import { font } from "../theme/fonts";

type GoalPickCardProps = {
  goal: Goal;
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
};

export function GoalPickCard({
  goal: _goal,
  selected,
  onSelect,
  title,
  subtitle,
  icon,
  iconColor,
}: GoalPickCardProps): ReactElement {
  void _goal;
  const inner = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, flex: 1 }}>
      <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            fontFamily: selected ? font.bold : font.semibold,
            fontSize: 18,
            color: selected ? colors.slate900 : colors.slate700,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: selected ? font.semibold : font.regular,
            fontSize: 12,
            color: selected ? colors.emerald600 : colors.slate400,
          }}
        >
          {subtitle}
        </Text>
      </View>
      {selected ? (
        <LinearGradient
          colors={[...gradients.logoCircle]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
        >
          <MaterialCommunityIcons name="check" size={16} color={colors.white} />
        </LinearGradient>
      ) : null}
    </View>
  );

  if (selected) {
    return (
      <Pressable onPress={onSelect} accessibilityRole="button" accessibilityState={{ selected: true }}>
        <LinearGradient
          colors={[...gradients.logoCircle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radii.card, padding: 2 }}
        >
          <View style={{ height: 92, borderRadius: radii.card - 2, backgroundColor: "#ECFDF5", justifyContent: "center" }}>
            {inner}
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onSelect} accessibilityRole="button">
      <View
        style={{
          height: 92,
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: colors.slate200,
          backgroundColor: colors.white,
          justifyContent: "center",
        }}
      >
        {inner}
      </View>
    </Pressable>
  );
}
