# Tài Liệu Thiết Kế Nghiệp Vụ & Cấu Trúc Hệ Thống (Solando Solar)

Tài liệu này tổng hợp toàn bộ các module nghiệp vụ cần thiết và các quy tắc nghiệp vụ cốt lõi (Business Logic Rules) đã được thống nhất, được thiết kế theo mô hình **Clean Architecture** thay vì DDD phức tạp.

Hệ thống được định hướng phát triển theo **phương án tự xây dựng (Native Custom ERP & Portal)** để làm chủ hoàn toàn dữ liệu, tự động hóa luồng thanh toán và kiểm soát công nợ mà không phụ thuộc vào các phần mềm bên thứ ba như KiotViet.

---

## 1. Tổng Quan Kiến Trúc Hệ Thống (Clean Architecture)

Hệ thống tuân thủ mô hình **Clean Architecture**, tách biệt hoàn toàn giữa logic nghiệp vụ (Core Business Logic) và các yếu tố công nghệ (Database, Framework, UI):

```
┌────────────────────────────────────────────────────────┐
│             Infrastructure Layer (External)            │
│  [PostgreSQL / Prisma]   [VietQR Webhook]   [Next.js]  │
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

### Phân rã cấu trúc thư mục (Folder Structure):

```bash
src/
├── domain/                    # Lớp Thực thể Lõi (Không phụ thuộc vào Database hay Framework)
│   ├── entities/              # Dealer, Product, Order, Serial, Invoice, ActivatedAsset
│   └── repositories/          # Các Interface định nghĩa cách tương tác dữ liệu (IDealerRepository,...)
├── use-cases/                 # Lớp Nghiệp vụ (Use Cases - Luồng xử lý cụ thể)
│   ├── authentication/        # LoginUseCase, ValidateUserUseCase
│   ├── master-data/           # ManageSettingsUseCase, ViewCategoriesUseCase
│   ├── dealer/                # CheckCreditLimitUseCase, CreateDealerUseCase
│   ├── quotation/             # CalculateMarginUseCase, ApproveQuotationUseCase
│   ├── order/                 # CreateOrderFromQuotationUseCase, ShipOrderUseCase
│   ├── billing/               # ProcessVietQRPaymentUseCase, IssueInvoiceUseCase
│   ├── inventory/             # ImportBatchUseCase, ScanSerialExportUseCase
│   └── warranty/              # ActivateWarrantyViaQRUseCase
├── infrastructure/            # Lớp Hạ tầng (Triển khai kỹ thuật cụ thể)
│   ├── database/              # Prisma ORM, PostgreSQL Repositories implementation
│   ├── http/                  # NestJS Controllers, Route definitions, Request/Response DTOs
│   ├── payment/               # SePay/Casso Webhook receiver, VietQR generator
│   └── shared/                # Logging, Helpers, Configuration
```

---

## 2. Danh Sách Phân Rã Các Module Thực Tế Cần Phát Triển

Để xây dựng một hệ thống ERP & Portal vận hành đầy đủ thực tế, hệ thống cần được phân rã thành **9 module cụ thể** bao gồm các module nghiệp vụ lõi và các module kỹ thuật nền tảng:

### 🔑 1. Module Xác Thực & Phân Quyền (Authentication & Authorization)

- **Mô tả:** Hệ thống đăng nhập bảo mật và kiểm soát quyền truy cập cho nhân viên Solando (Admin, Kế toán, Kinh doanh, Kho) và Đại lý (Dealer Portal).
- **Domain Entities:** `User`, `Role`, `Permission`, `UserSession`.
- **Use Cases:**
  - `LoginUseCase`: Đăng nhập, trả về JWT Token.
  - `VerifySessionUseCase`: Xác thực Token hợp lệ.
  - `AssignRoleUseCase`: Phân quyền người dùng dựa trên vai trò (Role-Based Access Control - RBAC).
- **Infrastructure:** NestJS Guards, JWT Passport Strategy, Bcrypt mã hóa mật khẩu.

### ⚙️ 2. Module Dữ Liệu Dùng Chung (Master Data)

- **Mô tả:** Quản lý các danh mục nền tảng làm cơ sở cho toàn bộ hệ thống bán hàng và cấu hình.
- **Domain Entities:** `Branch` (Chi nhánh kho), `Currency` (Cấu hình ngoại tệ/tỷ giá), `Unit` (Đơn vị tính sản phẩm), `SystemConfig` (Ngưỡng duyệt Margin, công thức mặc định).
- **Use Cases:**
  - `GetCategoriesUseCase`: Lấy danh mục đơn vị tính, chi nhánh.
  - `UpdateSystemSettingsUseCase`: Thay đổi cấu hình chung (ví dụ: Thay đổi ngưỡng duyệt chiết khấu mặc định từ 10% thành 12%).
- **Infrastructure:** Prisma repository.

### 🏢 3. Module Đại Lý & Khách Hàng (Dealers & Customers)

- **Mô tả:** Quản lý thông tin đối tác, hạn mức công nợ và tệp thông tin khách lẻ.
- **Domain Entities:** `Dealer` (Đại lý: Tier 1, Tier 2, Lẻ), `DealerProfile`, `EndUser`.
- **Use Cases:**
  - `CheckCreditLimitUseCase`: Chặn nợ tự động dựa trên tổng dư nợ hiện tại và đơn mới.
  - `CreateDealerUseCase` / `UpdateDealerTierUseCase`: Tạo mới và thay đổi phân hạng đại lý.
- **Infrastructure:**
  - **Hard Credit Block:** Nếu dư nợ + giá trị đơn mới vượt hạn mức, đơn hàng bị khóa cứng và chuyển sang trạng thái "Chờ duyệt hạn mức".

### 🏷️ 4. Module Sản Phẩm & PIM (Products & BOM)

- **Mô tả:** Danh mục sản phẩm Solar, Inverter, Pin Lithium và đóng gói combo kỹ thuật.
- **Domain Entities:** `Product` (SKU, giá bán lẻ đề xuất, bảo hành theo SKU), `SolutionKit` (Combo BOM gồm pin + inverter + phụ kiện).
- **Use Cases:**
  - `RegisterProductUseCase` / `UpdateProductCatalogUseCase`.
  - `CalculateWarrantyExpiryUseCase`: Truy vấn thời hạn bảo hành mặc định cấu hình trên SKU.
- **Infrastructure:** S3 Storage (để tải lên CO/CQ, Catalog đính kèm sản phẩm).

### 📋 5. Module Báo Giá & Pricing Engine (Quotations)

- **Mô tả:** Lập báo giá, tự động áp dụng giá theo Tier của Đại lý và tính toán Margin.
- **Domain Entities:** `Quotation`, `QuotationItem`, `PricingPolicy`.
- **Use Cases:**
  - `CalculateMarginUseCase`: Biên lợi nhuận được tính từ giá bán và giá vốn thực tế của lô hàng có sẵn trong kho.
  - `ApproveQuotationUseCase`: Tự động kích hoạt quy trình duyệt chiết khấu lên Admin khi Margin < 10%.

### 🤝 6. Module Đơn Hàng (Orders)

- **Mô tả:** Quy trình bán hàng và quản trị đơn hàng đại lý.
- **Domain Entities:** `Order`, `OrderItem`, `OrderStatusHistory`.
- **Use Cases:**
  - `CreateOrderFromQuotationUseCase`: Chuyển báo giá thành đơn hàng chính thức.
  - `ApproveCreditLimitOverrideUseCase`: Quyết định phê duyệt đơn hàng vượt hạn mức của Admin.
  - `UpdateOrderStatusUseCase`: Chuyển trạng thái đơn hàng (Draft -> Pending Credit -> Approved -> Shipped -> Completed).

### 💳 7. Module Hóa Đơn & Thanh Toán (Billing & Payments - Tự Xây)

- **Mô tả:** Hệ thống gạch nợ tự động qua VietQR không dùng KiotViet.
- **Domain Entities:** `Invoice` (Hóa đơn), `PaymentTransaction` (Biến động số dư).
- **Use Cases:**
  - `GenerateVietQRPayloadUseCase`: Tạo QR động chứa mã hóa đơn và số tiền cần thanh toán.
  - `ProcessVietQRPaymentUseCase`: Xử lý Webhook ngân hàng gửi về để tự động thanh toán hóa đơn và giải phóng ngay công nợ cho đại lý trong 3 giây.
- **Infrastructure:** Tích hợp Casso/SePay API Webhook.

### 📦 8. Module Kho & Số Serial (Inventory & Serials)

- **Mô tả:** Quản lý xuất/nhập kho theo lô và truy vết thiết bị qua số Serial Number.
- **Domain Entities:** `Batch`/`Lot` (Đợt nhập PO, có giá vốn nhập riêng), `Serial` (Trạng thái thiết bị: In Stock, Shipped, Activated).
- **Use Cases:**
  - `ImportBatchUseCase`: Quét/Nhập danh sách Serial từ NSX khi nhập hàng về.
  - `ScanSerialExportUseCase`: Quét Serial thực tế xuất đi bằng app điện thoại để đối chiếu và trừ kho.
- **Infrastructure:** Tích hợp camera điện thoại làm đầu đọc quét QR/Barcode trên giao diện Web (PWA Scanner).

### 🛠️ 9. Module Bảo Hành & Kích Hoạt QR (Warranty & Services)

- **Mô tả:** Form kích hoạt bảo hành công cộng và theo dõi ticket sửa chữa.
- **Domain Entities:** `ActivatedAsset` (Thiết bị đã kích hoạt), `SupportTicket` (Yêu cầu hỗ trợ).
- **Use Cases:**
  - `ActivateWarrantyViaQRUseCase`: Quét mã QR trên thiết bị -> Tự động truy vết Serial về đơn hàng mua -> Gợi ý đại lý mua ban đầu (cho phép sửa đổi) -> Tính ngày hết hạn từ ngày kích hoạt + cấu hình bảo hành SKU.
  - `CreateSupportTicketUseCase` / `ProcessTicketUseCase`: Quản lý yêu cầu hỗ trợ bảo trì.

---

## 3. Lộ Trình Phát Triển & Bảng Timeline Dự Kiến

Để triển khai dự án Custom ERP & Portal này một cách an toàn và tối ưu, thời gian được phân chia làm **5 giai đoạn** trong vòng **10 tuần**:

| Giai Đoạn                                | Tuần           | Module Triển Khai                                             | Use Cases & Tính Năng Trọng Tâm                                                                                                                                                     | Mức Độ Ưu Tiên | Phụ Thuộc (Dependencies) |
| :--------------------------------------- | :------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- | :----------------------- |
| **Giai Đoạn 1:<br>Nền tảng**             | **Tuần 1 - 2** | 🔑 1. Auth & RBAC<br>⚙️ 2. Master Data<br>🏷️ 4. Product & PIM | - Đăng nhập phân quyền admin/kinh doanh/đại lý.<br>- Cấu hình danh mục dùng chung (tỷ giá, chi nhánh).<br>- Định nghĩa SKU và thời hạn bảo hành mặc định cho sản phẩm.              | 🔴 Cao         | Không có                 |
| **Giai Đoạn 2:<br>Công nợ & Kho**        | **Tuần 3 - 5** | 🏢 3. Dealer & CRM<br>📦 8. Inventory & Serial                | - Cấu hình cấp bậc đại lý (Tier 1/2) và hạn mức nợ.<br>- Quản lý lô hàng nhập, tính giá vốn từng lô.<br>- Giao diện quét Serial nhập/xuất kho (PWA Web Scanner).                    | 🔴 Cao         | Giai đoạn 1              |
| **Giai Đoạn 3:<br>Kinh doanh & Báo giá** | **Tuần 6 - 7** | 📋 5. Quotation<br>🤝 6. Order                                | - Pricing engine tự áp giá bán theo Tier của đại lý.<br>- Lập báo giá, tính toán Margin và kích hoạt duyệt chiết khấu.<br>- Chuyển báo giá -> đơn hàng, cơ chế chặn nợ tự động.     | 🟡 Trung bình  | Giai đoạn 2              |
| **Giai Đoạn 4:<br>VietQR & Thanh toán**  | **Tuần 8 - 9** | 💳 7. Billing & Payment                                       | - Phát hành hóa đơn đi kèm mã VietQR động.<br>- Webhook ngân hàng tự động nhận tiền gạch nợ và giải phóng công nợ.                                                                  | 🟡 Trung bình  | Giai đoạn 3              |
| **Giai Đoạn 5:<br>Bảo hành & QR**        | **Tuần 10**    | 🛠️ 9. Warranty & QR Form                                      | - Public Form quét QR kích hoạt bảo hành không cần portal login.<br>- Đăng ký thông tin End-User, tự động gợi ý đại lý, tính hạn bảo hành.<br>- Gửi tin nhắn SMS/Zalo ZNS xác nhận. | 🔴 Cao         | Giai đoạn 2 & 4          |

---

## 4. Bản Đồ Kiểm Soát Rủi Ro & Mốc Quan Trọng (Milestones)

- **Milestone 1 (Cuối Tuần 2):** Khởi tạo khung Clean Architecture, vận hành trơn tru phân quyền người dùng và danh mục sản phẩm (PIM).
- **Milestone 2 (Cuối Tuần 5):** Hoàn thành tích hợp quét Serial kho và quản lý công nợ. Đại lý có thể được cấu hình nợ đầy đủ.
- **Milestone 3 (Cuối Tuần 7):** Chạy thử nghiệm luồng chặn công nợ cứng khi sale lên đơn hàng mới vượt hạn mức thành công.
- **Milestone 4 (Cuối Tuần 9):** Tích hợp thành công VietQR, gạch nợ tự động ngay lập tức khi chuyển khoản thật.
- **Milestone 5 (Cuối Tuần 10):** Chạy thực tế luồng quét QR dán trên sản phẩm để kích hoạt bảo hành thành công.
