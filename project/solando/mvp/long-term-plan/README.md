# Kế Hoạch Triển Khai Dài Hạn — Phần Mềm ERP & Portal Tự Build

> **Mục tiêu:** Xây dựng hệ thống ERP & Portal độc lập, làm chủ 100% mã nguồn (Native Custom), chuyển đổi từ KiotViet sang kiến trúc bền vững **Clean Architecture** để đáp ứng các nghiệp vụ phức tạp lâu dài.

---

## 1. Lý Do Tự Xây Dựng (Native Custom ERP)

Mặc dù KiotViet rất tốt cho giai đoạn ngắn hạn (MVP), về lâu dài Solando cần một hệ thống tự xây dựng vì các lý do sau:

| Tiêu chí | Giải thích / Lợi ích lâu dài |
|---|---|
| **Tự do tùy biến nghiệp vụ sâu** | KiotViet bị giới hạn trong nghiệp vụ bán hàng/kho tiêu chuẩn và không hỗ trợ tùy biến các logic giao dịch sâu. Với Custom Backend (NestJS), ta dễ dàng can thiệp vào Database Transactions (ví dụ: xử lý tranh chấp dữ liệu tồn kho khi nhiều thủ kho cùng xuất nhập một mã serial). |
| **Portal tự phục vụ cho Đại lý** | Xây dựng giao diện riêng biệt (Dealer Portal) cho hàng trăm đại lý tự đăng nhập xem báo giá riêng, đặt hàng, theo dõi đơn hàng và yêu cầu bảo hành. |
| **Đối soát & Báo cáo BI động** | Báo cáo doanh số, tự động tính Margin thực tế và đối soát doanh thu hỗ trợ kế toán. |
| **Quét mã kho chuyên biệt (PWA)** | Xây dựng Web App dạng Progressive Web App (PWA) tối ưu cho camera điện thoại quét Serial liên tục ở môi trường kho thiếu sáng. |
| **Làm chủ cấu trúc Database** | Dùng Prisma ORM để quản lý migrations cơ sở dữ liệu chuyên nghiệp, dễ dàng tối ưu hóa index cho hàng triệu bản ghi Serial sau này. |
| **Không phụ thuộc License & Updates** | Tránh rủi ro về chi phí license theo user của KiotViet và giới hạn của bên thứ ba ảnh hưởng đến hệ thống đang vận hành ổn định. |

---

## 2. Kiến Trúc Hệ Thống (Clean Architecture)

Hệ thống dài hạn sẽ được thiết kế theo mô hình **Clean Architecture**, tách biệt hoàn toàn giữa logic nghiệp vụ (Core Business Logic) và các công nghệ bên ngoài (Database, HTTP Framework, UI):

```
┌────────────────────────────────────────────────────────┐
│             Infrastructure Layer (External)            │
│  [PostgreSQL / Prisma]                  [React (Vite)] │
│                           ▼                            │
│      ┌──────────────────────────────────────────┐      │
│      │        Presentation Layer (API)          │      │
│      │      [Controllers]   [DTOs / Serialization]      │
│      │                    ▼                     │      │
│      │   ┌──────────────────────────────────┐   │      │
│      │   │     Use Cases / Application      │   │      │
│      │   │    [Services / Use Case Flows]   │   │      │
│      │   │                ▼                 │   │      │
│      │   │   ┌──────────────────────────┐   │      │
│      │   │   │       Domain Layer       │   │      │
│      │   │   │    [Entities / Rules]    │   │      │
│      │   │   └──────────────────────────┘   │      │
│      │   └──────────────────────────────────┘   │      │
│      └──────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────┘
```

### Cấu trúc thư mục dự án đề xuất:

