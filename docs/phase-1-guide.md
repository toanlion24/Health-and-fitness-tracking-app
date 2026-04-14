# Phase 1 Learning Guide — Core Tracking

Tài liệu này giải thích **phạm vi Phase 1** (theo dõi tập luyện, dinh dưỡng, chỉ số cơ thể), kiến trúc module, schema DB mục tiêu, hợp đồng API, và luồng mobile — viết theo cùng tinh thần với [Phase 0 Learning Guide](./phase-0-guide.md): học và triển khai, không chỉ liệt kê endpoint.

**Ghi chú về repo:** tại thời điểm scaffold Phase 0, code trong monorepo có thể chưa chứa đủ các module dưới đây. Dùng tài liệu này làm **chuẩn mục tiêu** và checklist khi bạn (hoặc team) bổ sung migration, route, và màn hình.

---

## Mục lục

1. [Phase 1 là gì? So với Phase 0](#1-phase-1-là-gì-so-với-phase-0)
2. [Cấu trúc dự án sau Phase 1](#2-cấu-trúc-dự-án-sau-phase-1)
3. [Database — Schema mở rộng](#3-database--schema-mở-rộng)
4. [Backend — Module mới](#4-backend--module-mới)
5. [Hợp đồng API chi tiết](#5-hợp-đồng-api-chi-tiết)
6. [Lớp Shared — DTO và lỗi](#6-lớp-shared--dto-và-lỗi)
7. [Mobile — Feature layering](#7-mobile--feature-layering)
8. [Luồng hoạt động đầu đến cuối](#8-luồng-hoạt-động-đầu-đến-cuối)
9. [OpenAPI, test, và chất lượng](#9-openapi-test-và-chất-lượng)
10. [Migration và vận hành](#10-migration-và-vận-hành)
11. [Debug Phase 1](#11-debug-phase-1)
12. [Những chú ý quan trọng](#12-những-chú-ý-quan-trọng)
13. [Từ điển từ khoá](#13-từ-điển-từ-khoá)

---

## 1. Phase 1 là gì? So với Phase 0

### 1.1 Mục tiêu sản phẩm (3–4 tuần trong roadmap tổng)

Phase 1 tập trung **ghi nhận dữ liệu cốt lõi** mà user dùng hằng ngày:

- **Workout:** danh mục bài tập, kế hoạch buổi tập (plan), phiên tập (session), và từng set thực tế.
- **Nutrition:** danh mục thức ăn, nhật ký bữa ăn theo ngày, dòng món trong bữa (macro + kcal).
- **Body metrics:** cân nặng, % mỡ, vòng eo… theo thời điểm ghi nhận.

Chưa bắt buộc trong Phase 1 (thường để Phase 2+):

- Tổng hợp `daily_progress` tự động qua worker.
- Reminder + push notification + Redis queue.
- Offline queue phức tạp trên mobile.

### 1.2 Phase 0 đã có gì?

- Monorepo, auth (register/login/refresh/logout), `GET /me`, profile/goals trong DB.
- Pattern **controller → service → repository (Prisma)** và error contract thống nhất.
- Mobile: auth flow, `apiFetch`, SecureStore, UI states.

### 1.3 Phase 1 bổ sung gì?

| Lớp | Bổ sung |
|-----|---------|
| **DB** | Bảng workout, nutrition, body metrics (xem mục 3). |
| **Backend** | Module `workouts`, `nutrition`, `body-metrics` (hoặc `metrics`) dưới `backend/src/modules/`. |
| **Shared** | DTO response/request cho session, meal log, metric log. |
| **Mobile** | Feature folders + màn hình list/form + hook gọi API. |
| **Worker** | Có thể vẫn placeholder; **không** chạy job nặng trong request lifecycle. |
| **Docs & test** | Cập nhật `openapi.yaml`, ít nhất một integration test cho mỗi domain chính. |

---

## 2. Cấu trúc dự án sau Phase 1

```
ReactPjApp/
├── shared/
│   └── src/
│       └── index.ts          ← mở rộng DTO Phase 1
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     ← thêm model workout / nutrition / metrics
│   │   └── migrations/       ← migration mới có version
│   ├── openapi/
│   │   └── openapi.yaml      ← mô tả endpoint Phase 1
│   └── src/
│       ├── app.ts            ← mount thêm router /api/v1/...
│       └── modules/
│           ├── auth/         ← Phase 0
│           ├── users/        ← Phase 0 (+ PATCH profile / goals nếu chưa có)
│           ├── workouts/     ← Phase 1
│           ├── nutrition/    ← Phase 1
│           └── body-metrics/ ← Phase 1 (tên thư mục kebab-case)
├── mobile/
│   └── src/
│       ├── core/
│       │   └── api/          ← không fetch trực tiếp trong screen
│       └── features/
│           ├── auth/
│           ├── home/
│           ├── workouts/     ← Phase 1
│           ├── nutrition/    ← Phase 1
│           └── metrics/      ← Phase 1
└── worker/                   ← có thể vẫn chưa dùng trong Phase 1
```

**Nguyên tắc kiến trúc (nhắc lại):**

- Không import chéo logic giữa hai domain khác nhau; nếu cần dữ liệu chung, expose qua service interface hoặc đọc qua API nội bộ rõ ràng.
- Mọi ghi dữ liệu qua **validate body/query/params** (Zod) và trả lỗi theo shape `code`, `message`, `details`, `requestId`.

---

## 3. Database — Schema mở rộng

### 3.1 Vì sao tách nhiều bảng thay vì một bảng “log” chung?

- Workout có cấu trúc **session → set** (lặp theo bài tập).
- Meal có cấu trúc **meal → items** (nhiều dòng macro trong một bữa).
- Body metric là **chuỗi thời gian** đơn giản nhưng cần index theo user + thời điểm.

Tách bảng giúp query nhanh, ràng buộc FK rõ ràng, và migration an toàn hơn.

### 3.2 Nhóm Workout (mục tiêu schema)

Quan hệ logic:

```
exercise_catalog          ← dữ liệu tham chiếu (có thể seed)
        ▲
        │ (FK)
workout_plan_exercises ◄── workout_plans (user_id)
        │
        │ (optional) plan_id
workout_sessions (user_id, session_date, started_at, ended_at, ...)
        │
        ▼
workout_session_sets (session_id, exercise_id, set_index, actual_reps, ...)
```

**Ý nghĩa từng nhóm:**

| Bảng | Vai trò |
|------|---------|
| `exercise_catalog` | Tên bài, nhóm cơ, thiết bị, MET (ước lượng calo). |
| `workout_plans` | Tên plan, mô tả, cờ template (tuỳ nhu cầu). |
| `workout_plan_exercises` | Thứ tự bài trong plan + mục tiêu set/rep/cân/nghỉ. |
| `workout_sessions` | Một buổi tập thực tế; có thể không gắn plan. |
| `workout_session_sets` | Từng set thực hiện: rep, kg, giây, RPE. |

**Index gợi ý:**

- `workout_sessions(user_id, session_date)`
- `workout_session_sets(session_id)`
- `meal_logs(user_id, logged_at)` (xem dưới)

### 3.3 Nhóm Nutrition

```
food_catalog
     ▲
     │ food_id (nullable nếu custom)
meal_log_items ◄── meal_logs (user_id, meal_type, logged_at)
```

| Bảng | Vai trò |
|------|---------|
| `food_catalog` | Kcal và macro trên một đơn vị khẩu phần (theo thiết kế sản phẩm). |
| `meal_logs` | Một bữa (breakfast/lunch/dinner/snack) tại một thời điểm. |
| `meal_log_items` | Dòng chi tiết: số lượng, đơn vị, macro snapshot (để lịch sử không đổi khi catalog sửa). |

**Quyết định quan trọng:** lưu **snapshot** macro trên `meal_log_items` (kcal, protein_g, carb_g, fat_g tại thời điểm log) để báo cáo quá khứ nhất quán.

### 3.4 Nhóm Body metrics

Bảng đơn (ví dụ `body_metric_logs`):

- `user_id`, `recorded_at`
- `weight_kg`, `body_fat_pct`, `waist_cm`, … (nullable — chỉ bắt buộc field product yêu cầu)

**Index:** `(user_id, recorded_at)` cho range query.

### 3.5 Ràng buộc và xoá

- Child tables (`workout_session_sets`, `meal_log_items`, …) dùng `ON DELETE CASCADE` khi xoá session/meal cha là hợp lý cho MVP.
- **Catalog** (`exercise_catalog`, `food_catalog`): thường **không** cascade xoá log lịch sử; item log giữ `exercise_id`/`food_id` nullable + tên snapshot nếu cần.

### 3.6 Prisma — quy trình thay đổi

1. Sửa `schema.prisma` (thêm model, enum, `@@map`, `@map`).
2. `npx prisma migrate dev --name phase1_core_tracking` (dev) hoặc `migrate deploy` (staging/prod).
3. `npx prisma generate` để cập nhật client TypeScript.

Chi tiết tư duy Prisma (`@map`, `@@index`, quan hệ) đã giải thích kỹ trong Phase 0 — áp dụng tương tự.

---

## 4. Backend — Module mới

### 4.1 Luồng request (không đổi so với Phase 0)

```
helmet → cors → json → requestId → log → router → errorHandler
```

Mỗi route Phase 1 nên:

- Dùng `requireAuth` (access token) khi thao tác theo user.
- `validateBody` / `validateQuery` với Zod.
- Controller mỏng; service chứa rule nghiệp vụ; Prisma ở tầng “repository” trong cùng service file nếu MVP (hoặc tách file `*.repository.ts` khi phình to).

### 4.2 Phân quyền theo user

Mọi query ghi/đọc phải filter `where: { userId: req.user.id }` (hoặc tương đương).  
Không tin `userId` từ body client cho resource đã thuộc về user.

### 4.3 Gợi ý cấu trúc file trong một module

```
backend/src/modules/workouts/
├── workouts.routes.ts
├── workouts.controller.ts
├── workouts.service.ts
├── workouts.dto.ts          ← Zod schema + inferred types
└── workouts.serializer.ts   ← map Prisma → DTO trả API (tuỳ chọn)
```

Module `nutrition` và `body-metrics` cùng pattern.

### 4.4 Lỗi và mã ổn định

Bổ sung mã lỗi có ý nghĩa (ví dụ):

- `NOT_FOUND` — session/meal không tồn tại hoặc không thuộc user.
- `VALIDATION_ERROR` — Zod (giữ như Phase 0).
- `CONFLICT` — hoàn thành session hai lần, vi phạm rule trạng thái.

Luôn kèm `requestId` trong body lỗi (đã có ở Phase 0).

---

## 5. Hợp đồng API chi tiết

Tất cả path dưới prefix **`/api/v1`**. Dưới đây là contract mục tiêu (khớp production plan); khi implement có thể tinh chỉnh tên field nhưng nên giữ **ổn định** sau khi mobile đã ship.

### 5.1 Workouts

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/exercises` | Danh sách catalog (có thể phân trang, filter nhóm cơ). |
| `POST` | `/workout-plans` | Tạo plan cho user hiện tại. |
| `GET` | `/workout-plans` | List plan (optional `?include=exercises`). |
| `GET` | `/workout-plans/:id` | Chi tiết một plan. |
| `PATCH` | `/workout-plans/:id` | Đổi tên / mô tả / danh sách bài (tuỳ MVP). |
| `DELETE` | `/workout-plans/:id` | Xoá plan (soft-delete tùy chính sách). |
| `POST` | `/workout-sessions` | Bắt đầu / tạo session (body: `planId?`, `sessionDate`, `startedAt?`). |
| `GET` | `/workout-sessions` | List theo khoảng ngày hoặc phân trang. |
| `GET` | `/workout-sessions/:id` | Chi tiết session + sets. |
| `POST` | `/workout-sessions/:id/sets` | Thêm một set (hoặc bulk — tuỳ thiết kế). |
| `PATCH` | `/workout-sessions/:id/sets/:setId` | Sửa set. |
| `PATCH` | `/workout-sessions/:id/complete` | Đánh dấu hoàn thành, `endedAt`, tổng calo ước lượng nếu có. |

**Ví dụ body tạo session (minh hoạ):**

```json
{
  "planId": 12,
  "sessionDate": "2026-04-14",
  "notes": "Leg day"
}
```

**Ví dụ thêm set:**

```json
{
  "exerciseId": 3,
  "setIndex": 1,
  "actualReps": 8,
  "actualWeightKg": 60,
  "actualDurationSec": null,
  "rpe": 8
}
```

### 5.2 Nutrition

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/foods` | Tìm kiếm catalog (`?q=`, limit). |
| `POST` | `/meal-logs` | Tạo bữa (meal_type, logged_at, notes). |
| `GET` | `/meal-logs?date=YYYY-MM-DD` | Bữa trong ngày (theo timezone profile hoặc query). |
| `GET` | `/meal-logs/:id` | Chi tiết một bữa + items. |
| `PATCH` | `/meal-logs/:id` | Sửa meta bữa. |
| `DELETE` | `/meal-logs/:id` | Xoá bữa (cascade items). |
| `POST` | `/meal-logs/:id/items` | Thêm món vào bữa. |
| `PATCH` | `/meal-logs/:id/items/:itemId` | Sửa số lượng / macro snapshot. |
| `DELETE` | `/meal-logs/:id/items/:itemId` | Xoá dòng. |

**Ví dụ thêm item có food catalog:**

```json
{
  "foodId": 100,
  "quantity": 1.5,
  "unit": "serving"
}
```

**Custom food (không có `foodId`):**

```json
{
  "customFoodName": "Phở bò tái",
  "quantity": 1,
  "unit": "bowl",
  "kcal": 650,
  "proteinG": 35,
  "carbG": 70,
  "fatG": 22
}
```

### 5.3 Body metrics

| Method | Path | Mô tả |
|--------|------|--------|
| `POST` | `/body-metrics` | Tạo một bản ghi metrics. |
| `GET` | `/body-metrics?from=YYYY-MM-DD&to=YYYY-MM-DD` | Chuỗi thời gian trong khoảng. |
| `GET` | `/body-metrics/:id` | Chi tiết một bản ghi (optional). |
| `PATCH` | `/body-metrics/:id` | Sửa (nếu cho phép sửa lịch sử). |
| `DELETE` | `/body-metrics/:id` | Xoá bản ghi. |

**Ví dụ tạo bản ghi:**

```json
{
  "recordedAt": "2026-04-14T08:00:00.000Z",
  "weightKg": 72.4,
  "bodyFatPct": 18.2,
  "waistCm": 82
}
```

### 5.4 User profile / goals (nếu chưa đủ từ Phase 0)

Phase 1 thường cần chỉnh sửa hồ sơ để phục vụ macro và timezone:

- `PATCH /api/v1/me/profile`
- `PUT` hoặc `PATCH /api/v1/me/goals` (theo convention đã chọn; nhất quán là trên hết)

---

## 6. Lớp Shared — DTO và lỗi

### 6.1 Vai trò

Giữ **một nguồn** type cho response quan trọng (session detail, meal day view, metric series) để mobile và backend không lệch field.

### 6.2 Gợi ý kiểu cần có (tên minh hoạ)

| Kiểu | Dùng cho |
|------|-----------|
| `ExerciseDto` | Một dòng catalog |
| `WorkoutPlanSummaryDto` / `WorkoutPlanDetailDto` | List vs detail |
| `WorkoutSessionDto` | Session + nested sets |
| `WorkoutSetDto` | Một set |
| `FoodDto` | Một thức ăn trong catalog |
| `MealLogDto` | Một bữa + `items[]` |
| `MealLogItemDto` | Dòng món |
| `BodyMetricLogDto` | Một điểm dữ liệu cơ thể |

Sau khi sửa `shared`, chạy `npm run build:shared` (giống Phase 0).

### 6.3 Date và timezone

- API có thể nhận/tra `Instant` (ISO 8601) hoặc `date` theo calendar.
- Thống nhất: lưu UTC trong DB, chuyển đổi “ngày bữa ăn” theo `user_profiles.timezone` ở service layer.

---

## 7. Mobile — Feature layering

### 7.1 Cấu trúc đề xuất mỗi feature

```
mobile/src/features/workouts/
├── screens/
│   ├── workout-plans-screen.tsx
│   ├── workout-session-screen.tsx
│   └── ...
├── hooks/
│   └── use-workout-session.ts
├── services/
│   └── workouts-api.ts        ← chỉ gọi apiFetch, không UI
└── components/
    └── set-row.tsx
```

**Quy tắc:** screen → hook/store → service(`apiFetch`). Không `fetch` rải rác trong component.

### 7.2 Trạng thái UI

Mọi màn hình có dữ liệu async:

- `LoadingState` khi đang tải lần đầu.
- `ErrorState` khi lỗi mạng hoặc API (có nút retry).
- `EmptyState` khi thành công nhưng không có dữ liệu (vd: chưa có session trong tuần).

### 7.3 Điều hướng

Mở rộng navigator sau login:

- Tab hoặc stack: **Home**, **Workouts**, **Nutrition**, **Metrics** (tuỳ UX).
- Params route: `sessionId`, `date` (meal log theo ngày).

### 7.4 Form và validation

- Validate phía client (UX nhanh) nhưng **server vẫn là chốt** (Zod).
- Số thập phân (kg, macro): dùng kiểu phù hợp, tránh floating error — có thể nhập string rồi parse ở service.

---

## 8. Luồng hoạt động đầu đến cuối

### 8.1 Tạo plan → tập → ghi set → hoàn thành

```
User mở Workouts → GET /workout-plans
  → EmptyState nếu rỗng
  → User tạo plan POST /workout-plans (+ exercises nếu API gộp)
User bắt đầu buổi tập POST /workout-sessions { planId, sessionDate }
  → màn hình session GET /workout-sessions/:id
User thêm từng set POST /workout-sessions/:id/sets
User kết thúc PATCH /workout-sessions/:id/complete
  → điều hướng về list hoặc home
```

### 8.2 Ghi nhận bữa ăn trong ngày

```
User chọn ngày (local date) → GET /meal-logs?date=2026-04-14
User thêm bữa POST /meal-logs { mealType, loggedAt }
User thêm món POST /meal-logs/:id/items { foodId | custom..., quantity }
  → client có thể hiển thị tổng macro cộng dồn trong ngày (tính local hoặc từ API sau này)
```

### 8.3 Ghi chỉ số cơ thể

```
User mở Metrics → GET /body-metrics?from=&to=
User thêm POST /body-metrics { recordedAt, weightKg, ... }
  → list refresh hoặc optimistic UI (cẩn trọng với conflict)
```

---

## 9. OpenAPI, test, và chất lượng

### 9.1 OpenAPI

- Cập nhật `backend/openapi/openapi.yaml` với schema request/response và `securitySchemes` (Bearer JWT).
- Mỗi endpoint ghi phải có: parameters, `responses` (200/201/400/401/404), và ví dụ.

### 9.2 Test backend (theo testing rule của repo)

- **Unit test:** service — ví dụ tính tổng set, validate thứ tự setIndex, rule complete session.
- **Integration test:** supertest (hoặc stack hiện có) + DB test:

  - Auth fixture: tạo user, lấy access token.

  - Workout: tạo session → thêm set → complete.

  - Nutrition: tạo meal → thêm item → GET theo date.

  - Metrics: POST → GET range trả đúng số bản ghi.

- Dùng **clock cố định** nếu assert theo ngày.

### 9.3 Test mobile

- Unit test cho hook format ngày, reducer list.
- E2E smoke (Phase 1 có thể bắt đầu): login → tạo meal item (tuỳ thời gian).

---

## 10. Migration và vận hành

### 10.1 Thứ tự triển khai an toàn

1. Migration catalog (`exercise_catalog`, `food_catalog`) + seed tối thiểu.
2. Migration bảng user-owned (`workout_plans`, `meal_logs`, …).
3. Deploy backend có cờ tắt/bật route nếu cần canary (tuỳ đội).
4. Publish mobile cùng version tối thiểu đọc được response mới (hoặc version API).

### 10.2 Dữ liệu seed

- Catalog nên seed bằng script idempotent (check tồn tại trước khi insert).
- Không hardcode secret; connection string từ env.

### 10.3 Hiệu năng

- List catalog và foods: **pagination** hoặc limit mặc định (vd: 50).
- Tránh N+1 query khi load session + sets — dùng `include` Prisma có chừng hoặc query 2 bước có kiểm soát.

---

## 11. Debug Phase 1

| Triệu chứng | Hướng xử lý |
|-------------|-------------|
| 404 trên `/workout-sessions/:id` | Kiểm tra session có đúng `user_id` không; không leak tồn tại hay không. |
| Macro bữa ăn không khớp catalog | So sánh snapshot trên `meal_log_items` với giá trị food hiện tại — đây có thể là đúng (lịch sử cố định). |
| Ngày meal lệch một ngày | Timezone: xác định “ngày” theo UTC vs theo user; log `timezone` và input raw. |
| 409 khi complete session hai lần | Thiết kế idempotent: nếu đã complete thì trả 200 với cùng state hoặc 409 có `code` rõ ràng. |
| Prisma lỗi FK | foodId/exerciseId không tồn tại; validate trước khi insert. |

Công cụ hữu ích (đã nêu Phase 0): `requestId` trong log, Prisma Studio, curl/Postman với Bearer token.

---

## 12. Những chú ý quan trọng

### Bảo mật và quyền riêng tư

- Metrics và meal là dữ liệu nhạy cảm — không log full body vào info level; chỉ log id + requestId.

### Idempotency (khuyến nghị)

- Endpoint dễ bị double-submit (tạo session, tạo meal) có thể nhận `Idempotency-Key` header; MVP có thể hoãn nhưng nên thiết kế service tách hàm tạo để thêm sau dễ dàng.

### Không làm nặng API

- Tổng hợp `daily_progress`, gửi reminder, tính toán lớn: **worker + queue** (Phase 2), không chặn response Phase 1.

### Nhất quán kiến trúc

- Giữ **module-first monolith**; không import chéo domain.
- Contract lỗi và version path `/api/v1` không đổi.

---

## 13. Từ điển từ khoá

| Từ khoá | Giải thích |
|---------|------------|
| **Workout plan** | Khuôn mẫu danh sách bài tập và mục tiêu set/rep. |
| **Workout session** | Một buổi tập thực tế tại một ngày/giờ. |
| **Set** | Một lần thực hiện của một bài trong session (rep, kg, RPE…). |
| **Meal log** | Bản ghi một bữa ăn của user. |
| **Meal item** | Một dòng món trong bữa; thường có macro snapshot. |
| **Body metric log** | Một điểm đo cơ thể theo thời gian. |
| **Catalog** | Bảng tham chiếu chung (exercise/food), có thể seed. |
| **Snapshot** | Lưu giá trị tại thời điểm ghi để lịch sử không đổi khi catalog cập nhật. |
| **Pagination** | Chia nhỏ list response theo `limit`/`cursor` để giảm tải. |
| **Idempotency** | Gửi trùng request không tạo duplicate side-effect. |
| **Integration test** | Test gọi API thật (hoặc gần thật) kèm DB. |

---

## Liên kết

- Nền tảng Phase 0 (auth, middleware, mobile core): [phase-0-guide.md](./phase-0-guide.md)
- Roadmap tổng thể và schema gợi ý: `.cursor/plans/health_fitness_app_plan_9b81a15e.plan.md`

Khi Phase 1 đã được merge vào repo, nên bổ sung vào cuối file này một mục **“Mapping file thực tế”** (bảng endpoint → file controller) để tài liệu và code khớp 1:1.
