# Chuẩn bị buổi học — Phân tích chức năng, luồng nghiệp vụ, tương tác

Tài liệu này phục vụ **Pre-class** và **In-class**: sơ đồ phân rã chức năng, luồng nghiệp vụ (góc người dùng), sơ đồ tương tác chính.  
**Chú thích trạng thái:** ✅ đã có trong mã nguồn (Phase 0) · 🔜 thiết kế / roadmap (Phase 1+).

---

## 1. Sơ đồ phân rã chức năng (Functional Decomposition)

Mục đích: thể hiện **cấu trúc cây** từ hệ thống → nhóm chức năng → chức năng con (không đi sâu class/code).

```mermaid
flowchart TB
  HF[Hệ thống Health Fitness]

  HF --> A[Quản lý tài khoản và phiên đăng nhập]
  HF --> B[Quản lý hồ sơ và mục tiêu cá nhân]
  HF --> C[Ghi nhận tập luyện]
  HF --> D[Ghi nhận dinh dưỡng]
  HF --> E[Theo dõi chỉ số cơ thể]
  HF --> F[Tổng hợp tiến độ và báo cáo]
  HF --> G[Nhắc nhở và thông báo]
  HF --> H[Hạ tầng kỹ thuật dùng chung]

  A --> A1[Đăng ký tài khoản ✅]
  A --> A2[Đăng nhập / đăng xuất ✅]
  A --> A3[Làm mới phiên đăng nhập ✅]
  A --> A4[Thu hồi phiên refresh ✅]

  B --> B1[Xem thông tin người dùng hiện tại ✅]
  B --> B2[Cập nhật hồ sơ cá nhân ✅]
  B --> B3[Thiết lập / cập nhật mục tiêu ✅]

  C --> C1[Danh mục bài tập 🔜]
  C --> C2[Kế hoạch buổi tập 🔜]
  C --> C3[Ghi log phiên tập và từng set 🔜]

  D --> D1[Danh mục thức ăn 🔜]
  D --> D2[Ghi nhật ký bữa ăn và macro 🔜]

  E --> E1[Ghi nhận cân nặng / vòng eo / % mỡ 🔜]

  F --> F1[Bảng tổng hợp theo ngày/tuần 🔜]
  F --> F2[Biểu đồ xu hướng 🔜]

  G --> G1[Lập lịch nhắc nhở 🔜]
  G --> G2[Gửi thông báo đẩy 🔜]

  H --> H1[API REST phiên bản hóa ✅]
  H --> H2[Hợp đồng lỗi thống nhất ✅]
  H --> H3[Đồng bộ kiểu client–server shared ✅]
  H --> H4[Worker / hàng đợi tác vụ nền 🔜]
```

**Gợi ý trình bày trên lớp:** Bắt đầu từ nút gốc, đọc từng nhánh; nhấn mạnh phần ✅ đã làm và phần 🔜 là lộ trình hợp lý (MVP trước, mở rộng sau).

---

## 2. Luồng nghiệp vụ chính (Business flow — góc người dùng)

Các sơ đồ dưới đây mô tả **việc người dùng muốn làm gì**, không mô tả JWT/bcrypt (đó là luồng kỹ thuật, để phần báo cáo kỹ thuật).

### 2.1 Lần đầu sử dụng — tạo tài khoản và vào ứng dụng (✅)

```mermaid
flowchart TD
  Start([Người dùng mở app]) --> ChuaCo[Chưa có tài khoản?]
  ChuaCo -->|Có| DangNhap[Đăng nhập email/mật khẩu]
  ChuaCo -->|Chưa| DangKy[Đăng ký tài khoản mới]
  DangKy --> ThanhCong[Đăng ký thành công]
  ThanhCong --> VaoHome[Vào màn hình chính]
  DangNhap --> KiemTra{Thông tin đúng?}
  KiemTra -->|Không| DangNhap
  KiemTra -->|Đúng| VaoHome
  VaoHome --> End([Sử dụng các chức năng đã có])
```

### 2.2 Khởi động lại app — nhớ phiên đăng nhập (✅)

```mermaid
flowchart TD
  Start([Mở lại app]) --> CoToken{Còn phiên hợp lệ trên máy?}
  CoToken -->|Có| TaiThongTin[Tải thông tin người dùng]
  TaiThongTin --> VaoHome[Vào màn hình chính]
  CoToken -->|Không / hết hạn không phục hồi được| ManHinhDangNhap[Màn hình đăng nhập]
  ManHinhDangNhap --> End([Người dùng đăng nhập lại])
```

### 2.3 Cập nhật hồ sơ và mục tiêu (✅)

```mermaid
flowchart LR
  A([Người dùng]) --> B[Mở màn hình hồ sơ]
  B --> C[Xem thông tin hiện tại]
  C --> D{Sửa hồ sơ hoặc mục tiêu?}
  D -->|Hồ sơ| E[Nhập / chỉnh thông tin cá nhân]
  D -->|Mục tiêu| F[Chọn loại mục tiêu và chỉ tiêu]
  E --> G[Lưu]
  F --> G
  G --> H{Hợp lệ?}
  H -->|Không| C
  H -->|Có| I([Thông tin được cập nhật trên server])
```

### 2.4 Luồng nghiệp vụ mục tiêu — ghi buổi tập (🔜 thiết kế)

Dùng để trình bày **tính hợp lý** của roadmap, chưa cần code đầy đủ.

