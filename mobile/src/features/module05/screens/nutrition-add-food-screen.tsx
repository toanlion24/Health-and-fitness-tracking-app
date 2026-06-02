import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { NutritionStackScreenProps } from "../navigation/nutrition-stack-types";
import { useNutritionApiStore, getMealLogsByType } from "../store/nutrition-api-store";
import type { MealType, FoodItem } from "../store/nutrition-api-store";

export function NutritionAddFoodScreen({ navigation, route }: NutritionStackScreenProps<"AddFood">): ReactElement {
  const presetMeal = (route.params?.presetMeal ?? "breakfast") as MealType;
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<number | null>(null); // foodId đang được thêm

  const foods = useNutritionApiStore((s) => s.foods);
  const loadingFoods = useNutritionApiStore((s) => s.loadingFoods);
  const fetchFoods = useNutritionApiStore((s) => s.fetchFoods);
  const mealLogs = useNutritionApiStore((s) => s.mealLogs);
  const createMealLog = useNutritionApiStore((s) => s.createMealLog);
  const addFoodToMeal = useNutritionApiStore((s) => s.addFoodToMeal);

  // Debounce search / Load default foods menu
  useEffect(() => {
    if (query.trim().length === 0) {
      void fetchFoods("");
      return;
    }
    if (query.trim().length < 2) return;
    const timer = setTimeout(() => {
      void fetchFoods(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const getMealLogId = async (): Promise<number | null> => {
    const existingLogs = getMealLogsByType(mealLogs, presetMeal);
    if (existingLogs.length > 0) return existingLogs[0]!.id;
    // Tạo meal log mới
    return createMealLog(presetMeal);
  };

  const handleAddFood = async (food: FoodItem): Promise<void> => {
    setAdding(food.id);
    try {
      const mealLogId = await getMealLogId();
      if (!mealLogId) {
        Alert.alert("Error", "Could not create meal log");
        return;
      }
      await addFoodToMeal(mealLogId, food, 1);
      Alert.alert("✅ Added", `${food.name} added to ${presetMeal}!`, [
        { text: "Continue", style: "cancel" },
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Could not add food");
    } finally {
      setAdding(null);
    }
  };

  const mealLabel = presetMeal.charAt(0).toUpperCase() + presetMeal.slice(1);

  return (
    <Module01Layout variant="onboardingMint" contentInset={[12, 20, 28, 20]} scrollable={false} keyboardAvoiding keyboardVerticalOffset={0}>
      <View style={{ flex: 1, gap: 14 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate900} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.slate900 }}>Add food</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>to {mealLabel}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("BarcodeScan")} accessibilityRole="button" accessibilityLabel="Scan barcode" style={backBtn}>
            <MaterialCommunityIcons name="barcode-scan" size={22} color={colors.slate900} />
          </Pressable>
        </View>

        {/* Search box */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, borderRadius: radii.input, borderWidth: 1, borderColor: colors.slate200, backgroundColor: colors.white, paddingHorizontal: 14, minHeight: touch.inputMinHeight, ...iosCardShadow }}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.slate400} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search foods (e.g. chicken breast)..."
            placeholderTextColor={colors.slate400}
            style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: colors.slate900, paddingVertical: 12 }}
            accessibilityLabel="Search foods"
          />
          {loadingFoods && <ActivityIndicator color={colors.emerald600} />}
        </View>

        {/* Results */}
        {query.trim().length >= 2 && !loadingFoods && foods.length === 0 && (
          <View style={{ paddingVertical: 32, alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons name="food-off-outline" size={40} color={colors.slate400} />
            <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate700 }}>No results found</Text>
            <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.slate500, textAlign: "center" }}>
              Try a different search term
            </Text>
          </View>
        )}

        {foods.length > 0 && (
          <>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700, marginVertical: 4 }}>
              {query.trim().length === 0 ? "Menu / Available Foods" : `${foods.length} result${foods.length !== 1 ? "s" : ""}`}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
              {foods.map((food) => (
                <FoodRow key={food.id} food={food} adding={adding === food.id} onAdd={() => void handleAddFood(food)} />
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </Module01Layout>
  );
}

function FoodRow(props: { food: FoodItem; adding: boolean; onAdd: () => void }): ReactElement {
  const { food, adding, onAdd } = props;
  return (
    <View style={{ borderRadius: radii.cardMd, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.slate200, backgroundColor: colors.white, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, ...iosCardShadow }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" }}>
        <MaterialCommunityIcons name="food-apple" size={24} color={colors.emerald600} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>{food.name}</Text>
        <Text style={{ fontFamily: font.medium, fontSize: 12, color: colors.slate500 }}>
          {food.servingUnit ?? "1 serving"}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 2 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: "#6366F1" }}>P {Number(food.proteinG).toFixed(0)}g</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: "#F59E0B" }}>C {Number(food.carbG).toFixed(0)}g</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: "#EF4444" }}>F {Number(food.fatG).toFixed(0)}g</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>{food.kcalPerServing} kcal</Text>
        <Pressable
          onPress={onAdd}
          disabled={adding}
          accessibilityRole="button"
          accessibilityLabel={`Add ${food.name}`}
          style={({ pressed }) => ({
            opacity: pressed || adding ? 0.7 : 1,
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: colors.emerald600,
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          {adding ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <MaterialCommunityIcons name="plus" size={18} color={colors.white} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

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
