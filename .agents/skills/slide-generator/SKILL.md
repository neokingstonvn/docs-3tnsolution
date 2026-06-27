---
name: slide-generator
description: Biên soạn slide deck thuyết trình dự án bằng HTML/CSS chạy trên trình duyệt theo phong cách Instrument Serif + Plus Jakarta Sans sáng màu, thanh lịch của v2.
license: MIT
compatibility: Gemini (Antigravity IDE)
metadata:
  version: "1.0.0"
---

# Slide Generator Skill

Kỹ năng này giúp Agent biên soạn các bản slide thuyết trình dự án dưới dạng HTML/CSS chạy trực tiếp trên trình duyệt (`presentation/index.html` và `presentation/presentation.css`) theo đúng phong cách light theme, font Instrument Serif + Plus Jakarta Sans, hỗ trợ phím mũi tên điều hướng và full screen của `v2`.

## Luật Kích Hoạt & Cung Cấp (Trigger & Delivery Rules)

- **Trường hợp kích hoạt**: Kích hoạt sau khi có đặc tả/kế hoạch phát triển và người dùng yêu cầu: `"tạo slide thuyết trình"`, `"lập bài trình chiếu"`, `"viết presentation slide"`, hoặc gọi lệnh `/slide-generator`.
- **Quy tắc bổ sung**: Slides chỉ chứa thông tin nghiệp vụ cấp cao, không bao gồm chi tiết kỹ thuật, schema, API, hoặc các mốc thời gian cụ thể.
- **Đầu ra**: 
  - File slide HTML `presentation/index.html` kế thừa từ template `slide-deck.html`.
  - File slide CSS `presentation/presentation.css` kế thừa từ template `presentation.css`.
  - Một file script điều hướng phụ `presentation/presentation.js`.

## Hướng Dẫn Từng Bước Cho Agent

1. **Bước 1: Phân tích tài liệu nguồn (Chỉ lấy thông tin High-level)**
   - Đọc đặc tả MVP và kế hoạch phát triển để trích xuất các thông tin nghiệp vụ cốt lõi: mục tiêu, giải pháp bài toán thực tế, vai trò người dùng, phạm vi MVP và timeline lộ trình phát triển.
   - **Quy tắc bắt buộc:** TUYỆT ĐỐI KHÔNG đưa các chi tiết kỹ thuật sâu (như mã SQL DDL, cấu trúc bảng database, sơ đồ payload API endpoints, cấu trúc thư mục Clean Architecture) vào slide. Slide chỉ dùng để trình bày hướng nghiệp vụ mức cao cho các Stakeholders (Quản lý, Khách hàng). Đồng thời không đưa các mốc thời gian cụ thể (ngày/tuần) vào slide timeline, chỉ hiển thị phân kỳ Phase nghiệp vụ mức cao.
   
2. **Bước 2: Cấu trúc hóa Slide Slide-by-slide**
   - Biên soạn slide deck tối đa 8-10 slides. Mỗi slide giải quyết một ý trọng tâm (ví dụ: Slide 1: Welcome; Slide 2: Bài toán thực tế; Slide 3: Giai đoạn 1; Slide 4: Timeline GĐ 1; Slide 5: Giai đoạn 2; Slide 6: Báo cáo & Lợi ích; Slide 7: Bảng so sánh; Slide 8: Kêu gọi hành động).
   - Áp dụng nguyên tắc viết slide (ngắn gọn, tập trung vào bullet points cô đọng, dùng các badge chỉ số, không sử dụng biệt ngữ kỹ thuật).

3. **Bước 3: Biên dịch Slide HTML**
   - Đọc template `slide-deck.html`.
   - Thay thế placeholder `{{SLIDES_HTML}}` bằng danh sách các slide được định nghĩa bằng thẻ `<section class="slide slide--content">` hoặc `<section class="slide slide--title">`.
   - Sử dụng các class hỗ trợ sẵn như `glass-card`, `grid-2`, `grid-3`, `slide-horizontal-flow` để tạo layouts trực quan.
   - **Quy tắc bắt buộc về tách biệt mã nguồn:** TUYỆT ĐỐI KHÔNG viết CSS hoặc Script Javascript nội tuyến inside file HTML slide deck.
     - Toàn bộ style phải nằm trong `presentation.css`.
     - Toàn bộ logic phím bấm điều hướng, toàn màn hình, v.v. phải nằm trong `presentation.js`.

## Tài Liệu Tham Khảo

- Template Slide Deck: [slide-deck.html](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/slide-generator/templates/slide-deck.html)
- Hướng dẫn bố cục: [presentation-guide.md](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/slide-generator/references/presentation-guide.md)
