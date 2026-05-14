# Bản đồ file và chức năng (Health Fitness Monorepo)

Tài liệu này liệt kê các file quan trọng trong project, kèm link và mô tả ngắn chức năng để tra cứu nhanh.

## 1) Tài liệu tổng quan

- [`README.md`](../README.md)  
  Tổng quan dự án, stack, lệnh chạy chính.

- [`docs/run-project-guide.md`](./run-project-guide.md)  
  Hướng dẫn chạy chi tiết, xử lý lỗi thường gặp (bao gồm lỗi Prisma EPERM).

- [`docs/architecture.md`](./architecture.md)  
  Mô tả kiến trúc hệ thống và phân tách module.

- [`docs/bao-cao-do-an.md`](./bao-cao-do-an.md)  
  Nội dung báo cáo đồ án.

## 2) Root workspace

- [`package.json`](../package.json)  
  Script điều phối monorepo (`quickstart`, `setup:dev`, `dev:all`, `lint`, `typecheck`, `test`).

- [`eslint.config.mjs`](../eslint.config.mjs)  
  Cấu hình ESLint dùng chung cho backend/mobile/shared.

- [`.prettierrc.json`](../.prettierrc.json)  
  Chuẩn format code.

- [`.husky/pre-commit`](../.husky/pre-commit)  
  Hook pre-commit chạy `lint-staged`.

## 3) Backend API (Express + Prisma)

### Entry và wiring

- [`backend/src/server.ts`](../backend/src/server.ts)  
  Điểm vào backend, load env và start HTTP server.

- [`backend/src/app.ts`](../backend/src/app.ts)  
  Khởi tạo Express app, middleware chung, mount tất cả router `/api/v1/*`.

### Auth module

- [`backend/src/modules/auth/auth.routes.ts`](../backend/src/modules/auth/auth.routes.ts)  
  Định nghĩa route auth: register/login/refresh/logout.

- [`backend/src/modules/auth/auth.controller.ts`](../backend/src/modules/auth/auth.controller.ts)  
  Controller nhận request/response cho auth.

- [`backend/src/modules/auth/auth.service.ts`](../backend/src/modules/auth/auth.service.ts)  
  Business logic auth: hash password, issue token, refresh, revoke.

- [`backend/src/modules/auth/auth.dto.ts`](../backend/src/modules/auth/auth.dto.ts)  
  Schema validate input auth bằng Zod.

### Shared backend core

- [`backend/src/shared/db/prisma.ts`](../backend/src/shared/db/prisma.ts)  
  Prisma client singleton.

- [`backend/src/shared/config/env.ts`](../backend/src/shared/config/env.ts)  
  Đọc và validate biến môi trường backend.

- [`backend/src/shared/middleware/error-handler.ts`](../backend/src/shared/middleware/error-handler.ts)  
  Chuẩn hóa response lỗi theo error contract.

- [`backend/src/shared/middleware/require-auth.ts`](../backend/src/shared/middleware/require-auth.ts)  
  Middleware xác thực Bearer token.

## 4) Database và migration

- [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)  
  Source of truth cho schema DB.

- [`backend/prisma/migrations/20260414000000_init/migration.sql`](../backend/prisma/migrations/20260414000000_init/migration.sql)  
  Migration nền tảng v1 (identity/auth).

- [`backend/prisma/migrations/20260415000000_phase1_core_tracking/migration.sql`](../backend/prisma/migrations/20260415000000_phase1_core_tracking/migration.sql)  
  Migration cho workout/nutrition/body metrics.

- [`backend/prisma/migrations/20260416120000_phase2_progress_reminders/migration.sql`](../backend/prisma/migrations/20260416120000_phase2_progress_reminders/migration.sql)  
  Migration cho progress/reminders.

- [`backend/prisma/seed.ts`](../backend/prisma/seed.ts)  
  Seed dữ liệu dev (bao gồm tài khoản test).

- [`backend/prisma/MIGRATION_V1.md`](../backend/prisma/MIGRATION_V1.md)  
  Ghi chú thao tác migration baseline v1.

## 5) Mobile app (React Native + Expo)

### App entry và navigation

- [`mobile/App.tsx`](../mobile/App.tsx)  
  Entry của Expo app, bọc providers và mount navigator.

