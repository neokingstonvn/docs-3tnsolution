# Kế Hoạch MVP Tổng Thể — AuraStudio

Tài liệu này trình bày kế hoạch phát triển mức cao (High-level Plan) cho phiên bản MVP của dự án AuraStudio, bao gồm phân tích nghiệp vụ, kiến trúc Clean Architecture, mô hình cơ sở dữ liệu PostgreSQL, lộ trình phân kỳ phát triển, và stack kỹ thuật đề xuất.

---

## 1. Phân Tích Logic Nghiệp Vụ Cốt Lõi

| Tiêu Chí Nghiệp Vụ | Giải Thích & Lợi Ích Lâu Dài Cho Dự Án |
| :--- | :--- |
| **Tại sao dùng PostgreSQL?** | PostgreSQL cung cấp hiệu năng truy vấn cao, hỗ trợ kiểu dữ liệu JSONB linh hoạt (phù hợp để lưu thông số coordinates bổ sung của safe zone) và tính toàn vẹn dữ liệu cực kỳ tốt. |
| **Cấu hình Safe Zone động** | MVP thiết kế hệ thống tọa độ Safe Zone động (x, y, w, h) dưới dạng tỷ lệ phần trăm so với kích thước gốc của template. Giúp ảnh sản phẩm tự động co giãn vừa vặn trên mọi kích thước ảnh render. |
| **Xếp hàng FIFO xử lý AI** | Giúp hệ thống tránh bị quá tải tài nguyên GPU khi nhiều người dùng gửi yêu cầu cùng lúc. Đảm bảo tính ổn định và cung cấp thông tin thời gian chờ dự kiến thực tế cho người dùng. |
| **Phân lớp Layer rõ ràng** | Đảm bảo tính mỹ thuật của ảnh sản phẩm (chủ thể nằm dưới logo, text trang trí nhưng nằm trên phông nền template). |

---

## 2. Kiến Trúc Clean Architecture

Dự án áp dụng mô hình kiến trúc phân lớp Clean Architecture để dễ dàng mở rộng và bảo trì:

```
src/
├── domain/                      # Quy tắc nghiệp vụ cốt lõi (Entities, Value Objects)
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── template.entity.ts
│   │   ├── product.entity.ts
│   │   └── composition.entity.ts
│   └── interfaces/
├── usecases/                    # Logic ứng dụng cụ thể (Use Cases)
│   ├── background-removal/
│   ├── product-management/
│   ├── template-management/
│   └── image-composition/
└── infrastructure/              # Chi tiết kỹ thuật & Framework (DB, Web Server, AI Workers)
    ├── database/
    │   ├── prisma/
    │   └── repositories/
    ├── queue/                   # Redis queue adapter
    ├── ai-engine/               # Tích hợp API tách nền
    └── webserver/               # NestJS Controllers
```

---

## 3. Database Schema

Chi tiết các bảng dữ liệu cốt lõi phục vụ MVP (DDL SQL được lưu trữ tại `.agents/output/db_schema.sql`):
*   `users`: Lưu trữ thông tin người dùng và phân quyền (Admin, Merchant).
*   `products`: Quản lý danh mục sản phẩm của Merchant theo Mã sản phẩm (SKU).
*   `product_images`: Quản lý tệp ảnh góc chụp thô và kết quả tách nền AI liên kết với từng mã sản phẩm.
*   `compositions`: Quản lý phối cảnh và cấu hình bóng đổ của sản phẩm lên template.
*   `processing_queues`: Quản lý hàng đợi khi server AI bị quá tải.
*   `audit_logs`: Nhật ký bảo mật và hoạt động hệ thống.

---

## 4. Lộ Trình Phân Kỳ Phát Triển (Phases - Không ghi ngày cụ thể)

*   **Phase 1 — Khởi Tạo Dự Án & Thiết Lập Nền Tảng:** Khởi tạo khung dự án Clean Architecture, cấu hình PostgreSQL database và viết các APIs cơ bản cho User/Auth.
*   **Phase 2 — AI Background Removal Engine:** Tích hợp Clipdrop API để tự động tách nền, vẽ bóng đổ vật lý và hòa hợp ánh sáng bối cảnh (AI Harmonization).
*   **Phase 3 — Template Group & Layout Engine:** Xây dựng quản lý Template nhóm và các Hình Mẫu con (Layouts) cùng cấu hình vùng an toàn Safe Zone & thông số kỹ thuật (Title, Description, Type).
*   **Phase 4 — Batch Composition & Metadata Customization Engine:** Xây dựng luồng phối cảnh co giãn hàng loạt cho folder ảnh, ghép cặp sản phẩm vào hình mẫu, và tùy biến lưu thông số kỹ thuật hình mẫu đã chỉnh sửa.
*   **Phase 5 — Giao Diện UAT Portal Hợp Nhất & RBAC:** Ghép các APIs vào giao diện Portal duy nhất hỗ trợ chuyển đổi phân quyền RBAC và xếp hàng đợi xử lý.

---

## 5. Stack Kỹ Thuật Đề Xuất

*   **Backend Framework:** NestJS (Node.js) mang tính cấu trúc tốt, dễ dàng áp dụng Clean Architecture.
*   **Database:** PostgreSQL + Prisma ORM giúp phát triển nhanh và an toàn kiểu dữ liệu.
*   **Queue System:** Redis (BullMQ) để quản lý hàng đợi tác vụ AI bất đồng bộ hiệu quả.
*   **Object Storage:** AWS S3 (hoặc MinIO local) để lưu trữ tệp hình ảnh raw và kết quả render.
*   **Frontend Framework:** React + Tailwind CSS để xây dựng giao diện tương tác mượt mà.
