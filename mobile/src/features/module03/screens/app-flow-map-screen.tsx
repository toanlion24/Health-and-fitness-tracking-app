import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { CompositeScreenProps, NavigationProp } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { StackScreenProps } from "@react-navigation/stack";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import type { MainTabParamList } from "../../../core/navigation/main-tab-types";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProgressStackParamList } from "../navigation/progress-stack-types";

type Props = CompositeScreenProps<
  StackScreenProps<ProgressStackParamList, "AppFlowMap">,
  BottomTabScreenProps<MainTabParamList>
>;

function FlowCard(props: {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  onPress: () => void;
}): ReactElement {
  const { title, subtitle, icon, iconColor, onPress } = props;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({
        borderRadius: radii.cardMd,
        borderWidth: 1,
        borderColor: colors.slate200,
        backgroundColor: colors.white,
        paddingVertical: 12,
        paddingHorizontal: 10,
        opacity: pressed ? 0.92 : 1,
        gap: 6,
      })}
    >
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate900 }}>{title}</Text>
      <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500 }}>{subtitle}</Text>
    </Pressable>
  );
}

export function AppFlowMapScreen({ navigation }: Props): ReactElement {
  const goTab = (tab: keyof MainTabParamList): void => {
    const tabNav = navigation as unknown as NavigationProp<MainTabParamList>;
    switch (tab) {
      case "Workout":
        tabNav.navigate("Workout", { screen: "WorkoutList" });
        break;
      case "Nutrition":
        tabNav.navigate("Nutrition", { screen: "NutritionDashboard" });
        break;
      case "Progress":
        tabNav.navigate("Progress", { screen: "MetricsDashboard" });
        break;
      case "Profile":
        tabNav.navigate("Profile", { screen: "SettingsHome" });
        break;
      default:
        break;
    }
  };

  return (
    <Module01Layout variant="flowMap" contentInset={layout.contentPadProgressFlowMap} scrollable>
      <View style={{ width: "100%", gap: 14, flex: 1 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          style={({ pressed }) => ({ alignSelf: "flex-start", opacity: pressed ? 0.7 : 1, flexDirection: "row", alignItems: "center", gap: 6 })}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate900} />
          <Text style={{ fontFamily: font.semibold, fontSize: 15, color: colors.slate700 }}>Back</Text>
        </Pressable>

        <Text style={{ fontFamily: font.extrabold, fontSize: 26, letterSpacing: -0.6, color: colors.slate900 }}>Flow map</Text>
        <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>
          Core app navigation at a glance (same structure as design Module 03).
        </Text>

        <View
          style={{
            borderRadius: radii.pill,
            overflow: "hidden",
            alignSelf: "flex-start",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 10,
              paddingHorizontal: 14,
              backgroundColor: colors.emerald600,
            }}
          >
            <MaterialCommunityIcons name="home-variant-outline" size={16} color={colors.white} />
            <Text style={{ fontFamily: font.bold, fontSize: 12, letterSpacing: 0.5, color: colors.white }}>
              HOME DASHBOARD
            </Text>
          </View>
        </View>

        <MaterialCommunityIcons name="arrow-down" size={18} color={colors.slate400} style={{ alignSelf: "center" }} />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <View style={{ flex: 1, minWidth: "30%" }}>
            <FlowCard
              title="Workout"
              subtitle="List → Detail → Player"
              icon="dumbbell"
              iconColor={colors.emerald600}
              onPress={() => goTab("Workout")}
            />
          </View>
          <View style={{ flex: 1, minWidth: "30%" }}>
            <FlowCard
              title="Nutrition"
              subtitle="Dashboard → Add → Detail"
              icon="food-apple-outline"
              iconColor={colors.orange500}
              onPress={() => goTab("Nutrition")}
            />
          </View>
          <View style={{ flex: 1, minWidth: "30%" }}>
            <FlowCard
              title="Progress"
              subtitle="Overview → Detail → Add"
              icon="chart-line"
              iconColor={colors.sky500}
              onPress={() => goTab("Progress")}
            />
          </View>
        </View>

        <MaterialCommunityIcons name="arrow-down" size={18} color={colors.slate400} style={{ alignSelf: "center" }} />

        <Pressable
          onPress={() => goTab("Profile")}
          style={({ pressed }) => ({
            borderRadius: radii.cardMd,
            borderWidth: 1,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: pressed ? 0.92 : 1,
          })}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>Profile / Settings</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500 }}>Global controls</Text>
        </Pressable>

        <View
          style={{
            borderRadius: radii.cardMd,
            borderWidth: 1,
            borderColor: "#BAE6FD",
            backgroundColor: "#ECFEFF",
            padding: 12,
            gap: 8,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#0369A1" }}>Flow notes</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: "#075985" }}>• Tap card to jump to that tab</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: "#075985", lineHeight: 16 }}>
            • CTAs on workouts and nutrition return here with updated demo data when wired to API
          </Text>
        </View>
      </View>
    </Module01Layout>
  );
}
