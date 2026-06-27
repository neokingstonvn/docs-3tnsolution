# Chi Tiết Thiết Kế & Danh Sách Task Triển Khai (Solando Warranty Integration)

Tài liệu này phân rã chi tiết kiến trúc kỹ thuật và các task lập trình cho dự án **Solando Warranty** tích hợp hệ thống quản lý bán hàng **KiotViet**.

---

## 1. Mục Tiêu Kỹ Thuật (Technical Objective)

- **Backend (NestJS)**: Xây dựng hệ thống API Gateway để giao tiếp dữ liệu từ KiotViet API sang database PostgreSQL nội bộ, quản lý logic nghiệp vụ và xác thực phân quyền.
- **Frontend (Vite + React)**: Thiết kế giao diện nội bộ dành cho Thủ kho quét gán Serial, CSKH quản lý Tickets sửa chữa, và trang Public Form cho người dùng cuối quét QR kích hoạt bảo hành.
- **Database (PostgreSQL 16)**: Lưu vết dòng đời Serial thiết bị, trạng thái kích hoạt, liên kết hóa đơn và xử lý sự cố.

---

## 2. Danh Sách Task Triển Khai Theo Giai Đoạn (Phát Triển Solando Warranty App & Tích Hợp)

### Giai Đoạn 1: Cấu Hình Core Database & API OAuth KiotViet (Ngày 1–4)

- [ ] **Task 1.1: [Solando Warranty App] Thiết Lập Database Migration (SQL Setup)**  
  Tạo các bảng cơ sở dữ liệu `serial_numbers`, `warranties`, `warranty_tickets` trên PostgreSQL. Cấu hình các ràng buộc khóa ngoại (foreign keys) và tạo index tăng tốc tìm kiếm cho `serial_number`, `invoice_code`.  
  *Milestone:* Chạy thành công script migration trên PostgreSQL.
  
- [ ] **Task 1.2: [Solando Warranty App] Khởi Tạo NestJS Backend Project**  
  Scaffold NestJS backend, cấu hình module quản lý file cấu hình (`@nestjs/config`), TypeORM hoặc Prisma kết nối cơ sở dữ liệu. Thiết lập Docker Compose để chạy database PostgreSQL cục bộ.  
  *Milestone:* NestJS backend kết nối thành công với database PostgreSQL qua Docker.

- [ ] **Task 1.3: [KiotViet Integration] Client OAuth 2.0 Client Handshake**  
  Xây dựng service NestJS gửi request lấy Access Token từ API của KiotViet (`https://id.kiotviet.vn/connect/token`). Lưu token vào bộ nhớ đệm (cache/memory) và tự động làm mới (refresh) trước khi hết hạn.  
  *Milestone:* Access Token hợp lệ được log thành công.

- [ ] **Task 1.4: [KiotViet Integration] Service Đồng Bộ Hóa Đơn & SKU**  
  Viết HTTP client trong NestJS kết nối đến các endpoint `GET /invoices/{code}` và `GET /products/{code}` của KiotViet.  
  *Milestone:* Log dữ liệu JSON hóa đơn KiotViet thành công qua các Unit Test Mock.

---

### Giai Đoạn 2: Phát Triển Giao Diện Thủ Kho & Gán Serial Xuất Kho (Ngày 5–8)

- [ ] **Task 2.1: [Solando Warranty App] API Quản Lý Số Serial**  
  Thiết kế các API endpoints trong NestJS:
  - `POST /api/serials/assign`: Tiếp nhận danh sách số Serial được gán cho một mã hóa đơn, đổi trạng thái sang `Sold`.
  - `GET /api/serials/invoice/{invoiceCode}`: Lấy thông tin hóa đơn và các Serial đã được gán để đối chiếu số lượng.
  
- [ ] **Task 2.2: [Solando Warranty App] Khởi Tạo Vite + React App**  
  Scaffold frontend sử dụng React (Vite), cài đặt React Router, State Management (Zustand hoặc Context API), Tailwind CSS hoặc Vanilla CSS.  
  *Milestone:* Màn hình cấu hình routing hoạt động.