```mermaid
flowchart TD
  A([Người dùng muốn ghi nhận buổi tập]) --> B[Chọn hoặc tạo phiên tập]
  B --> C[Thêm bài tập vào phiên]
  C --> D[Ghi từng set rep/cân/nghỉ]
  D --> E{Còn bài?}
  E -->|Có| C
  E -->|Không| F[Kết thúc phiên]
  F --> G([Dữ liệu lưu trên hệ thống để theo dõi sau này])
```

### 2.5 Luồng nghiệp vụ mục tiêu — ghi bữa ăn (🔜 thiết kế)

```mermaid
flowchart TD
  A([Người dùng muốn ghi nhận dinh dưỡng]) --> B[Chọn bữa trong ngày]
  B --> C[Thêm món / khẩu phần]
  C --> D[Hệ thống tính kcal và macro]
  D --> E{Lưu?}
  E -->|Có| F([Nhật ký bữa ăn được cập nhật])
  E -->|Chưa| C
```

---

## 3. Sơ đồ tương tác chính (Actors & use cases)

### 3.1 Tác nhân (actors)

| Actor | Mô tả |
|-------|--------|
| **Người dùng đã xác thực** | Người dùng ứng dụng di động sau khi đăng nhập (hoặc phiên được khôi phục). |
| **Khách (chưa đăng nhập)** | Chỉ thực hiện đăng ký / đăng nhập. |
| **Hệ thống Health Fitness** | Ranh giới: mobile app + API + CSDL (theo thiết kế monorepo). |

### 3.2 Sơ đồ use case — phạm vi hiện triển khai (Phase 0)

```mermaid
flowchart LR
  subgraph Khach[Khách]
    K((Khách))
  end

  subgraph ND[Người dùng]
    U((Người dùng đã xác thực))
  end

  subgraph SYS[Hệ thống Health Fitness]
    UC1((Đăng ký))
    UC2((Đăng nhập))
    UC3((Đăng xuất))
    UC4((Xem thông tin tài khoản))
    UC5((Cập nhật hồ sơ))
    UC6((Cập nhật mục tiêu))
  end

  K --> UC1
  K --> UC2
  U --> UC3
  U --> UC4
  U --> UC5
  U --> UC6
```

### 3.3 Sơ đồ use case — mở rộng theo roadmap (Phase 1+)

```mermaid
flowchart LR
  U((Người dùng đã xác thực))

  subgraph SYS[Hệ thống Health Fitness — mở rộng]
    P0((Các use case Phase 0))
    UC7((Ghi nhận tập luyện))
    UC8((Ghi nhật ký dinh dưỡng))
    UC9((Ghi chỉ số cơ thể))
    UC10((Xem tiến độ tổng hợp))
    UC11((Quản lý nhắc nhở))
  end

  U --> P0
  U -.->|roadmap| UC7
  U -.->|roadmap| UC8
  U -.->|roadmap| UC9
  U -.->|roadmap| UC10
  U -.->|roadmap| UC11
```

Đường nét đứt (`.->`) gợi ý **kế hoạch**, đường liền là **đã nằm trong phạm vi thiết kế tổng thể**.

---

## 4. Sơ đồ tương tác hệ thống (ngữ cảnh — Context)

Mục đích: cho thấy **tương tác chính giữa các khối**, không đi sâu endpoint.

```mermaid
flowchart LR
  User[Người dùng]

  subgraph Client[Ứng dụng di động Expo]
    UI[Giao diện]
    Store[Trạng thái / lưu token an toàn]
  end

  subgraph Server[Máy chủ API]
    API[REST /api/v1]
  end

  DB[(MySQL)]

  User --> UI
  UI <--> Store
  UI <-->|HTTPS JSON| API
  API <--> DB
```

**Gợi ý nói thêm:** Worker + Redis + push nằm trong roadmap; có thể vẽ thêm một nhánh `API --> Queue --> Worker` khi trình bày phần mở rộng.

---

## 5. Checklist trước khi lên lớp

| Hạng mục | Đã có trong file này? |
|----------|------------------------|
| Sơ đồ phân rã chức năng | Có (mục 1) |
| Luồng nghiệp vụ (ít nhất: đăng ký/đăng nhập, hồ sơ) | Có (mục 2.1–2.3) |
| Luồng nghiệp vụ tương lai (tập, ăn) để thảo luận hợp lý | Có (mục 2.4–2.5) |
| Tương tác actor / use case | Có (mục 3) |
| Ngữ cảnh hệ thống | Có (mục 4) |

**In-class:** Trình bày mục 1 → 3 (Phase 0) trước, sau đó mở Phase 1 để nhận góp ý về **thứ tự ưu tiên** (ví dụ: ghi tập trước hay dinh dưỡng trước). Ghi nhận ý GV về tối ưu luồng (giảm bước, gộp màn hình, v.v.) và cập nhật lại sơ đồ sau buổi học.

---

## 6. Xuất hình để nộp / trình chiếu

- **Trong VS Code / Cursor:** cài extension “Markdown Preview Mermaid Support” hoặc mở preview có hỗ trợ Mermaid.
- **Online:** dán nội dung khối ` ```mermaid ` vào [mermaid.live](https://mermaid.live) để xuất PNG/SVG.
- **Slide:** chụp màn hình từ preview hoặc dán SVG vào PowerPoint/Google Slides.

---

*Tài liệu bổ sung cho `docs/architecture.md` và các báo cáo trong repo; không thay thế tài liệu kỹ thuật chi tiết.*