- [`mobile/src/core/navigation/module01-navigator.tsx`](../mobile/src/core/navigation/module01-navigator.tsx)  
  Stack navigator chính cho auth/onboarding/main tabs.

### Danh sách màn hình mobile đã làm

Các màn dưới đây đã có file screen và được gắn vào navigator (stack/tab) trừ khi có ghi chú **chưa gắn navigator**. Luồng đăng nhập/đăng ký đã gọi API backend (`/api/v1/auth/login`, `/api/v1/auth/register`); các tab chính chủ yếu là UI và điều hướng — mức độ nối API chi tiết xem từng màn và module tương ứng ở mục 8.

#### Module 01 — Auth và onboarding (`module01-navigator`)

- [`login-screen.tsx`](../mobile/src/features/module01/screens/login-screen.tsx) — route `Login`
- [`register-screen.tsx`](../mobile/src/features/module01/screens/register-screen.tsx) — route `Register`
- [`forgot-password-screen.tsx`](../mobile/src/features/module01/screens/forgot-password-screen.tsx) — `ForgotPassword`
- [`password-email-sent-screen.tsx`](../mobile/src/features/module01/screens/password-email-sent-screen.tsx) — `PasswordEmailSent`
- [`onboarding-gender-screen.tsx`](../mobile/src/features/module01/screens/onboarding-gender-screen.tsx) — `OnboardingGender`
- [`onboarding-age-screen.tsx`](../mobile/src/features/module01/screens/onboarding-age-screen.tsx) — `OnboardingAge`
- [`onboarding-body-screen.tsx`](../mobile/src/features/module01/screens/onboarding-body-screen.tsx) — `OnboardingBody`
- [`onboarding-activity-screen.tsx`](../mobile/src/features/module01/screens/onboarding-activity-screen.tsx) — `OnboardingActivity`
- [`onboarding-goal-screen.tsx`](../mobile/src/features/module01/screens/onboarding-goal-screen.tsx) — `OnboardingGoal`
- [`onboarding-result-screen.tsx`](../mobile/src/features/module01/screens/onboarding-result-screen.tsx) — `OnboardingResult`

#### Tab Home — module 06 (`home-stack-navigator`)

- [`home-dashboard-screen.tsx`](../mobile/src/features/module06/screens/home-dashboard-screen.tsx) — `HomeDashboard`
- [`home-today-session-screen.tsx`](../mobile/src/features/module06/screens/home-today-session-screen.tsx) — `HomeTodaySession`
- [`home-readiness-screen.tsx`](../mobile/src/features/module06/screens/home-readiness-screen.tsx) — `HomeReadiness`

#### Tab Workout — module 04 (`workout-stack-navigator`)

- [`workout-list-screen.tsx`](../mobile/src/features/module04/screens/workout-list-screen.tsx) — `WorkoutList`
- [`workout-detail-screen.tsx`](../mobile/src/features/module04/screens/workout-detail-screen.tsx) — `WorkoutDetail`
- [`workout-player-screen.tsx`](../mobile/src/features/module04/screens/workout-player-screen.tsx) — `WorkoutPlayer`
- [`workout-plan-screen.tsx`](../mobile/src/features/module04/screens/workout-plan-screen.tsx) — `WorkoutPlan`

#### Tab Nutrition — module 05 (`nutrition-stack-navigator`)

- [`nutrition-dashboard-screen.tsx`](../mobile/src/features/module05/screens/nutrition-dashboard-screen.tsx) — `NutritionDashboard`
- [`nutrition-add-food-screen.tsx`](../mobile/src/features/module05/screens/nutrition-add-food-screen.tsx) — `AddFood`
- [`nutrition-food-detail-screen.tsx`](../mobile/src/features/module05/screens/nutrition-food-detail-screen.tsx) — `FoodDetail`
- [`nutrition-meal-detail-screen.tsx`](../mobile/src/features/module05/screens/nutrition-meal-detail-screen.tsx) — `MealDetail`
- [`nutrition-barcode-screen.tsx`](../mobile/src/features/module05/screens/nutrition-barcode-screen.tsx) — `BarcodeScan`

#### Tab Progress — module 03 (`progress-stack-navigator`)