- [ ] **Task 2.3: [Solando Warranty App] Giao Diện Gán Serial (Warehouse UI)**  
  Xây dựng giao diện nhập mã hóa đơn KiotViet (`HDxxxxx`). Khi nhập mã, gọi API NestJS để hiển thị danh sách sản phẩm (SKU) và số lượng bán.  
  *Milestone:* Hiển thị đúng thông tin hóa đơn khi truy vấn.

- [ ] **Task 2.4: [Solando Warranty App] Tích Hợp Quét Mã Vạch (Scanner Integration)**  
  Tích hợp thư viện quét mã vạch (ví dụ: `html5-qrcode` bằng camera điện thoại/máy tính bảng) hoặc cho phép nhập tay. Thêm điều kiện kiểm tra: Số lượng Serial quét phải khớp chính xác với số lượng trên hóa đơn.  
  *Milestone:* Quét lưu thành công 1 danh sách Serial cho hóa đơn thử nghiệm.

---

### Giai Đoạn 3: Phát Triển Cổng Kích Hoạt Bảo Hành QR Public (Ngày 9–11)

- [ ] **Task 3.1: [Solando Warranty App] API Kích Hoạt Bảo Hành QR**  
  Viết các endpoint:
  - `GET /api/warranties/check/{serial}`: Truy vấn trạng thái Serial. Phải có trạng thái `Sold` mới cho kích hoạt.
  - `POST /api/warranties/activate`: Lưu thông tin bảo hành kích hoạt thực địa, đổi trạng thái Serial sang `Activated`. Tính toán ngày hết hạn dựa trên cấu hình SKU.
  
- [ ] **Task 3.2: [Solando Warranty App] Giao Diện Form Kích Hoạt QR Di Động (Responsive UI)**  
  Xây dựng trang public `solando.vn/warranty?sn=SNxxxxxx` thân thiện với thiết bị di động.
  - Tự động điền Serial từ URL.
  - Điền thông tin End-User: Tên, Số điện thoại, Địa chỉ lắp đặt, Đại lý thi công.  
  *Milestone:* Kích hoạt bảo hành thành công từ giao diện di động.

---

### Giai Đoạn 4: Phát Triển Tính Năng CSKH & Go-live (Ngày 12–14)

- [ ] **Task 4.1: [Solando Warranty App] API Quản Lý Ticket Bảo Hành**  
  Xây dựng endpoint tạo mới Ticket khi có sự cố và API cập nhật trạng thái xử lý (`Pending` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Rejected`) kèm ghi chú kỹ thuật.  
  *Milestone:* Tạo và cập nhật Ticket qua REST API thành công.

- [ ] **Task 4.2: [Solando Warranty App] Giao Diện CSKH (Tickets Console & Serial Search)**  
  Xây dựng giao diện cho CSKH tìm kiếm nhanh vòng đời của Serial thiết bị (Hóa đơn mua, Đại lý, Ngày kích hoạt) và tạo/cập nhật Ticket bảo trì lỗi.  
  *Milestone:* Xem thông tin lịch sử Serial và quản lý Tickets trên dashboard UI.

- [ ] **Task 4.3: [QA & DevOps] Kiểm Thử E2E Tích Hợp & Deploy VPS**  
  Tiến hành kiểm thử luồng nghiệp vụ hoàn chỉnh (E2E): Tạo hóa đơn trên KiotViet $\rightarrow$ Thủ kho gán Serial $\rightarrow$ Quét QR kích hoạt $\rightarrow$ Tạo ticket sửa chữa lỗi. Triển khai dự án lên VPS sử dụng Docker Compose.  
  *Milestone:* Hệ thống go-live hoạt động ổn định trên môi trường Production.

---

## 3. Cấu Trúc Database PostgreSQL Chi Tiết (DDL)

```sql
-- Kích hoạt extension sinh UUID tự động
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng 1: serial_numbers (Quản lý Serial xuất kho)
CREATE TABLE serial_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    product_code VARCHAR(50) NOT NULL, -- Mã SKU đối chiếu KiotViet
    product_name VARCHAR(255) NOT NULL, -- Tên SKU KiotViet
    invoice_code VARCHAR(100) NOT NULL, -- Mã hóa đơn KiotViet
    sold_date TIMESTAMP NOT NULL, -- Ngày lập hóa đơn
    status VARCHAR(50) DEFAULT 'Sold' CHECK (status IN ('Sold', 'Activated')), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 2: warranties (Thông tin kích hoạt bảo hành)
CREATE TABLE warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) UNIQUE NOT NULL REFERENCES serial_numbers(serial_number) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    installation_address TEXT NOT NULL,
    dealer_code VARCHAR(100), -- Mã đại lý trên KiotViet
    activation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NOT NULL, -- Hạn bảo hành tính toán
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 3: warranty_tickets (Quản lý xử lý sự cố thiết bị)
CREATE TABLE warranty_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) NOT NULL REFERENCES serial_numbers(serial_number) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'Rejected')),
    problem_description TEXT NOT NULL,
    cskh_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo Index để tối ưu hiệu năng tìm kiếm
