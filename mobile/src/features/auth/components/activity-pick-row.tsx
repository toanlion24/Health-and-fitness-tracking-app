import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import type { ActivityLevel } from "../store/onboarding-store";
import { colors, gradients, radii } from "../theme/tokens";
import { font } from "../theme/fonts";

type ActivityRowProps = {
  level: ActivityLevel;
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

export function ActivityPickRow({ level: _level, selected, onSelect, title, subtitle, icon }: ActivityRowProps): ReactElement {
  void _level;
  const h = selected ? 76 : 72;
  const inner = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, flex: 1 }}>
      <MaterialCommunityIcons name={icon} size={24} color={selected ? colors.emerald600 : colors.slate400} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontFamily: selected ? font.bold : font.semibold,
            fontSize: 16,
            color: selected ? colors.slate900 : colors.slate700,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: font.regular,
            fontSize: 12,
            color: selected ? colors.emerald600 : colors.slate400,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );

  if (selected) {
    return (
      <Pressable onPress={onSelect} accessibilityRole="button" accessibilityState={{ selected: true }}>
        <LinearGradient
          colors={[...gradients.logoCircle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radii.cardMd, padding: 2 }}
        >
          <View
            style={{
              height: h,
              borderRadius: radii.cardMd - 2,
              backgroundColor: "#ECFDF5",
              justifyContent: "center",
              shadowColor: "#10B981",
              shadowOpacity: 0.12,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
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
          height: h,
          borderRadius: radii.cardMd,
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
