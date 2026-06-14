# Tài Liệu Test Case — ReactPjApp

> Ngày: 2026-06-04
> Framework: **Backend** — Vitest | **Mobile** — Vitest + React Native Testing Library

---

## Mục Lục

1. [Backend — Dịch Vụ Dinh Dưỡng](#1-backend--dịch-vụ-dinh-dưỡng)
2. [Backend — Dịch Vụ Chỉ Số Cơ Thể](#2-backend--dịch-vụ-chỉ-số-cơ-thể)
3. [Backend — Dịch Vụ Nhắc Nhở](#3-backend--dịch-vụ-nhắc-nhở)
4. [Backend — Dịch Vụ Tiến Độ](#4-backend--dịch-vụ-tiến-độ)
5. [Backend — Tính Toán Tiến Độ (Hàm Thuần)](#5-backend--tính-toán-tiến-độ-hàm-thuần)
6. [Backend — Dịch Vụ Nước & Giấc Ngủ](#6-backend--dịch-vụ-nước--giấc-ngủ)
7. [Backend — Dịch Vụ Tin Nhắn Chat](#7-backend--dịch-vụ-tin-nhắn-chat)
8. [Mobile — Store Phiên Chạy Bộ](#8-mobile--store-phiên-chạy-bộ)
9. [Mobile — Store Nước](#9-mobile--store-nước)
10. [Mobile — Store Giấc Ngủ](#10-mobile--store-giấc-ngủ)
11. [Mobile — Store Trang Chủ](#11-mobile--store-trang-chủ)
12. [Mobile — Store Xác Thực](#12-mobile--store-xác-thực)

---

## 1. Backend — Dịch Vụ Dinh Dưỡng

**File:** `backend/src/modules/nutrition/nutrition.service.test.ts`

### 1.1 `listFoods` — Liệt Kê Thực Phẩm

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-001 | Trả về thực phẩm khớp từ khóa tìm kiếm | `q: "ga"` | Mảng thực phẩm có `name`, `kcalPerServing`, macros |
| NUT-002 | Trả về toàn bộ danh mục khi không có từ khóa | `{}` | Không có filter `name`, trả tất cả |
| NUT-003 | Dùng giới hạn tùy chỉnh | `limit: 10` | `findMany` gọi với `take: 10` |
| NUT-004 | Serialize trường `Decimal` thành chuỗi | `proteinG: new Decimal("13.0")` | Trả về `"13"` (không có số 0 thừa) |

### 1.2 `createMealLog` — Tạo Nhật Ký Bữa Ăn

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-010 | Tạo nhật ký với dữ liệu đúng | `mealType: "breakfast"`, `loggedAt`, `notes` | `mealLog.create` được gọi với `data` đúng |
| NUT-011 | Tạo nhật ký không có notes | Không truyền `notes` | `notes` lưu là `null` |

### 1.3 `listMealLogsForDate` — Liệt Kê Nhật Ký Theo Ngày

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-020 | Trả về nhật ký theo ngày, sắp xếp tăng dần | `date: "2026-01-01"` | `findMany` với `gte/lte`, `orderBy: { loggedAt: "asc" }` |
| NUT-021 | Trả về mảng rỗng khi không có nhật ký | Không có bản ghi | `[]` |

### 1.4 `getMealLog` — Lấy Nhật Ký Bữa Ăn

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-030 | Trả về nhật ký kèm các món ăn | `userId: 3`, `mealLogId: 10` | Nhật ký với mảng items lồng nhau |
| NUT-031 | Ném lỗi 404 khi không tìm thấy | `mealLogId: 999` | `AppError(404, "NOT_FOUND")` |
| NUT-032 | Ném lỗi 404 khi nhật ký thuộc người dùng khác | `userId` khác | `AppError(404, "NOT_FOUND")` |

### 1.5 `patchMealLog` — Cập Nhật Nhật Ký

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-040 | Cập nhật `mealType` khi có giá trị | `{ mealType: "snack" }` | `mealLog.update` được gọi |
| NUT-041 | Đặt `notes` về null | `{ notes: null }` | `notes` được đặt `null` |
| NUT-042 | Không gọi update khi không có trường nào | `{}` | `update` không được gọi |
| NUT-043 | Ném lỗi 404 khi không tìm thấy | ID không hợp lệ | `AppError(404, "NOT_FOUND")` |

### 1.6 `deleteMealLog` — Xóa Nhật Ký

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-050 | Xóa nhật ký thành công | ID hợp lệ | `deleteMany` được gọi, trả `undefined` |
| NUT-051 | Ném lỗi 404 khi không tìm thấy | `count: 0` | `AppError(404, "NOT_FOUND")` |

### 1.7 `addMealLogItem` — Thêm Món Ăn Vào Nhật Ký

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-060 | Thêm từ danh mục với macros đã scale | `foodId: 5`, `quantity: 2` | `kcal: 330` (165 × 2), macros scale tương ứng |
| NUT-061 | Thêm món ăn tùy chỉnh với macros cho sẵn | `customFoodName`, macros | Item tạo với giá trị trực tiếp |
| NUT-062 | Ném lỗi 404 khi không tìm thấy nhật ký | `mealLogId` không hợp lệ | `AppError(404, "NOT_FOUND")` |
| NUT-063 | Ném lỗi 404 khi không tìm thấy thực phẩm | `foodId: 999` | `AppError(404, "NOT_FOUND")` |

### 1.8 `patchMealLogItem` — Cập Nhật Món Trong Nhật Ký

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-070 | Tính lại macros khi đổi số lượng | `quantity: 3` trên food 165kcal | `kcal: 495`, macros ×3 |
| NUT-071 | Ném lỗi 404 khi không tìm thấy nhật ký | `mealLogId` không hợp lệ | `AppError(404, "NOT_FOUND")` |
| NUT-072 | Ném lỗi 404 khi không tìm thấy item | `itemId` không hợp lệ | `AppError(404, "NOT_FOUND")` |

### 1.9 `deleteMealLogItem` — Xóa Món Trong Nhật Ký

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| NUT-080 | Xóa item thành công | ID hợp lệ | `deleteMany` được gọi, trả `undefined` |
| NUT-081 | Ném lỗi 404 khi không tìm thấy nhật ký | `mealLogId` không hợp lệ | `AppError(404, "NOT_FOUND")` |
| NUT-082 | Ném lỗi 404 khi không tìm thấy item | `count: 0` | `AppError(404, "NOT_FOUND")` |

---

## 2. Backend — Dịch Vụ Chỉ Số Cơ Thể

**File:** `backend/src/modules/body-metrics/body-metrics.service.test.ts`

### 2.1 `listBodyMetrics` — Liệt Kê Chỉ Số

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| BM-001 | Trả về chỉ số trong khoảng ngày, sắp tăng dần | `from/to: 2026-01-01/01-31` | Sắp xếp `recordedAt: asc`, áp dụng ranh giới |
| BM-002 | Trả về mảng rỗng khi không có chỉ số | Không có bản ghi | `[]` |
| BM-003 | Serialize `Decimal` thành chuỗi | `weightKg: new Decimal("80")` | Trả về `"80"` |

### 2.2 `createBodyMetric` — Tạo Chỉ Số

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| BM-010 | Tạo với tất cả trường | Tất cả trường tùy chọn có giá trị | `create` được gọi với đầy đủ `data` |
| BM-011 | Tạo với chỉ `weightKg` | Chỉ có `weightKg` | Các trường khác là `null` |
| BM-012 | Xử lý null rõ ràng cho các trường tùy chọn | `bodyFatPct: 20.0`, khác `null` | Chỉ `bodyFatPct` được lưu |

### 2.3 `getBodyMetric` — Lấy Chỉ Số

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| BM-020 | Trả về chỉ số khi tìm thấy | ID hợp lệ | Chỉ số đã serialize đầy đủ |
| BM-021 | Ném lỗi 404 khi không tìm thấy | `id: 999` | `AppError(404, "NOT_FOUND")` |

### 2.4 `patchBodyMetric` — Cập Nhật Chỉ Số

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| BM-030 | Cập nhật `weightKg` khi có giá trị | `{ weightKg: 69.5 }` | `update` được gọi |
| BM-031 | Có thể đặt `weightKg` về null | `{ weightKg: null }` | `weightKg` thành `null` |
| BM-032 | Không gọi update khi không có trường nào | `{}` | `update` không được gọi |
| BM-033 | Ném lỗi 404 khi không tìm thấy | ID không hợp lệ | `AppError(404, "NOT_FOUND")` |

### 2.5 `deleteBodyMetric` — Xóa Chỉ Số

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| BM-040 | Xóa thành công | ID hợp lệ | `deleteMany` được gọi |
| BM-041 | Ném lỗi 404 khi không tìm thấy | `count: 0` | `AppError(404, "NOT_FOUND")` |

---

## 3. Backend — Dịch Vụ Nhắc Nhở

**File:** `backend/src/modules/reminders/reminders.service.test.ts`

### 3.1 `listReminders` — Liệt Kê Nhắc Nhở

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| REM-001 | Trả về tất cả nhắc nhở giảm dần | `userId: 1` | `orderBy: { id: "desc" }` |
| REM-002 | Trả về mảng rỗng khi không có nhắc nhở | Không có bản ghi | `[]` |

### 3.2 `createReminder` — Tạo Nhắc Nhở

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| REM-010 | Tạo nhắc nhở bật với `nextTriggerAt` | `isEnabled: true` | `nextTriggerAt` là `Date` |
| REM-011 | Tạo nhắc nhở tắt với `nextTriggerAt` null | `isEnabled: false` | `nextTriggerAt` là `null` |

### 3.3 `patchReminder` — Cập Nhật Nhắc Nhở

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| REM-020 | Cập nhật title và tính lại `nextTriggerAt` khi đổi giờ | `{ title, localHour }` | `update` với cả 2 trường và `nextTriggerAt` mới |
| REM-021 | KHÔNG tính lại `nextTriggerAt` khi chỉ đổi title | `{ title }` | `nextTriggerAt` không thay đổi |
| REM-022 | Đặt `nextTriggerAt` thành null khi tắt | `{ isEnabled: false }` | `nextTriggerAt: null` |
| REM-023 | Ném lỗi 404 khi không tìm thấy | `reminderId: 999` | `AppError(404, "NOT_FOUND")` |

### 3.4 `deleteReminder` — Xóa Nhắc Nhở

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| REM-030 | Xóa thành công | ID hợp lệ | `reminder.delete` được gọi |
| REM-031 | Ném lỗi 404 khi không tìm thấy | ID không hợp lệ | `AppError(404, "NOT_FOUND")` |

### 3.5 `advanceReminderAfterFire` — Cập Nhật Sau Khi Kích Hoạt

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| REM-040 | Cập nhật `lastTriggeredAt` và `nextTriggerAt` | Nhắc nhở đang bật | Cả 2 trường đều là `Date` |
| REM-041 | Không làm gì khi không tìm thấy | `id: 999` | `update` không được gọi |
| REM-042 | Không làm gì khi nhắc nhở bị tắt | `isEnabled: false` | `update` không được gọi |

---

## 4. Backend — Dịch Vụ Tiến Độ

**File:** `backend/src/modules/progress/progress.service.test.ts`

### 4.1 `recomputeDailyProgress` — Tính Lại Tiến Độ Ngày

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| PRG-001 | Tính `totalKcalIn` từ các món ăn | 2 món có 300 + 200 kcal | `totalKcalIn: 500` |
| PRG-002 | Cộng dồn macros từ tất cả món | 2 bữa ăn | `proteinG` = tổng |
| PRG-003 | Dùng mặc định 70kg khi không có chỉ số cân nặng | Không có bản ghi | Dùng `70` cho tính kcal |
| PRG-004 | Dùng cân nặng mới nhất cho tính kcal | `weightKg: 80.0` | Cân nặng dùng trong công thức MET |
| PRG-005 | Tính phút tập từ thời gian bắt đầu/kết thúc | 45 phút tập | `totalWorkoutMinutes: 45` |
| PRG-006 | Bao gồm goal active trong tính điểm | `dailyKcalTarget`, `weeklyWorkoutTarget` | `goalScore` khác null |
| PRG-007 | Dùng upsert (không create/update riêng) | Bất kỳ dữ liệu nào | `dailyProgress.upsert` được gọi |

### 4.2 `listDailyProgress` — Liệt Kê Tiến Độ Theo Ngày

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| PRG-010 | Trả về tiến độ mỗi ngày trong khoảng | 3 ngày | Mảng các progress đã serialize |
| PRG-011 | Ném lỗi 400 khi `from > to` | Khoảng không hợp lệ | `AppError(400, "VALIDATION_ERROR")` |
| PRG-012 | Ném lỗi 400 khi khoảng > 120 ngày | 150 ngày | `AppError(400, "VALIDATION_ERROR")` |
| PRG-013 | Tính lại mỗi ngày trước khi trả kết quả | 3 ngày | `upsert` được gọi 3 lần |

### 4.3 `getSummaryProgress` — Lấy Tổng Hợp Tiến Độ

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| PRG-020 | Trả tổng tuần với số liệu đúng | 2 ngày dữ liệu | `totals.kcalIn = 3800`, `totals.workoutMinutes = 75` |
| PRG-021 | Trả thay đổi cân nặng từ sớm nhất đến muộn nhất | 2 bản ghi cân nặng | `changeKg = hiện tại - sớm nhất` |
| PRG-022 | Trả null cân nặng khi không có log | Không có bản ghi | `currentKg: null`, `changeKg: null` |
| PRG-023 | Dùng khoảng 30 ngày cho period "month" | `period: "month"` | `enumerateDays` với 30 ngày |
| PRG-024 | Trả mảng rỗng khi không có progress | Không có bản ghi | `dailyItems: []`, tổng = 0 |

---

## 5. Backend — Tính Toán Tiến Độ (Hàm Thuần)

**File:** `backend/src/modules/progress/progress-calc.test.ts`

### 5.1 `computeGoalScore` — Tính Điểm Mục Tiêu

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| PC-001 | Trả `null` khi không có mục tiêu | Cả 2 `null` | `null` |
| PC-002 | Điểm 100 khi kcal khớp mục tiêu chính xác | `kcalIn = kcalTarget` | `100` |
| PC-003 | Điểm thấp hơn khi kcal lệch khỏi mục tiêu | Ăn 50% quá mục tiêu | Điểm < 100, > 0 |
| PC-004 | Điểm thấp khi kcal quá thấp so với mục tiêu | 90% dưới mục tiêu | Điểm < 50 |
| PC-005 | Giới hạn ở 0 khi lệch > 100% | `kcalIn = 0`, `target = 2000` | `0` |
| PC-006 | Thưởng hoạt động cho 30+ phút | `activeMinutes: 30` | Điểm > base (70) |
| PC-007 | Thưởng tập luyện tuần cho 3+ buổi | `weeklyWorkoutCount: 3` | Điểm > không có bài tập |
| PC-008 | Thưởng cân bằng dinh dưỡng trong 10% | `kcalIn = target` | Điểm > không cân bằng |
| PC-009 | Nhãn "Tuyệt vời!" cho điểm ≥ 85 | Giá trị cao | `label: "Tuyệt vời!"` |
| PC-010 | Nhãn "Tốt" cho điểm 70–84 | Hoạt động vừa phải | `label: "Tốt"` |
| PC-011 | Nhãn "Trung bình" cho điểm 50–69 | Hoạt động thấp | `label: "Trung bình"` |
| PC-012 | Nhãn "Cần cải thiện" cho điểm < 50 | Không hoạt động | `label: "Cần cải thiện"` |
| PC-013 | Giới hạn ở 100 dù có tất cả bonus | Giá trị cực đoan | `score ≤ 100` |
| PC-014 | Trả số nguyên đã làm tròn | Các đầu vào khác nhau | `Number.isInteger(score)` |

---

## 6. Backend — Dịch Vụ Nước & Giấc Ngủ

**File:** `backend/src/modules/water-sleep/service.test.ts`

### 6.1 `logWater` — Ghi Nước Uống

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-001 | Tạo log nước và upsert tóm tắt ngày | `amountMl: 250` | `waterLog.create` + `upsert` được gọi |
| WS-002 | Tăng `totalMl` cho log tiếp theo | 250ml thứ 2 | `totalMl: 500`, dùng increment |
| WS-003 | Tính số ly (250ml/ly) đúng | `amountMl: 500` | `glassesCount` tăng 2 |

### 6.2 `getWaterLogs` — Lấy Lịch Sử Nước

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-010 | Trả log với phân trang mặc định | `{}` | `take: 50`, `skip: 0`, `loggedAt: desc` |
| WS-011 | Áp dụng bộ lọc ngày | `from/to` | `loggedAt.gte/lte` trong where |

### 6.3 `getTodayWaterSummary` — Tóm Tắt Nước Hôm Nay

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-020 | Trả tóm tắt có với % hoàn thành | 1500ml / 2000ml | `percentage: 75` |
| WS-021 | Trả tóm tắt zero khi không có dữ liệu | Không có bản ghi | `totalMl: 0`, `goalMl: 2000`, `percentage: 0` |

### 6.4 `updateWaterGoal` — Cập Nhật Mục Tiêu Nước

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-030 | Cập nhật goal trên tóm tắt có sẵn | `goalMl: 3000` | `goalMl` mới trong response |
| WS-031 | Tạo tóm tắt với goal mới khi chưa có | Không có bản ghi | `upsert` tạo bản ghi mới |

### 6.5 `logSleep` — Ghi Giấc Ngủ

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-040 | Tạo log với thời lượng tính được | Ngủ 8.5h | `durationMinutes: 510` |
| WS-041 | Đặt duration null khi wakeTime trước sleepTime | Thời gian không hợp lệ | `durationMinutes: null` |

### 6.6 `getSleepLogs` — Lấy Lịch Sử Giấc Ngủ

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-050 | Trả log với phân trang mặc định | `{}` | Mảng sleep logs |
| WS-051 | Áp dụng bộ lọc khoảng ngày | `from/to` | `sleepTime.gte/lte` |

### 6.7 `getTodaySleepSummary` — Tóm Tắt Giấc Ngủ Hôm Nay

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-060 | Trả tóm tắt có với % hoàn thành | 420 phút / 480 phút | `percentage: 88` |
| WS-061 | Trả tóm tắt zero với goal mặc định | Không có bản ghi | `sleepGoalMin: 480`, `avgQuality: null` |

### 6.8 `updateSleepGoal` — Cập Nhật Mục Tiêu Giấc Ngủ

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-070 | Cập nhật goal giấc ngủ | `sleepGoalMin: 420` | `sleepGoalMin` mới trong response |

### 6.9 `deleteSleepLog` — Xóa Log Giấc Ngủ

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| WS-080 | Xóa và tính lại tóm tắt | ID hợp lệ | `delete` + `upsert` tóm tắt |
| WS-081 | Ném lỗi 404 khi không tìm thấy | `id: 999` | `AppError(404, "NOT_FOUND")` |

---

## 7. Backend — Dịch Vụ Tin Nhắn Chat

**File:** `backend/src/modules/chat-messages/chat-messages.service.test.ts`

> **Lưu ý:** Cần thêm model `ChatMessage` vào `schema.prisma` với các trường: `id`, `userId`, `role`, `content`, `createdAt`.

### 7.1 `listChatMessages` — Liệt Kê Tin Nhắn

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| CM-001 | Trả tin nhắn mới nhất trước | `userId: 1` | `findMany` với `orderBy: { createdAt: "desc" }`, `take: 20` |
| CM-002 | Áp dụng filter `before` | `{ before: "2026-01-01", limit: 10 }` | `where.createdAt.lt` |
| CM-003 | Serialize `createdAt` thành chuỗi ISO | Bất kỳ tin nhắn | `createdAt` là chuỗi ISO |
| CM-004 | Trả mảng rỗng khi không có tin nhắn | Không có bản ghi | `[]` |

### 7.2 `sendChatMessage` — Gửi Tin Nhắn

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| CM-010 | Tạo tin nhắn với vai trò user | `content: "Xin chào"` | `create` với `role: "user"`, trả serialize |
| CM-011 | Trả tin nhắn serialize với `createdAt` ISO | Bất kỳ nội dung | `createdAt` là chuỗi ISO |

---

## 8. Mobile — Store Phiên Chạy Bộ

**File:** `mobile/src/__tests__/stores/running-session-store.test.ts`

### 8.1 Máy Trạng Thái

| ID | Mô tả | Hành động | Trạng thái mong đợi |
|----|-------|-----------|---------------------|
| RUN-001 | Trạng thái ban đầu sau reset | `resetRun()` | `idle`, mọi stats = 0, GPS rỗng |
| RUN-002 | Bắt đầu chạy | `startRun()` | `status: "running"`, `startTime` được đặt |
| RUN-003 | Tạm dừng | `pauseRun()` | `status: "paused"` |
| RUN-004 | Tiếp tục | `resumeRun()` | `status: "running"` |
| RUN-005 | Hoàn thành | `completeRun()` | `status: "completed"` |
| RUN-006 | Chu trình đầy đủ | idle → start → pause → resume → complete → reset | Quay về `idle` |

### 8.2 `updateStats` — Cập Nhật Thống Kê

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| RUN-010 | Cập nhật từng stat riêng lẻ | `{ elapsedSec: 300 }` | Chỉ stat đó thay đổi |
| RUN-011 | Cập nhật nhiều stats cùng lúc | Tất cả stats | Tất cả stats được cập nhật |
| RUN-012 | Ghi đè (không cộng dồn) | Nhiều lần gọi | Lần gọi cuối là giá trị cuối |

### 8.3 `addGpsPoint` — Thêm Điểm GPS

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| RUN-020 | Thêm điểm với timestamp | `{ lat, lng }` | Array length = 1, `timestamp` có giá trị |
| RUN-021 | Tích lũy nhiều điểm | 2 lần gọi | Array length = 2 |

### 8.4 Các Hàm Định Dạng

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| RUN-030 | `fmtDistance` — mét sang km | `1500` | `"1.50 km"` |
| RUN-031 | `fmtDuration` — giây sang mm:ss | `90` | `"01:30"` |
| RUN-032 | `fmtDuration` — thêm hh:mm:ss khi > 1 giờ | `3661` | `"1:01:01"` |
| RUN-033 | `fmtDuration` — xử lý số âm | `-10` | `"00:00"` |
| RUN-034 | `fmtPace` — pace hợp lệ | `300` | `"5:00"` |
| RUN-035 | `fmtPace` — zero/âm/Infinity | `0`, `-1`, `Infinity` | `"—"` |

---

## 9. Mobile — Store Nước

**File:** `mobile/src/__tests__/stores/water-store.test.ts`

### 9.1 Trạng Thái Ban Đầu

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| WTR-001 | Bắt đầu với null summary, mảng rỗng, không loading, không lỗi | Tất cả giá trị ban đầu |

### 9.2 `fetchTodaySummary` — Lấy Tóm Tắt Hôm Nay

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| WTR-010 | Đặt `todaySummary` và dừng loading khi thành công | `todaySummary` có dữ liệu, `isLoading: false` |
| WTR-011 | Đặt lỗi khi thất bại | `error` chứa message, `isLoading: false` |

### 9.3 `fetchLogs` — Lấy Lịch Sử

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| WTR-020 | Điền mảng logs từ API | `logs` có dữ liệu |
| WTR-021 | Đặt lỗi khi thất bại | `error` được đặt |
| WTR-022 | Thêm filter ngày vào query | `from` và `to` trong URL |

### 9.4 `logWater` — Ghi Nước

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| WTR-030 | Cập nhật summary và thêm log khi thành công | `todaySummary` cập nhật, log được thêm |
| WTR-031 | Ném lại lỗi khi thất bại | Lỗi được ném lại |

### 9.5 `updateGoal` — Cập Nhật Mục Tiêu

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| WTR-040 | Cập nhật `todaySummary` với goal mới | `goalMl` được cập nhật |

### 9.6 `reset` — Đặt Lại

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| WTR-050 | Xóa toàn bộ trạng thái | Tất cả về giá trị ban đầu |

---

## 10. Mobile — Store Giấc Ngủ

**File:** `mobile/src/__tests__/stores/sleep-store.test.ts`

### 10.1 Trạng Thái Ban Đầu

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| SLP-001 | Bắt đầu với null summary, mảng rỗng, không loading, không lỗi | Tất cả giá trị ban đầu |

### 10.2 `fetchTodaySummary` — Lấy Tóm Tắt Hôm Nay

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| SLP-010 | Điền `todaySummary` khi thành công | `totalSleepMin`, `avgQuality` có giá trị |
| SLP-011 | Đặt lỗi khi thất bại | `error` được đặt |

### 10.3 `fetchLogs` — Lấy Lịch Sử

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| SLP-020 | Điền mảng logs từ API | `logs` có dữ liệu |

### 10.4 `logSleep` — Ghi Giấc Ngủ

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| SLP-030 | Tải lại summary và logs sau khi ghi | Cả hai được tải lại |
| SLP-031 | Đặt lỗi khi thất bại | `error` được đặt |

### 10.5 `deleteLog` — Xóa Log

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| SLP-040 | Tải lại summary và logs sau khi xóa | Cả hai được tải lại |
| SLP-041 | Ném và đặt lỗi khi thất bại | Lỗi được ném |

### 10.6 `updateGoal` — Cập Nhật Mục Tiêu

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| SLP-050 | Cập nhật `todaySummary` với goal mới | `sleepGoalMin` được cập nhật |

### 10.7 `reset` — Đặt Lại

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| SLP-060 | Xóa toàn bộ trạng thái | Tất cả về giá trị ban đầu |

### 10.8 Các Hàm Helper

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| SLP-070 | `formatSleepDuration` | `480` | `"8h 0m"` |
| SLP-071 | `getSleepQualityLabel` | `4` | `"Great"` |
| SLP-072 | `getSleepQualityLabel` | `null` | `"Not rated"` |
| SLP-073 | `getSleepQualityColor` | `1` | `"#EF4444"` (đỏ) |
| SLP-074 | `getSleepQualityColor` | `null` | `"#9CA3AF"` (xám) |

---

## 11. Mobile — Store Trang Chủ

**File:** `mobile/src/__tests__/stores/home-dashboard-store.test.ts`

### 11.1 Trạng Thái Ban Đầu

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| HDB-001 | Bắt đầu với stats null, pulse rỗng, streak = 0 | Tất cả giá trị ban đầu |

### 11.2 `load` — Tải Dữ Liệu

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| HDB-010 | Tải dữ liệu và tính readiness khi thành công | `stats`, `readiness` có dữ liệu |
| HDB-011 | Đặt lỗi khi fetch thất bại | `error` chứa message |
| HDB-012 | Không ném khi có ngoại lệ non-Error | Lỗi được bắt và đặt |

### 11.3 `clearError` — Xóa Lỗi

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| HDB-020 | Đặt `error` về null | `error: null` |

### 11.4 `computeReadiness` — Tính Điểm Sẵn Sàng

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|-------------------|
| HDB-030 | Điểm giới hạn 0–100 | Không hoạt động | Điểm ≥ 0, ≤ 100 |
| HDB-031 | Thưởng hoạt động cho 30+ phút | `activeMinutes: 30` | Điểm > không có hoạt động |
| HDB-032 | Thưởng tập luyện tuần | `weeklyWorkoutCount: 3` | Điểm > không có bài tập |
| HDB-033 | Thưởng cân bằng dinh dưỡng | kcalIn = target | Điểm > không cân bằng |
| HDB-034 | Nhãn "Tuyệt vời!" | Điểm ≥ 85 | `label: "Tuyệt vời!"` |
| HDB-035 | Nhãn "Tốt" | Điểm 70–84 | `label: "Tốt"` |
| HDB-036 | Nhãn "Trung bình" | Điểm 50–69 | `label: "Trung bình"` |
| HDB-037 | Nhãn "Cần cải thiện" | Điểm < 50 | `label: "Cần cải thiện"` |
| HDB-038 | Giới hạn 100 với tất cả bonus | Giá trị cực đoan | `score ≤ 100` |
| HDB-039 | Cung cấp hint không rỗng | Bất kỳ đầu vào | `hint` là chuỗi không rỗng |

---

## 12. Mobile — Store Xác Thực

**File:** `mobile/src/__tests__/stores/auth-store.test.ts`

### 12.1 Trạng Thái Ban Đầu

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-001 | Bắt đầu với user null, không onboarding, trạng thái loading | Tất cả giá trị ban đầu |

### 12.2 `hydrate` — Khôi Phục Trạng Thái

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-010 | Đặt user và ready khi token hợp lệ | `status: "ready"`, `user.id` có giá trị |
| AUTH-011 | Đặt `needsOnboarding` khi profile chưa hoàn chỉnh | `needsOnboarding: true` |
| AUTH-012 | Xóa tokens khi token không hợp lệ | `deleteItemAsync` được gọi 2 lần |
| AUTH-013 | Đặt ready với user null khi không có token | `user: null` |

### 12.3 `register` — Đăng Ký

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-020 | Lưu tokens, đặt `needsOnboarding: true` | SecureStore lưu tokens |
| AUTH-021 | Ném lỗi khi thất bại | Error được ném |

### 12.4 `login` — Đăng Nhập

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-030 | `needsOnboarding` dựa trên profile | Profile đầy đủ → `false` |
| AUTH-031 | Ném lỗi khi thất bại | Error được ném |

### 12.5 `loginWithGoogle` — Đăng Nhập Google

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-040 | Đăng nhập và lưu tokens | Access token được lưu |

### 12.6 `loginWithApple` — Đăng Nhập Apple

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-050 | Đăng nhập và lưu tokens | Access token được lưu |

### 12.7 `completeOnboarding` — Hoàn Thành Onboarding

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-060 | Đặt `needsOnboarding: false` | Trạng thái được cập nhật |

### 12.8 `logout` — Đăng Xuất

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-070 | Xóa tokens và reset user | `user: null`, tokens đã xóa |
| AUTH-071 | Xóa tokens dù API thất bại | Tokens vẫn được xóa |
| AUTH-072 | Không ném khi không có refresh token | Resolve thành công |

### 12.9 `updateUser` — Cập Nhật User

| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| AUTH-080 | Cập nhật trạng thái user | Đối tượng `user` được cập nhật |

---

## Phụ Lục: Lệnh Chạy Tests

### Backend

```bash
cd backend
npx vitest run                    # Tất cả tests
npx vitest run src/modules/nutrition/nutrition.service.test.ts
```

### Mobile

```bash
cd mobile
npx vitest run --config vitest.config.ts
```

### Ghi Chú

- Mobile store tests (water, sleep, dashboard, auth) cần `@testing-library/react-native` được resolve đúng. Chạy `npm install` trong thư mục `mobile/`.
- `chat-messages.service.test.ts` sẽ pass sau khi thêm model `ChatMessage` vào `prisma/schema.prisma`.

### Tổng Quan Coverage

| Phần | Số file | Số test |
|------|---------|---------|
| Backend Nutrition | 1 | 27 |
| Backend Body Metrics | 1 | 14 |
| Backend Reminders | 1 | 12 |
| Backend Progress Service | 1 | 16 |
| Backend Progress Calc | 1 | 14 |
| Backend Water-Sleep | 1 | 16 |
| Backend Chat Messages | 1 | 9 |
| Mobile Running Session | 1 | 19 |
| Mobile Water | 1 | 15 |
| Mobile Sleep | 1 | 17 |
| Mobile Dashboard | 1 | 14 |
| Mobile Auth | 1 | 16 |
| **Tổng** | **13** | **189** |
