# Báo cáo đồ án: Ứng dụng theo dõi sức khỏe và tập luyện (Health Fitness)

> **Ghi chú sử dụng:** Điền thông tin cá nhân/khoa/giảng viên vào các chỗ `[...]` trước khi nộp. Nội dung kỹ thuật dựa trên mã nguồn và tài liệu trong monorepo `health-fitness-monorepo` tại thời điểm lập báo cáo.

---

## Thông tin chung

| Mục | Nội dung |
|-----|----------|
| Tên đề tài | Xây dựng hệ thống ứng dụng di động theo dõi sức khỏe và tập luyện kết hợp API phía máy chủ |
| Sinh viên thực hiện | `[Họ tên — MSSV]` |
| Lớp / Khoa | `[...]` |
| Giảng viên hướng dẫn | `[...]` |
| Thời gian thực hiện | `[...]` |

---

## 1. Tóm tắt (Abstract)

Đề tài triển khai một **monorepo** gồm ứng dụng di động **React Native (Expo)** và **API REST** bằng **Node.js + Express (TypeScript)**, lưu trữ dữ liệu trên **MySQL 8** thông qua **Prisma ORM**. Gói **`shared`** chứa hợp đồng kiểu TypeScript (DTO lỗi, auth, hồ sơ, mục tiêu) để đồng bộ giữa client và server.

Trong phạm vi đã mã hóa (tương ứng **Phase 0** trong tài liệu dự án), hệ thống hỗ trợ **đăng ký, đăng nhập, làm mới token, đăng xuất**, truy vấn **thông tin người dùng hiện tại (`/me`)**, cập nhật **hồ sơ** và **mục tiêu** (goals). Các tính năng mở rộng (tập luyện, dinh dưỡng, chỉ số cơ thể, tiến độ, nhắc nhở, worker) được **thiết kế và mô tả** trong kế hoạch và hướng dẫn Phase 1+, sẵn sàng làm lộ trình phát triển tiếp theo.

---

## 2. Đặt vấn đề và mục tiêu

### 2.1 Đặt vấn đề

Người dùng cần công cụ ghi nhận thói quen tập luyện, dinh dưỡng và chỉ số cơ thể một cách **liên tục, có cấu trúc**, đồng thời có **tài khoản tập trung** để đồng bộ dữ liệu giữa các thiết bị. Giải pháp tách **ứng dụng client** và **dịch vụ backend** giúp mở rộng tính năng, bảo mật và kiểm thử rõ ràng.

### 2.2 Mục tiêu đồ án

1. **Kiến trúc:** Monolith theo module (mobile / backend / shared / worker dự phòng), API version **`/api/v1`**, luồng **controller → service → repository (Prisma)**.
2. **Chức năng cốt lõi:** Xác thực người dùng (JWT + refresh token), quản lý hồ sơ và mục tiêu cá nhân.
3. **Chất lượng kỹ thuật:** Validation đầu vào, **hợp đồng lỗi thống nhất** (`code`, `message`, `details`, `requestId`), tài liệu **OpenAPI**, kiểm thử tự động phần backend.
4. **Lộ trình:** Chuẩn bị nền tảng cho Phase 1 (workout, nutrition, body metrics) theo tài liệu trong repo.

---

## 3. Phạm vi và hạn chế

### 3.1 Đã triển khai trong mã nguồn

- Monorepo npm workspaces: `mobile`, `backend`, `shared`.
- Backend: module `auth`, `users`; endpoint health; middleware xử lý lỗi theo contract.
- CSDL: bảng `users`, `user_profiles`, `user_goals`, `refresh_tokens` (Prisma schema).
- Mobile: màn hình auth (đăng nhập/đăng ký), home, profile; gọi API qua lớp client tập trung (theo quy ước `src/core/api`).
- Tài liệu: `README.md`, `docs/phase-0-guide.md`, `docs/phase-1-guide.md`, OpenAPI `backend/openapi/openapi.yaml`.

### 3.2 Chưa triển khai / nằm trong roadmap

- Module backend `workouts`, `nutrition`, `body-metrics`, `progress`, `reminders` (cấu trúc thư mục và hợp đồng được mô tả trong Phase 1 guide; code có thể chưa đầy đủ so với tài liệu mục tiêu).
- Worker xử lý hàng đợi (Redis), push notification.
- Đồng bộ Apple Health / Google Fit, mạng xã hội, AI coach (ngoài phạm vi MVP theo kế hoạch).

---

## 4. Công nghệ và công cụ

| Thành phần | Công nghệ |
|------------|-----------|
| Ứng dụng di động | React Native, Expo, TypeScript |
| API | Express, TypeScript, Node.js 20+ |
| Cơ sở dữ liệu | MySQL 8, Prisma Migrate |
| Hợp đồng chia sẻ | Package `@health-fitness/shared` |
| Tài liệu API | OpenAPI 3.0 (`openapi.yaml`) |
| Triển khai DB cục bộ | Docker Compose (MySQL), biến môi trường `.env` |

---

## 5. Thiết kế hệ thống

### 5.1 Kiến trúc tổng thể

