# Hướng dẫn chạy dự án (Health Fitness Monorepo)

Tài liệu này mô tả cách chạy monorepo (Expo + Express + Prisma + MySQL) theo từng bước, kèm gợi ý dùng bao nhiêu terminal. Phạm vi code hiện tại gồm **Phase 0** (auth, hồ sơ) và **Phase 1** (tập luyện, dinh dưỡng, chỉ số cơ thể) sau khi đã chạy migration.

### Chạy nhanh để test (một terminal, từ thư mục gốc repo)

Sau `npm install` lần đầu. Script `setup:dev` / `quickstart` sẽ **tự tạo** `backend/.env` và `mobile/.env` từ file `.env.example` nếu bạn chưa có (không ghi đè file đã chỉnh sửa).

| Lệnh | Ý nghĩa |
|------|---------|
| `npm run quickstart` | Bật MySQL (Docker) → build shared → tạo `mobile/.env` nếu thiếu → migrate + seed user dev → **chạy đồng thời** API + Expo |
| `npm run quickstart:app` | Giống trên nhưng **không** gọi Docker — dùng khi MySQL đã chạy sẵn (container hoặc cài local) |
| `npm run dev:all` | Chỉ chạy API + Expo (không migrate/seed); dùng hằng ngày sau khi đã `setup:dev` |

**Đăng nhập thử sau khi seed:** email `dev@local.test`, mật khẩu `DevPass12345` (xem mục migration / seed tài khoản dev).

Nếu dùng **điện thoại thật** hoặc **Android emulator**, sửa `EXPO_PUBLIC_API_URL` trong `mobile/.env` rồi chạy lại Expo (`npx expo start -c`). Chi tiết xem mục cấu hình API và lỗi “Network request failed”.

### Test tạo tài khoản và đăng nhập thành công

1. **Kết nối API:** App phải gọi được backend (không còn lỗi “Không kết nối được máy chủ API…”). Trên điện thoại thật: dùng IP LAN máy tính trong `EXPO_PUBLIC_API_URL`. Android emulator: `http://10.0.2.2:3000`. Xác nhận trên PC: `http://127.0.0.1:3000/api/v1/health` trả `{"status":"ok"}`.
2. **Chạy API:** `npm run dev:backend` hoặc `npm run dev:all`.
3. **Đăng ký:** Màn **Create account** → email **chưa dùng** trong DB (ví dụ `ban.test.1@gmail.com`), mật khẩu **ít nhất 8 ký tự** → nhấn **Create account**. Khi thành công, server trả token và app **vào thẳng màn Home** (đã đăng nhập).
4. **Thử đăng nhập lại:** **Đăng xuất** → **Sign in** → nhập lại đúng email/mật khẩu vừa tạo → vào Home.

**Cách nhanh chỉ cần đăng nhập (không tạo mới):** dùng tài khoản seed `dev@local.test` / `DevPass12345` sau khi đã chạy `npm run setup:dev` hoặc `npm run db:seed` trong `backend/`.

---

## 1) Yêu cầu hệ thống

- Node.js **>= 20**
- npm (đi kèm Node)
- **Docker Desktop** (khuyến nghị để chạy MySQL bằng container)
- Hệ điều hành: Windows / macOS / Linux

---

## 2) Cấu trúc repo

| Thư mục | Nội dung |
|---------|----------|
| `mobile/` | Ứng dụng Expo (Android / iOS / Web) |
| `backend/` | API Express + TypeScript + Prisma |
| `shared/` | Package `@health-fitness/shared` (kiểu dùng chung client–server) |
| `worker/` | Giữ chỗ cho job nền (chưa bắt buộc cho dev) |

---

## 3) Quy tắc dùng terminal

- **Một terminal** đủ cho: cài đặt, copy `.env`, migrate (khi MySQL đã chạy).
- **Hai terminal** khi dev hằng ngày:
  - **Terminal 1**: backend (`npm run dev:backend` từ thư mục gốc repo).
  - **Terminal 2**: Expo (`npm run dev:mobile` hoặc web).
