# Kế Hoạch Triển Khai Ngắn Hạn — Tích Hợp KiotViet (Ứng dụng Solando Warranty)

> **Mục tiêu:** Tận dụng hệ thống KiotViet sẵn có làm hạt nhân quản lý giao dịch và bán hàng. Chúng ta chỉ tự phát triển một ứng dụng riêng biệt mang tên **Solando Warranty** để phục vụ việc **Quản lý Số Serial, Kích hoạt Bảo hành QR công cộng và xử lý Yêu cầu Bảo hành (Tickets)**. Ứng dụng này chỉ đồng bộ các dữ liệu thực sự cần thiết từ KiotViet (Hóa đơn, SKU sản phẩm) thông qua KiotViet Public API, hoàn toàn không có chức năng nhập kho hay quản lý mua hàng/nhập khẩu. Chúng tôi lựa chọn giải pháp **Tự lập trình (Custom Build)** dựa trên React (Vite) và NestJS để tối ưu hóa trải nghiệm quét QR thực địa và hoạt động ổn định lâu dài.

---

## 1. Ưu Điểm Giải Pháp Tự Lập Trình (Custom Build)

Giải pháp tự phát triển bằng mã nguồn độc lập (React (Vite) + NestJS + PostgreSQL) đem lại các lợi ích vượt trội:
- **Trải nghiệm di động (UX) xuất sắc**: Tùy biến 100% giao diện quét QR, tải trang cực mượt ngoài công trường.
- **Bảo mật & Phân quyền sâu**: Phân quyền chi tiết qua mã nguồn JWT/Guards tự viết, bảo mật tối đa.
- **Linh hoạt tích hợp**: Dễ dàng tích hợp Zalo ZNS, gửi email tự động và mở rộng các kênh thông báo.
- **Tính kế thừa dài hạn**: Mã nguồn NestJS Backend và React (Vite) Frontend là nền tảng vững chắc để Solando nâng cấp lâu dài.

---

## 2. Kiến Trúc Luồng Dữ Liệu Tích Hợp (KiotViet API)

```
       ┌──────────────────────────────┐
       │     KiotViet Cloud System    │
       │ (Hàng hóa, Hóa đơn, Đại lý)  │
       └──────────────┬───────────────┘
                      │
                      │ OAuth 2.0 (Client Credentials)
                      │ GET /invoices, GET /products
                      ▼
 ┌──────────────────────────────────────────┐
 │       Solando Warranty Database          │
 │             (PostgreSQL)                 │
 └────────────────────┬─────────────────────┘
                      │
                      ▼
 ┌──────────────────────────────────────────┐
 │           Giải pháp kỹ thuật:            │
 │          React (Vite) + NestJS           │
 └──────────────────────────────────────────┘
```

1. **Xác thực:** Hệ thống lấy Access Token từ `https://id.kiotviet.vn/connect/token` bằng Client ID và Client Secret.
2. **Đồng bộ hóa đơn:** Khi có hóa đơn bán hàng trên KiotViet (chứa mã hàng và số lượng), hệ thống gọi API để lấy chi tiết đơn hàng nhằm đối chiếu số lượng Serial cần gán.
3. **Quét Serial xuất kho:** Nhân viên kho sử dụng giao diện quét mã để liên kết Serial thiết bị với hóa đơn KiotViet.

---

## 3. Cấu Trúc Database PostgreSQL Rút Gọn

Hệ thống chỉ lưu trữ dữ liệu đặc thù của bảo hành, sử dụng PostgreSQL làm nơi lưu trữ chính:

```sql
-- 1. Bảng lưu trữ Số Serial thiết bị đã bán
CREATE TABLE serial_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    product_code VARCHAR(50) NOT NULL, -- Khớp với Mã hàng trên KiotViet
    product_name VARCHAR(255) NOT NULL,
    invoice_code VARCHAR(100) NOT NULL, -- Khớp với Mã hóa đơn KiotViet
    sold_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'Sold', -- 'Sold' hoặc 'Activated'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng lưu trữ thông tin Kích hoạt Bảo hành
CREATE TABLE warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(100) UNIQUE REFERENCES serial_numbers(serial_number),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    installation_address TEXT NOT NULL,
    dealer_code VARCHAR(100), -- Khớp với Mã khách hàng trên KiotViet
    activation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NOT NULL
);

-- 3. Bảng lưu trữ nhật ký Yêu cầu Bảo hành (Tickets)
CREATE TABLE warranty_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(100) REFERENCES serial_numbers(serial_number),
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Resolved', 'Rejected'
    problem_description TEXT NOT NULL,
    cskh_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 4. Các Luồng Nghiệp Vụ Chính

### Luồng A: Gán Số Serial Khi Xuất Kho (Thủ Kho)
* **Bước 1:** Thủ kho mở màn hình quản lý xuất kho, điền mã hóa đơn KiotViet (ví dụ: `HD000456`).
* **Bước 2:** Hệ thống tự động gọi API KiotViet lấy thông tin hóa đơn: đại lý mua hàng, ngày mua, danh sách SKU và số lượng.
* **Bước 3:** Giao diện hiển thị danh sách dòng hàng. Thủ kho dùng camera/máy quét để quét đủ số lượng Serial tương ứng cho từng dòng sản phẩm.
* **Bước 4:** Nhấn "Lưu" -> Hệ thống ghi nhận các Serial này vào bảng `serial_numbers` kèm thông tin bán hàng từ KiotViet.

### Luồng B: Khách Hàng / Kỹ Thuật Viên Kích Hoạt QR (Public)
* **Bước 1:** Quét QR trên Inverter/Pin (Link dạng: `solando.vn/warranty?sn=SN987654`).
* **Bước 2:** Form kích hoạt tự động điền sẵn mã Serial. Hệ thống kiểm tra trong database PostgreSQL:
  * Nếu không tồn tại mã Serial -> Báo lỗi sản phẩm chưa được xuất bán.
  * Nếu đã kích hoạt bảo hành -> Hiển thị ngày kích hoạt và thời hạn bảo hành.
  * Nếu hợp lệ -> Cho phép điền thông tin: Tên khách hàng, Số điện thoại, Địa chỉ lắp đặt.
* **Bước 3:** Nhấn "Kích hoạt" -> Tạo bản ghi bảo hành, tính ngày hết hạn (ngày bán hàng + thời hạn bảo hành của SKU), cập nhật trạng thái Serial thành `Activated`.

### Luồng C: Tiếp Nhận & Xử Lý Bảo Hành (CSKH)
* **Bước 1:** Khi khách hàng báo lỗi, CSKH nhập Serial vào ô tìm kiếm.
* **Bước 2:** Hệ thống hiển thị chi tiết: Tên sản phẩm, Tình trạng bảo hành, Đại lý lắp đặt, Lịch sử kích hoạt.
* **Bước 3:** Tạo mới một **Warranty Ticket** ghi nhận hiện trạng lỗi, gán kỹ thuật viên đi kiểm tra xử lý.
* **Bước 4:** Cập nhật trạng thái sửa chữa, ghi chú xử lý để lưu vết lịch sử thiết bị.
