/**
 * Centralized image assets and constants.
 * Add local assets to mobile/assets/ and reference them here.
 */

export const Images = {
  // Splash and onboarding
  splashLogo: require("../../../assets/SplashScreen/Rectangle 1.png"),
  welcomeIllustration: require("../../../assets/welcomeScreen/illustration fitness equipments design background.png"),
  welcomeOverlay: require("../../../assets/welcomeScreen/Rectangle 1.png"),

  // Auth screens
  authImage: require("../../../assets/auth-mock/A7y6J.png"),

  // Profile/avatar
  avatar: require("../../../assets/Comprehensive Fitness Assessment/avatar.png"),

  // Coach Kai avatar (fitness coach)
  coachAvatar: require("../../../assets/Comprehensive Fitness Assessment/image1.png"),
  coachHero: require("../../../assets/Comprehensive Fitness Assessment/e39da68eba3636562b5e011a81b3ec2b 1.png"),

  // Fitness equipment/workout images
  workoutHero: require("../../../assets/166a47fe8fbc986a824c5b5734eaa6a9 1.png"),
  workoutCard: require("../../../assets/19b7e46ee1a300a638fb8afbac21f268 1.png"),

  // Nutrition food images (placeholders)
  foodPlaceholder: require("../../../assets/Screen4/download 1.png"),

  // Progress/analytics
  progressHero: require("../../../assets/a6fed9fe585547d27b3ae62ef1bf58f4 1.png"),
} as const;

/**
 * Unsplash image URLs for dynamic/fetchable images.
 * These are free to use with attribution.
 */
export const ImageUrls = {
  // Exercise images (from Unsplash)
  exercises: {
    pushUp: "https://images.unsplash.com/photo-1556261012-3d2e0586697b?w=400&q=80",
    squat: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80",
    plank: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&q=80",
    burpee: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80",
    lunge: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80",
    jumpingJack: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&q=80",
    mountainClimber: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&q=80",
    deadlift: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80",
    benchPress: "https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=400&q=80",
    pullUp: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80",
  },

  // Fitness/coaching avatars (from Unsplash)
  coach: {
    kai: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=80",
    femaleCoach: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&q=80",
  },

  // Nutrition/food images (from Unsplash)
  nutrition: {
    healthyMeal: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    protein: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
    fruits: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80",
    water: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
  },

  // Background/atmospheric images (from Unsplash)
  backgrounds: {
    darkFitness: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    gymAtmosphere: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&q=80",
    outdoorRun: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
    yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  },

  // Achievement/motivation images
  achievements: {
    medal: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=200&q=80",
    trophy: "https://images.unsplash.com/photo-1508050249562-b28a87434496?w=200&q=80",
    fire: "https://images.unsplash.com/photo-1552931028-48a8c67b74ae?w=200&q=80",
  },
} as const;

export type ImageKey = keyof typeof Images;
export type ImageUrlKey = keyof typeof ImageUrls;
