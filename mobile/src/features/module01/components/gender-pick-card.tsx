import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import type { Gender } from "../store/module01-store";
import { colors, gradients, radii } from "../theme/tokens";
import { font } from "../theme/fonts";

type GenderPickCardProps = {
  gender: Gender;
  active: boolean;
  onSelect: () => void;
  label: string;
  sub: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
};

export function GenderPickCard({
  gender: _gender,
  active,
  onSelect,
  label,
  sub,
  icon,
  iconColor,
}: GenderPickCardProps): ReactElement {
  void _gender;
  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 20,
        minHeight: 88,
        flex: 1,
      }}
    >
      <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            fontFamily: active ? font.bold : font.semibold,
            fontSize: 18,
            color: active ? colors.slate900 : colors.slate700,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: active ? font.semibold : font.regular,
            fontSize: 12,
            color: active ? colors.emerald600 : colors.slate400,
          }}
        >
          {sub}
        </Text>
      </View>
      {active ? (
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

  if (active) {
    return (
      <Pressable onPress={onSelect} accessibilityRole="button" accessibilityState={{ selected: true }}>
        <LinearGradient
          colors={[...gradients.logoCircle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radii.card, padding: 2 }}
        >
          <View
            style={{
              borderRadius: radii.card - 2,
              backgroundColor: colors.white,
              height: 88,
              overflow: "hidden",
            }}
          >
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
          height: 88,
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: colors.slate200,
          backgroundColor: colors.white,
          overflow: "hidden",
        }}
      >
        {inner}
      </View>
    </Pressable>
  );
}
