# Chức năng ứng dụng & hướng dẫn cài đặt

Tài liệu này giúp **bất kỳ ai** clone repo đều có thể cài đặt, chạy app, và hiểu **các màn hình / luồng** hiện có trong monorepo **Health & Fitness** (Expo + API + MySQL).  
Hướng dẫn chạy chi tiết từng bước (terminal, lỗi mạng, tài khoản thử) nằm thêm ở: [`run-project-guide.md`](./run-project-guide.md).

---

## 1. Tổng quan dự án

| Thành phần | Mô tả |
|------------|--------|
| `mobile/` | Ứng dụng **Expo (React Native)** — Android, iOS, web. Giao diện theo module **module01** → **module06**. |
| `backend/` | **Express + TypeScript + Prisma** — API `/api/v1/...`, MySQL. |
| `shared/` | Package `@health-fitness/shared` — kiểu dùng chung client–server. |
| `worker/` | Dành cho job nền (tùy giai đoạn dự án). |

**Yêu cầu tối thiểu:** Node.js **>= 20**, npm, (khuyến nghị) **Docker** cho MySQL.  
Hệ điều hành: Windows, macOS, Linux.

---

## 2. Cài đặt để mọi người đều truy cập được

### 2.1. Clone repository

```bash
git clone <URL-repo-của-bạn>.git
cd <thư-mục-repo>
```

### 2.2. Cài dependency (lần đầu, tại thư mục gốc)

```bash
npm install
```

### 2.3. Chạy nhanh (một lệnh — MySQL + migrate/seed + API + Expo)

Khi đã cài **Docker Desktop** và muốn bật MySQL tự động:

```bash
npm run quickstart
```

- Script sẽ tạo `backend/.env` và `mobile/.env` từ `.env.example` nếu chưa có (không ghi đè file bạn đã sửa).
- Sau khi seed, có thể đăng nhập thử: `dev@local.test` / `DevPass12345` (xem thêm `run-project-guide.md`).

Nếu **MySQL đã chạy sẵn** (container hoặc cài local), dùng:

```bash
npm run quickstart:app
```

### 2.4. Chạy từng phần (hằng ngày)

Sau khi đã `setup:dev` / migrate xong:

| Lệnh (từ thư mục gốc) | Ý nghĩa |
|------------------------|---------|
| `npm run dev:backend` | Chỉ API |
| `npm run dev:mobile` | Chỉ Expo |
| `npm run dev:all` | API + Expo cùng lúc |

Kiểm tra API: trình duyệt hoặc `curl` — `GET http://127.0.0.1:3000/api/v1/health` → `{"status":"ok"}`.

### 2.5. Thiết bị thật / Android emulator — cấu hình API

Expo đọc biến môi trường lúc build. File `mobile/.env` (tạo từ `mobile/.env.example`) cần **`EXPO_PUBLIC_API_URL`** trỏ đúng máy chạy backend:

| Môi trường | Gợi ý URL |
|------------|-----------|
| Máy ảo Android | `http://10.0.2.2:3000` |
| Điện thoại cùng Wi‑Fi | `http://<IP-LAN-của-PC>:3000` |

Sau khi sửa `.env`: khởi động lại Expo (ví dụ `npx expo start -c`).

### 2.6. Mở app

- **QR / Expo Go:** làm theo hướng dẫn trong terminal sau `npm run dev:mobile`.
- **Web:** có script `expo start --web` trong workspace mobile (xem `mobile/package.json`).

---

## 3. Danh sách chức năng (theo luồng & tab)

### 3.1. Module 01 — Đăng nhập, đăng ký, onboarding

| Chức năng | Giải thích ngắn |
|-----------|-----------------|
| Đăng nhập / Đăng ký | Luồng xác thực ban đầu; sau đăng nhập thành công có thể vào tab chính. |
| Quên mật khẩu | Gửi email (luồng UI); phần gửi email thực tế phụ thuộc backend. |
| Onboarding | Chuỗi màn hình thu thập giới tính, tuổi, chỉ số cơ thể, mức vận động, mục tiêu — tóm tắt kết quả cuối onboarding. |

**Ý nghĩa UX:** Chuẩn hoá “first run” trước khi người dùng thấy dashboard 5 tab.

---

### 3.2. Tab **Home** (module06) — Dashboard Premium

