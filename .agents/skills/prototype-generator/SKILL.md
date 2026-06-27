---
name: prototype-generator
description: Sinh prototype tương tác UAT hoàn chỉnh (HTML/CSS/JS thuần, sử dụng localStorage và db.js mock) theo phong cách thiết kế sáng màu thanh lịch v2.
license: MIT
compatibility: Gemini (Antigravity IDE)
metadata:
  version: "1.0.0"
---

# Prototype Generator Skill

Kỹ năng này giúp Agent tự động sinh ra một Prototype UAT chạy thử nghiệm hoàn chỉnh cho dự án mới tại thư mục `prototype/` gồm: một trang Gateway chọn Portal (`index.html`), các trang sub-portal cho từng role người dùng (`admin.html`, `user.html`...), một file logic `db.js` mock dữ liệu localStorage và file `style.css` dùng chung phong cách sáng màu thanh lịch v2.

## Luật Kích Hoạt & Cung Cấp (Trigger & Delivery Rules)

- **Trường hợp kích hoạt**: Kích hoạt sau khi đã thiết kế database schema và các module ở bước `implementation-planner` và người dùng yêu cầu: `"sinh prototype chạy thử"`, `"tạo mock portal"`, `"build UAT prototype"`, hoặc gọi lệnh `/prototype-generator`.
- **Đầu ra**: 
  - Trang chủ UAT Gateway `prototype/index.html` (dựa trên `prototype-gateway.html`).
  - Các trang sub-portals `prototype/admin.html`, `prototype/tech.html`... (dựa trên `prototype-portal.html`).
  - File database mock `prototype/db.js` (dựa trên `db.js` template).
  - File CSS dùng chung `prototype/style.css` (nhân bản từ `style.css` template).

## Hướng Dẫn Từng Bước Cho Agent

1. **Bước 1: Đọc DB Schema & Roles**
   - Đọc các file `.agents/output/spec_metadata.json` và `.agents/output/db_schema.sql` để hiểu các User Roles cần tạo portal, và cấu trúc các bảng dữ liệu cần mock.
   
2. **Bước 2: Sinh file mock database `db.js`**
   - Đọc template `db.js`.
   - Sinh code dữ liệu ảo ban đầu (initial data) khớp với các thực thể trong DB schema (ví dụ: tạo danh sách Đại lý, Sản phẩm, Hóa đơn mẫu).
   - Viết các hàm JS để lấy dữ liệu, lưu dữ liệu (ghi đè localStorage), và tìm kiếm/lọc dữ liệu realtime.

3. **Bước 3: Sinh trang Gateway `index.html`**
   - Đọc template `prototype-gateway.html`.
   - Điền tên dự án và tạo các thẻ link/card dẫn đến các trang Portal tương ứng với các user roles.

4. **Bước 4: Sinh các trang Portal (`admin.html`, `tech.html`...)**
   - Phân tích giao diện và form thao tác của từng vai trò người dùng.
   - Nhân bản template `prototype-portal.html` cho từng role (ví dụ: `admin.html` cho Admin, `tech.html` cho Kỹ thuật viên).
   - Tạo menu sidebar, top breadcrumb.
   - Thiết kế các layout Form nhập liệu, Bảng hiển thị dữ liệu tương ứng với nghiệp vụ của role đó.
   - **Quy tắc bắt buộc**: Phải tách biệt hoàn toàn mã CSS và Script Javascript khỏi file HTML.
     - Toàn bộ style dùng chung phải nằm trong file `style.css`. Nếu có style chỉnh sửa riêng biệt, phải lưu vào tệp CSS riêng (ví dụ: `admin.css`) rồi liên kết qua thẻ `<link>`.
     - Toàn bộ logic Javascript điều khiển tương tác giao diện và gọi DB mock phải nằm trong tệp JS riêng biệt (ví dụ: `admin.js`, `tech.js`) và được tham chiếu qua thẻ `<script src="..."></script>`. Tuyệt đối không viết thẻ `<style>` hoặc `<script>` có chứa logic nội tuyến bên trong file HTML portal.
     - Liên kết sự kiện DOM và logic cập nhật dữ liệu realtime sang tệp JS tương ứng để cập nhật hiển thị.

## Tài Liệu Tham Khảo

- Gateway Template: [prototype-gateway.html](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/prototype-generator/templates/prototype-gateway.html)
- Portal Template: [prototype-portal.html](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/prototype-generator/templates/prototype-portal.html)
- DB Template: [db.js](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/prototype-generator/templates/db.js)
- CSS Template: [style.css](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/prototype-generator/templates/style.css)
- Hướng dẫn thiết kế Prototype: [prototype-guide.md](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/prototype-generator/references/prototype-guide.md)
