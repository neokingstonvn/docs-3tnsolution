---
name: spec-generator
description: Sinh tài liệu đặc tả chức năng tổng thể (README.md) và dashboard đặc tả HTML light-theme chuẩn v2 tại thư mục gốc của dự án (chứa scope matrix, roles, modules, và happy paths).
license: MIT
compatibility: Gemini (Antigravity IDE)
metadata:
  version: "1.0.0"
---

# Spec Generator Skill

Kỹ năng này chịu trách nhiệm sinh ra Đặc tả Tổng thể hoàn chỉnh cho dự án mới, bao gồm tài liệu đặc tả markdown (`README.md`) và một trang web Dashboard đặc tả HTML/CSS sáng màu, thanh lịch (`index.html`) trực tiếp tại thư mục gốc của dự án mô phỏng tài liệu đó một cách trực quan.

## Luật Kích Hoạt & Cung Cấp (Trigger & Delivery Rules)

- **Trường hợp kích hoạt**: Kích hoạt sau khi có file `.agents/output/project_overview.md` và người dùng yêu cầu: `"viết đặc tả chức năng"`, `"lập đặc tả MVP"`, hoặc gọi lệnh `/spec-generator`.
- **Đầu ra**: 
  - File đặc tả markdown `README.md` tại thư mục gốc.
  - File dashboard đặc tả HTML `index.html` tại thư mục gốc kế thừa từ template `spec-dashboard.html` (sử dụng giao diện sáng màu).
- **Đồng bộ ngữ cảnh**: Ghi nhận và xuất file cấu hình `.agents/output/spec_metadata.json` chứa thông tin chi tiết về user roles và các modules nghiệp vụ để truyền ngữ cảnh cho `implementation-planner`.

## Hướng Dẫn Từng Bước Cho Agent

1. **Bước 1: Đọc ngữ cảnh & Làm rõ nghiệp vụ (Grill Check)**
   - Đọc kỹ thông tin trong `.agents/output/project_overview.md` để lấy thông tin lõi của dự án mới.
   - **Đối thoại làm rõ:** Nếu phát hiện các luật nghiệp vụ (Business Rules) phức tạp hoặc luồng kiểm thử (Happy Paths) chưa rõ ràng, Agent phải hỏi trực tiếp người dùng để làm rõ trước khi hoàn tất đặc tả.
   
2. **Bước 2: Viết đặc tả markdown (`README.md` tại thư mục gốc)**
   - Xây dựng tài liệu chi tiết với 5 phần chuẩn:
     1. Phạm Vi (In-scope vs Out-of-scope dưới dạng bảng so sánh).
     2. Vai Trò Người Dùng (Bảng phân quyền chi tiết).
     3. Kiến Trúc Sơ Bộ (Vẽ sơ đồ luồng hệ thống bằng Mermaid).
     4. Đặc Tả Tính Năng (Chi tiết nghiệp vụ của từng Module).
     5. Luồng Chính Cần Kiểm Thử (Happy Path flows).

3. **Bước 3: Sinh Dashboard đặc tả HTML (`index.html` tại thư mục gốc)**
   - Đọc template `spec-dashboard.html`.
   - Biên dịch và điền các thông tin đặc tả từ bước 2 vào các phần tương ứng của template.
   - **Quy tắc bắt buộc về tách biệt mã nguồn:** TUYỆT ĐỐI KHÔNG viết CSS hoặc Script Javascript nội tuyến inside file HTML.
     - Toàn bộ CSS phải được tách thành tệp `.css` riêng biệt (ví dụ: `index.css` ở thư mục gốc) và liên kết qua thẻ `<link rel="stylesheet" href="...">`.
     - Toàn bộ Script Javascript (bao gồm xử lý cuộn trang, sự kiện click, v.v.) phải được tách thành tệp `.js` riêng biệt (ví dụ: `index.js` ở thư mục gốc) và liên kết qua thẻ `<script src="..."></script>`.
   - Giữ nguyên bộ khung CSS sáng màu, sidebar menu tự động cuộn đến phần tương ứng.
   
4. **Bước 4: Xuất Spec Metadata**
   - Tạo file `.agents/output/spec_metadata.json` để Agent tiếp theo đọc được danh sách module, entities, và roles.

## Tài Liệu Tham Khảo

- Template Spec Dashboard: [spec-dashboard.html](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/spec-generator/templates/spec-dashboard.html)
- Hướng dẫn viết đặc tả: [spec-guide.md](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/spec-generator/references/spec-guide.md)