- [`metrics-dashboard-screen.tsx`](../mobile/src/features/module03/screens/metrics-dashboard-screen.tsx) — `MetricsDashboard`
- [`health-metrics-detail-screen.tsx`](../mobile/src/features/module03/screens/health-metrics-detail-screen.tsx) — `HealthMetricsDetail`
- [`weight-detail-screen.tsx`](../mobile/src/features/module03/screens/weight-detail-screen.tsx) — `WeightDetail`
- [`add-weight-screen.tsx`](../mobile/src/features/module03/screens/add-weight-screen.tsx) — `AddWeight`
- [`calories-detail-screen.tsx`](../mobile/src/features/module03/screens/calories-detail-screen.tsx) — `CaloriesDetail`
- [`activity-detail-screen.tsx`](../mobile/src/features/module03/screens/activity-detail-screen.tsx) — `ActivityDetail`
- [`app-flow-map-screen.tsx`](../mobile/src/features/module03/screens/app-flow-map-screen.tsx) — `AppFlowMap`
- [`nutrition-home-dashboard-screen.tsx`](../mobile/src/features/module03/screens/nutrition-home-dashboard-screen.tsx) — **chưa gắn navigator** (component có sẵn, chưa đăng ký trong stack hiện tại)

#### Tab Profile — module 02 (`profile-stack-navigator`)

- [`settings-home-screen.tsx`](../mobile/src/features/module02/screens/settings-home-screen.tsx) — `SettingsHome`
- [`settings-edit-profile-screen.tsx`](../mobile/src/features/module02/screens/settings-edit-profile-screen.tsx) — `EditProfile`
- [`settings-change-password-screen.tsx`](../mobile/src/features/module02/screens/settings-change-password-screen.tsx) — `ChangePassword`
- [`notifications-hub-screen.tsx`](../mobile/src/features/module02/screens/notifications-hub-screen.tsx) — `NotificationsSettings`
- [`notifications-preferences-screen.tsx`](../mobile/src/features/module02/screens/notifications-preferences-screen.tsx) — `NotificationsPreferences`
- [`notifications-reminder-setup-screen.tsx`](../mobile/src/features/module02/screens/notifications-reminder-setup-screen.tsx) — `NotificationsReminderSetup`
- [`notifications-detail-screen.tsx`](../mobile/src/features/module02/screens/notifications-detail-screen.tsx) — `NotificationsDetail`
- [`notifications-ai-coach-screen.tsx`](../mobile/src/features/module02/screens/notifications-ai-coach-screen.tsx) — `NotificationsAiCoach`
- [`ai-coach-pulse-screen.tsx`](../mobile/src/features/module02/screens/ai-coach-pulse-screen.tsx) — `AiCoachPulse`
- [`settings-app-preferences-screen.tsx`](../mobile/src/features/module02/screens/settings-app-preferences-screen.tsx) — `AppPreferences`
- [`settings-privacy-screen.tsx`](../mobile/src/features/module02/screens/settings-privacy-screen.tsx) — `PrivacySecurity`
- [`settings-support-screen.tsx`](../mobile/src/features/module02/screens/settings-support-screen.tsx) — `Support`

### API client và state

- [`mobile/src/core/api/http-client.ts`](../mobile/src/core/api/http-client.ts)  
  HTTP client dùng chung, xử lý base URL và API error mapping.

- [`mobile/src/core/store/auth-store.ts`](../mobile/src/core/store/auth-store.ts)  
  Auth state store trung tâm (zustand).

### Auth UI + service

- [`mobile/src/features/module01/screens/login-screen.tsx`](../mobile/src/features/module01/screens/login-screen.tsx)  
  Màn hình đăng nhập, đã gọi API `/api/v1/auth/login`.

- [`mobile/src/features/module01/screens/register-screen.tsx`](../mobile/src/features/module01/screens/register-screen.tsx)  
  Màn hình đăng ký, đã gọi API `/api/v1/auth/register`.

- [`mobile/src/features/module01/services/auth-api.ts`](../mobile/src/features/module01/services/auth-api.ts)  
  Service gọi auth API và map lỗi hiển thị cho UI.

- [`mobile/src/features/module01/components/input-field.tsx`](../mobile/src/features/module01/components/input-field.tsx)  
  Input component dùng lại cho form auth/onboarding.

- [`mobile/src/features/module01/components/primary-button.tsx`](../mobile/src/features/module01/components/primary-button.tsx)  
  Button chính của UI auth.

## 6) Shared contracts