```bash
src/
├── domain/                    # Lớp Thực thể Lõi (Không phụ thuộc Database/Framework)
│   ├── entities/              # Dealer, Product, Order, Serial, Invoice, ActivatedAsset
│   └── repositories/          # Interface định nghĩa cách tương tác dữ liệu
├── use-cases/                 # Lớp Nghiệp vụ (Use Cases - Luồng xử lý cụ thể)
│   ├── authentication/        # LoginUseCase, ValidateUserUseCase
│   ├── dealer/                # CheckCreditLimitUseCase, CreateDealerUseCase
│   ├── quotation/             # CalculateMarginUseCase, ApproveQuotationUseCase
│   ├── order/                 # CreateOrderFromQuotationUseCase, ShipOrderUseCase
│   ├── billing/               # ProcessManualPaymentUseCase, IssueInvoiceUseCase
│   ├── inventory/             # ImportBatchUseCase, ScanSerialExportUseCase
│   └── warranty/              # ActivateWarrantyViaQRUseCase
└── infrastructure/            # Lớp Hạ tầng (Triển khai kỹ thuật cụ thể)
    ├── database/              # Prisma ORM, PostgreSQL Repositories
    ├── http/                  # NestJS Controllers, DTOs
    └── shared/                # Helpers, Logging, Config
```

---

## 3. Danh Sách 9 Module Nghiệp Vụ Cốt Lõi

| Module | Thực thể (Entities) | Use Cases Trọng Tâm | Ghi Chú Kỹ Thuật |
|---|---|---|---|
| **1. Auth & RBAC** | `User`, `Role`, `Permission` | Đăng nhập hệ thống, Phân quyền cho nhân viên & đại lý | NestJS Guards + JWT |
| **2. Master Data** | `Branch`, `Currency`, `SystemConfig` | Quản lý tỷ giá, chi nhánh kho, cấu hình ngưỡng Margin | Singleton pattern |
| **3. Dealer & CRM** | `Dealer`, `DealerProfile`, `EndUser` | Quản lý thông tin đại lý và gán sale phụ trách chăm sóc | Đồng bộ cơ sở dữ liệu |
| **4. Product & PIM** | `Product`, `SolutionKit` | Quản lý SKU thiết bị, combo giải pháp kỹ thuật | Tích hợp AWS S3 lưu tài liệu |
| **5. Báo Giá** | `Quotation`, `QuotationItem` | Pricing engine tự áp giá theo Tier đại lý, tự tính Margin | Tự động cảnh báo Admin duyệt khi Margin thấp |
| **6. Đơn Hàng** | `Order`, `OrderItem` | Chuyển báo giá thành đơn hàng và quản lý giao nhận | Vòng đời đơn hàng khép kín |
| **7. Đối Soát & Báo Cáo** | `Invoice` | Tổng hợp báo giá, theo dõi tình trạng thanh toán đơn hàng, xuất báo cáo BI | Biểu đồ trực quan, xuất excel |
| **8. Kho & Số Serial** | `Batch`, `Serial` | Nhập lô hàng excel serial, quét serial thực tế xuất đi | Web App PWA Camera Scanner |
| **9. Bảo Hành & QR** | `ActivatedAsset`, `Ticket` | Quét QR trên Inverter kích hoạt bảo hành, gửi SMS/Zalo | Web Public Form không cần đăng nhập |

---

## 4. Hệ Thống Báo Cáo Quản Trị & Phân Tích Tài Chính

Để tối ưu hóa kiểm soát tài chính và năng suất làm việc của kế toán cũng như ban giám đốc, hệ thống cung cấp công cụ báo cáo trực quan:
- **Theo dõi hóa đơn thanh toán:** Kế toán dễ dàng ghi nhận các khoản thanh toán của đại lý theo đơn hàng để khớp trạng thái đơn hàng.
- **Phân tích Margin & Sales:** Dashboard hiển thị báo cáo doanh số bán hàng, biên lợi nhuận (Margin %) theo sản phẩm, theo đại lý và theo nhân viên Sale để ban giám đốc đưa ra các quyết định kinh doanh kịp thời.

---

## 5. Timeline Phát Triển

Kế hoạch phát triển và kiểm thử hệ thống tự xây dựng, chia thành 5 giai đoạn chính:

