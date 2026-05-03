import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";

export function SettingsSectionTitle(props: { children: string }): ReactElement {
  return (
    <Text
      style={{
        fontFamily: font.extrabold,
        fontSize: 11,
        letterSpacing: 0.6,
        color: colors.slate600,
        marginTop: 4,
      }}
    >
      {props.children}
    </Text>
  );
}

export function SettingsNavRow(props: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  title: string;
  onPress: () => void;
  testID?: string;
}): ReactElement {
  const { icon, iconColor, title, onPress, testID } = props;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 11, flex: 1 }}>
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
        <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>{title}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={16} color={colors.slate400} />
    </Pressable>
  );
}

export function SettingsValueRow(props: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  title: string;
  value: string;
  onPress?: () => void;
}): ReactElement {
  const { icon, iconColor, title, value, onPress } = props;
  const inner = (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 11, flex: 1 }}>
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
        <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>{title}</Text>
      </View>
      <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>{value}</Text>
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${value}`}
        style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.92 : 1 }]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={styles.navRow}>{inner}</View>;
}

export function SettingsDestructiveRow(props: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  onPress: () => void;
}): ReactElement {
  const rose = "#BE123C";
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel={props.title}
      style={({ pressed }) => [styles.logoutRow, { opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <MaterialCommunityIcons name={props.icon} size={18} color={rose} />
        <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: rose }}>{props.title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touch.min,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    ...iosCardShadow,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: touch.min,
    padding: 12,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FECDD3",
    backgroundColor: "#FFF1F2",
  },
});
