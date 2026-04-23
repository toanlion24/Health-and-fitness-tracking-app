-- Phase 2: daily progress aggregation, reminders, Expo device tokens

CREATE TABLE `daily_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `total_kcal_in` INTEGER NOT NULL,
    `total_kcal_out` INTEGER NOT NULL DEFAULT 0,
    `total_workout_minutes` INTEGER NOT NULL DEFAULT 0,
    `protein_g` DECIMAL(10, 2) NOT NULL,
    `carb_g` DECIMAL(10, 2) NOT NULL,
    `fat_g` DECIMAL(10, 2) NOT NULL,
    `goal_score` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `daily_progress_user_id_date_key`(`user_id`, `date`),
    INDEX `daily_progress_user_id_date_idx`(`user_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `daily_progress` ADD CONSTRAINT `daily_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `reminders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('workout', 'water', 'meal', 'sleep') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` VARCHAR(512) NULL,
    `cron_expr` VARCHAR(128) NULL,
    `timezone` VARCHAR(64) NOT NULL,
    `local_hour` INTEGER NOT NULL,
    `local_minute` INTEGER NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `next_trigger_at` DATETIME(3) NULL,
    `last_triggered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reminders_user_id_is_enabled_next_trigger_at_idx`(`user_id`, `is_enabled`, `next_trigger_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `reminders` ADD CONSTRAINT `reminders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `device_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `platform` VARCHAR(32) NOT NULL,
    `expo_push_token` VARCHAR(512) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `device_tokens_expo_push_token_key`(`expo_push_token`),
    INDEX `device_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `device_tokens` ADD CONSTRAINT `device_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