- **Terminal 3** (tuỳ chọn): chạy test, Prisma Studio, lệnh phụ — tránh chen vào terminal đang chạy server.

---

## 4) Cài đặt lần đầu (một terminal, tại thư mục gốc repo)

```bash
npm install
```

Build package shared (nên chạy sau khi clone hoặc khi đổi kiểu trong `shared/`):

```bash
npm run build:shared
```

Tạo file môi trường nếu chưa có:

**Windows (PowerShell hoặc cmd):**

```bash
copy backend\.env.example backend\.env
copy mobile\.env.example mobile\.env
```

**macOS / Linux:**

```bash
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

Chỉnh `backend/.env` (ít nhất `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` đủ dài). Với MySQL trong Docker Compose mặc định của repo, chuỗi kết nối thường giống ví dụ trong `backend/.env.example`.

Chỉnh `mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
```

**Android Emulator:** máy ảo không phải `127.0.0.1` của máy host — dùng `http://10.0.2.2:3000` trong `EXPO_PUBLIC_API_URL` nếu API chạy trên máy dev.

---

## 5) Khởi động MySQL (Terminal 1)

Từ thư mục gốc repo:

```bash
docker compose up -d mysql
docker compose ps
```

Service `mysql` ở trạng thái running là được. Database mặc định trong compose: `health_fitness` (user/password xem `docker-compose.yml`).

---

## 6) Migration Prisma (cùng terminal sau khi MySQL sẵn sàng)

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..
```

- Lệnh này áp dụng toàn bộ migration (gồm **Phase 1**: bảng workout, nutrition, body metrics và dữ liệu seed catalog mẫu nếu có trong migration).
- Nếu dùng database khác (ví dụ DB test riêng), đặt `DATABASE_URL` tương ứng rồi chạy lại `migrate deploy` cho DB đó.

### Tài khoản dev để đăng nhập (tuỳ chọn)

Sau khi migrate, có thể tạo **một user cố định** chỉ dùng trên máy dev (không dùng production):

```bash
cd backend
npm run db:seed
```

Thông tin đăng nhập (cũng ghi trong `backend/prisma/seed.ts`):

| Trường | Giá trị |
|--------|---------|
| Email | `dev@local.test` |
| Mật khẩu | `DevPass12345` |

Chạy lại `npm run db:seed` bất kỳ lúc nào sẽ **cập nhật lại mật khẩu** về giá trị trên (upsert theo email).

---

## 7) Chạy Backend API (Terminal 1)

Từ **thư mục gốc** repo:

```bash
npm run dev:backend
```

Giữ terminal này mở khi đang dev.

Mặc định:

- Base URL: `http://127.0.0.1:3000` (hoặc `PORT` trong `backend/.env`)
- Health: `GET http://127.0.0.1:3000/api/v1/health`
- OpenAPI (tham khảo): `backend/openapi/openapi.yaml`

---

## 8) Chạy Mobile hoặc Web (Terminal 2)

Mở terminal mới tại thư mục gốc repo.

### Cách A — Expo (QR / thiết bị / emulator)

```bash
npm run dev:mobile
```

### Cách B — Expo Web

```bash
npm run web -w mobile
```

Nếu port `8081` bị chiếm:

```bash
cd mobile
npx expo start --web --port 8082
```

---

## 9) Nếu Web báo thiếu dependency

Trong thư mục `mobile/`:

```bash
npx expo install react-dom react-native-web
npx expo install expo-secure-store react-native-safe-area-context react-native-screens
```

---

## 10) Lệnh hay dùng (từ thư mục gốc repo)

| Mục đích | Lệnh |
|----------|------|
| **Một lệnh: Docker + migrate + seed + API + Expo** | `npm run quickstart` |
| MySQL đã chạy sẵn: setup + API + Expo | `npm run quickstart:app` |
| Chỉ chạy API + Expo (sau khi đã setup) | `npm run dev:all` |
| Setup (shared, `mobile/.env`, migrate, seed) | `npm run setup:dev` |
| Bật MySQL (Docker) | `npm run docker:mysql` |
| Build shared | `npm run build:shared` |
| Dev backend | `npm run dev:backend` |
| Dev Expo | `npm run dev:mobile` |
| Expo Web | `npm run web -w mobile` |
| Test backend (unit + smoke, **không** cần DB integration) | `npm run test:backend` |