```
[Mobile Expo] --HTTPS/JSON--> [Express API :3000]
                                    |
                                    v
                              [MySQL + Prisma]
```

- **Worker** (`worker/`) được giữ trong cấu trúc monorepo cho tác vụ nền (Phase sau), không gắn job nặng vào vòng đời request HTTP (theo quy tắc kiến trúc dự án).

### 5.2 Phân tầng backend

- **Routes / Controller:** nhận HTTP, gọi service.
- **Service:** logic nghiệp vụ, tách khỏi HTTP.
- **Repository:** truy cập dữ liệu qua Prisma Client.
- **Shared (backend):** middleware, logger, cấu hình env, map lỗi ra mã ổn định.

### 5.3 Phân tầng mobile

- **`src/features/<domain>`:** màn hình theo miền chức năng.
- **`src/core`:** API client, lưu trữ token (ví dụ SecureStore), theme, điều hướng.
- Mọi gọi mạng đi qua client API tập trung, không `fetch` rải rác trong UI.

### 5.4 Thiết kế cơ sở dữ liệu (tóm tắt)

- **`User`:** email duy nhất, mật khẩu băm, trạng thái `active` / `locked`.
- **`UserProfile`:** 1-1 với user (họ tên, giới tính, ngày sinh, chiều cao, mức độ vận động, timezone, locale).
- **`UserGoal`:** 1-n với user (loại mục tiêu, cân đích, chỉ tiêu tập/tuần, kcal/ngày, ngày bắt đầu/kết thúc, cờ active).
- **`RefreshToken`:** lưu hash token, hết hạn, hỗ trợ rotation và thu hồi khi logout.

---

## 6. Thiết kế API (phiên bản v1)

Các nhóm endpoint chính (chi tiết tham chiếu `backend/openapi/openapi.yaml`):

| Nhóm | Phương thức | Đường dẫn | Mô tả ngắn |
|------|--------------|-----------|------------|
| Hệ thống | GET | `/api/v1/health` | Kiểm tra hoạt động API |
| Auth | POST | `/api/v1/auth/register` | Đăng ký |
| Auth | POST | `/api/v1/auth/login` | Đăng nhập |
| Auth | POST | `/api/v1/auth/refresh` | Làm mới access token |
| Auth | POST | `/api/v1/auth/logout` | Thu hồi refresh token (Bearer) |
| Người dùng | GET | `/api/v1/me` | Thông tin user + profile + goals |
| Profile | PATCH | `/api/v1/me/profile` | Cập nhật/upsert hồ sơ |
| Goals | PUT | `/api/v1/me/goals` | Thay thế mục tiêu active |

**Lỗi API:** thân lỗi thống nhất với các trường `code`, `message`, `details` (tuỳ chọn), `requestId` — định nghĩa kiểu trong `shared` (`ApiErrorBody`, `ApiErrorCodes`).

---

## 7. Triển khai và vận hành thử nghiệm

1. Cài **Node.js 20+**, **MySQL 8** (hoặc `docker compose up -d mysql`).
2. Sao chép `backend/.env.example` → `backend/.env`, cấu hình `DATABASE_URL`.
3. Chạy migration: `cd backend && npx prisma migrate deploy`.
4. Khởi động API: `npm run dev:backend` (từ root monorepo); kiểm tra `GET http://127.0.0.1:3000/api/v1/health`.
5. Mobile: sao chép `mobile/.env.example` → `mobile/.env`, `npm run dev:mobile`. Trên Android emulator, địa chỉ máy host thường dùng `10.0.2.2` thay cho `127.0.0.1`.

---

## 8. Kiểm thử

- Script: `npm run test:backend` (Vitest/Jest tùy cấu hình workspace backend).
- Trong repo có ít nhất file kiểm thử ví dụ `backend/src/app.test.ts` — nên bổ sung thêm test tích hợp cho auth và `/me` khi mở rộng đồ án (theo quy tắc testing của dự án).

---

## 9. Kết luận và hướng phát triển

Đồ án đã **thiết lập nền tảng** ứng dụng theo dõi sức khỏe với **xác thực người dùng**, **hồ sơ**, **mục tiêu** và **kiến trúc module-first** thuận tiện mở rộng. Hướng tiếp theo khớp với tài liệu **Phase 1**: bổ sung schema và API cho workout, nutrition, body metrics; cập nhật OpenAPI và màn hình mobile tương ứng; chuẩn bị worker và Redis cho nhắc nhở khi cần.

---

## 10. Tài liệu tham khảo / phụ lục

- Tài liệu nội bộ: `README.md`, `docs/phase-0-guide.md`, `docs/phase-1-guide.md`.
- OpenAPI: `backend/openapi/openapi.yaml`.
- Prisma: https://www.prisma.io/docs  
- Expo: https://docs.expo.dev  
- Express: https://expressjs.com  

---

*Báo cáo được soạn thảo dưới dạng Markdown để dễ chỉnh sửa, chuyển sang Word/PDF bằng Pandoc hoặc công cụ xuất tài liệu tương thích Markdown.*
