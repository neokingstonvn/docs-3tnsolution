---
name: implementation-planner
description: Lập kế hoạch kỹ thuật chi tiết cho MVP và dài hạn, thiết kế database DDL SQL, API synchronization flow, timeline các giai đoạn và tạo dashboard kế hoạch HTML light-theme chuẩn v2.
license: MIT
compatibility: Gemini (Antigravity IDE)
metadata:
  version: "1.0.0"
---

# Technical Implementation Planner Skill

Kỹ năng này giúp Agent lập kế hoạch kỹ thuật chi tiết cho dự án mới, bao gồm thiết kế kiến trúc hệ thống (Clean Architecture), database DDL SQL, sơ đồ API sync, timeline các giai đoạn và tạo trang web Dashboard kế hoạch HTML/CSS sáng màu, thanh lịch (kế hoạch MVP tổng thể tại `mvp/plan-high-level/index.html`, kế hoạch triển khai chi tiết cho MVP tại `mvp/plan-detailed/index.html`, và kế hoạch dài hạn chứa các tính năng sau MVP tại `mmp/index.html`) tích hợp Mermaid zoom/pan.

## Luật Kích Hoạt & Cung Cấp (Trigger & Delivery Rules)

- **Trường hợp kích hoạt**: Kích hoạt sau khi có file đặc tả tổng thể (`README.md` tại thư mục gốc) và người dùng yêu cầu: `"lập kế hoạch triển khai"`, `"thiết kế database schema"`, `"viết roadmap phát triển"`, hoặc gọi lệnh `/implementation-planner`.
- **Đầu ra**: 
  - Tài liệu kế hoạch MVP tổng thể tại `mvp/plan-high-level/README.md` kèm dashboard HTML sáng màu `mvp/plan-high-level/index.html`.
  - Tài liệu kế hoạch triển khai chi tiết cho MVP tại `mvp/plan-detailed/README.md` kèm dashboard HTML sáng màu `mvp/plan-detailed/index.html`.
  - Tài liệu kế hoạch dài hạn (chứa các tính năng sau MVP / MMP) tại `mmp/README.md` kèm dashboard HTML sáng màu `mmp/index.html`.
  - **Quy tắc thiết kế UI**: Tất cả các dashboard HTML phải sử dụng light theme (không có dark mode) và tuân thủ phong cách sáng màu thanh lịch.
- **Đồng bộ ngữ cảnh**: Xuất file SQL schema `.agents/output/db_schema.sql` chứa các câu lệnh DDL của dự án mới để làm ngữ cảnh đầu vào cho `prototype-generator`.

## Hướng Dẫn Từng Bước Cho Agent

1. **Bước 1: Đọc tài liệu đặc tả**
   - Đọc kỹ `README.md` tại thư mục gốc để hiểu sâu về các module chức năng, business rules, và roles người dùng.
   
2. **Bước 2: Thiết kế Database & Kiến Trúc**
   - Đề xuất cấu trúc thư mục dự án theo Clean Architecture (Domain, Use Cases, Infrastructure).
   - Thiết kế database schema PostgreSQL (viết mã SQL DDL sạch, đầy đủ PRIMARY KEY, FOREIGN KEY, triggers tự động và index).
   
3. **Bước 3: Lập Timeline Phân Kỳ Phát Triển**
   - Chia kế hoạch phát triển thành các Phase (giai đoạn) rõ ràng.
   - **Quy tắc quan trọng:** TUYỆT ĐỐI KHÔNG đưa ngày/tuần hoặc khoảng thời gian cụ thể (ví dụ: "Tuần 1", "Tuần 2-3", hay ngày cụ thể) vào các timeline của kế hoạch tổng thể (`plan-high-level/`) hoặc kế hoạch dài hạn (`mmp/`). Chỉ duy nhất tài liệu kế hoạch triển khai chi tiết (`plan-detailed/`) mới được phép có mốc thời gian ngày/tuần cụ thể.
   - **Quy tắc thời gian**: Chỉ `plan-detailed` được phép chứa các mốc thời gian; các plan khác chỉ dùng tên Phase.

4. **Bước 4: Sinh Dashboard kế hoạch HTML**
   - Đọc template `plan-dashboard.html`.
   - Biên dịch và điền các thông tin kế hoạch, code SQL DDL, sequence API flow, sơ đồ kiến trúc Mermaid vào template.
   - Sơ đồ Mermaid phải được bọc trong thẻ `<script type="text/plain" class="diagram-source">` để Javascript có thể load và hỗ trợ zoom/pan.
   - **Quy tắc bắt buộc về tách biệt mã nguồn:** TUYỆT ĐỐI KHÔNG viết CSS hoặc Script Javascript nội tuyến inside file HTML.
     - Toàn bộ CSS phải được tách ra tệp `.css` riêng biệt và liên kết qua thẻ `<link rel="stylesheet" href="...">`.
     - Toàn bộ logic Script Javascript (bao gồm cả thư viện Mermaid initialization, logic zoom/pan, v.v.) phải được tách ra tệp `.js` riêng biệt và liên kết qua thẻ `<script src="..."></script>`.

5. **Bước 5: Xuất DB Schema Context**
   - Lưu trữ mã SQL DDL vào `.agents/output/db_schema.sql`.

## Tài Liệu Tham Khảo

- Template Plan Dashboard: [plan-dashboard.html](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/implementation-planner/templates/plan-dashboard.html)
- Hướng dẫn thiết kế kỹ thuật: [planning-guide.md](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/implementation-planner/references/planning-guide.md)