---

## 11) Test backend chi tiết

Trong thư mục `backend/`:

| Mục đích | Lệnh |
|----------|------|
| Test mặc định (Vitest, không gồm file `*.integration.test.ts`) | `npm test` |
| Test tích hợp DB + JWT (Phase 1 end-to-end API) | `npm run test:integration` |

**Test tích hợp** (`npm run test:integration`):

- Cần MySQL đã **migrate** (cùng schema với dev, có seed catalog nếu migration có INSERT).
- Biến môi trường `DATABASE_URL` trỏ tới database đó. File `backend/src/test-env.ts` có giá trị mặc định cho Vitest; bạn có thể **ghi đè** `DATABASE_URL` trong shell trước khi chạy (ví dụ trỏ về `health_fitness` trên máy local).

**Windows PowerShell (ví dụ):**

```powershell
cd backend
$env:DATABASE_URL="mysql://health_fitness:health_fitness@127.0.0.1:3306/health_fitness"
npm run test:integration
```

**Công cụ DB (tuỳ chọn):**

```bash
cd backend
npx prisma studio
```

---

## 12) Kiểm tra nhanh sau khi chạy

- [ ] `docker compose ps` — MySQL running  
- [ ] `GET /api/v1/health` — HTTP 200  
- [ ] Expo mở được app (thiết bị / web)  
- [ ] Đã có `backend/.env` và `mobile/.env` đúng API URL  

Sau đăng nhập, có thể thử các màn **Tập luyện**, **Dinh dưỡng**, **Chỉ số cơ thể** (Phase 1) khi backend và DB đã migrate.

---

## 13) Lỗi thường gặp

| Hiện tượng | Gợi ý xử lý |
|------------|-------------|
| Port 3000 đã dùng | Đổi `PORT` trong `backend/.env`, khởi động lại backend; cập nhật `EXPO_PUBLIC_API_URL` cho khớp. |
| Port 8081 (Expo) bị chiếm | Chạy web với `--port 8082` (hoặc port khác). |
| Không kết nối MySQL | Kiểm tra `DATABASE_URL`, firewall, và `docker compose ps`. |
| `prisma migrate` lỗi | Đảm bảo MySQL đã chạy trước khi migrate. |
| **Network request failed** khi đăng nhập | `127.0.0.1` chỉ đúng trên máy dev / iOS Simulator. **Điện thoại thật:** đặt `EXPO_PUBLIC_API_URL=http://<IP-LAN-PC>:3000` (cùng Wi‑Fi). **Android emulator:** `http://10.0.2.2:3000`. Sửa `mobile/.env` rồi chạy lại Expo (`npx expo start -c`). Android: đã bật `usesCleartextTraffic` trong `app.json` cho HTTP dev. |
| Mobile không gọi được API (Android emulator) | Dùng `10.0.2.2` thay cho `127.0.0.1` trong `mobile/.env`. |
| Expo báo lệch phiên bản package | `cd mobile && npx expo install <package>` |
| Test integration fail | Kiểm tra DB đã migrate; thử ghi đè `DATABASE_URL` trỏ đúng DB có schema + seed. |

---

## 14) Quy trình gợi ý mỗi ngày

1. **Terminal 1:** `docker compose up -d mysql` → `npm run dev:backend`  
2. **Terminal 2:** `npm run dev:mobile` hoặc `npm run web -w mobile`  
3. **Terminal 3 (khi cần):** `npm test` trong `backend/`, `npx prisma studio`, hoặc `npm run test:integration` (khi đã cấu hình DB)

---

*Tài liệu phản ánh trạng thái monorepo tại thời điểm cập nhật (Phase 0 + Phase 1 tracking).*
