/**
 * Dev-only seed: one user you can use to sign in on mobile/web.
 * Run from backend/: `npm run db:seed` (requires DATABASE_URL + migrations applied).
 *
 * Credentials (do not use in production):
 *   Email:    dev@local.test
 *   Password: DevPass12345
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const DEV_EMAIL = "dev@local.test";
const DEV_PASSWORD = "DevPass12345";
const BCRYPT_ROUNDS = 12;

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, BCRYPT_ROUNDS);

  // 1. Seed dev user
  await prisma.user.upsert({
    where: { email: DEV_EMAIL },
    create: {
      email: DEV_EMAIL,
      passwordHash,
      profile: { create: {} },
    },
    update: {
      passwordHash,
      status: "active",
    },
  });
  console.log(`Seed User OK: sign in with email "${DEV_EMAIL}" and password "${DEV_PASSWORD}"`);

  // 2. Seed default popular Foods (English & Vietnamese)
  console.log("Checking and seeding food catalog...");
  const defaultFoods = [
    {
      name: "Cơm trắng (Cooked white rice)",
      kcalPerServing: 130,
      proteinG: new Decimal("2.70"),
      carbG: new Decimal("28.00"),
      fatG: new Decimal("0.30"),
      servingUnit: "100g",
    },
    {
      name: "Ức gà phi lê (Chicken breast)",
      kcalPerServing: 165,
      proteinG: new Decimal("31.00"),
      carbG: new Decimal("0.00"),
      fatG: new Decimal("3.60"),
      servingUnit: "100g",
    },
    {
      name: "Trứng gà luộc (Boiled egg)",
      kcalPerServing: 155,
      proteinG: new Decimal("13.00"),
      carbG: new Decimal("1.10"),
      fatG: new Decimal("11.00"),
      servingUnit: "100g",
    },
    {
      name: "Sữa tươi không đường (Unsweetened milk)",
      kcalPerServing: 62,
      proteinG: new Decimal("3.20"),
      carbG: new Decimal("4.80"),
      fatG: new Decimal("3.30"),
      servingUnit: "100ml",
    },
    {
      name: "Chuối chín (Banana)",
      kcalPerServing: 89,
      proteinG: new Decimal("1.10"),
      carbG: new Decimal("22.80"),
      fatG: new Decimal("0.30"),
      servingUnit: "100g",
    },
    {
      name: "Táo đỏ (Apple)",
      kcalPerServing: 52,
      proteinG: new Decimal("0.30"),
      carbG: new Decimal("13.80"),
      fatG: new Decimal("0.20"),
      servingUnit: "100g",
    },
    {
      name: "Thịt bò thăn (Beef tenderloin)",
      kcalPerServing: 250,
      proteinG: new Decimal("26.00"),
      carbG: new Decimal("0.00"),
      fatG: new Decimal("15.00"),
      servingUnit: "100g",
    },
    {
      name: "Cá hồi phi lê (Salmon fillet)",
      kcalPerServing: 208,
      proteinG: new Decimal("20.00"),
      carbG: new Decimal("0.00"),
      fatG: new Decimal("13.00"),
      servingUnit: "100g",
    },
    {
      name: "Bánh mì gối (Sliced white bread)",
      kcalPerServing: 265,
      proteinG: new Decimal("9.00"),
      carbG: new Decimal("49.00"),
      fatG: new Decimal("3.20"),
      servingUnit: "100g",
    },
    {
      name: "Bơ chín (Avocado)",
      kcalPerServing: 160,
      proteinG: new Decimal("2.00"),
      carbG: new Decimal("8.50"),
      fatG: new Decimal("14.70"),
      servingUnit: "100g",
    },
    {
      name: "Phở bò (Beef Pho)",
      kcalPerServing: 350,
      proteinG: new Decimal("18.00"),
      carbG: new Decimal("52.00"),
      fatG: new Decimal("7.50"),
      servingUnit: "1 bowl",
    },
    {
      name: "Bánh mì Việt Nam (Vietnamese Banh Mi)",
      kcalPerServing: 400,
      proteinG: new Decimal("12.50"),
      carbG: new Decimal("58.00"),
      fatG: new Decimal("14.00"),
      servingUnit: "1 loaf",
    },
    {
      name: "Bún chả (Vietnamese Bun cha)",
      kcalPerServing: 390,
      proteinG: new Decimal("16.00"),
      carbG: new Decimal("55.00"),
      fatG: new Decimal("12.00"),
      servingUnit: "1 serving",
    },
    {
      name: "Bún bò Huế (Beef noodle soup Hue)",
      kcalPerServing: 450,
      proteinG: new Decimal("22.00"),
      carbG: new Decimal("60.00"),
      fatG: new Decimal("14.00"),
      servingUnit: "1 bowl",
    },
    {
      name: "Gỏi cuốn tôm thịt (Fresh spring rolls)",
      kcalPerServing: 60,
      proteinG: new Decimal("4.50"),
      carbG: new Decimal("8.00"),
      fatG: new Decimal("1.20"),
      servingUnit: "1 piece",
    },
    {
      name: "Hủ tiếu Nam Vang (Hu Tieu)",
      kcalPerServing: 400,
      proteinG: new Decimal("18.00"),
      carbG: new Decimal("58.00"),
      fatG: new Decimal("10.00"),
      servingUnit: "1 bowl",
    },
    {
      name: "Bánh xèo (Savory crepe)",
      kcalPerServing: 350,
      proteinG: new Decimal("12.00"),
      carbG: new Decimal("45.00"),
      fatG: new Decimal("14.00"),
      servingUnit: "1 serving",
    },
    {
      name: "Cá thu sốt cà chua (Tomato Mackerel)",
      kcalPerServing: 180,
      proteinG: new Decimal("18.50"),
      carbG: new Decimal("3.00"),
      fatG: new Decimal("10.50"),
      servingUnit: "100g",
    },
    {
      name: "Thịt kho tàu (Caramelized pork and eggs)",
      kcalPerServing: 320,
      proteinG: new Decimal("15.00"),
      carbG: new Decimal("5.00"),
      fatG: new Decimal("26.00"),
      servingUnit: "100g",
    },
    {
      name: "Rau muống xào tỏi (Stir-fried water spinach)",
      kcalPerServing: 65,
      proteinG: new Decimal("2.50"),
      carbG: new Decimal("4.50"),
      fatG: new Decimal("4.20"),
      servingUnit: "100g",
    },
    {
      name: "Canh chua cá lóc (Snakehead fish sour soup)",
      kcalPerServing: 120,
      proteinG: new Decimal("12.00"),
      carbG: new Decimal("8.50"),
      fatG: new Decimal("4.00"),
      servingUnit: "1 bowl",
    },
    {
      name: "Chả giò chiên (Fried spring roll)",
      kcalPerServing: 150,
      proteinG: new Decimal("6.00"),
      carbG: new Decimal("15.00"),
      fatG: new Decimal("7.50"),
      servingUnit: "1 piece",
    },
    {
      name: "Đậu hũ sốt cà chua (Tofu with tomato sauce)",
      kcalPerServing: 110,
      proteinG: new Decimal("8.00"),
      carbG: new Decimal("6.00"),
      fatG: new Decimal("6.50"),
      servingUnit: "100g",
    },
    {
      name: "Cá lóc kho tộ (Claypot snakehead fish)",
      kcalPerServing: 135,
      proteinG: new Decimal("19.00"),
      carbG: new Decimal("2.00"),
      fatG: new Decimal("5.50"),
      servingUnit: "100g",
    },
    {
      name: "Cháo lòng (Pork offal porridge)",
      kcalPerServing: 320,
      proteinG: new Decimal("14.00"),
      carbG: new Decimal("42.00"),
      fatG: new Decimal("10.50"),
      servingUnit: "1 bowl",
    },
    {
      name: "Hạt óc chó (Walnuts)",
      kcalPerServing: 654,
      proteinG: new Decimal("15.20"),
      carbG: new Decimal("13.70"),
      fatG: new Decimal("65.20"),
      servingUnit: "100g",
    },
    {
      name: "Hạt hạnh nhân (Almonds)",
      kcalPerServing: 579,
      proteinG: new Decimal("21.20"),
      carbG: new Decimal("21.60"),
      fatG: new Decimal("49.90"),
      servingUnit: "100g",
    },
    {
      name: "Ức vịt nướng (Grilled duck breast)",
      kcalPerServing: 220,
      proteinG: new Decimal("20.00"),
      carbG: new Decimal("0.00"),
      fatG: new Decimal("15.00"),
      servingUnit: "100g",
    },
    {
      name: "Khoai lang luộc (Boiled sweet potato)",
      kcalPerServing: 86,
      proteinG: new Decimal("1.60"),
      carbG: new Decimal("20.10"),
      fatG: new Decimal("0.10"),
      servingUnit: "100g",
    },
    {
      name: "Khoai tây nghiền (Mashed potatoes)",
      kcalPerServing: 88,
      proteinG: new Decimal("2.00"),
      carbG: new Decimal("15.00"),
      fatG: new Decimal("2.50"),
      servingUnit: "100g",
    },
    {
      name: "Sữa chua Hy Lạp (Greek yogurt)",
      kcalPerServing: 97,
      proteinG: new Decimal("9.00"),
      carbG: new Decimal("4.00"),
      fatG: new Decimal("5.00"),
      servingUnit: "100g",
    },
    {
      name: "Hạt chia (Chia seeds)",
      kcalPerServing: 486,
      proteinG: new Decimal("16.50"),
      carbG: new Decimal("42.10"),
      fatG: new Decimal("30.70"),
      servingUnit: "100g",
    },
    {
      name: "Cá ngừ ngâm dầu (Canned tuna in oil)",
      kcalPerServing: 186,
      proteinG: new Decimal("26.50"),
      carbG: new Decimal("0.00"),
      fatG: new Decimal("8.20"),
      servingUnit: "100g",
    },
    {
      name: "Sinh tố bơ (Avocado smoothie)",
      kcalPerServing: 240,
      proteinG: new Decimal("3.50"),
      carbG: new Decimal("35.00"),
      fatG: new Decimal("10.00"),
      servingUnit: "1 glass",
    },
    {
      name: "Nước ép cam nguyên chất (Fresh orange juice)",
      kcalPerServing: 45,
      proteinG: new Decimal("0.70"),
      carbG: new Decimal("10.40"),
      fatG: new Decimal("0.20"),
      servingUnit: "100ml",
    },
    {
      name: "Hạt điều rang muối (Roasted cashews)",
      kcalPerServing: 553,
      proteinG: new Decimal("18.20"),
      carbG: new Decimal("30.20"),
      fatG: new Decimal("43.80"),
      servingUnit: "100g",
    },
    {
      name: "Thịt bò xào bông cải (Beef stir-fried broccoli)",
      kcalPerServing: 140,
      proteinG: new Decimal("12.00"),
      carbG: new Decimal("6.00"),
      fatG: new Decimal("7.50"),
      servingUnit: "100g",
    },
    {
      name: "Canh bí đỏ thịt bằm (Pumpkin minced pork soup)",
      kcalPerServing: 95,
      proteinG: new Decimal("6.50"),
      carbG: new Decimal("10.00"),
      fatG: new Decimal("3.50"),
      servingUnit: "1 bowl",
    },
    {
      name: "Mì Ý sốt bò bằm (Spaghetti Bolognese)",
      kcalPerServing: 330,
      proteinG: new Decimal("14.50"),
      carbG: new Decimal("46.00"),
      fatG: new Decimal("9.50"),
      servingUnit: "1 plate",
    },
    {
      name: "Trà sữa trân châu (Pearl Milk Tea)",
      kcalPerServing: 360,
      proteinG: new Decimal("3.00"),
      carbG: new Decimal("68.00"),
      fatG: new Decimal("8.50"),
      servingUnit: "1 cup",
    },
  ];

  let foodSeededCount = 0;
  for (const food of defaultFoods) {
    const existing = await prisma.foodCatalog.findFirst({
      where: { name: food.name },
    });
    if (!existing) {
      await prisma.foodCatalog.create({
        data: {
          ...food,
          userId: null,
        },
      });
      foodSeededCount++;
    }
  }
  console.log(`Seeding Food Catalog OK: Added ${foodSeededCount} popular foods.`);

  // 3. Seed default popular Exercises (wger API fallbacks)
  console.log("Checking and seeding exercise catalog...");
  const defaultExercises = [
    {
      name: "Push-up",
      muscleGroup: "Chest",
      equipment: "Bodyweight",
      met: new Decimal("4.00"),
    },
    {
      name: "Bodyweight Squat",
      muscleGroup: "Quads",
      equipment: "Bodyweight",
      met: new Decimal("5.00"),
    },
    {
      name: "Pull-up",
      muscleGroup: "Back",
      equipment: "Pull-up bar",
      met: new Decimal("6.00"),
    },
    {
      name: "Plank",
      muscleGroup: "Core",
      equipment: "Bodyweight",
      met: new Decimal("2.80"),
    },
    {
      name: "Barbell Bench Press",
      muscleGroup: "Chest",
      equipment: "Barbell, Bench",
      met: new Decimal("5.50"),
    },
    {
      name: "Deadlift",
      muscleGroup: "Hamstrings, Back",
      equipment: "Barbell",
      met: new Decimal("6.00"),
    },
    {
      name: "Treadmill Running",
      muscleGroup: "Cardio",
      equipment: "Treadmill",
      met: new Decimal("8.00"),
    },
  ];

  let exerciseSeededCount = 0;
  for (const ex of defaultExercises) {
    const existing = await prisma.exerciseCatalog.findFirst({
      where: { name: ex.name },
    });
    if (!existing) {
      await prisma.exerciseCatalog.create({
        data: ex,
      });
      exerciseSeededCount++;
    }
  }
  console.log(`Seeding Exercise Catalog OK: Added ${exerciseSeededCount} exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
