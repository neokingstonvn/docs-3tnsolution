# Hướng Dẫn Soạn Slide Thuyết Trình HTML/CSS

Tài liệu này hướng dẫn Agent cách thiết lập và sinh slide thuyết trình dự án mới (`mvp/presentation/index.html`) sử dụng template slide.

---

## 1. Nguyên Tắc Thiết Kế Slide (Copywriting & Layout Rules)

Để slide thuyết trình chuyên nghiệp như `v2`, Agent phải tuân thủ nghiêm ngặt các nguyên tắc sau:
- **Chỉ đưa thông tin High-level (No technical jargon):** Slide thuyết trình phục vụ việc trình bày tổng quan dự án cho khách hàng hoặc cấp quản lý. Chỉ trình bày: mục tiêu nghiệp vụ, giải pháp bài toán thực tế, vai trò người dùng chính, phạm vi MVP, và lộ trình phát triển (Timeline). Tuyệt đối không đưa code SQL DDL, cấu trúc database, sơ đồ API endpoints chi tiết hoặc kiến trúc mã nguồn vào slide.
- **Tập trung & Trực quan**: Tuyệt đối không nhồi nhét quá nhiều chữ trong slide. Mỗi slide chỉ hiển thị từ 3-5 ý chính (bullet points), mỗi ý dài không quá 2 dòng.
- **Tiêu đề hấp dẫn**: Sử dụng font chữ Instrument Serif cỡ lớn (`slide__display` hoặc `slide__heading`) cho các tiêu đề slide để tạo điểm nhấn nghệ thuật.
- **Visual Elements**: Sử dụng tối đa các layout trực quan sẵn có trong CSS:
  - Layout Grid 2 hoặc 3 cột (`grid-2`, `grid-3`) kết hợp card kính (`glass-card`).
  - Sơ đồ tiến trình nằm ngang (`slide-horizontal-flow`).
  - Dòng thời gian cuộn (`slide-timeline`).
  - Bảng so sánh trực quan (`slide-table-card`).

---

## 2. Các Mẫu Code Slide Layout Có Sẵn (HTML Snippets)

Khi sinh slide, Agent có thể chèn các đoạn HTML sau vào placeholder `{{SLIDES_HTML}}`:

### Slide 1: Welcome & Cover Slide
```html
<section class="slide slide--title">
    <div class="slide__container" style="align-items: center; text-align: center;">
        <span class="slide-badge">[Role hoặc Đối tượng]</span>
        <h1 class="slide__display">[Tiêu đề thuyết trình dự án]</h1>
        <p class="slide__body">[Mô tả tóm tắt giá trị cốt lõi]</p>
    </div>
</section>
```

### Slide 2: Grid 3 Cột (Hiển thị các Bài toán / Tính năng)
```html
<section class="slide slide--content">
    <div class="slide__container">
        <span class="slide__label">[Tiêu đề phụ]</span>
        <h2 class="slide__heading">[Tiêu đề slide]</h2>
        <div class="grid-3">
            <div class="glass-card" style="border-top: 3px solid var(--accent);">
                <div class="card-num-badge">01</div>
                <h3>[Ý chính 1]</h3>
                <p style="font-size: 12px; color: var(--text-dim);">[Mô tả chi tiết 1]</p>
            </div>
            <!-- Lặp lại các card 02, 03 -->
        </div>
    </div>
</section>
```

### Slide 3: So Sánh 2 Cột (Split View)
```html
<section class="slide slide--content">
    <div class="slide__container">
        <div class="slide__inner">
            <div>
                <span class="slide__label" style="color: var(--green);">[Nhãn]</span>
                <h2 class="slide__heading">[Tiêu đề]</h2>
                <ul class="slide__bullets">
                    <li><strong>[Ý 1]</strong>: [Mô tả chi tiết 1]</li>
                    <li><strong>[Ý 2]</strong>: [Mô tả chi tiết 2]</li>
                </ul>
            </div>
            <div class="glass-card" style="border: 1.5px dashed var(--green); background: var(--green-dim);">
                <!-- Nội dung card visual bên phải -->
            </div>
        </div>
    </div>
</section>
```

### Slide 4: Bảng So Sánh (Table Slide)
```html
<section class="slide slide--table">
    <div class="slide__container">
        <h2 class="slide__heading" style="text-align: center;">[Tiêu đề bảng so sánh]</h2>
        <div class="slide-table-card">
            <table class="slide-table">
                <thead>
                    <tr>
                        <th>Tiêu chí</th>
                        <th style="color: var(--green);">Giai đoạn 1</th>
                        <th style="color: var(--accent);">Giai đoạn 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight:600;">[Tiêu chí 1]</td>
                        <td>[Nội dung GĐ 1]</td>
                        <td>[Nội dung GĐ 2]</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</section>
```