- [`shared/src/index.ts`](../shared/src/index.ts)  
  Kiểu dữ liệu dùng chung client-server: DTO auth, error contract, domain DTO.

## 7) File kế hoạch

- [`.cursor/plans/health_fitness_app_plan_9b81a15e.plan.md`](../.cursor/plans/health_fitness_app_plan_9b81a15e.plan.md)  
  Kế hoạch triển khai MVP 3-4 tháng.

- [`.cursor/plans/gui3.pen`](../.cursor/plans/gui3.pen)  
  File thiết kế màn hình (Pencil), dùng làm nguồn UI reference.

## 8) Onboarding chi tiết theo module

Phần này dành cho thành viên mới: đọc theo thứ tự `routes -> controller -> service -> mobile screens`.

### 8.1 Module Workout

**Chức năng chính**

- Quản lý danh sách bài tập (`exercises`).
- CRUD workout plans.
- Tạo workout session, thêm set, cập nhật set, complete session.

**Backend cần đọc trước**

- [`backend/src/modules/workouts/workouts.routes.ts`](../backend/src/modules/workouts/workouts.routes.ts)  
  Toàn bộ endpoint của workout.
- [`backend/src/modules/workouts/workouts.controller.ts`](../backend/src/modules/workouts/workouts.controller.ts)  
  Điều phối request/response.
- [`backend/src/modules/workouts/workouts.service.ts`](../backend/src/modules/workouts/workouts.service.ts)  
  Xử lý nghiệp vụ workout plans/sessions/sets.
- [`backend/src/modules/workouts/workouts.dto.ts`](../backend/src/modules/workouts/workouts.dto.ts)  
  Validate body/query cho workout API.

**API chính**

- `GET /api/v1/exercises`
- `GET/POST/PATCH/DELETE /api/v1/workout-plans`
- `GET/POST /api/v1/workout-sessions`
- `POST /api/v1/workout-sessions/:sessionId/sets`
- `PATCH /api/v1/workout-sessions/:sessionId/complete`

**Mobile cần đọc trước**

- [`mobile/src/features/module04/navigation/workout-stack-navigator.tsx`](../mobile/src/features/module04/navigation/workout-stack-navigator.tsx)
- [`mobile/src/features/module04/screens/workout-list-screen.tsx`](../mobile/src/features/module04/screens/workout-list-screen.tsx)
- [`mobile/src/features/module04/screens/workout-detail-screen.tsx`](../mobile/src/features/module04/screens/workout-detail-screen.tsx)
- [`mobile/src/features/module04/screens/workout-player-screen.tsx`](../mobile/src/features/module04/screens/workout-player-screen.tsx)
- [`mobile/src/features/module04/screens/workout-plan-screen.tsx`](../mobile/src/features/module04/screens/workout-plan-screen.tsx)

**Checklist khi sửa module**

- Có đủ trạng thái loading/empty/error cho màn list/detail/player.
- Với endpoint write, cập nhật DTO + validation trước khi sửa service.
- Bổ sung regression test khi sửa session transition hoặc set update.

**First task for newcomer (1-2 giờ)**

- Task: thêm filter đơn giản cho endpoint `GET /api/v1/exercises` theo `muscleGroup` (query param tùy chọn).
- File chạm:
  - [`backend/src/modules/workouts/workouts.dto.ts`](../backend/src/modules/workouts/workouts.dto.ts)
  - [`backend/src/modules/workouts/workouts.service.ts`](../backend/src/modules/workouts/workouts.service.ts)
  - [`backend/src/modules/workouts/workouts.controller.ts`](../backend/src/modules/workouts/workouts.controller.ts)
- Kết quả mong đợi:
  - Gọi `GET /api/v1/exercises?muscleGroup=chest` trả danh sách đã lọc.
  - Không truyền query vẫn trả đầy đủ như cũ (không breaking).
- Verify nhanh:
  - Chạy backend, gọi bằng Postman/curl 2 case (có và không có filter).
  - Chạy `npm run test:backend` và `npm run lint`.

### 8.2 Module Nutrition

**Chức năng chính**

- Tìm kiếm/danh sách food.
- Tạo meal log, thêm/sửa/xóa item trong meal log.
- Xem meal log theo ngày và detail.

**Backend cần đọc trước**