### Phase 1 — Nền Tảng & Product PIM (Ngày 1–14)
- [ ] Khởi tạo khung Clean Architecture cho dự án NestJS + Prisma ORM
- [ ] Thiết lập module Xác thực & phân quyền (RBAC) cho cả Admin và Đại lý
- [ ] Định nghĩa SKU sản phẩm, BOM giải pháp kỹ thuật, đính kèm CO/CQ trên AWS S3
- [ ] Thiết lập kết nối PostgreSQL và chạy DB migrations đầu tiên
- *Mốc quan trọng (Milestone 1):* Vận hành trơn tru khung sườn và phân quyền người dùng.

### Phase 2 — Quản Lý Đại Lý & Kho Serial (Ngày 15–35)
- [ ] Thiết kế cơ sở dữ liệu đại lý phân hạng (Tier 1/Tier 2) và gán Sale phụ trách
- [ ] Xây dựng luồng Nhập kho theo lô, import serial từ file Excel lớn
- [ ] Phát triển Web App PWA Scanner để thủ kho quét serial thực tế xuất đi bằng camera điện thoại
- *Mốc quan trọng (Milestone 2):* Hoàn thành tích hợp quét Serial kho và quản lý đại lý.

### Phase 3 — Báo Giá, Pricing Engine & Đơn Hàng (Ngày 36–49)
- [ ] Xây dựng Pricing Engine tự động áp dụng giá theo Tier của Đại lý
- [ ] Lập báo giá, tính toán Margin theo lô và cảnh báo duyệt chiết khấu thấp
- [ ] Chuyển đổi Báo giá -> Đơn hàng và tích hợp luồng phê duyệt Margin
- *Mốc quan trọng (Milestone 3):* Chạy thử nghiệm luồng chuyển đổi đơn hàng và phê duyệt margin thành công.

### Phase 4 — Báo Báo Quản Trị & Đối Soát Doanh Thu (Ngày 50–63)
- [ ] Xây dựng màn hình ghi nhận thanh toán thủ công cho kế toán
- [ ] Phát triển tính năng phân tích doanh thu đại lý theo kỳ
- [ ] Thiết kế Dashboard báo cáo doanh số, biên lợi nhuận Margin động cho BGĐ
- *Mốc quan trọng (Milestone 4):* Vận hành thử nghiệm hệ thống báo cáo đối soát doanh thu.

### Phase 5 — Cổng Bảo Hành QR & Go-Live (Ngày 64–70)
- [ ] Phát triển Public QR Form (React (Vite)) quét QR trên inverter ngoài công trường
- [ ] Tích hợp SMS/Zalo Gateway gửi tin nhắn xác nhận kích hoạt bảo hành thành công
- [ ] Triển khai hệ thống lên hạ tầng cloud (AWS/RDS), load test và chính thức Go-live
- *Mốc quan trọng (Milestone 5):* Chạy thực tế luồng quét QR kích hoạt bảo hành thành công.

---

## 6. Stack Kỹ Thuật Đề Xuất

| Layer | Công nghệ đề xuất | Vai trò / Ghi chú |
|---|---|---|
| **Backend API** | NestJS (TypeScript) | Framework mạnh mẽ, hỗ trợ Dependency Injection tốt nhất cho Clean Architecture |
| **Database** | PostgreSQL 16 | Đảm bảo tính toàn vẹn dữ liệu (ACID), xử lý các transaction phức tạp |
| **ORM** | Prisma ORM | Quản lý Schema, DB Migrations và type-safety tốt nhất cho TypeScript |
| **Frontend Admin** | React (Vite) + Tailwind CSS | Giao diện quản lý nội bộ cho nhân viên Solando |
| **Dealer Portal** | React (Vite) + Tailwind CSS | Cổng thông tin tự phục vụ dành riêng cho Đại lý |
| **File Storage** | AWS S3 | Lưu trữ tài liệu CO/CQ, Datasheet thiết bị |
| **Infrastructure** | Docker + AWS (EC2/RDS) | Đảm bảo khả năng vận hành ổn định và backup tự động |