| Chức năng | Giải thích ngắn |
|-----------|-----------------|
| Hub đầu trang | Branding, lời chào, **chuông thông báo** + badge số chưa đọc, avatar mở **Cài đặt / Hồ sơ**. |
| Readiness | Thẻ “sẵn sàng trong ngày” — điều hướng tới màn **chi tiết readiness** (giấc ngủ, HRV, tải tập — demo). |
| Today’s session | Kế hoạch buổi tập hôm nay — điều hướng **chi tiết buổi** và liên kết sang tab **Workout**. |
| Quick actions | Lối tắt: **Dinh dưỡng**, **Tiến trình**, **AI Coach**. |
| AI Coach (FAB + sheet) | **Nút nổi (FAB)** hoặc quick action mở **sheet** (prompt + ô nhập). **Mở chat đầy đủ** chuyển sang tab Profile → **Coach AI** kèm tin nhắn khởi đầu tuỳ chọn. |
| Coach tip / mini pulse | Khối gợi ý coach và biểu đồ năng lượng demo (theo thiết kế “pulse”). |

---

### 3.3. Tab **Workout** (module04)

| Chức năng | Giải thích ngắn |
|-----------|-----------------|
| Danh sách bài / plan | Chọn bài tập hoặc kế hoạch. |
| Chi tiết bài | Thông tin động tác (tham số theo `exerciseId`). |
| Player | Chạy buổi tập với trạng thái (active / paused / completed). |

**Ý nghĩa UX:** Tập trung luồng “chọn → xem → chạy” tách khỏi dinh dưỡng và tiến độ.

---

### 3.4. Tab **Nutrition** (module05)

| Chức năng | Giải thích ngắn |
|-----------|-----------------|
| Dashboard dinh dưỡng | Tổng quan bữa, calo (demo / store local tuỳ implementation). |
| Thêm món / chi tiết món | Ghi nhận hoặc xem chi tiết thực phẩm. |
| Chi tiết bữa | Xem theo “khung bữa” (meal slot). |
| Quét mã vạch | Màn quét (tuỳ thiết bị / quyền camera). |

---

### 3.5. Tab **Progress** (module03)

| Chức năng | Giải thích ngắn |
|-----------|-----------------|
| Metrics dashboard | Bảng điều khiển chỉ số (cân, calo, hoạt động…). |
| Chi tiết sức khoẻ | BMI / BMR / TDEE (nội dung chi tiết). |
| Cân nặng | Xu hướng / chi tiết — thêm cân (`AddWeight`). |
| Calo & hoạt động | Màn chi tiết theo từng loại metric. |
| App flow map | Sơ đồ / map luồng app (thường phục vụ demo hoặc onboarding nội bộ). |

---

### 3.6. Tab **Profile** (module02)

| Chức năng | Giải thích ngắn |
|-----------|-----------------|
| Settings home | Trung tâm: hồ sơ, mật khẩu, thông báo, tuỳ chọn app, quyền riêng tư, hỗ trợ. |
| Thông báo | Hub danh sách, chi tiết thông báo, đánh dấu đã đọc (badge đồng bộ với Home). |
| Coach AI | Chat demo với coach; có thể nhận `initialMessage` từ sheet Home. |
| Live Pulse | Màn “Coach Kai / pulse” theo thiết kế premium. |
| Nhắc nhở / tuỳ chọn thông báo | Cấu hình reminder và preferences (UI). |

**Ghi chú điều hướng:** Từ Home có thể **chuyển tab** sang Nutrition / Progress / Workout / Profile bằng helper điều hướng gốc (bottom tab), không phụ thuộc stack con.

---

## 4. Đa ngôn ngữ (i18n)

App dùng **i18next**; file chuỗi nằm trong `mobile/src/core/i18n/locales/` (ví dụ `en.json`, `vi.json`). Ngôn ngữ có thể được chuyển từ phần **Cài đặt / Ngôn ngữ** (tuỳ màn App Preferences đã nối store).

---

## 5. Tài liệu API & OpenAPI

- Contract HTTP: `backend/openapi/openapi.yaml`.
- Endpoint health: `GET /api/v1/health`.

---

## 6. Góp ý cho người mới

1. Luôn chạy `npm install` ở **thư mục gốc** monorepo (workspaces).  
2. Nếu đổi kiểu trong `shared/`, chạy `npm run build:shared`.  
3. Gặp lỗi mạng trên điện thoại: ưu tiên kiểm tra **firewall**, **cùng Wi‑Fi**, và **`EXPO_PUBLIC_API_URL`**.  
4. Chi tiết lệnh `quickstart`, seed user, troubleshooting: xem [`run-project-guide.md`](./run-project-guide.md).

---

*Tài liệu được tạo để onboard nhanh; khi thêm màn hình mới, nên cập nhật bảng chức năng tương ứng.*
