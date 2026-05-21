# 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng (Health Fitness Monorepo)

Chào mừng bạn đến với dự án **Health & Fitness Tracking App**! Đây là dự án cấu trúc dạng **Monorepo** bao gồm ứng dụng di động (Expo/React Native), server API (Express + TypeScript + Prisma), và gói chia sẻ dữ liệu chung (Shared Contracts).

Tài liệu này sẽ hướng dẫn bạn chi tiết từng bước để chạy ứng dụng từ lúc mới tải về cho đến khi chạy thử nghiệm trên máy tính, máy ảo hoặc điện thoại thật.

---

## 📌 1. Các Công Cụ Cần Chuẩn Bị (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

1. **Node.js**: Phiên bản **>= 20** (Khuyến nghị bản LTS mới nhất).
2. **Docker Desktop** (Khuyến nghị): Để chạy MySQL cực kỳ nhanh chóng mà không cần cài đặt trực tiếp lên hệ điều hành.
   * *Nếu không dùng Docker, bạn phải tự cài MySQL Server (v8.x) và tạo sẵn một cơ sở dữ liệu tên là `health_fitness`.*
3. **Điện thoại thật** đã cài app **Expo Go** (từ App Store hoặc Google Play Store) HOẶC máy ảo (Android Emulator / iOS Simulator) nếu muốn test app di động.

---

## ⚡ 2. Cách Khởi Chạy Nhanh Nhất (Quick Start - 1 Click)

Dự án đã được cấu hình sẵn các script tự động hóa. Chỉ với **1 terminal** ở thư mục gốc của dự án, bạn có thể thiết lập toàn bộ môi trường và khởi động app:

### 👉 Bước 1: Cài đặt các thư viện (dependencies)
Mở terminal tại thư mục gốc `Health-and-fitness-tracking-app/` và chạy:
```bash
npm install
```

### 👉 Bước 2: Khởi chạy toàn bộ hệ thống
Chọn **MỘT** trong hai lệnh dưới đây tùy thuộc vào cách bạn chạy MySQL:

* **Trường hợp A: Bạn dùng Docker (Khuyến nghị)**
  ```bash
  npm run quickstart
  ```
  *Lệnh này sẽ tự động: Bật MySQL Container ➡️ Build module Shared ➡️ Tạo file `.env` mẫu cho backend & mobile ➡️ Áp dụng migration DB ➡️ Seed tài khoản test ➡️ Khởi chạy đồng thời cả Backend API và Expo Dev Server.*

* **Trường hợp B: Bạn đã tự cài đặt MySQL trên máy hoặc MySQL đã chạy sẵn**
  ```bash
  npm run quickstart:app
  ```
  *Lệnh này giống hệt lệnh trên nhưng **không** gọi Docker.*

---

## 📂 3. Cấu Trúc Monorepo & Các Thư Mục

| Thư mục | Vai trò | Công nghệ chính |
| :--- | :--- | :--- |
| `backend/` | API Server | Express, TypeScript, Prisma ORM, MySQL, Vitest |
| `mobile/` | Client App | React Native, Expo SDK 54, Zustand, Tailwind/Vanilla CSS |
| `shared/` | Định nghĩa kiểu dùng chung | TypeScript (`@health-fitness/shared`) |
| `docs/` | Tài liệu kỹ thuật | Markdown |

---

## ⚙️ 4. Thiết Lập Thủ Công & Quản Lý Môi Trường (Khi cần chỉnh sửa)

Nếu bạn muốn kiểm soát và khởi chạy từng thành phần độc lập bằng nhiều terminal (khuyên dùng khi lập trình hàng ngày), hãy làm theo các bước sau:

### Bước 4.1: Cấu hình biến môi trường (`.env`)
Chạy lệnh sau ở thư mục gốc để tự tạo các file `.env` (nếu chưa có):
* **Windows (PowerShell):**
  ```powershell
  copy backend\.env.example backend\.env
  copy mobile\.env.example mobile\.env
  ```
* **macOS / Linux:**
  ```bash
  cp backend/.env.example backend/.env
  cp mobile/.env.example mobile/.env
  ```

#### 📝 Cấu hình `backend/.env`:
```env
PORT=3000
DATABASE_URL="mysql://health_fitness:health_fitness@127.0.0.1:3306/health_fitness"
JWT_ACCESS_SECRET="change-me-access-min-16-chars!!"
JWT_REFRESH_SECRET="change-me-refresh-min-16-chars!!"
```

#### 📝 Cấu hình `mobile/.env` (⚠️ RẤT QUAN TRỌNG):
Mặc định biến `EXPO_PUBLIC_API_URL` trỏ về `http://127.0.0.1:3000`. Bạn cần đổi giá trị này tùy theo thiết bị chạy thử app:
* **Chạy Expo Web / iOS Simulator:** Giữ nguyên `http://127.0.0.1:3000`.
* **Chạy trên Android Emulator (Máy ảo Android):** Đổi thành `http://10.0.2.2:3000` (vì địa chỉ `127.0.0.1` trên máy ảo trỏ về chính nó).
* **Chạy trên Điện thoại thật (qua Expo Go):** Đổi thành `http://<IP_MÁY_TÍNH_CỦA_BẠN>:3000` (Ví dụ: `http://192.168.1.15:3000`). Điện thoại và máy tính phải kết nối chung một mạng Wi-Fi.

> 💡 **Mẹo:** Sau khi sửa file `.env` của thư mục `mobile`, bạn phải khởi động lại Expo Server bằng lệnh `npx expo start -c` để xóa bộ nhớ đệm (cache).

---

### Bước 4.2: Build module Shared
Module này chứa các DTO và interface dùng chung giữa frontend và backend. Phải build trước khi chạy code:
```bash
npm run build:shared
```

