# Phase 0 Learning Guide

Tài liệu này giải thích từng khái niệm, luồng hoạt động, và cách vận hành dự án Health Fitness App đã scaffold ở Phase 0. Được viết để học — không phải chỉ để đọc qua.

---

## Mục lục

1. [Cấu trúc dự án tổng thể](#1-cấu-trúc-dự-án-tổng-thể)
2. [Lớp Shared — Hợp đồng dùng chung](#2-lớp-shared--hợp-đồng-dùng-chung)
3. [Backend — Kiến trúc Express](#3-backend--kiến-trúc-express)
4. [Database — Prisma + MySQL](#4-database--prisma--mysql)
5. [Hệ thống Authentication (Auth)](#5-hệ-thống-authentication-auth)
6. [Mobile — Expo + React Native](#6-mobile--expo--react-native)
7. [Luồng hoạt động đầu đến cuối](#7-luồng-hoạt-động-đầu-đến-cuối)
8. [Biến môi trường](#8-biến-môi-trường)
9. [Cách chạy dự án](#9-cách-chạy-dự-án)
10. [Cách Debug](#10-cách-debug)
11. [Những chú ý quan trọng](#11-những-chú-ý-quan-trọng)
12. [Từ điển từ khoá](#12-từ-điển-từ-khoá)

---

## 1. Cấu trúc dự án tổng thể

```
ReactPjApp/               ← root workspace (monorepo)
├── package.json          ← quản lý workspaces npm
├── docker-compose.yml    ← khởi động MySQL bằng Docker
├── shared/               ← kiểu TypeScript dùng chung (không có runtime)
├── backend/              ← Express API server
│   ├── prisma/           ← schema + migration MySQL
│   ├── src/
│   │   ├── app.ts        ← cấu hình Express app
│   │   ├── server.ts     ← entry point (listen port)
│   │   ├── modules/      ← domain code theo chức năng
│   │   │   ├── auth/     ← register, login, refresh, logout
│   │   │   └── users/    ← GET /me
│   │   └── shared/       ← code dùng chung trong backend
│   │       ├── auth/     ← ký / xác minh JWT
│   │       ├── config/   ← đọc biến môi trường
│   │       ├── crypto/   ← hash token
│   │       ├── db/       ← Prisma client singleton
│   │       ├── errors/   ← AppError class
│   │       ├── logger.ts ← pino logger
│   │       └── middleware/
│   └── openapi/          ← tài liệu API dạng YAML
├── mobile/               ← Expo app (React Native)
│   ├── App.tsx           ← entry point app
│   └── src/
│       ├── core/         ← hạ tầng dùng chung mobile
│       │   ├── api/      ← HTTP client
│       │   ├── config/   ← đọc biến môi trường Expo
│       │   ├── navigation/  ← cấu hình màn hình
│       │   ├── storage/  ← lưu token bảo mật
│       │   ├── store/    ← Zustand store
│       │   └── ui-states/  ← Loading, Error, Empty
│       └── features/
│           ├── auth/     ← màn hình đăng nhập / đăng ký
│           └── home/     ← màn hình chính
└── worker/               ← placeholder cho Phase 1+ (chưa có code)
```

**Tại sao tổ chức vậy?**

Đây là pattern **module-first monolith**: tất cả nằm trong một repo, nhưng tách rõ theo *vai trò* (`mobile`, `backend`, `worker`) và theo *domain chức năng* (`auth`, `users`, `workouts`...). Khi scale, từng domain có thể tách ra riêng mà không cần refactor nhiều.

---

## 2. Lớp Shared — Hợp đồng dùng chung

**File:** `shared/src/index.ts`

```
shared/
└── src/
    └── index.ts   ← chỉ chứa TypeScript types, không có logic runtime
```

### Tại sao cần `shared`?

Backend trả về JSON, Mobile nhận JSON. Nếu backend đổi tên field mà mobile không biết → bug ngầm. `shared` là **nguồn chân lý duy nhất** cho shape của response, đảm bảo cả hai bên đều compile theo cùng một contract.

### Các kiểu quan trọng

| Kiểu | Dùng cho |
|---|---|
| `ApiErrorBody` | Shape mọi lỗi trả về từ API |
| `ApiErrorCodes` | Mã lỗi ổn định (machine-readable) |
| `AuthTokens` | Access token + refresh token + TTL |
| `AuthUserDto` | Thông tin user an toàn (không có password) |
| `LoginResponseDto` | Response của `/auth/login` và `/auth/register` |

### Chú ý

- Package name là `@health-fitness/shared` (khai báo trong `shared/package.json`).
- Backend và Mobile đều import từ tên này, không import đường dẫn tương đối.
- Sau khi sửa `shared`, phải chạy `npm run build:shared` thì mới có hiệu lực.

---

## 3. Backend — Kiến trúc Express

### 3.1 Luồng request qua middleware

Mỗi HTTP request đi qua các tầng theo thứ tự:

```
Request đến
    │
    ▼
helmet()            ← bảo mật HTTP headers
    │
    ▼
cors()              ← cho phép cross-origin (dev)
    │
    ▼
express.json()      ← parse JSON body, giới hạn 1MB
    │
    ▼
requestIdMiddleware ← gán ID duy nhất cho mỗi request
    │
    ▼
log middleware      ← ghi log sau khi response xong
    │
    ▼
Router (auth/users) ← xử lý nghiệp vụ
    │
    ▼
errorHandlerMiddleware ← bắt mọi lỗi, trả JSON chuẩn
    │
    ▼
Response trả về client
```

### 3.2 Module pattern: controller → service → repository

```
auth.routes.ts      ← đăng ký route, gắn middleware validate
    │ gọi
    ▼
auth.controller.ts  ← nhận req, gọi service, trả res
    │ gọi
    ▼
auth.service.ts     ← logic nghiệp vụ (hash password, tạo token...)
    │ gọi
    ▼
prisma (db)         ← query MySQL
```

**Nguyên tắc:**
- Controller không chứa business logic, chỉ gọi service và trả response.
- Service không biết gì về HTTP, chỉ nhận/trả dữ liệu thuần.

### 3.3 requestId (correlation ID)

**File:** `backend/src/shared/middleware/request-id.ts`

Mỗi request được gán một UUID duy nhất (`x-request-id`). UUID này:
- Được gắn vào mọi dòng log.
- Được trả về trong mọi response lỗi.
- Dùng để trace một request cụ thể qua toàn bộ hệ thống khi debug.

Ví dụ response lỗi:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "details": { "fieldErrors": { "email": ["Invalid email"] } },
  "requestId": "89452144-bc6e-4abe-9424-d5a743076c6f"
}
```

### 3.4 Error handler tập trung

**File:** `backend/src/shared/middleware/error-handler.ts`

Xử lý 3 loại lỗi:
1. `ZodError` → 400 validation error (do `validateBody` middleware throw)
2. `AppError` → HTTP status do code chủ động throw (vd: 409 email trùng)
3. Lỗi khác → 500 internal error (lỗi không mong đợi)

Nhờ handler tập trung này, mọi controller chỉ cần gọi `next(err)` khi có lỗi, không cần tự xử lý format response lỗi.

### 3.5 `validateBody` middleware

**File:** `backend/src/shared/middleware/validate.ts`

```typescript
router.post("/register", validateBody(registerBodySchema), authController.register);
```

- Nhận một Zod schema làm tham số.
- Parse `req.body` theo schema đó.
- Nếu không hợp lệ → throw `ZodError` → error handler xử lý.
- Nếu hợp lệ → ghi đè `req.body` bằng dữ liệu đã được type-safe.

---

## 4. Database — Prisma + MySQL

### 4.1 Prisma là gì?

Prisma là **ORM** (Object-Relational Mapper): thay vì viết SQL thô, bạn mô tả cấu trúc DB bằng schema file, rồi Prisma sinh ra:
- TypeScript types cho mọi model
- Client API để query (`.findUnique`, `.create`, `.delete`...)
- Công cụ migration (tracking lịch sử thay đổi schema)

### 4.2 Đọc schema Prisma

**File:** `backend/prisma/schema.prisma`

```prisma
model User {
  id           Int        @id @default(autoincrement())
  email        String     @unique @db.VarChar(255)
  passwordHash String     @map("password_hash")  // ← tên cột MySQL là password_hash
  status       UserStatus @default(active)
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  profile       UserProfile?   // ← quan hệ 1-1
  goals         UserGoal[]     // ← quan hệ 1-nhiều
  refreshTokens RefreshToken[] // ← quan hệ 1-nhiều

  @@map("users") // ← tên bảng trong MySQL là "users"
}
```

**Giải thích từ khoá Prisma:**

| Từ khoá | Ý nghĩa |
|---|---|
| `@id` | Khoá chính |
| `@default(autoincrement())` | Tự tăng khi insert |
| `@unique` | Không trùng lặp |
| `@map("ten_cot")` | Ánh xạ sang tên cột MySQL |
| `@@map("ten_bang")` | Ánh xạ sang tên bảng MySQL |
| `@default(now())` | Tự gán thời điểm tạo |
| `@updatedAt` | Tự cập nhật khi record thay đổi |
| `?` sau kiểu | Nullable (có thể NULL) |
| `[]` sau kiểu | Mảng (quan hệ 1-nhiều) |
| `onDelete: Cascade` | Xoá user → tự xoá profile/goals/tokens |
| `@@index([userId])` | Tạo index trên cột để query nhanh |

### 4.3 Các bảng Phase 0

```
users ←──────────────────────────────────────────┐
  ├── user_profiles (1-1: mỗi user có 1 profile) │
  ├── user_goals (1-nhiều: nhiều mục tiêu)        │ CASCADE
  └── refresh_tokens (1-nhiều: nhiều thiết bị)   │
                                                  │
      Tất cả đều ON DELETE CASCADE: xoá user → xoá tất cả dữ liệu liên quan
```

### 4.4 Migration là gì?

Migration là **lịch sử thay đổi schema**, được lưu dưới dạng file SQL có version. Prisma tự track xem DB đang ở version nào.

```
prisma/migrations/
└── 20260414000000_init/
    └── migration.sql   ← SQL tạo 4 bảng ban đầu
```

**Khi nào cần tạo migration mới?** Khi bạn thêm bảng, thêm cột, đổi kiểu dữ liệu trong `schema.prisma`.

```bash
npx prisma migrate dev --name add_workout_table
# → Prisma diff schema vs DB hiện tại, sinh SQL, áp dụng, cập nhật lịch sử
```

### 4.5 Prisma Client singleton

**File:** `backend/src/shared/db/prisma.ts`

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... });
```

Tại sao dùng singleton? Vì `PrismaClient` duy trì connection pool. Nếu tạo nhiều instance → lãng phí connection, dễ gây lỗi "too many connections" trong dev.

---

## 5. Hệ thống Authentication (Auth)

### 5.1 Tổng quan: Access Token + Refresh Token

```
┌─────────────────────────────────────────────────────────────────┐
│  Vấn đề: làm sao biết request đến từ đúng user?                │
│                                                                  │
│  Giải pháp: dùng JWT (JSON Web Token)                           │
│                                                                  │
│  Access Token  ← dùng để call API, ngắn hạn (15 phút)          │
│  Refresh Token ← dùng để lấy access token mới, dài hạn (7 ngày)│
└─────────────────────────────────────────────────────────────────┘
```

**Tại sao cần 2 loại token?**

- Nếu chỉ có 1 token dài hạn: nếu bị lộ, attacker dùng mãi.
- Access token ngắn → bị lộ thì chỉ dùng được 15 phút.
- Refresh token lưu trong DB → có thể thu hồi (revoke) ngay lập tức.

### 5.2 JWT là gì?

JWT (JSON Web Token) có cấu trúc 3 phần, ngăn cách bởi dấu `.`:

```
eyJhbGciOiJIUzI1NiJ9   ← Header (thuật toán)
.
eyJzdWIiOjEsImVtYWlsIjoiZm9vQGJhci5jb20iLCJ0eXAiOiJhY2Nlc3MifQ==  ← Payload
.
ABC123signature       ← Signature (chữ ký, dùng secret để verify)
```

Payload sau khi decode:
```json
{
  "sub": 1,          ← subject = user ID
  "email": "foo@bar.com",
  "typ": "access",   ← loại token (tuỳ chỉnh thêm để phân biệt)
  "iss": "health-fitness-api",   ← issuer
  "exp": 1776139352  ← expiry timestamp
}
```

**Quan trọng:** JWT KHÔNG được mã hoá — ai cũng có thể decode phần payload. Chỉ có signature là bí mật. Không bao giờ bỏ password hay thông tin nhạy cảm vào payload.

### 5.3 Luồng Register

```
Mobile gửi: POST /api/v1/auth/register
  body: { email, password }
         │
         ▼
validateBody(registerBodySchema)
  ← Zod check: email hợp lệ, password >= 8 ký tự
         │
         ▼
authService.register()
  1. Kiểm tra email đã tồn tại? → 409 nếu trùng
  2. bcrypt.hash(password, 12) → tạo password hash
  3. prisma.user.create() → tạo user + profile rỗng
  4. issueTokens() → tạo access + refresh token
  5. Lưu hash của refresh token vào refresh_tokens table
         │
         ▼
Trả về:
  {
    user: { id, email, status },
    tokens: { accessToken, refreshToken, expiresIn }
  }
```

### 5.4 Tại sao hash refresh token trước khi lưu?

**File:** `backend/src/shared/crypto/token-hash.ts`

```typescript
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
```

Trong `auth.service.ts`:
```typescript
const rawRefresh = randomBytes(48).toString("hex"); // sinh ngẫu nhiên
const jti = hashToken(rawRefresh);                  // hash lưu vào DB
const refreshTokenJwt = signRefreshToken(userId, jti); // jti là "identifier"
```

Tại sao? Vì nếu DB bị lộ, attacker lấy được hash nhưng không thể reverse lại token gốc. Chỉ có người dùng giữ token gốc trong JWT.

**jti** (JWT ID) = hash của raw token = "chìa khoá" để tìm bản ghi trong DB.

### 5.5 Luồng Login

```
Mobile gửi: POST /api/v1/auth/login
  body: { email, password }
         │
         ▼
authService.login()
  1. Tìm user theo email
  2. bcrypt.compare(password, passwordHash)
     → Nếu sai: 401 "Invalid email or password"
     (Trả cùng message cho cả email sai lẫn password sai → bảo mật)
  3. issueTokens() → trả tokens mới
```

**Tại sao trả cùng message cho cả email và password sai?**

Nếu trả "Email không tồn tại" → attacker biết được email nào đã đăng ký → có thể dùng để tấn công.

### 5.6 Luồng Refresh Token (rotation)

```
Mobile gửi: POST /api/v1/auth/refresh
  body: { refreshToken: <JWT> }
         │
         ▼
authService.refresh()
  1. verifyRefreshToken(jwt) → giải mã, lấy jti và sub (userId)
  2. Tìm bản ghi: refresh_tokens WHERE userId=sub AND tokenHash=jti
  3. Kiểm tra expiresAt > now → nếu hết hạn: 401
  4. XOÁ bản ghi cũ (rotation: mỗi refresh dùng một lần)
  5. issueTokens() → tạo cặp token MỚI hoàn toàn
  6. Trả tokens mới
```

**Token Rotation** có nghĩa là mỗi refresh token chỉ dùng được 1 lần. Sau khi dùng, bị xoá và bộ mới được cấp. Lợi ích: nếu token bị đánh cắp và dùng trước, server phát hiện được (bản ghi đã bị xoá).

### 5.7 Luồng Logout

```
Mobile gửi: POST /api/v1/auth/logout
  header: Authorization: Bearer <accessToken>
  body: { refreshToken: <JWT> }
         │
         ▼
requireAuth middleware  ← xác thực access token, gắn user vào request
         │
         ▼
authService.logout()
  1. Verify refresh token, lấy jti
  2. Xoá bản ghi refresh_tokens WHERE userId AND tokenHash=jti
  → Access token cũ vẫn còn hiệu lực đến khi hết hạn (15 phút)
  → Refresh token bị revoke ngay lập tức
```

### 5.8 requireAuth middleware

**File:** `backend/src/shared/middleware/require-auth.ts`

```
Request đến route cần auth
  │
  ▼
Lấy header: Authorization: Bearer <token>
  │
  ▼
verifyAccessToken(token)
  → Nếu sai/hết hạn: 401
  → Nếu đúng: gắn req.user = { id, email }
  │
  ▼
Route handler chạy, dùng req.user
```

### 5.9 bcrypt là gì?

`bcrypt.hash(password, rounds)` không phải là mã hoá thông thường — nó là hàm **one-way** (không thể reverse). rounds=12 có nghĩa là tính toán qua 2^12 = 4096 lần để chủ động làm chậm. Kẻ tấn công muốn brute-force phải mất rất nhiều thời gian.

Dùng `bcrypt.compare(plain, hash)` để kiểm tra — không bao giờ hash lại rồi so sánh.

---

## 6. Mobile — Expo + React Native

### 6.1 Luồng khởi động app

```
App.tsx (entry point)
  │
  ├── useEffect → hydrate()   ← chạy 1 lần khi app mở
  │       │
  │       ▼
  │   getTokens() từ SecureStore
  │       │
  │       ├── Không có token → status="ready", user=null
  │       └── Có token → GET /api/v1/me để lấy user info
  │               │
  │               ├── Thành công → user được set, status="ready"
  │               └── Thất bại (token hết hạn) → clearTokens, status="ready"
  │
  ▼
Nếu status === "loading"   → LoadingState ("Starting...")
Nếu status === "ready"     → AppNavigator
```

### 6.2 Điều hướng dựa trên trạng thái auth

```
AppNavigator
  │
  ├── user != null → MainNavigator (HomeScreen)
  └── user == null → AuthNavigator (LoginScreen, RegisterScreen)
```

Khi user đăng nhập xong → `useAuthStore` cập nhật `user` → React tự re-render → `AppNavigator` tự chuyển sang `MainNavigator`. Không cần gọi `navigation.navigate()` thủ công.

### 6.3 Zustand store

**File:** `mobile/src/core/store/auth-store.ts`

Zustand là thư viện quản lý state. So với Redux phức tạp, Zustand đơn giản hơn nhiều:

```typescript
export const useAuthStore = create<AuthState>((set, get) => ({
  // state
  user: null,
  status: "loading",

  // actions
  login: async (email, password) => {
    set({ status: "loading" });   // cập nhật state
    const res = await apiFetch(...);
    set({ user: res.user, status: "ready" });
  }
}));
```

Dùng trong component:
```typescript
const user = useAuthStore((s) => s.user);      // selector
const login = useAuthStore((s) => s.login);    // action
```

**`set`** = cập nhật state (merge, không replace).
**`get`** = đọc state hiện tại từ bên trong action.

### 6.4 apiFetch — HTTP client tập trung

**File:** `mobile/src/core/api/client.ts`

```typescript
const res = await apiFetch<LoginResponseDto>("/api/v1/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
```

Tại sao không dùng `fetch` trực tiếp trong screen?

- `apiFetch` tự prepend `apiBaseUrl` (đọc từ env).
- Tự set `Content-Type: application/json`.
- Tự gắn `Authorization: Bearer <token>` nếu truyền `accessToken`.
- Throw `ApiClientError` khi server trả lỗi (không phải 2xx).
- Một chỗ duy nhất để thêm logic chung (retry, logging...).

### 6.5 expo-secure-store

**File:** `mobile/src/core/storage/secure-store.ts`

Trên mobile, không được lưu token vào `AsyncStorage` (không được mã hoá). `expo-secure-store` lưu dữ liệu vào:
- iOS: Keychain Services
- Android: Keystore

Đây là nơi lưu trữ nhạy cảm, hệ điều hành bảo vệ.

### 6.6 UI States — loading, error, empty

**Folder:** `mobile/src/core/ui-states/`

| Component | Dùng khi |
|---|---|
| `LoadingState` | Đang fetch dữ liệu |
| `ErrorState` | Fetch thất bại, có thể retry |
| `EmptyState` | Thành công nhưng không có dữ liệu |

Mọi màn hình có dữ liệu bất đồng bộ **bắt buộc** hiển thị cả 3 trạng thái này.

---

## 7. Luồng hoạt động đầu đến cuối

### 7.1 Đăng ký tài khoản mới

```
User nhập email + password trên RegisterScreen
  │ onPress → store.register(email, password)
  ▼
store: set status="loading"
  │ gọi
  ▼
apiFetch POST /api/v1/auth/register
  │ body: { email, password }
  ▼
Backend:
  validateBody → Zod check OK
  authService.register()
    → check email trùng? → OK
    → bcrypt.hash(password, 12)
    → prisma.user.create({ email, passwordHash, profile: {create:{}} })
    → issueTokens(userId, email)
        → signAccessToken → JWT ngắn hạn 15 phút
        → signRefreshToken(userId, jti) → JWT dài hạn 7 ngày
        → prisma.refreshToken.create({ userId, tokenHash: jti, expiresAt })
    → return { user, tokens }
  ← 201 { user: {...}, tokens: { accessToken, refreshToken, expiresIn } }
  ▼
store:
  saveTokens(accessToken, refreshToken) → SecureStore
  set({ user, accessToken, refreshToken, status: "ready" })
  ▼
AppNavigator tự re-render → hiện MainNavigator (HomeScreen)
```

### 7.2 Mở lại app sau khi đã đăng nhập

```
App.tsx mount → hydrate()
  │
  ▼
getTokens() từ SecureStore → { accessToken, refreshToken }
  │
  ▼ (có token)
apiFetch GET /api/v1/me { Authorization: Bearer <accessToken> }
  │
  ▼
Backend:
  requireAuth → verifyAccessToken(token) → OK
  usersService.getMe(userId)
    → prisma.user.findUnique({ include: profile, goals })
  ← 200 { id, email, status, profile, goals }
  ▼
store: set({ user, status: "ready" })
  ▼
HomeScreen hiển thị email user
```

---

## 8. Biến môi trường

### Backend — `backend/.env`

Sao chép từ `backend/.env.example`:

```bash
NODE_ENV=development
PORT=3000

# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://health_fitness:health_fitness@127.0.0.1:3306/health_fitness"

# Secret ngẫu nhiên, tối thiểu 16 ký tự
JWT_ACCESS_SECRET="change-me-access-min-16-chars!!"
JWT_REFRESH_SECRET="change-me-refresh-min-16-chars!!"

ACCESS_TOKEN_TTL_SEC=900     # 15 phút
REFRESH_TOKEN_TTL_SEC=604800 # 7 ngày
BCRYPT_ROUNDS=12
```

**File `backend/src/shared/config/env.ts`** đọc và validate mọi biến bằng Zod. Nếu thiếu hoặc sai → app throw lỗi ngay khi khởi động, không chạy ngầm với config sai.

### Mobile — `mobile/.env`

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
```

Expo đọc biến prefix `EXPO_PUBLIC_` và nhúng vào bundle lúc build. Không bao giờ đặt secret vào biến `EXPO_PUBLIC_` vì nó sẽ công khai trong app bundle.

**Lưu ý địa chỉ API theo môi trường:**

| Môi trường | Địa chỉ |
|---|---|
| iOS Simulator | `http://127.0.0.1:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Thiết bị thật (cùng WiFi) | `http://192.168.x.x:3000` (IP máy tính) |

---

## 9. Cách chạy dự án

### Bước 1: Chuẩn bị môi trường

```bash
# Yêu cầu Node.js 20+
node --version

# Yêu cầu Docker (để chạy MySQL)
docker --version
```

### Bước 2: Cài đặt dependencies

```bash
# Từ thư mục root (d:\ReactPjApp)
npm install
```

### Bước 3: Khởi động MySQL

```bash
# Từ root
docker compose up -d mysql

# Kiểm tra đã chạy chưa
docker compose ps
```

### Bước 4: Cấu hình backend

```bash
cd backend

# Sao chép file env
copy .env.example .env   # Windows
# hoặc
cp .env.example .env     # Linux/Mac

# Chỉnh sửa .env nếu cần (mặc định phù hợp với Docker compose)
```

### Bước 5: Chạy database migration

```bash
# Từ thư mục backend
npx prisma migrate deploy

# Kiểm tra DB bằng Prisma Studio (giao diện web)
npx prisma studio
```

### Bước 6: Khởi động backend

```bash
# Từ root
npm run dev:backend

# Kiểm tra
curl http://127.0.0.1:3000/api/v1/health
# Kết quả: {"status":"ok"}
```

### Bước 7: Cấu hình mobile

```bash
cd mobile
copy .env.example .env   # Windows
# Điều chỉnh EXPO_PUBLIC_API_URL theo môi trường chạy app
```

### Bước 8: Khởi động mobile

```bash
# Từ root
npm run dev:mobile

# Expo CLI sẽ mở browser với QR code
# - Quét QR bằng Expo Go (điện thoại thật)
# - Nhấn "a" để mở Android Emulator
# - Nhấn "i" để mở iOS Simulator
```

### Bước 9: Chạy tests

```bash
# Test backend
npm run test:backend

# Typecheck
cd backend; npx tsc --noEmit
cd mobile; npx tsc --noEmit
```

---

## 10. Cách Debug

### 10.1 Debug backend

**Xem log real-time:**

Backend dùng `pino` logger output JSON. Khi chạy `npm run dev:backend`, log hiện trong terminal.

Mỗi log có dạng:
```json
{
  "level": 30,
  "method": "POST",
  "path": "/api/v1/auth/login",
  "status": 401,
  "durationMs": 12,
  "requestId": "abc-123"
}
```

Dùng `requestId` để tìm tất cả log liên quan đến 1 request.

**Test API bằng curl hoặc Postman:**

```bash
# Register
curl -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"

# Login
curl -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"

# Lấy thông tin user (thay <token> bằng accessToken từ login)
curl http://127.0.0.1:3000/api/v1/me \
  -H "Authorization: Bearer <token>"
```

**Xem dữ liệu trong DB:**

```bash
cd backend
npx prisma studio
# Mở http://localhost:5555 → xem/sửa dữ liệu trực tiếp
```

**Lỗi thường gặp backend:**

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| `Invalid environment` khi start | Thiếu biến env | Copy `.env.example` → `.env` |
| `Can't connect to MySQL` | MySQL chưa chạy | `docker compose up -d mysql` |
| `P1001: Can't reach database` | DATABASE_URL sai | Kiểm tra host, port, user, password |
| `401 Invalid access token` | Token hết hạn | Gọi `/auth/refresh` để lấy token mới |
| `409 Email already registered` | Email đã tồn tại | Dùng email khác hoặc xem DB |

### 10.2 Debug mobile

**React Native Debugger / Expo Dev Tools:**

Khi chạy Expo, nhấn `j` trong terminal để mở JS debugger, hoặc lắc điện thoại → "Open Debugger".

**Xem log trên thiết bị:**

```bash
# Trong terminal Expo, log từ console.log() hiện trực tiếp
# Hoặc dùng:
npx expo start --clear   # clear cache nếu app bị stuck
```

**Lỗi thường gặp mobile:**

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| Network request failed | Sai `EXPO_PUBLIC_API_URL` | Dùng `10.0.2.2:3000` cho Android Emulator |
| Token không lưu được | `expo-secure-store` chưa cài | `npm install -w mobile expo-secure-store` |
| App bị stuck ở LoadingState | `hydrate()` throw lỗi | Xem log, check API URL |
| `Module not found: @health-fitness/shared` | Shared chưa build | `npm run build:shared` |

**Network inspection:**

Thêm vào `apiFetch` tạm thời để debug:
```typescript
console.log("API request:", method, url);
console.log("API response status:", res.status);
```

**Xem SecureStore trong Expo Go:**

Không thể xem trực tiếp — đây là tính năng bảo mật. Để reset, gọi `clearTokens()` hoặc xoá/reinstall app.

### 10.3 Debug JWT

Dán token vào [jwt.io](https://jwt.io) để decode và xem payload. **Chỉ dùng khi debug ở môi trường dev** — không bao giờ dán token production lên web bên ngoài.

---

## 11. Những chú ý quan trọng

### Bảo mật

- Không bao giờ commit file `.env` vào git (đã có trong `.gitignore`).
- JWT secret phải đủ dài và ngẫu nhiên trong production.
- `BCRYPT_ROUNDS=12` đủ cho dev; production có thể tăng lên 13-14 (chậm hơn nhưng an toàn hơn).
- Access token trong memory (Zustand) bị xoá khi đóng app → phải `hydrate()` lại.

### Database

- **Không bao giờ** tự sửa file `migration.sql` đã apply. Nếu cần sửa schema → tạo migration mới.
- Chạy `npx prisma migrate deploy` (không phải `dev`) trong staging/production.
- Sau khi sửa `schema.prisma`, phải chạy `npx prisma generate` để cập nhật TypeScript types.

### Mobile

- Env variable `EXPO_PUBLIC_*` bị nhúng vào bundle lúc build — không bí mật.
- Khi đổi `.env` của Expo → phải restart Expo (Ctrl+C rồi `npm run dev:mobile`).
- Lệnh `--clear` (`npx expo start --clear`) xoá cache Metro bundler, dùng khi gặp lỗi lạ.

### TypeScript

- `shared` package phải build (`npm run build:shared`) trước khi `tsc` hoặc import từ backend/mobile.
- Mobile pin `@types/react@18.3.18` để tránh xung đột type với React Native.
- Backend dùng ESM (`"type": "module"`), nên import phải có `.js` extension (dù file thực là `.ts`).

### Monorepo npm workspaces

- Chạy `npm install` từ **root** (không phải từng subfolder riêng).
- `npm install -w mobile <package>` để thêm dependency vào workspace `mobile`.
- `node_modules` được hoist lên root khi có thể (shared giữa các packages).

---

## 12. Từ điển từ khoá

| Từ khoá | Giải thích |
|---|---|
| **JWT** | JSON Web Token — chuỗi mã hoá chứa thông tin user, dùng để xác thực |
| **Access Token** | JWT ngắn hạn (15 phút), dùng để call API |
| **Refresh Token** | JWT dài hạn (7 ngày), dùng để lấy access token mới |
| **Token Rotation** | Mỗi refresh token chỉ dùng 1 lần, sau đó bị xoá và cấp mới |
| **jti** | JWT ID — định danh duy nhất của một refresh token |
| **bcrypt** | Hàm hash mật khẩu một chiều, chủ động chậm để chống brute-force |
| **ORM** | Object-Relational Mapper — ánh xạ giữa code và database |
| **Prisma** | ORM cho Node.js/TypeScript với MySQL, PostgreSQL... |
| **Migration** | File SQL có version, lưu lịch sử thay đổi schema database |
| **Middleware** | Hàm xử lý request trước khi đến route handler |
| **Monorepo** | Nhiều package/project trong cùng một repository |
| **npm workspaces** | Tính năng npm quản lý nhiều package trong monorepo |
| **Zod** | Thư viện validation và parse TypeScript runtime |
| **DTO** | Data Transfer Object — kiểu mô tả shape của data vào/ra API |
| **Zustand** | Thư viện quản lý state nhẹ cho React |
| **Hydrate** | Quá trình khởi động app lấy lại session từ storage |
| **SecureStore** | Lưu trữ bảo mật trên mobile (iOS Keychain / Android Keystore) |
| **Singleton** | Pattern đảm bảo chỉ có một instance duy nhất (vd: Prisma client) |
| **requestId** | UUID gắn vào mỗi request để trace log |
| **AppError** | Class lỗi tuỳ chỉnh mang HTTP status + stable error code |
| **Cascade** | Khi xoá record cha, tự động xoá record con liên quan |
| **CORS** | Cross-Origin Resource Sharing — policy cho phép web/app khác gọi API |
| **helmet** | Middleware Express thiết lập HTTP headers bảo mật |
| **pino** | Logger JSON hiệu năng cao cho Node.js |
| **Expo** | Framework để build React Native app, không cần Xcode/Android Studio |
| **ESM** | ECMAScript Modules — hệ thống module hiện đại (`import/export`) |
