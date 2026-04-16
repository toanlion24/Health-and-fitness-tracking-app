# Entity–Relationship diagram (MySQL / Prisma)

Nguồn sự thật: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma). Tên bảng và cột dưới đây khớp `@@map` / `@map` trong Prisma.

## Enum (MySQL)

| Enum | Giá trị |
|------|---------|
| `UserStatus` | `active`, `locked` |
| `MealType` | `breakfast`, `lunch`, `dinner`, `snack` |
| `WorkoutSessionStatus` | `in_progress`, `completed` |

## Mermaid ER (đầy đủ field)

Render: GitHub/GitLab, VS Code (Mermaid preview), hoặc [mermaid.live](https://mermaid.live).

```mermaid
erDiagram
  users ||--o| user_profiles : "1:1"
  users ||--o{ user_goals : "1:n"
  users ||--o{ refresh_tokens : "1:n"
  users ||--o{ workout_plans : "1:n"
  users ||--o{ workout_sessions : "1:n"
  users ||--o{ meal_logs : "1:n"
  users ||--o{ body_metric_logs : "1:n"
  users ||--o{ food_catalog : "1:n custom foods"

  exercise_catalog ||--o{ workout_plan_exercises : "1:n"
  workout_plans ||--o{ workout_plan_exercises : "1:n"

  workout_plans ||--o{ workout_sessions : "optional template"
  users ||--o{ workout_sessions : "owner"

  workout_sessions ||--o{ workout_session_sets : "1:n"
  exercise_catalog ||--o{ workout_session_sets : "exercise ref"

  meal_logs ||--o{ meal_log_items : "1:n"
  food_catalog ||--o{ meal_log_items : "optional food ref"

  users {
    int id PK
    varchar_255 email UK "UNIQUE"
    varchar_255 password_hash
    enum status "UserStatus active locked"
    datetime created_at
    datetime updated_at
  }

  user_profiles {
    int user_id PK "PK FK to users.id"
    varchar_255 full_name "nullable"
    varchar_32 gender "nullable"
    date dob "nullable"
    decimal_6_2 height_cm "nullable"
    varchar_64 activity_level "nullable"
    varchar_64 timezone "nullable"
    varchar_16 locale "nullable"
  }

  user_goals {
    int id PK
    int user_id FK "FK users.id"
    varchar_32 goal_type
    decimal_6_2 target_weight_kg "nullable"
    int weekly_workout_target "nullable"
    int daily_kcal_target "nullable"
    date start_date "nullable"
    date target_date "nullable"
    boolean is_active
  }

  refresh_tokens {
    int id PK
    int user_id FK "FK users.id"
    varchar_255 token_hash
    datetime expires_at
    datetime created_at
  }

  exercise_catalog {
    int id PK
    varchar_255 name
    varchar_128 muscle_group "nullable"
    varchar_128 equipment "nullable"
    decimal_5_2 met "nullable"
    datetime created_at
  }

  workout_plans {
    int id PK
    int user_id FK "FK users.id"
    varchar_255 name
    varchar_512 description "nullable"
    datetime created_at
    datetime updated_at
  }

  workout_plan_exercises {
    int id PK
    int plan_id FK "FK workout_plans.id"
    int exercise_id FK "FK exercise_catalog.id"
    int sort_order
    int target_sets "nullable"
    int target_reps "nullable"
    decimal_8_2 target_weight_kg "nullable"
    int rest_sec "nullable"
  }

  workout_sessions {
    int id PK
    int user_id FK "FK users.id"
    int plan_id FK "nullable SET NULL on plan delete"
    date session_date
    datetime started_at
    datetime ended_at "nullable"
    enum status "WorkoutSessionStatus in_progress completed"
    varchar_512 notes "nullable"
    datetime created_at
  }

  workout_session_sets {
    int id PK
    int session_id FK "FK workout_sessions.id"
    int exercise_id FK "FK exercise_catalog.id"
    int set_index
    int actual_reps "nullable"
    decimal_8_2 actual_weight_kg "nullable"
    int actual_duration_sec "nullable"
    int rpe "nullable"
    datetime created_at
  }

  food_catalog {
    int id PK
    int user_id FK "nullable global food if NULL"
    varchar_255 name
    int kcal_per_serving
    decimal_8_2 protein_g
    decimal_8_2 carb_g
    decimal_8_2 fat_g
    varchar_64 serving_unit "nullable"
    datetime created_at
  }

  meal_logs {
    int id PK
    int user_id FK "FK users.id"
    enum meal_type "MealType breakfast lunch dinner snack"
    datetime logged_at
    varchar_512 notes "nullable"
    datetime created_at
  }

  meal_log_items {
    int id PK
    int meal_log_id FK "FK meal_logs.id"
    int food_id FK "nullable SET NULL on food delete"
    varchar_255 custom_food_name "nullable"
    decimal_10_3 quantity
    varchar_64 unit "nullable"
    int kcal
    decimal_8_2 protein_g
    decimal_8_2 carb_g
    decimal_8_2 fat_g
    datetime created_at
  }

  body_metric_logs {
    int id PK
    int user_id FK "FK users.id"
    datetime recorded_at
    decimal_6_2 weight_kg "nullable"
    decimal_5_2 body_fat_pct "nullable"
    decimal_6_2 waist_cm "nullable"
    varchar_512 notes "nullable"
    datetime created_at
  }
```

## Ghi chú index (tóm tắt)

| Bảng | Index (theo schema) |
|------|---------------------|
| `users` | UNIQUE `email` |
| `workout_plans` | `user_id` |
| `workout_plan_exercises` | `plan_id` |
| `workout_sessions` | `(user_id, session_date)` |
| `workout_session_sets` | `session_id` |
| `food_catalog` | `user_id`, `name` |
| `meal_logs` | `(user_id, logged_at)` |
| `meal_log_items` | `meal_log_id` |
| `body_metric_logs` | `(user_id, recorded_at)` |
| `user_goals` | `user_id` |
| `refresh_tokens` | `user_id`, `token_hash` |

## Khóa ngoại (hành vi xóa chính)

- `user_profiles`, `user_goals`, `refresh_tokens`, `workout_plans`, `workout_sessions`, `meal_logs`, `body_metric_logs`, `food_catalog` (khi `user_id` set): **ON DELETE CASCADE** từ `users`.
- `workout_plan_exercises`: CASCADE theo `workout_plans`; **RESTRICT** nếu xóa `exercise_catalog` đang được tham chiếu.
- `workout_sessions.plan_id`: **SET NULL** khi xóa plan.
- `workout_session_sets`: CASCADE theo session; **RESTRICT** trên `exercise_catalog`.
- `meal_log_items.food_id`: **SET NULL** khi xóa món trong `food_catalog`.
