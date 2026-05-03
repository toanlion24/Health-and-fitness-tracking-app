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
    id: "push-up",
    name: "Push Up",
    level: "beginner",
    kcal: 80,
    minutes: 12,
    muscle: "Chest",
    setsReps: "3 sets × 12 reps",
    instructions: [
      "Start in a high plank with shoulders over wrists.",
      "Lower your chest while keeping your core tight.",
      "Push back up and fully extend elbows.",
    ],
    tip: "Keep your neck neutral and exhale as you push up.",
    listImageUrl:
      "https://images.unsplash.com/photo-1556261012-3d2e0586697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1634925718611-e0c64b737d16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "squat",
    name: "Squat",
    level: "intermediate",
    kcal: 95,
    minutes: 14,
    muscle: "Legs",
    setsReps: "4 sets × 10 reps",
    instructions: [
      "Stand with feet shoulder-width apart, toes slightly out.",
      "Send hips back and down as if sitting in a chair.",
      "Drive through mid-foot to stand tall.",
    ],
    tip: "Track knees over toes; keep chest proud through the rep.",
    listImageUrl:
      "https://images.unsplash.com/photo-1758274526399-a541ea816be9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1758274526399-a541ea816be9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "plank",
    name: "Plank",
    level: "beginner",
    kcal: 70,
    minutes: 10,
    muscle: "Core",
    setsReps: "3 sets × 45s hold",
    instructions: [
      "Elbows under shoulders, body in a straight line.",
      "Brace glutes and quads; avoid sagging hips.",
      "Breathe steadily for the full hold.",
    ],
    tip: "Slightly tuck the pelvis to keep abs engaged.",
    listImageUrl:
      "https://images.unsplash.com/photo-1758599878908-596c2042f563?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1758599878908-596c2042f563?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "jumping-jack",
    name: "Jumping Jack",
    level: "beginner",
    kcal: 85,
    minutes: 11,
    muscle: "Full Body",
    setsReps: "3 × 60s",
    instructions: [
      "Jump feet out while lifting arms overhead.",
      "Return to start with control.",
      "Keep a soft landing through the balls of your feet.",
    ],
    tip: "Scale to step-jacks if impact is too high.",
    listImageUrl:
      "https://images.unsplash.com/photo-1591901280284-1ff378ecf9bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1591901280284-1ff378ecf9bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "burpees",
    name: "Burpees",
    level: "advanced",
    kcal: 130,
    minutes: 15,
    muscle: "Full Body",
    setsReps: "4 sets × 8 reps",
    instructions: [
      "Drop to hands, jump feet to plank.",
      "Chest touches floor or hover; jump feet to hands.",
      "Explode up with hands overhead.",
    ],
    tip: "Step back instead of jumping if heart rate spikes too fast.",
    listImageUrl:
      "https://images.unsplash.com/photo-1739283180407-21e27d5c0735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1739283180407-21e27d5c0735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    level: "intermediate",
    kcal: 110,
    minutes: 13,
    muscle: "Core",
    setsReps: "3 × 40s",
    instructions: [
      "High plank with wrists under shoulders.",
      "Drive knees toward chest alternately.",
      "Keep hips low and shoulders stacked.",
    ],
    tip: "Slow tempo beats sloppy speed for core engagement.",
    listImageUrl:
      "https://images.unsplash.com/photo-1568486776370-d880b23ace85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1568486776370-d880b23ace85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "lunges",
    name: "Lunges",
    level: "intermediate",
    kcal: 90,
    minutes: 12,
    muscle: "Legs",
    setsReps: "3 sets × 10 reps each leg",
    instructions: [
      "Step forward into 90° angles at both knees.",
      "Drive through front heel to return.",
      "Alternate legs each rep or complete one side.",
    ],
    tip: "Keep torso upright; avoid letting front knee cave inward.",
    listImageUrl:
      "https://images.unsplash.com/photo-1661856791802-4abd55ce1a76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1661856791802-4abd55ce1a76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "sit-up",
    name: "Sit Up",
    level: "beginner",
    kcal: 78,
    minutes: 10,
    muscle: "Abs",
    setsReps: "3 sets × 15 reps",
    instructions: [
      "Hook feet or lie on mat with knees bent.",
      "Curl ribs toward hips with exhale.",
      "Lower with control to protect lower back.",
    ],
    tip: "Avoid yanking the neck — hands light behind ears.",
    listImageUrl:
      "https://images.unsplash.com/photo-1745421276977-e04f57c1ef63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1745421276977-e04f57c1ef63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "high-knees",
    name: "High Knees",
    level: "intermediate",
    kcal: 100,
    minutes: 12,
    muscle: "Cardio",
    setsReps: "4 × 30s",
    instructions: [
      "Run in place driving knees toward chest height.",
      "Pump arms naturally opposite to legs.",
      "Stay tall through the torso.",
    ],
    tip: "Lower knee height before slowing tempo fully.",
    listImageUrl:
      "https://images.unsplash.com/photo-1661856791802-4abd55ce1a76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1661856791802-4abd55ce1a76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "bicycle-crunch",
    name: "Bicycle Crunch",
    level: "intermediate",
    kcal: 88,
    minutes: 11,
    muscle: "Core",
    setsReps: "3 sets × 20 reps",
    instructions: [
      "Lie supine, hands behind ears lightly.",
      "Bring opposite elbow to knee while extending other leg.",
      "Alternate sides in a controlled rhythm.",
    ],
    tip: "Slow rotation beats fast twisting for oblique load.",
    listImageUrl:
      "https://images.unsplash.com/photo-1607429288748-43fbb2d1e74f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    detailHeroUrl:
      "https://images.unsplash.com/photo-1607429288748-43fbb2d1e74f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
