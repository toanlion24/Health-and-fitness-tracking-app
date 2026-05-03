import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { FoodDef } from "../data/nutrition-demo";
import { FOOD_CATALOG } from "../data/nutrition-demo";
import type { NutritionStackScreenProps } from "../navigation/nutrition-stack-types";

type Chip = "all" | "protein" | "lowcal";

const CHIP_LABEL: Record<Chip, string> = {
  all: "All",
  protein: "High protein",
  lowcal: "Low cal",
};

export function NutritionAddFoodScreen({ navigation, route }: NutritionStackScreenProps<"AddFood">): ReactElement {
  const presetMeal = route.params?.presetMeal;
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<Chip>("all");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = FOOD_CATALOG;
    if (chip === "protein") list = list.filter((f) => f.filter === "protein");
    if (chip === "lowcal") list = list.filter((f) => f.filter === "lowcal");
    const q = query.trim().toLowerCase();
    if (q.length > 0) list = list.filter((f) => f.name.toLowerCase().includes(q));
    return list;
  }, [chip, query]);

  const onSearchChange = (text: string): void => {
    setQuery(text);
    if (text.trim().length > 0) {
      setLoading(true);
      setTimeout(() => setLoading(false), 350);
    }
  };

  const openFood = (food: FoodDef): void => {
    navigation.navigate("FoodDetail", { foodId: food.id, targetMeal: presetMeal });
  };

  return (
    <Module01Layout variant="onboardingMint" contentInset={[12, 20, 28, 20]} scrollable={false} keyboardAvoiding keyboardVerticalOffset={0}>
      <View style={{ flex: 1, gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={backBtn}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate900} />
          </Pressable>
          <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.slate900, flex: 1 }}>Add food</Text>
          <Pressable
            onPress={() => navigation.navigate("BarcodeScan")}
            accessibilityRole="button"
            accessibilityLabel="Scan barcode"
            style={backBtn}
          >
            <MaterialCommunityIcons name="barcode-scan" size={22} color={colors.slate900} />
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderRadius: radii.input,
            borderWidth: 1,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            paddingHorizontal: 14,
            minHeight: touch.inputMinHeight,
            ...iosCardShadow,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={22} color={colors.slate400} />
          <TextInput
            value={query}
            onChangeText={onSearchChange}
            placeholder="Search foods…"
            placeholderTextColor={colors.slate400}
            style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: colors.slate900, paddingVertical: 12 }}
            accessibilityLabel="Search foods"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {(Object.keys(CHIP_LABEL) as Chip[]).map((key) => {
            const active = chip === key;
            return (
              <Pressable
                key={key}
                onPress={() => setChip(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => ({
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: active ? colors.emerald600 : colors.white,
                  borderWidth: 1,
                  borderColor: active ? colors.emerald600 : colors.slate200,
                  alignSelf: "center",
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: font.semibold,
                    fontSize: 13,
                    color: active ? colors.white : colors.slate700,
                  }}
                >
                  {CHIP_LABEL[key]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>Suggested</Text>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color={colors.emerald600} />
            <Text style={{ fontFamily: font.medium, fontSize: 14, color: colors.slate500, marginTop: 12 }}>Searching…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ paddingVertical: 32, alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons name="food-off-outline" size={40} color={colors.slate400} />
            <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate700 }}>No matches</Text>
            <Text style={{ fontFamily: font.medium, fontSize: 14, color: colors.slate500, textAlign: "center" }}>
              Try another search or filter.
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
            {filtered.map((food) => (
              <Pressable
                key={food.id}
                onPress={() => openFood(food)}
                accessibilityRole="button"
                accessibilityLabel={`${food.name}, ${food.kcal} calories`}
                style={({ pressed }) => [
                  {
                    borderRadius: radii.cardMd,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.slate200,
                    backgroundColor: colors.white,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    opacity: pressed ? 0.94 : 1,
                    ...iosCardShadow,
                  },
                ]}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: "#ECFDF5",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons name="food-apple" size={24} color={colors.emerald600} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate900 }}>{food.name}</Text>
                  <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.slate500 }}>{food.serving}</Text>
                </View>
                <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>{food.kcal} kcal</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </Module01Layout>
  );
}

const styles = StyleSheet.create({
  /** Horizontal `ScrollView` in a `flex:1` column otherwise stretches children to its full height (tall “pill” chips). */
  chipScroll: {
    flexGrow: 0,
  },
  chipScrollContent: {
    gap: 8,
    paddingBottom: 4,
    alignItems: "center",
  },
});

const backBtn = {
  width: touch.min,
  height: touch.min,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  ...iosCardShadow,
};