### Bước 4.3: Khởi chạy MySQL & Di cư Database (Migrations)
1. **Khởi động MySQL qua Docker:**
   ```bash
   docker compose up -d mysql
   ```
2. **Deploy schema database bằng Prisma:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
3. **Tạo tài khoản mẫu để test nhanh (Seed Database):**
   ```bash
   npm run db:seed
   ```
   Tài khoản mặc định được tạo sẵn:
   * 📧 **Email:** `dev@local.test`
   * 🔑 **Mật khẩu:** `DevPass12345`

---

## 💻 5. Khởi Chạy Từng Phần Hàng Ngày (Nhận diện lỗi tốt nhất)

Khi code hàng ngày, bạn nên mở **2 Terminal** riêng biệt để dễ theo dõi log:

### 🟢 Terminal 1: Chạy Backend API
Chạy từ thư mục gốc dự án:
```bash
npm run dev:backend
```
* API sẽ chạy tại: `http://127.0.0.1:3000`
* Bạn có thể kiểm tra trạng thái API bằng cách truy cập: `http://127.0.0.1:3000/api/v1/health`. Nếu hiển thị `{"status":"ok"}` là backend đã kết nối thành công với MySQL.

### 🔵 Terminal 2: Chạy Frontend Mobile (Expo)
Chạy từ thư mục gốc dự án:
```bash
npm run dev:mobile
```
* Terminal sẽ hiển thị một **mã QR**.
* **Trên Android:** Mở ứng dụng **Expo Go** ➡️ chọn "Scan QR Code".
* **Trên iOS:** Mở ứng dụng **Camera mặc định** quét mã QR để mở Expo Go.
* **Chạy trên Web trình duyệt:** Nhấn nút `w` trên bàn phím (hoặc chạy lệnh `npm run web -w mobile`).

---

## 🧪 6. Chạy Kiểm Thử (Testing)

Dự án đi kèm các bộ unit test và integration test hoàn chỉnh cho Backend:

| Mục đích | Lệnh chạy (Trong thư mục `backend/`) |
| :--- | :--- |
| Chạy Unit Test (Không cần DB) | `npm test` |
| Chạy Integration Test (Cần DB chạy) | `npm run test:integration` |
| Xem cơ sở dữ liệu trực quan bằng UI | `npx prisma studio` |

---

## 🛠️ 7. Bảng Tổng Hợp Các Lệnh Thường Dùng (Tại thư mục gốc)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run quickstart` | Bật Docker MySQL + Setup Env + Migrate + Seed + Chạy API & Mobile cùng lúc. |
| `npm run quickstart:app` | Giống như trên nhưng không khởi động Docker (cho MySQL cài local). |
| `npm run dev:all` | Chỉ chạy Backend & Expo cùng lúc (dùng sau khi đã cài đặt xong). |
| `npm run dev:backend` | Chỉ chạy Backend API ở chế độ Watch mode. |
| `npm run dev:mobile` | Chỉ chạy Expo Server để mở app trên điện thoại/máy ảo. |
| `npm run build:shared` | Build lại module Shared khi có thay đổi định nghĩa kiểu dữ liệu. |
| `npm run db:seed` | Tạo lại tài khoản dev mặc định trong DB. |

---

## ❓ 8. Các Lỗi Thường Gặp & Cách Khắc Phục (Troubleshooting)

| Hiện tượng lỗi | Nguyên nhân | Cách xử lý |
| :--- | :--- | :--- |
| **Lỗi `Network request failed` hoặc không kết nối được backend khi chạy app trên điện thoại.** | App mobile đang cố gọi API qua IP `127.0.0.1` của chính chiếc điện thoại chứ không phải máy tính. | 1. Mở file `mobile/.env`. <br>2. Sửa `EXPO_PUBLIC_API_URL` thành IP mạng LAN của máy tính (Ví dụ: `http://192.168.1.x:3000`). <br>3. Khởi chạy lại Expo bằng lệnh: `npx expo start -c` (nhớ thêm `-c` để xóa cache env). <br>4. Đảm bảo điện thoại và máy tính kết nối chung mạng Wi-Fi. |
| **Không thể kết nối đến cơ sở dữ liệu MySQL.** | Docker chưa được bật hoặc MySQL chưa chạy. | 1. Mở Docker Desktop và đảm bảo ứng dụng đang chạy.<br>2. Chạy lệnh: `docker compose up -d mysql`.<br>3. Kiểm tra bằng cách gõ: `docker compose ps` để xem cổng `3306` đã sẵn sàng chưa. |
| **Lỗi TypeScript khi import các kiểu dữ liệu từ `@health-fitness/shared`.** | Gói Shared chưa được build hoặc build lỗi. | Chạy lệnh `npm run build:shared` ở thư mục gốc để biên dịch lại file TypeScript dùng chung. |
| **Port `3000` (Backend) hoặc `8081` (Expo) đã bị sử dụng.** | Có một tiến trình khác đang chiếm cổng này. | * **Với backend:** Đổi `PORT` trong `backend/.env` (Ví dụ thành `3001`), sau đó cập nhật lại `EXPO_PUBLIC_API_URL` ở `mobile/.env` tương ứng.<br>* **Với Expo:** Nhấn `Ctrl + C` để tắt hẳn rồi chạy lại, Expo sẽ hỏi bạn có muốn đổi sang cổng khác không (nhấn `y`), hoặc chạy thủ công: `cd mobile && npx expo start --web --port 8082` |

---

Chúc bạn có trải nghiệm tuyệt vời khi phát triển và sử dụng ứng dụng **Health & Fitness Tracking App**! Nếu gặp bất kỳ khó khăn nào khác, hãy liên hệ ngay để được hỗ trợ. 💪
