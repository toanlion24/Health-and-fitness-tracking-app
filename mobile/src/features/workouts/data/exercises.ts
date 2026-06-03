export type ExerciseLevel = "beginner" | "intermediate" | "advanced";

export type Exercise = {
  id: string;
  name: string;
  level: ExerciseLevel;
  kcal: number;
  minutes: number;
  muscle: string;
  setsReps: string;
  instructions: string[];
  tip: string;
  listImageUrl: string;
  detailHeroUrl: string;
};

export const EXERCISES: Exercise[] = [
  {
    id: "barbell-squat",
    name: "Barbell Squat",
    level: "intermediate",
    kcal: 120,
    minutes: 15,
    muscle: "Legs",
    setsReps: "4 sets × 8 reps",
    instructions: [
      "Place the barbell on your upper back (traps), feet shoulder-width apart.",
      "Lower your hips down and back, keeping your knees in line with your toes.",
      "Drive through your heels to return to the starting position."
    ],
    tip: "Keep your chest up and your core braced throughout the movement.",
    listImageUrl:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "bench-press",
    name: "Bench Press",
    level: "intermediate",
    kcal: 110,
    minutes: 12,
    muscle: "Chest",
    setsReps: "4 sets × 10 reps",
    instructions: [
      "Lie flat on the bench, feet flat on the floor, grip the bar slightly wider than shoulder-width.",
      "Unrack the bar and lower it with control to your mid-chest.",
      "Push the bar back up until your arms are fully extended."
    ],
    tip: "Keep your shoulder blades retracted and feet anchored to the floor.",
    listImageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    level: "advanced",
    kcal: 150,
    minutes: 15,
    muscle: "Back",
    setsReps: "3 sets × 5 reps",
    instructions: [
      "Stand with mid-foot under the barbell, bend and grip the bar with a shoulder-width grip.",
      "Keep your back flat, drop your hips slightly, and brace your core.",
      "Drive through your legs and pull the bar up along your shins to a standing position."
    ],
    tip: "Do not let your back round; keep the bar close to your body.",
    listImageUrl:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "pull-up",
    name: "Pull-up",
    level: "intermediate",
    kcal: 100,
    minutes: 10,
    muscle: "Back",
    setsReps: "3 sets × 8 reps",
    instructions: [
      "Grip the pull-up bar with hands wider than shoulder-width, palms facing away.",
      "Hang with arms straight, then pull your chest up toward the bar.",
      "Lower yourself back down with control to a dead hang."
    ],
    tip: "Engage your lats first and avoid swinging your body.",
    listImageUrl:
      "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "overhead-press",
    name: "Overhead Press",
    level: "intermediate",
    kcal: 95,
    minutes: 12,
    muscle: "Shoulders",
    setsReps: "4 sets × 8 reps",
    instructions: [
      "Stand with feet shoulder-width apart, rest the barbell on your front shoulders.",
      "Press the bar overhead in a straight line, racking your head forward at the top.",
      "Lower the bar back to your collarbone with control."
    ],
    tip: "Squeeze your glutes and brace your core to prevent arching your lower back.",
    listImageUrl:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

