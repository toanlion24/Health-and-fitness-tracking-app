# Báo cáo kỹ thuật: Health Fitness Monorepo

**Phiên bản:** 0.1.0 · **Ngày lập:** 2026-04-14 · **Trạng thái:** Phase 0 hoàn thành (Auth + User management)

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Cấu trúc monorepo](#2-cấu-trúc-monorepo)
3. [Ngăn xếp công nghệ](#3-ngăn-xếp-công-nghệ)
4. [Backend — Kiến trúc chi tiết](#4-backend--kiến-trúc-chi-tiết)
5. [Mobile — Kiến trúc chi tiết](#5-mobile--kiến-trúc-chi-tiết)
6. [Shared — Hợp đồng kiểu liên tầng](#6-shared--hợp-đồng-kiểu-liên-tầng)
7. [Cơ sở dữ liệu](#7-cơ-sở-dữ-liệu)
8. [Hợp đồng API (OpenAPI)](#8-hợp-đồng-api-openapi)
9. [Luồng xác thực end-to-end](#9-luồng-xác-thực-end-to-end)
10. [Hạ tầng và vận hành](#10-hạ-tầng-và-vận-hành)
11. [Kiểm thử](#11-kiểm-thử)
12. [Bảo mật](#12-bảo-mật)
13. [Hạn chế hiện tại và nợ kỹ thuật](#13-hạn-chế-hiện-tại-và-nợ-kỹ-thuật)
14. [Roadmap Phase 1+](#14-roadmap-phase-1)

---

## 1. Tổng quan hệ thống

Health Fitness là ứng dụng theo dõi sức khỏe và tập luyện cá nhân, kiến trúc **module-first monolith** gồm ba workspace npm:

```
┌──────────────┐   HTTPS/JSON   ┌──────────────────┐        ┌──────────┐
│  Mobile App  │ ─────────────> │  Express API      │ ─────> │ MySQL 8  │
│  (Expo/RN)   │ <───────────── │  :3000            │ <───── │ (Prisma) │
└──────────────┘                └──────────────────┘        └──────────┘
        │                              │
        └───── @health-fitness/shared ─┘
               (TypeScript contracts)
```

- **Backend** xử lý xác thực, quản lý người dùng, profile, goals.
- **Mobile** hiển thị giao diện, lưu token, tự động refresh khi 401.
- **Shared** đảm bảo client và server dùng cùng kiểu dữ liệu (DTO, error codes).
- **Worker** (dự phòng) — thư mục có mặt trong repo, chưa wired vào workspace.

---

## 2. Cấu trúc monorepo

```
ReactPjApp/
├── package.json                 # workspaces: [mobile, backend, shared]
├── package-lock.json
├── docker-compose.yml           # MySQL 8.4
├── README.md
│
├── shared/                      # @health-fitness/shared
│   ├── package.json             # type: module, main: ./dist/index.js
│   ├── tsconfig.json            # ES2022, NodeNext, strict
│   └── src/
│       └── index.ts             # Tất cả kiểu DTO và error codes
│
├── backend/
│   ├── package.json             # type: module, ESM
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── .env.example
│   ├── openapi/
│   │   └── openapi.yaml         # OpenAPI 3.0.3
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── server.ts            # Entry point
│       ├── app.ts               # Express factory
│       ├── app.test.ts
│       ├── test-env.ts          # Vitest setup
│       ├── types/
│       │   └── express.d.ts     # Augment req.requestId
│       ├── shared/
│       │   ├── config/env.ts    # Zod env validation
│       │   ├── db/prisma.ts     # Singleton PrismaClient
│       │   ├── logger.ts        # Pino logger
│       │   ├── errors/app-error.ts
│       │   ├── auth/jwt.ts      # Sign/verify JWT
│       │   ├── crypto/token-hash.ts
│       │   └── middleware/
│       │       ├── request-id.ts
│       │       ├── validate.ts
│       │       ├── require-auth.ts
│       │       └── error-handler.ts
│       └── modules/
│           ├── auth/            # register, login, refresh, logout
│           │   ├── auth.routes.ts
│           │   ├── auth.controller.ts
│           │   ├── auth.service.ts
│           │   └── auth.dto.ts
│           └── users/           # /me, profile, goals
│               ├── users.routes.ts
│               ├── users.controller.ts
│               ├── users.service.ts
│               ├── users.dto.ts
│               └── users.serializer.ts
│
├── mobile/
│   ├── package.json             # Expo SDK 54, React 19, RN 0.81
│   ├── app.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── index.ts                 # registerRootComponent
│   ├── App.tsx                  # SafeAreaProvider + auth gate
│   └── src/
│       ├── core/
│       │   ├── api/
│       │   │   ├── client.ts    # apiFetch + auto-refresh
│       │   │   ├── api-error.ts # ApiClientError class
│       │   │   └── auth-bridge.ts
│       │   ├── config/env.ts    # EXPO_PUBLIC_API_URL
│       │   ├── navigation/
│       │   │   ├── app-navigator.tsx
│       │   │   └── types.ts     # Typed route params
│       │   ├── storage/
│       │   │   └── secure-store.ts
│       │   ├── store/
│       │   │   └── auth-store.ts  # Zustand
│       │   └── ui-states/
│       │       ├── loading-state.tsx
│       │       ├── error-state.tsx
│       │       └── empty-state.tsx
│       └── features/
│           ├── auth/screens/
│           │   ├── login-screen.tsx
│           │   └── register-screen.tsx
│           ├── home/
│           │   └── home-screen.tsx
│           └── profile/
│               └── profile-screen.tsx
│
├── worker/                      # Placeholder (chưa nằm trong workspaces)
│   └── README.md
│
└── docs/
    ├── architecture.md
    ├── run-project-guide.md
    ├── phase-0-guide.md
    ├── phase-1-guide.md
    └── bao-cao-do-an.md
```

**Root scripts (package.json):**

| Script | Lệnh |
|--------|-------|
| `build:shared` | `npm run build -w @health-fitness/shared` |
| `dev:backend` | `npm run dev -w backend` |
| `dev:mobile` | `npm run start -w mobile` |
| `test:backend` | `npm run test -w backend` |

**Engine:** Node.js ≥ 20.

---

## 3. Ngăn xếp công nghệ

### 3.1 Backend

| Vai trò | Thư viện | Phiên bản | Ghi chú |
|---------|----------|-----------|---------|
| Runtime | Node.js | ≥ 20 | ESM (`"type": "module"`) |
| Framework | Express | 4.x | `createApp()` factory pattern |
| ORM / Migration | Prisma Client + Prisma CLI | latest | `prisma migrate deploy`, `prisma studio` |
| Validation | Zod | latest | Schema → middleware `validateBody()` |
| Auth — JWT | jsonwebtoken | — | Access + Refresh, HS256 |
| Auth — Password | bcrypt | — | Configurable rounds (10–14) |
| Logging | Pino | — | Structured JSON, per-request duration |
| Security headers | Helmet | — | Default config |
| Dev runner | tsx | — | `tsx watch src/server.ts` |
| Test | Vitest + Supertest | — | Node env, setup file |

### 3.2 Mobile

| Vai trò | Thư viện | Phiên bản |
|---------|----------|-----------|
| Framework | React Native | 0.81.5 |
| Platform | Expo SDK | ~54.0.33 |
| React | react | 19.1.0 |
| Navigation | @react-navigation/native + stack | ^7.2.2 / ^7.4.10 |
| State | Zustand | ^5.0.12 |
| Secure storage | expo-secure-store | ~15.0.8 |
| TypeScript | typescript | ~5.9.2 |

### 3.3 Infrastructure

| Thành phần | Chi tiết |
|------------|----------|
| Database | MySQL 8.4 (Docker image) — utf8mb4, unicode_ci |
| Container | Docker Compose — chỉ service `mysql` |
| CI/CD | Chưa cấu hình (không có `.github/workflows`) |

---

## 4. Backend — Kiến trúc chi tiết

### 4.1 Request lifecycle

```
HTTP Request
  │
  ▼
helmet()                     # Security headers
  │
  ▼
cors()                       # CORS policy
  │
  ▼
express.json({ limit: 1mb }) # Body parsing
  │
  ▼
requestIdMiddleware          # x-request-id hoặc uuid v4 → req.requestId
  │
  ▼
Request logging (on finish)  # Pino: method, path, status, duration, requestId
  │
  ▼
Router matching
  ├── GET  /api/v1/health                → { status: "ok" }
  ├── POST /api/v1/auth/register         → validateBody → controller → service
  ├── POST /api/v1/auth/login            → validateBody → controller → service
  ├── POST /api/v1/auth/refresh          → validateBody → controller → service
  ├── POST /api/v1/auth/logout           → requireAuth → validateBody → controller
  ├── GET  /api/v1/me                    → requireAuth → controller
  ├── PATCH /api/v1/me/profile           → requireAuth → validateBody → controller
  └── PUT  /api/v1/me/goals             → requireAuth → validateBody → controller
  │
  ▼
errorHandlerMiddleware       # Catch-all: ZodError → 400, AppError → status, else → 500
```

### 4.2 Module pattern

Mỗi domain module (`auth`, `users`) tuân thủ cấu trúc:

```
modules/<domain>/
├── <domain>.routes.ts       # createXxxRouter(): Express.Router
├── <domain>.controller.ts   # Handler functions (req, res, next)
├── <domain>.service.ts      # Business logic, Prisma calls
├── <domain>.dto.ts          # Zod schemas + inferred types
└── <domain>.serializer.ts   # (nếu cần) Map Prisma model → response DTO
```

**Luồng dữ liệu:**
- **Route** mount middleware (validate, requireAuth) rồi gọi controller.
- **Controller** cast request, gọi service, trả HTTP status + JSON.
- **Service** chứa logic nghiệp vụ, gọi Prisma trực tiếp (chưa tách repository riêng).
- **Serializer** chuyển đổi Decimal/Date thành string cho JSON.

### 4.3 Shared infrastructure (`backend/src/shared/`)

| File | Chức năng |
|------|-----------|
| `config/env.ts` | Zod schema validate `process.env` tại startup. Cache singleton. Fail fast nếu thiếu/sai biến. |
| `db/prisma.ts` | Singleton `PrismaClient`. Dev/test gắn vào `globalThis` tránh duplicate khi hot-reload. Log level: `error` + `warn` (dev), `error` only (prod). |
| `logger.ts` | `getLogger()` trả Pino instance. Level `debug` (dev) / `info` (prod). |
| `errors/app-error.ts` | `class AppError extends Error` với `statusCode`, `code` (từ `ApiErrorCodes`), optional `details`. |
| `auth/jwt.ts` | `signAccessToken`, `signRefreshToken`, `verifyAccessToken`, `verifyRefreshToken`. Issuer: `health-fitness-api`. Payload type checking helpers. |
| `crypto/token-hash.ts` | `hashToken(raw)` → SHA-256 hex digest. Dùng cho refresh token `jti`. |
| `middleware/request-id.ts` | Đọc `x-request-id` header hoặc generate uuid v4, gán vào `req.requestId` + response header. |
| `middleware/validate.ts` | `validateBody<T>(schema)` — `safeParse(req.body)`, thành công thì gán `req.body = parsed.data`, thất bại thì `next(ZodError)`. |
| `middleware/require-auth.ts` | Tách `Authorization: Bearer <token>`, `verifyAccessToken`, gán `req.user = { id, email }`. Không có token/invalid → `AppError 401`. Export `AuthedRequest` type. |
| `middleware/error-handler.ts` | `ZodError` → 400 + `VALIDATION_ERROR` + `err.flatten()`. `AppError` → status tương ứng. Else → 500 `INTERNAL_ERROR`. Luôn kèm `requestId`. |

### 4.4 Module Auth — Chi tiết triển khai

**`auth.dto.ts`** — Zod schemas:

| Schema | Trường | Ràng buộc |
|--------|--------|-----------|
| `registerBodySchema` | `email`, `password` | email format, password min 8 |
| `loginBodySchema` | `email`, `password` | email format, string |
| `refreshBodySchema` | `refreshToken` | string |

**`auth.service.ts`** — Các hàm chính:

| Hàm | Logic |
|-----|-------|
| `register(body)` | Kiểm tra email trùng (409 CONFLICT). `bcrypt.hash(password, env.BCRYPT_ROUNDS)`. Tạo `User` + `UserProfile` (empty) trong 1 query. Gọi `issueTokens`. |
| `login(body)` | Tìm user theo email (401 nếu không tìm thấy). `bcrypt.compare`. `issueTokens`. |
| `refresh(body)` | `verifyRefreshToken(jwt)` → payload. Lookup `RefreshToken` theo `jti` (token hash). Delete row cũ → `issueTokens` mới — **rotation một lần dùng**. |
| `logout(userId, body)` | Verify refresh JWT. Kiểm tra `payload.sub === userId`. `deleteMany` row matching `userId + tokenHash`. |
| `issueTokens(user)` | `randomBytes(48).toString("hex")` → raw. `hashToken(raw)` → `jti`. Sign access JWT (`sub, email, typ: "access"`). Sign refresh JWT (`sub, typ: "refresh", jti`). Lưu `RefreshToken` row (hash + expiresAt). Trả `{ user, tokens }`. |

### 4.5 Module Users — Chi tiết triển khai

**`users.dto.ts`** — Zod schemas:

| Schema | Trường |
|--------|--------|
| `updateProfileBodySchema` | `fullName?`, `gender?` (enum), `dob?`, `heightCm?`, `activityLevel?`, `timezone?`, `locale?` |
| `putGoalsBodySchema` | `goalType` (required), `targetWeightKg?`, `weeklyWorkoutTarget?`, `dailyKcalTarget?`, `startDate?`, `targetDate?`, `isActive?` |

**`users.service.ts`:**

| Hàm | Logic |
|-----|-------|
| `getMe(userId)` | Tìm user + include profile + goals (active). 404 nếu không tồn tại. Serialize qua `serializeProfile`, `serializeGoal`. |
| `updateProfile(userId, body)` | Nếu body rỗng → trả `getMe`. Upsert `UserProfile` (chuyển `heightCm` sang `Decimal`). Trả `getMe`. |
| `putGoals(userId, body)` | Transaction: deactivate tất cả goals hiện tại (`update many isActive = false`), tạo goal mới. Trả `getMe`. |

**`users.serializer.ts`:** Chuyển `Decimal` → `string`, `Date` → ISO string cho JSON transport.

---

## 5. Mobile — Kiến trúc chi tiết

### 5.1 Phân tầng

```
App.tsx (root)
├── SafeAreaProvider
├── StatusBar (dark)
├── Auth gate: status === "loading" → LoadingState
└── AppNavigator
    ├── AuthNavigator (khi chưa login)
    │   ├── Login → LoginScreen
    │   └── Register → RegisterScreen
    └── MainNavigator (khi đã login)
        ├── Home → HomeScreen
        └── Profile → ProfileScreen
```

### 5.2 Core layer (`src/core/`)

#### API Client (`core/api/client.ts`)

- **`apiFetch<T>(path, options)`**: Xây URL từ `apiBaseUrl`, set `Content-Type: application/json`, serialize body.
- **Auth header**: Khi `options.auth === true`, đọc access token qua `getAuthSessionHandlers()?.getAccessToken()`.
- **Auto-refresh**: Khi nhận 401 + `auth: true`, thực hiện **một lần** refresh:
  1. Gọi `POST /api/v1/auth/refresh` với `{ refreshToken }` (không Bearer).
  2. Thành công → `commitTokens` (cập nhật SecureStore + Zustand state).
  3. Retry request gốc với access token mới.
- **Lỗi**: Mọi HTTP lỗi ném `ApiClientError(status, body)`.

#### Auth Bridge (`core/api/auth-bridge.ts`)

Singleton bridge pattern tránh import vòng giữa `client.ts` ↔ `auth-store.ts`:
- `bindAuthSessionHandlers({ getAccessToken, getRefreshToken, commitTokens })`
- `getAuthSessionHandlers()` — trả interface hoặc `null`.

#### Secure Store (`core/storage/secure-store.ts`)

Keys: `access_token`, `refresh_token`. Ba hàm `saveTokens`, `getTokens`, `clearTokens` bọc `expo-secure-store`.

#### Auth Store (`core/store/auth-store.ts`) — Zustand

**State:**

| Field | Type | Mô tả |
|-------|------|-------|
| `user` | `AuthUserDto \| null` | User hiện tại |
| `accessToken` | `string \| null` | JWT access |
| `refreshToken` | `string \| null` | JWT refresh |
| `status` | `"loading" \| "ready" \| "error"` | Trạng thái store |
| `errorMessage` | `string \| null` | Thông báo lỗi |

**Actions:**

| Action | Luồng |
|--------|-------|
| `hydrate()` | `getTokens()` từ SecureStore → nếu có → `GET /api/v1/me` (auth) → set user → `"ready"`. Nếu fail → `clearTokens` → `"ready"` (không user). |
| `register(body)` | `POST /api/v1/auth/register` → `saveTokens` → set user + tokens → `"ready"`. |
| `login(body)` | `POST /api/v1/auth/login` → `saveTokens` → set user + tokens → `"ready"`. |
| `logout()` | Best-effort `POST /api/v1/auth/logout` (ignore errors) → `clearTokens` → clear state → `"ready"`. |

Module file cuối gọi `bindAuthSessionHandlers` để wire bridge.

#### Navigation (`core/navigation/`)

- **Thư viện:** `@react-navigation/native` + `@react-navigation/stack`.
- **Typed params:** `AuthStackParamList` (`Login`, `Register`), `AppStackParamList` (`Home`, `Profile`).
- **Gate logic:** `useAuthStore().user` truthy → MainNavigator, ngược lại → AuthNavigator.

#### UI States (`core/ui-states/`)

| Component | Props | Dùng khi |
|-----------|-------|----------|
| `LoadingState` | `message?` (default "Loading...") | Đang tải dữ liệu |
| `ErrorState` | `title`, `message`, `onRetry?` | Lỗi API / lỗi chung |
| `EmptyState` | `title`, `description?` | Không có dữ liệu |

### 5.3 Feature screens

#### LoginScreen / RegisterScreen

- Controlled inputs: `email`, `password`.
- Gọi `useAuthStore().login()` / `register()`.
- Khi `status === "loading"` → button disabled, text "Signing in…" / "Creating…".
- Lỗi hiển thị inline (text đỏ) từ `errorMessage`.
- `KeyboardAvoidingView` behavior theo `Platform.OS`.

#### HomeScreen

- Hiển thị welcome + `user.email`.
- Nút navigate sang `Profile`.
- Nút `logout`.
- Nếu `!user` → `EmptyState` (phòng thủ).

#### ProfileScreen

- Local state `loadState`: `"loading"` | `"error"` | `"ready"`.
- `loadMe()` → `GET /api/v1/me` (auth) → populate form.
- Form: fullName, gender (chips), dob, heightCm, activityLevel, timezone, goalType, targets.
- Save: `PATCH /api/v1/me/profile` + `PUT /api/v1/me/goals`.
- States: `LoadingState` khi load, `ErrorState` với retry khi lỗi.

### 5.4 Styling

- **Không dùng** design system library (NativeWind, Tamagui, v.v.).
- Mỗi file dùng `StyleSheet.create` riêng.
- Palette lặp lại: `#111827` (dark text), `#2563eb` (primary blue), `#e5e7eb` (border), `#b91c1c` (error red).

---

## 6. Shared — Hợp đồng kiểu liên tầng

Package `@health-fitness/shared` (`shared/src/index.ts`) — **chỉ chứa kiểu TypeScript**, không có runtime code.

### 6.1 Error contract

```typescript
type ApiErrorBody = {
  code: string;     // Từ ApiErrorCodes
  message: string;
  details?: unknown; // ZodError flatten hoặc context bổ sung
  requestId: string;
};

const ApiErrorCodes = {
  VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN,
  NOT_FOUND, CONFLICT, INTERNAL_ERROR
} as const;
```

### 6.2 Auth DTOs

| Type | Trường chính |
|------|-------------|
| `AuthTokens` | `accessToken`, `refreshToken`, `expiresIn` |
| `AuthUserDto` | `id`, `email`, `status` |
| `RegisterResponseDto` | `{ user, tokens }` |
| `LoginResponseDto` | Alias `RegisterResponseDto` |
| `RefreshResponseDto` | `{ tokens }` |

### 6.3 User DTOs

| Type | Mô tả |
|------|-------|
| `UserProfileDto` | Profile serialize — dates/decimal → string |
| `UserGoalDto` | Goal row serialize |
| `MeResponseDto` | `{ id, email, status, profile, goals[] }` |
| `UpdateProfileBodyDto` | Partial profile patch |
| `PutGoalsBodyDto` | Goal upsert body |

### 6.4 Build config

- **Target:** ES2022, **Module:** NodeNext, **Strict:** true.
- Output: `dist/index.js` + `dist/index.d.ts` + declaration map.
- Consumer import: `import { MeResponseDto } from "@health-fitness/shared"`.

---

## 7. Cơ sở dữ liệu

### 7.1 Schema Prisma (4 model)

```
┌──────────────────┐
│      users       │
├──────────────────┤
│ id (PK, auto)    │
│ email (unique)   │───1:1──┐    ┌──────────────────┐
│ password_hash    │        └──> │  user_profiles   │
│ status (enum)    │             │  user_id (PK/FK) │
│ created_at       │             │  full_name       │
│ updated_at       │             │  gender, dob     │
├──────────────────┤             │  height_cm       │
│                  │───1:N──┐    │  activity_level  │
│                  │        │    │  timezone, locale│
│                  │        │    └──────────────────┘
│                  │───1:N──┤
└──────────────────┘        │    ┌──────────────────┐
                            ├──> │   user_goals     │
                            │    │ id (PK, auto)    │
                            │    │ user_id (FK, idx)│
                            │    │ goal_type        │
                            │    │ target_weight_kg │
                            │    │ weekly_workout.. │
                            │    │ daily_kcal..     │
                            │    │ start/target_date│
                            │    │ is_active        │
                            │    └──────────────────┘
                            │
                            └──> ┌──────────────────┐
                                 │ refresh_tokens   │
                                 │ id (PK, auto)    │
                                 │ user_id (FK, idx)│
                                 │ token_hash (idx) │
                                 │ expires_at       │
                                 │ created_at       │
                                 └──────────────────┘
```

### 7.2 Đặc điểm kỹ thuật

| Khía cạnh | Chi tiết |
|-----------|----------|
| Engine | InnoDB (MySQL 8.4 mặc định) |
| Charset | `utf8mb4` / `utf8mb4_unicode_ci` |
| ID strategy | Auto-increment `Int` |
| Decimal | `Decimal(6,2)` cho heightCm, targetWeightKg |
| Cascade | `onDelete: Cascade` trên tất cả FK → xoá user dọn sạch data liên quan |
| Index | `user_goals(user_id)`, `refresh_tokens(user_id)`, `refresh_tokens(token_hash)` |
| Enum | `UserStatus` (active, locked) — native MySQL enum qua Prisma |
| Naming | snake_case trong DB (`@@map`), camelCase trong TypeScript |

---

## 8. Hợp đồng API (OpenAPI)

**Spec:** OpenAPI 3.0.3 · **Base:** `http://localhost:3000`

### 8.1 Bảng endpoint

| Method | Path | Auth | Request Body | Success | Errors |
|--------|------|------|-------------|---------|--------|
| GET | `/api/v1/health` | — | — | 200 `{ status: "ok" }` | — |
| POST | `/api/v1/auth/register` | — | `{ email, password }` | 201 `{ user, tokens }` | 400, 409 |
| POST | `/api/v1/auth/login` | — | `{ email, password }` | 200 `{ user, tokens }` | 401 |
| POST | `/api/v1/auth/refresh` | — | `{ refreshToken }` | 200 `{ tokens }` | 401 |
| POST | `/api/v1/auth/logout` | Bearer | `{ refreshToken }` | 204 | 401 |
| GET | `/api/v1/me` | Bearer | — | 200 `MeResponseDto` | 401 |
| PATCH | `/api/v1/me/profile` | Bearer | `UpdateProfileBodyDto` | 200 `MeResponseDto` | 400, 401 |
| PUT | `/api/v1/me/goals` | Bearer | `PutGoalsBodyDto` | 200 `MeResponseDto` | 400, 401 |

### 8.2 Error response shape (mọi endpoint)

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": { "fieldErrors": {}, "formErrors": [] },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 8.3 Auth scheme

- Type: HTTP Bearer, format: JWT.
- Access token TTL mặc định: 900s (15 phút).
- Refresh token TTL mặc định: 604800s (7 ngày).

---

## 9. Luồng xác thực end-to-end

### 9.1 Register

```
Mobile                          Backend                         DB
  │                                │                              │
  │ POST /auth/register            │                              │
  │ { email, password }            │                              │
  │ ──────────────────────────────>│                              │
  │                                │ Zod validate                 │
  │                                │ Check email unique ─────────>│
  │                                │ bcrypt.hash(pw, rounds)      │
  │                                │ INSERT user + profile ──────>│
  │                                │ issueTokens:                 │
  │                                │   randomBytes(48) → raw      │
  │                                │   SHA256(raw) → jti/hash     │
  │                                │   sign accessJWT (15m)       │
  │                                │   sign refreshJWT (7d, jti)  │
  │                                │   INSERT refresh_tokens ────>│
  │                                │                              │
  │ 201 { user, tokens }           │                              │
  │ <──────────────────────────────│                              │
  │                                                               │
  │ SecureStore.save(tokens)                                      │
  │ Zustand: set user + tokens                                    │
  │ Navigation → MainNavigator                                    │
```

### 9.2 Auto-refresh (khi access token hết hạn)

```
Mobile                          Backend
  │                                │
  │ GET /me (Bearer: expired)      │
  │ ──────────────────────────────>│
  │ 401 UNAUTHORIZED               │
  │ <──────────────────────────────│
  │                                │
  │ [apiFetch detects 401 + auth]  │
  │                                │
  │ POST /auth/refresh             │
  │ { refreshToken: storedJWT }    │
  │ ──────────────────────────────>│
  │                                │ verify refreshJWT
  │                                │ lookup token_hash in DB
  │                                │ DELETE old row (rotation)
  │                                │ issueTokens → new pair
  │ 200 { tokens }                 │
  │ <──────────────────────────────│
  │                                │
  │ commitTokens (store + secure)  │
  │                                │
  │ RETRY: GET /me (new Bearer)    │
  │ ──────────────────────────────>│
  │ 200 MeResponseDto              │
  │ <──────────────────────────────│
```

### 9.3 Hydrate (khởi động app)

```
App.tsx mount
  │
  ▼
auth-store.hydrate()
  │
  ├── SecureStore.getTokens()
  │     ├── Không có tokens → status: "ready", user: null → AuthNavigator
  │     └── Có tokens ↓
  │
  ├── GET /api/v1/me (auth: true)
  │     ├── 200 → set user → status: "ready" → MainNavigator
  │     └── Fail → clearTokens → status: "ready" → AuthNavigator
```

---

## 10. Hạ tầng và vận hành

### 10.1 Docker Compose

```yaml
services:
  mysql:
    image: mysql:8.4
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: health_fitness
      MYSQL_USER: health_fitness
      MYSQL_PASSWORD: health_fitness
    ports: ["3306:3306"]
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

### 10.2 Biến môi trường Backend

| Biến | Giá trị mẫu | Vai trò |
|------|-------------|---------|
| `NODE_ENV` | `development` | Log level, Prisma log |
| `PORT` | `3000` | Cổng API |
| `DATABASE_URL` | `mysql://health_fitness:...@localhost:3306/health_fitness` | Prisma connection |
| `JWT_ACCESS_SECRET` | *(≥16 ký tự)* | Ký access token |
| `JWT_REFRESH_SECRET` | *(≥16 ký tự)* | Ký refresh token |
| `ACCESS_TOKEN_TTL_SEC` | `900` | 15 phút |
| `REFRESH_TOKEN_TTL_SEC` | `604800` | 7 ngày |
| `BCRYPT_ROUNDS` | `12` | Zod enforce 10–14 |

Validation bằng Zod tại startup — thiếu/sai biến → crash ngay với thông báo rõ.

### 10.3 Biến môi trường Mobile

| Biến | Giá trị mẫu |
|------|-------------|
| `EXPO_PUBLIC_API_URL` | `http://127.0.0.1:3000` |

Expo embed tại build time qua prefix `EXPO_PUBLIC_`. Android emulator cần dùng `10.0.2.2`.

---

## 11. Kiểm thử

### 11.1 Thiết lập

- **Framework:** Vitest (config tại `backend/vitest.config.ts`).
- **Setup file:** `backend/src/test-env.ts` — set default env vars cho test (NODE_ENV, DATABASE_URL test, JWT secrets).
- **Pattern:** `src/**/*.test.ts`.

### 11.2 Test hiện có

| File | Scope | Assertions |
|------|-------|------------|
| `backend/src/app.test.ts` | Smoke test | `GET /api/v1/health` → 200, body `{ status: "ok" }` |

### 11.3 Khoảng trống cần bổ sung

- Integration test cho auth flow (register → login → refresh → logout).
- Test validation error shape cho invalid payloads.
- Test protected route (`/me`) với token hết hạn / thiếu.
- Test `updateProfile` và `putGoals` với edge cases (empty body, invalid types).
- Mobile: chưa có test. Cần unit test cho auth-store actions và apiFetch refresh logic.

---

## 12. Bảo mật

### 12.1 Đã triển khai

| Biện pháp | Chi tiết |
|-----------|----------|
| Password hashing | bcrypt, rounds cấu hình (mặc định 12) |
| JWT signing | HS256, secret ≥16 ký tự, issuer verification |
| Refresh token rotation | Mỗi lần refresh: xoá token cũ, cấp mới — chống replay |
| Token storage (mobile) | Expo SecureStore (Keychain/Keystore) |
| Token storage (DB) | Chỉ lưu SHA-256 hash, không lưu raw token |
| Input validation | Zod trên mọi write endpoint, fail fast |
| Error contract | Không leak stack trace; error codes ổn định |
| Security headers | Helmet defaults (X-Content-Type-Options, HSTS, CSP, v.v.) |
| Env validation | Zod parse `process.env` tại startup |
| Request tracing | UUID v4 requestId trên mọi response |

### 12.2 Chưa triển khai

| Biện pháp | Ghi chú |
|-----------|---------|
| Rate limiting | Cần bổ sung, đặc biệt cho `/auth/login` và `/auth/register` |
| HTTPS termination | Cần reverse proxy (nginx/Caddy) cho production |
| CORS whitelist | Hiện dùng default cors(); cần restrict origin |
| CSP tuning | Helmet default; cần review cho production |
| Refresh token reuse detection | Nếu token cũ bị dùng lại → có thể revoke toàn bộ session family |
| Account lockout | Trường `status: locked` tồn tại nhưng chưa có logic trigger |

---

## 13. Hạn chế hiện tại và nợ kỹ thuật

| # | Vấn đề | Mức độ | Gợi ý xử lý |
|---|--------|--------|-------------|
| 1 | Chưa tách repository layer khỏi service | Thấp | Tách khi module phức tạp hơn (Phase 1+) |
| 2 | Mobile chưa có unit test | Trung bình | Thêm test cho auth-store, apiFetch |
| 3 | Backend chỉ có 1 smoke test | Trung bình | Bổ sung integration test auth flow |
| 4 | Styling lặp palette — không có theme provider | Thấp | Tạo `theme.ts` tập trung hoặc dùng NativeWind |
| 5 | Không có CI/CD pipeline | Cao | Thêm GitHub Actions: lint + test + type check |
| 6 | Không có rate limiting | Cao | `express-rate-limit` hoặc Redis-backed limiter |
| 7 | Worker chưa wired | Thấp (đúng roadmap) | Kích hoạt khi cần reminder/push notification |
| 8 | Không có logging phía mobile | Thấp | Sentry hoặc Expo error reporting |
| 9 | Prisma Client singleton dùng `globalThis` hack | Thấp | Chấp nhận được cho dev; production chạy 1 instance |
| 10 | `cors()` mở rộng | Trung bình | Restrict origin trong production |

---

## 14. Roadmap Phase 1+

Dựa trên `docs/phase-1-guide.md` và plan file trong repo:

### Phase 1 — Core tracking (3–4 tuần)

| Module | DB tables mới | Endpoints | Mobile screens |
|--------|--------------|-----------|----------------|
| Workouts | `exercises`, `workout_plans`, `workout_plan_exercises`, `workout_sessions`, `workout_sets` | CRUD exercises, plans, sessions, sets | Danh sách bài tập, tạo plan, log session |
| Nutrition | `food_items`, `meal_logs`, `meal_log_items` | CRUD food items, meal logs | Nhật ký bữa ăn, thêm món |
| Body Metrics | `body_metric_logs` | CRUD metric entries | Ghi nhận cân nặng, body fat, vòng eo |

### Phase 2+ (outline)

- Progress dashboard: tổng hợp daily/weekly, biểu đồ.
- Reminders: Redis queue + worker + Expo push notification.
- Offline queue phía mobile.
- Apple Health / Google Fit sync.

---

*Báo cáo này phản ánh trạng thái mã nguồn thực tế trong repository tại thời điểm lập. Để chuyển sang PDF: `npx markdown-pdf docs/bao-cao-ky-thuat.md` hoặc dùng Pandoc.*
