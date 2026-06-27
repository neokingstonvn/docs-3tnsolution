# Hướng Dẫn Điều Phối Workflow & Quản Lý Ngữ Cảnh (Shared Context)

Tài liệu này hướng dẫn cách Agent duy trì, chia sẻ và truyền đạt thông tin (ngữ cảnh) giữa các bước trong quy trình phát triển sản phẩm mvp để đảm bảo các tài liệu, slide, và prototype luôn đồng nhất 100% về mặt dữ liệu.

---

## Luồng Truyền Tải Dữ Liệu Ngữ Cảnh (Context Pipeline)

Để tránh việc Agent tự suy diễn hoặc làm lệch thông tin giữa các bước, thông tin phải được lưu vết và chuyển giao như sau:

| Bước thực hiện                | File dữ liệu trung gian                                           | Dữ liệu được ghi nhận                                                                                                       | Agent kế tiếp sẽ đọc                       |
| ----------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **1. project-orchestrator**   | `.agents/output/project_overview.md`                              | - Tên dự án<br>- Mục tiêu cốt lõi (Sáng màu v2)<br>- Danh sách user roles<br>- Danh sách module thô                         | `spec-generator`                           |
| **2. spec-generator**         | `mvp/spec/README.md`<br>`mvp/spec/index.html` (Sáng màu)<br>`.agents/output/spec_metadata.json` | - Bảng phân quyền RBAC<br>- Business rules chi tiết<br>- Các modules chi tiết<br>- Happy path flow                          | `implementation-planner`                   |
| **3. implementation-planner** | `mvp/plan-high-level/README.md` (Kế hoạch dài hạn/hậu MVP)<br>`mvp/plan-detailed/README.md` (Kế hoạch triển khai chi tiết MVP)<br>`.agents/output/db_schema.sql` | - Clean Architecture folder structures<br>- Cấu trúc Database Table (DDL SQL)<br>- API endpoint details & payload JSON      | `prototype-generator`<br>`slide-generator` |
| **4. slide-generator**        | `mvp/presentation/index.html` (Sáng màu)                          | - Slide deck thuyết trình dự án dựa trên đặc tả và kế hoạch phát triển (Sáng màu).                                          | Người dùng / CSKH                          |
| **5. prototype-generator**    | `mvp/prototype/` (Sáng màu)                                       | - Bản chạy thử nghiệm UAT hoàn chỉnh.<br>- File `db.js` mock localStorage dựa trên `db_schema.sql` và `spec_metadata.json`. | Người dùng chạy thử                        |

---

## Các Chỉ Thị Đối Với Agent (Agent Directives)

### 1. Đồng bộ hóa Tên gọi & Nghiệp vụ (Naming & Domain Consistency)

- **Tên thực thể (Entities)**: Nếu ở bước Spec gọi là `Dealer` thì trong DB Schema phải là bảng `dealers`, trong prototype JS phải là đối tượng `dealer`, tuyệt đối không thay đổi sang các từ đồng nghĩa như `Agent`, `Partner`, `Customer` một cách ngẫu nhiên.
- **Vai trò người dùng (Roles)**: Nếu Spec quy định 3 role là `Admin`, `Storekeeper`, `CSKH` thì trong Dashboard hiển thị, Slide, và Prototype chỉ được thiết kế đúng 3 role này.

### 2. Kiểm soát Tính Đồng Bộ Realtime trong Prototype

- Để prototype tương tác thực sự giống `v2`, file `db.js` phải mock chính xác các table từ `db_schema.sql`.
- Các hàm trong `db.js` phải thao tác trực tiếp trên localStorage và ghi nhận logs giao dịch (audit log) ảo.
- Mọi Portal UI (như `admin.html`, `tech.html`) phải dùng chung file `db.js` và `style.css` để cập nhật trạng thái đồng bộ ngay lập tức.
