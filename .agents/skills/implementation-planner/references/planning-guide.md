# Hướng Dẫn Thiết Kế Cơ Sở Dữ Liệu & Lập Kế Hoạch Kỹ Thuật

Tài liệu này hướng dẫn Agent cách thiết kế cơ sở dữ liệu PostgreSQL chuẩn, phân tích kiến trúc Clean Architecture và cách biên dịch các thẻ placeholders của template `plan-dashboard.html` thành file kế hoạch phát triển HTML thực tế.

---

## 1. Quy Chuẩn Thiết Kế Cơ Sở Dữ Liệu PostgreSQL

Khi thiết kế SQL DDL cho dự án mới, Agent phải tuân thủ nghiêm ngặt các quy tắc sau:
- **Khóa chính**: Luôn sử dụng UUID tự sinh (`UUID PRIMARY KEY DEFAULT gen_random_uuid()` hoặc `uuid_generate_v4()`).
- **Khóa ngoại**: Có ràng buộc cụ thể (`REFERENCES parent_table(id) ON DELETE CASCADE` hoặc `ON DELETE SET NULL`).
- **Index**: Tạo index tăng tốc cho các trường thường xuyên tìm kiếm (như mã code, email, sđt, khóa ngoại).
- **Ràng buộc kiểm tra**: Sử dụng `CHECK (status IN ('Pending', 'In Progress', 'Resolved'))` để ràng buộc trạng thái.
- **Tính toàn vẹn**: Ghi chú đầy đủ comment trên từng bảng và cột.

---

Khi nhân bản template `plan-dashboard.html` thành file kế hoạch HTML (`mvp/plan-high-level/index.html` hoặc `mvp/plan-detailed/index.html`), Agent phải thay thế các thẻ bằng code HTML chất lượng cao (luôn áp dụng phong cách thiết kế **sáng màu thanh lịch**):

### A. `{{PLAN_TITLE}}` & `{{PLAN_DESC}}`
- Tên kế hoạch (ví dụ: "Kế Hoạch Dài Hạn (Post-MVP)" hoặc "Kế Hoạch MVP & Triển Khai Chi Tiết").
- Mô tả mục tiêu cốt lõi của kế hoạch kỹ thuật.

### B. `{{WHY_CUSTOM_OR_INTEGRATION_TABLE}}`
- Bảng so sánh hoặc phân tích các lý do chọn giải pháp kỹ thuật cụ thể dưới dạng các dòng `<tr>`.

### C. `{{CLEAN_ARCH_HTML}}`
- Hiển thị cấu trúc thư mục mã nguồn mẫu (sử dụng text preformatted).

### D. `{{MERMAID_DIAGRAM_SOURCE}}`
- Mã Mermaid diagram vẽ sơ đồ kiến trúc hệ thống hoặc luồng API. Ví dụ:
  ```
  flowchart TD
      A[Client] --> B[API Gateway]
      B --> C[PostgreSQL]
  ```

### E. `{{MODULES_TABLE_HTML}}`
- Bảng tổng hợp thực thể và vai trò trong database schema.

### F. `{{DB_SQL_DDL}}`
- Đoạn mã SQL DDL SQL đầy đủ để chạy khởi tạo các bảng.

### G. `{{TIMELINE_HTML}}`
- Mã HTML hiển thị timeline 5 giai đoạn phát triển dạng:
  ```html
  <div class="timeline-item">
      <span class="timeline-dot"></span>
      <div class="ve-card ve-card--elevated" style="margin-left: 16px; margin-bottom: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h3 style="font-size: 15px; font-weight: 700;">Phase X — [Tên giai đoạn]</h3>
              <span class="badge badge--blue">Ngày X - Ngày Y</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-dim);">
                  <input type="checkbox" disabled>
                  <span>[Tên task 1]</span>
              </label>
          </div>
      </div>
  </div>
  ```

### H. `{{TECH_STACK_TABLE_HTML}}`
- Bảng các lớp công nghệ (Frontend, Backend, Database, Cloud) và lý do lựa chọn.