- [`backend/src/modules/nutrition/nutrition.routes.ts`](../backend/src/modules/nutrition/nutrition.routes.ts)
- [`backend/src/modules/nutrition/nutrition.controller.ts`](../backend/src/modules/nutrition/nutrition.controller.ts)
- [`backend/src/modules/nutrition/nutrition.service.ts`](../backend/src/modules/nutrition/nutrition.service.ts)
- [`backend/src/modules/nutrition/nutrition.dto.ts`](../backend/src/modules/nutrition/nutrition.dto.ts)

**API chính**

- `GET /api/v1/foods`
- `POST/GET/PATCH/DELETE /api/v1/meal-logs`
- `POST/PATCH/DELETE /api/v1/meal-logs/:mealLogId/items`

**Mobile cần đọc trước**

- [`mobile/src/features/module05/navigation/nutrition-stack-navigator.tsx`](../mobile/src/features/module05/navigation/nutrition-stack-navigator.tsx)
- [`mobile/src/features/module05/screens/nutrition-dashboard-screen.tsx`](../mobile/src/features/module05/screens/nutrition-dashboard-screen.tsx)
- [`mobile/src/features/module05/screens/nutrition-add-food-screen.tsx`](../mobile/src/features/module05/screens/nutrition-add-food-screen.tsx)
- [`mobile/src/features/module05/screens/nutrition-food-detail-screen.tsx`](../mobile/src/features/module05/screens/nutrition-food-detail-screen.tsx)
- [`mobile/src/features/module05/screens/nutrition-meal-detail-screen.tsx`](../mobile/src/features/module05/screens/nutrition-meal-detail-screen.tsx)
- [`mobile/src/features/module05/screens/nutrition-barcode-screen.tsx`](../mobile/src/features/module05/screens/nutrition-barcode-screen.tsx)

**Checklist khi sửa module**

- Luồng thêm món ăn phải có success/error feedback rõ.
- Dữ liệu macro/kcal phải nhất quán giữa list, detail, dashboard.
- Nếu sửa logic tính toán dinh dưỡng, thêm test regression.

**First task for newcomer (1-2 giờ)**

- Task: thêm validate rõ hơn cho `POST /api/v1/meal-logs/:mealLogId/items` để chặn `quantity <= 0`.
- File chạm:
  - [`backend/src/modules/nutrition/nutrition.dto.ts`](../backend/src/modules/nutrition/nutrition.dto.ts)
  - [`backend/src/modules/nutrition/nutrition.controller.ts`](../backend/src/modules/nutrition/nutrition.controller.ts)
- Kết quả mong đợi:
  - Payload `quantity = 0` hoặc âm trả lỗi validate ổn định.
  - Payload hợp lệ vẫn thêm item bình thường.
- Verify nhanh:
  - Test thủ công 2 payload hợp lệ/không hợp lệ.
  - Chạy `npm run test:backend` và `npm run lint`.

### 8.3 Module Progress

**Chức năng chính**

- Xem tiến độ ngày theo khoảng thời gian (`daily progress`).
- Hiển thị dashboard và các màn chi tiết: weight, calories, activity.

**Backend cần đọc trước**

- [`backend/src/modules/progress/progress.routes.ts`](../backend/src/modules/progress/progress.routes.ts)
- [`backend/src/modules/progress/progress.controller.ts`](../backend/src/modules/progress/progress.controller.ts)
- [`backend/src/modules/progress/progress.service.ts`](../backend/src/modules/progress/progress.service.ts)
- [`backend/src/modules/progress/progress.dto.ts`](../backend/src/modules/progress/progress.dto.ts)

**API chính**

- `GET /api/v1/progress/daily?from=&to=`

**Mobile cần đọc trước**

- [`mobile/src/features/module03/navigation/progress-stack-navigator.tsx`](../mobile/src/features/module03/navigation/progress-stack-navigator.tsx)
- [`mobile/src/features/module03/screens/metrics-dashboard-screen.tsx`](../mobile/src/features/module03/screens/metrics-dashboard-screen.tsx)
- [`mobile/src/features/module03/screens/weight-detail-screen.tsx`](../mobile/src/features/module03/screens/weight-detail-screen.tsx)
- [`mobile/src/features/module03/screens/calories-detail-screen.tsx`](../mobile/src/features/module03/screens/calories-detail-screen.tsx)
- [`mobile/src/features/module03/screens/activity-detail-screen.tsx`](../mobile/src/features/module03/screens/activity-detail-screen.tsx)
- [`mobile/src/features/module03/screens/add-weight-screen.tsx`](../mobile/src/features/module03/screens/add-weight-screen.tsx)

