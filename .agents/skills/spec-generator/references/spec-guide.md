# Hướng Dẫn Viết Đặc Tả & Biên Dịch Spec Dashboard HTML

Tài liệu này hướng dẫn Agent cách lập đặc tả chức năng chi tiết (`mvp/spec/README.md`) và cách biên dịch các thẻ placeholders của template `spec-dashboard.html` thành file dashboard đặc tả HTML thực tế.

---

## 1. Hướng Dẫn Viết Đặc Tả Chức Năng (Spec Markdown)

Khi viết `mvp/spec/README.md`, Agent bắt buộc phải tuân thủ cấu trúc và phong cách viết cực kỳ chi tiết sau:

- **Phần 1: Phạm vi MVP**: Sử dụng bảng so sánh rõ ràng giữa In-scope (những gì làm trong MVP) và Out-of-scope (những gì để lại sau MVP).
- **Phần 2: Vai trò người dùng (Roles)**: Ghi rõ danh sách các Role trong hệ thống cùng với phạm vi quyền thao tác chính (Read, Write, Approve).
- **Phần 3: Đặc tả Module**:
  - Ghi nhận rõ ràng **Business Rules** (Luật nghiệp vụ): Là các quy tắc cốt lõi của doanh nghiệp (ví dụ: margin tối thiểu bao nhiêu %, logic tính toán như thế nào, block công nợ khi nào).
  - Phân tích rõ **System Features** (Các tính năng hệ thống tự động làm) và **User Features** (Những giao diện thao tác của người dùng).
- **Phần 4: Happy Paths**: Viết dưới dạng sơ đồ chữ hoặc luồng bước tuần tự (Step-by-step) của các luồng nghiệp vụ quan trọng nhất.

---

## 2. Quy Chuẩn Điền Thẻ Placeholder Trong Spec Dashboard HTML

Khi nhân bản template `spec-dashboard.html` thành file đặc tả HTML (`mvp/spec/index.html`), Agent phải thay thế các thẻ sau bằng code HTML chất lượng cao:

### A. `{{PROJECT_NAME}}` & `{{PROJECT_DESC}}`
- Điền tên dự án và mô tả tóm tắt (ví dụ: "Solando Warranty CRM Portal", "Hệ thống quản lý bảo hành và kiểm kho điện tử...").

### B. `{{SCOPE_TABLE}}`
- Sinh ra danh sách các thẻ `<tr>` chứa các cột:
  - Tên tính năng.
  - Checkmark `✅` (in-scope) kèm class `<span class="in-scope">` hoặc `❌` (out-scope) kèm class `<span class="out-scope">`.
  - Ghi chú/Quy mô thực hiện.

### C. `{{ROLES_TABLE}}`
- Sinh ra danh sách các thẻ `<tr>` chứa:
  - Tên vai trò người dùng (như `Admin`, `Sale`, `Kế toán`).
  - Danh sách chi tiết các quyền chính được gán.

### D. `{{MODULES_HTML}}`
- Sinh ra mã HTML phân nhóm theo từng module dạng:
  ```html
  <div class="module-group">
      <div class="module-header">📦 Module X: [Tên module]</div>
      <div class="module-desc">[Mô tả nghiệp vụ module]</div>
      <ul class="rules-list">
          <li><strong>Business Rules</strong>: [Quy tắc kinh doanh]</li>
          <li><strong>System Features</strong>: [Tính năng tự động]</li>
          <li><strong>User Features</strong>: [Giao diện người dùng]</li>
      </ul>
  </div>
  ```

### E. `{{HAPPY_PATHS_HTML}}`
- Sinh ra mã HTML cho luồng kiểm thử chính dạng:
  ```html
  <div class="happy-path-box">
      <h4>🎯 Luồng X: [Tên luồng nghiệp vụ]</h4>
      <div class="happy-path-flow">
          <div class="flow-node">Bước 1: [Mô tả]</div>
          <span class="flow-arrow">➔</span>
          <div class="flow-node">Bước 2: [Mô tả]</div>
          <span class="flow-arrow">➔</span>
          <div class="flow-node">Bước 3: [Mô tả]</div>
      </div>
  </div>
  ```
