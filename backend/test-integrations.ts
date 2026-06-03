import { Decimal } from "@prisma/client/runtime/library.js";

async function testNutritionIntegration() {
  console.log("=== Testing Nutrition Integration (Open Food Facts) ===");
  const q = "milk";
  try {
    const url = `https://world.openfoodfacts.org/api/v2/search?q=${encodeURIComponent(
      q,
    )}&fields=product_name,nutriments&page_size=3`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "StudentHealthTrackingApp/1.0 (pogasdace2005@gmail.com)",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = (await response.json()) as any;
    const products = data.products || [];
    console.log(`Successfully fetched ${products.length} products from Open Food Facts.`);

    const mapped = products.map((prod: any) => {
      const name = prod.product_name || "Unknown Product";
      const kcalPerServing = Math.round(prod.nutriments?.["energy-kcal_100g"] ?? 0);
      const proteinG = new Decimal((prod.nutriments?.proteins_100g ?? prod.nutriments?.protein_100g ?? 0).toFixed(2));
      const carbG = new Decimal((prod.nutriments?.carbohydrates_100g ?? 0).toFixed(2));
      const fatG = new Decimal((prod.nutriments?.fat_100g ?? 0).toFixed(2));
      const servingUnit = "100g";

      return {
        name,
        kcalPerServing,
        proteinG: proteinG.toString(),
        carbG: carbG.toString(),
        fatG: fatG.toString(),
        servingUnit,
      };
    });

    console.log("Mapped First Product Sample:", JSON.stringify(mapped[0], null, 2));

    // Verify fields against Expo's expectations:
    // FoodItem: name, kcalPerServing, proteinG, carbG, fatG, servingUnit
    const expoKeys = ["name", "kcalPerServing", "proteinG", "carbG", "fatG", "servingUnit"];
    const item = mapped[0];
    const missing = expoKeys.filter(k => !(k in item));

    if (missing.length === 0) {
      console.log("✅ Nutrition mapping fits the Expo FoodItem schema perfectly!");
    } else {
      console.log("❌ Nutrition mapping is missing Expo fields:", missing);
    }
  } catch (err: any) {
    console.error("❌ Nutrition test failed:", err.message);
  }
}

async function testWgerIntegration() {
  console.log("\n=== Testing Exercise Integration (Wger.de) ===");
  try {
    const url = "https://wger.de/api/v2/exerciseinfo/?language=2&limit=5";
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const jsonResponse = (await response.json()) as any;
    const externalExercises = jsonResponse.results || [];
    console.log(`Successfully fetched ${externalExercises.length} exercises from Wger.`);

    const typeToMet: Record<string, number> = {
      cardio: 7.5,
      strength: 5.0,
      stretching: 2.3,
      plyometrics: 8.0,
      powerlifting: 6.0,
      strongman: 6.0,
      olympic_weightlifting: 6.0,
    };

    const mapped = externalExercises.map((ex: any) => {
      const exName = ex.translations?.[0]?.name || ex.name || "Unknown Exercise";
      const exMuscle = ex.category?.name || "Unknown";
      const exEquipment = ex.equipment?.map((e: any) => e.name).join(", ") || "none";
      const exType = exMuscle.toLowerCase();
      const met = new Decimal((typeToMet[exType] || 5.0).toString());

      return {
        name: exName,
        muscleGroup: exMuscle,
        equipment: exEquipment,
        met: met.toString(),
      };
    });

    console.log("Mapped First Exercise Sample:", JSON.stringify(mapped[0], null, 2));

    // Verify fields against Expo's expectations:
    // ExerciseItem: name, muscleGroup, equipment, met
    const expoKeys = ["name", "muscleGroup", "equipment", "met"];
    const item = mapped[0];
    const missing = expoKeys.filter(k => !(k in item));

    if (missing.length === 0) {
      console.log("✅ Exercise mapping fits the Expo ExerciseItem schema perfectly!");
    } else {
      console.log("❌ Exercise mapping is missing Expo fields:", missing);
    }
  } catch (err: any) {
    console.error("❌ Exercise test failed:", err.message);
  }
}

async function runTests() {
  await testNutritionIntegration();
  await testWgerIntegration();
}

runTests();
