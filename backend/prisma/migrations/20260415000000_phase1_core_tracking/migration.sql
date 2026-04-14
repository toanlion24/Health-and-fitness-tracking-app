-- CreateTable
CREATE TABLE `exercise_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `muscle_group` VARCHAR(128) NULL,
    `equipment` VARCHAR(128) NULL,
    `met` DECIMAL(5, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(512) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workout_plans_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plan_exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plan_id` INTEGER NOT NULL,
    `exercise_id` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `target_sets` INTEGER NULL,
    `target_reps` INTEGER NULL,
    `target_weight_kg` DECIMAL(8, 2) NULL,
    `rest_sec` INTEGER NULL,

    INDEX `workout_plan_exercises_plan_id_idx`(`plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plan_id` INTEGER NULL,
    `session_date` DATE NOT NULL,
    `started_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NULL,
    `status` ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
    `notes` VARCHAR(512) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `workout_sessions_user_id_session_date_idx`(`user_id`, `session_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_session_sets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_id` INTEGER NOT NULL,
    `exercise_id` INTEGER NOT NULL,
    `set_index` INTEGER NOT NULL,
    `actual_reps` INTEGER NULL,
    `actual_weight_kg` DECIMAL(8, 2) NULL,
    `actual_duration_sec` INTEGER NULL,
    `rpe` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `workout_session_sets_session_id_idx`(`session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `food_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `name` VARCHAR(255) NOT NULL,
    `kcal_per_serving` INTEGER NOT NULL,
    `protein_g` DECIMAL(8, 2) NOT NULL,
    `carb_g` DECIMAL(8, 2) NOT NULL,
    `fat_g` DECIMAL(8, 2) NOT NULL,
    `serving_unit` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `food_catalog_user_id_idx`(`user_id`),
    INDEX `food_catalog_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meal_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    `logged_at` DATETIME(3) NOT NULL,
    `notes` VARCHAR(512) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `meal_logs_user_id_logged_at_idx`(`user_id`, `logged_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meal_log_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meal_log_id` INTEGER NOT NULL,
    `food_id` INTEGER NULL,
    `custom_food_name` VARCHAR(255) NULL,
    `quantity` DECIMAL(10, 3) NOT NULL,
    `unit` VARCHAR(64) NULL,
    `kcal` INTEGER NOT NULL,
    `protein_g` DECIMAL(8, 2) NOT NULL,
    `carb_g` DECIMAL(8, 2) NOT NULL,
    `fat_g` DECIMAL(8, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `meal_log_items_meal_log_id_idx`(`meal_log_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `body_metric_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `recorded_at` DATETIME(3) NOT NULL,
    `weight_kg` DECIMAL(6, 2) NULL,
    `body_fat_pct` DECIMAL(5, 2) NULL,
    `waist_cm` DECIMAL(6, 2) NULL,
    `notes` VARCHAR(512) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `body_metric_logs_user_id_recorded_at_idx`(`user_id`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workout_plans` ADD CONSTRAINT `workout_plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plan_exercises` ADD CONSTRAINT `workout_plan_exercises_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plan_exercises` ADD CONSTRAINT `workout_plan_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercise_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_session_sets` ADD CONSTRAINT `workout_session_sets_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_session_sets` ADD CONSTRAINT `workout_session_sets_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercise_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `food_catalog` ADD CONSTRAINT `food_catalog_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meal_logs` ADD CONSTRAINT `meal_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meal_log_items` ADD CONSTRAINT `meal_log_items_meal_log_id_fkey` FOREIGN KEY (`meal_log_id`) REFERENCES `meal_logs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meal_log_items` ADD CONSTRAINT `meal_log_items_food_id_fkey` FOREIGN KEY (`food_id`) REFERENCES `food_catalog`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `body_metric_logs` ADD CONSTRAINT `body_metric_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed catalog (global exercises)
INSERT INTO `exercise_catalog` (`name`, `muscle_group`, `equipment`, `met`) VALUES
('Barbell Squat', 'legs', 'barbell', 6.0),
('Bench Press', 'chest', 'barbell', 6.0),
('Deadlift', 'back', 'barbell', 6.0),
('Pull-up', 'back', 'bodyweight', 8.0),
('Overhead Press', 'shoulders', 'barbell', 5.0);

-- Seed catalog (global foods, user_id NULL)
INSERT INTO `food_catalog` (`user_id`, `name`, `kcal_per_serving`, `protein_g`, `carb_g`, `fat_g`, `serving_unit`) VALUES
(NULL, 'Cooked rice (1 cup)', 200, 4.00, 45.00, 0.50, 'cup'),
(NULL, 'Chicken breast (100g)', 165, 31.00, 0.00, 3.60, '100g'),
(NULL, 'Whole egg (1 large)', 78, 6.30, 0.60, 5.30, 'egg'),
(NULL, 'Banana (medium)', 105, 1.30, 27.00, 0.40, 'fruit');