CREATE INDEX idx_serials_number ON serial_numbers(serial_number);
CREATE INDEX idx_serials_invoice ON serial_numbers(invoice_code);
CREATE INDEX idx_warranties_serial ON warranties(serial_number);
CREATE INDEX idx_tickets_serial ON warranty_tickets(serial_number);
```

---

## 4. Đặc Tả Tích Hợp KiotViet API

### OAuth Handshake (Client Credentials Flow)

- **Method**: `POST`
- **Endpoint**: `https://id.kiotviet.vn/connect/token`
- **Headers**:
  - `Content-Type: application/x-www-form-urlencoded`
- **Body Request**:
  ```http
  scopes=PublicAPI.Access&grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
  ```

### API Lấy Thông Tin Chi Tiết Hóa Đơn

- **Method**: `GET`
- **Endpoint**: `https://public.api.kiotviet.vn/invoices/code/{code}`
- **Headers**:
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
  - `Retailer: YOUR_RETAILER_NAME`
- **Response Payload (Mẫu rút gọn)**:
  ```json
  {
    "id": 10001452,
    "code": "HD000145",
    "purchaseDate": "2026-06-27T15:00:00",
    "customerCode": "DL0009",
    "customerName": "Đại Lý Năng Lượng Xanh",
    "invoiceDetails": [
      {
        "productCode": "INVERTER-5KW",
        "productName": "Biến tần Solando 5kW",
        "quantity": 2,
        "price": 15000000
      }
    ]
  }
  ```

---

## 5. Kế Hoạch Kiểm Thử & Xác Minh (Test Plan)

### Kiểm Thử Tự Động (Automated Unit & Integration Tests)
1. **Kiểm thử OAuth Service**: Viết test class mock HTTP client để giả lập KiotViet API trả về token thành công / thất bại (Token Expired).
2. **Kiểm thử logic gán Serial**: Viết unit test xác thực rằng khi số lượng Serial quét vào không khớp với số lượng trên hóa đơn KiotViet, hệ thống phải ném lỗi `BadRequestException`.

### Kiểm Thử Thủ Công (Manual UAT Validation)
1. **UAT 1: Quét gán kho**
   - Nhập mã hóa đơn KiotViet giả lập vào giao diện Thủ kho.
   - Thử quét Serial mới $\rightarrow$ Kiểm tra database trạng thái Serial là `Sold` và liên kết với hóa đơn gốc.
2. **UAT 2: Kích hoạt QR thiết bị**
   - Quét mã QR trên điện thoại di động $\rightarrow$ Form mở ra tự điền Serial.
   - Điền thông tin kích hoạt $\rightarrow$ Kiểm tra trạng thái Serial chuyển sang `Activated` và thời hạn bảo hành hiển thị đúng.