**Checklist khi sửa module**

- Cố định timezone/date-range khi test để tránh flaky.
- Kiểm tra đủ `loading/empty/partial/error` ở dashboard.
- Khi đổi dữ liệu chart/tổng hợp, cập nhật test tính toán.

**First task for newcomer (1-2 giờ)**

- Task: bổ sung test cho `GET /api/v1/progress/daily` với case date range rỗng dữ liệu (empty state).
- File chạm:
  - [`backend/src/modules/progress/progress.service.ts`](../backend/src/modules/progress/progress.service.ts)
  - [`backend/src/modules/progress/progress-calc.test.ts`](../backend/src/modules/progress/progress-calc.test.ts)
- Kết quả mong đợi:
  - API trả mảng rỗng đúng contract khi không có record trong range.
  - Không ảnh hưởng case đã có dữ liệu.
- Verify nhanh:
  - Chạy `npm run test:backend`.
  - Gọi API với range xa hiện tại để thấy response `[]`.

### 8.4 Module Reminders (và Notifications liên quan)

**Chức năng chính**

- CRUD reminders (workout/water/meal/sleep).
- Đồng bộ trạng thái nhắc nhở và luồng hiển thị notification settings/hub trên mobile.

**Backend cần đọc trước**

- [`backend/src/modules/reminders/reminders.routes.ts`](../backend/src/modules/reminders/reminders.routes.ts)
- [`backend/src/modules/reminders/reminders.controller.ts`](../backend/src/modules/reminders/reminders.controller.ts)
- [`backend/src/modules/reminders/reminders.service.ts`](../backend/src/modules/reminders/reminders.service.ts)
- [`backend/src/modules/reminders/reminders.dto.ts`](../backend/src/modules/reminders/reminders.dto.ts)
- [`backend/src/worker/reminder-worker.ts`](../backend/src/worker/reminder-worker.ts)

**API chính**

- `GET /api/v1/reminders`
- `POST /api/v1/reminders`
- `PATCH /api/v1/reminders/:id`
- `DELETE /api/v1/reminders/:id`

**Mobile cần đọc trước**

- [`mobile/src/features/module02/navigation/profile-stack-navigator.tsx`](../mobile/src/features/module02/navigation/profile-stack-navigator.tsx)
- [`mobile/src/features/module02/screens/notifications-hub-screen.tsx`](../mobile/src/features/module02/screens/notifications-hub-screen.tsx)
- [`mobile/src/features/module02/screens/notifications-reminder-setup-screen.tsx`](../mobile/src/features/module02/screens/notifications-reminder-setup-screen.tsx)
- [`mobile/src/features/module02/screens/notifications-preferences-screen.tsx`](../mobile/src/features/module02/screens/notifications-preferences-screen.tsx)
- [`mobile/src/features/module02/screens/notifications-detail-screen.tsx`](../mobile/src/features/module02/screens/notifications-detail-screen.tsx)

**Checklist khi sửa module**

- Reminder create/update/delete phải có test API ít nhất 1 luồng.
- Luồng permission-disabled và empty/loading trên mobile không được mất.
- Nếu chỉnh scheduler/worker, xác nhận lại timezone + next trigger.

**First task for newcomer (1-2 giờ)**

- Task: thêm khả năng bật/tắt nhanh reminder bằng `PATCH /api/v1/reminders/:id` chỉ cập nhật `isEnabled`.
- File chạm:
  - [`backend/src/modules/reminders/reminders.dto.ts`](../backend/src/modules/reminders/reminders.dto.ts)
  - [`backend/src/modules/reminders/reminders.service.ts`](../backend/src/modules/reminders/reminders.service.ts)
  - [`mobile/src/features/module02/screens/notifications-reminder-setup-screen.tsx`](../mobile/src/features/module02/screens/notifications-reminder-setup-screen.tsx)
- Kết quả mong đợi:
  - Toggle trên mobile đổi trạng thái `isEnabled` thành công.
  - API phản hồi nhanh, không bắt buộc sửa các field khác.
- Verify nhanh:
  - Tạo reminder, toggle on/off 2 lần.
  - Kiểm tra DB hoặc API list trả `isEnabled` đúng.
