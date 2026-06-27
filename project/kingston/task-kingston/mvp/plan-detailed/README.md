# Chi Tiết Thiết Kế & Danh Sách Task Triển Khai (Task Kingston)

Tài liệu này phân rã chi tiết kiến trúc kỹ thuật và các task lập trình cho dự án **Task Kingston** phục vụ việc quản lý dự án và phê duyệt công việc.

---

## 1. Mục Tiêu Kỹ Thuật (Technical Objective)

- **Backend (Node.js + Express)**: Xây dựng hệ thống RESTful API, quản lý logic nghiệp vụ phân quyền theo vai trò (RBAC), log engine tự động lưu vết và luồng phê duyệt trạng thái nhiệm vụ.
- **Frontend (Vanilla JS + Vanilla CSS)**: Thiết kế các portal tương tác (Admin, PM, Staff) với giao diện Kanban Board trực quan hỗ trợ kéo thả và hàng đợi duyệt việc Approval Queue.
- **Database (PostgreSQL 16)**: Lưu trữ các thực thể Dự án, Công việc, Bình luận, Yêu cầu phê duyệt và Nhật ký hoạt động.

---

## 2. Danh Sách Task Triển Khai Theo Giai Đoạn

### Giai Đoạn 1: Cấu Hình Core Database & Module Auth (Ngày 1–3)

- [ ] **Task 1.1: Thiết lập database migration & DDL SQL Schema**  
  Tạo các bảng cơ sở dữ liệu `users`, `projects`, `tasks`, `comments`, `approval_requests`, `activity_logs` trên PostgreSQL. Cấu hình các ràng buộc khóa ngoại (foreign keys) và tạo index cho `assignee_id`, `project_id`.  
  *Milestone:* Chạy thành công script migration trên PostgreSQL.
  
- [ ] **Task 1.2: Scaffold ứng dụng Node.js/Express theo Clean Architecture**  
  Scaffold Express project backend, cấu hình module kết nối database PostgreSQL. Thiết lập Docker Compose để chạy database cục bộ.  
  *Milestone:* Server backend kết nối thành công với database PostgreSQL qua Docker.

- [ ] **Task 1.3: Viết middleware RBAC kiểm tra quyền truy cập theo vai trò**  
  Xây dựng middleware giải mã token JWT và kiểm tra vai trò người dùng (Admin, Project Manager, Staff) trước khi cho phép đi qua các router API bảo mật.  
  *Milestone:* Middleware chặn truy cập trái phép và log lỗi phân quyền thành công.

---

### Giai Đoạn 2: APIs & Giao Diện Quản Lý Dự Án (Ngày 4–6)

- [ ] **Task 2.1: Viết REST APIs CRUD quản lý Dự án**  
  Thiết kế các API endpoints trong Node.js/Express:
  - `POST /api/projects`: Tạo dự án mới (Chỉ dành cho Admin).
  - `GET /api/projects`: Lấy danh sách dự án (Phân quyền: Admin xem hết, PM xem dự án phụ trách, Staff xem dự án tham gia).
  - `PATCH /api/projects/:id`: Cập nhật trạng thái hoặc thông tin dự án.
  
- [ ] **Task 2.2: Thiết lập Giao diện Dashboard chính & Sidebar Navigation**  
  Xây dựng giao diện khung ứng dụng, thanh tiêu đề, menu định tuyến và bộ chuyển đổi vai trò ở Sidebar.  
  *Milestone:* Cấu trúc layout và Sidebar navigation hoạt động ổn định.

- [ ] **Task 2.3: Màn hình danh mục dự án (Project Directory) & Form Tạo mới**  
  Xây dựng giao diện hiển thị danh sách dự án dưới dạng thẻ card, tự động hiển thị phần trăm tiến độ dựa trên số task Done; tích hợp form modal thêm mới dự án cho Admin.  
  *Milestone:* Hiển thị đúng thông tin và phần trăm dự án khi truy vấn.

---

### Giai Đoạn 3: Kanban Board & APIs Công Việc (Ngày 7–10)

- [ ] **Task 3.1: Viết REST APIs CRUD quản lý Công việc**  
  Thiết kế các API endpoints công việc trong Node.js:
  - `POST /api/tasks`: Tạo task mới (Chỉ PM phụ trách hoặc Admin).
  - `GET /api/projects/:projectId/tasks`: Lấy danh sách task của một dự án.
  - `PATCH /api/tasks/:id/status`: Đổi trạng thái (chỉ cho phép Staff đổi To Do <-> In Progress).

- [ ] **Task 3.2: Giao diện Kanban Board kéo thả cập nhật tiến độ**  
  Thiết kế 4 cột trạng thái công việc (To Do, In Progress, Reviewing, Done) hỗ trợ Drag and Drop trực quan và tự động gọi API cập nhật khi thả thẻ.  
  *Milestone:* Kéo thả di chuyển thẻ task hoạt động mượt mà và lưu lại trạng thái thành công.

- [ ] **Task 3.3: Giao diện xem chi tiết Task, Comment Box & Activity Logs**  
  Tạo modal popup khi click vào task, cho phép PM/Staff mô tả chi tiết, viết bình luận thảo luận và hiển thị nhật ký thay đổi trạng thái của task.  
  *Milestone:* Xem bình luận và nhật ký thao tác trên giao diện chi tiết task.

---

### Giai Đoạn 4: Log Engine & Trình Phê Duyệt Trạng Thái (Ngày 11–13)

- [ ] **Task 4.1: Log Engine tự động ghi nhận thay đổi trạng thái**  
  Xây dựng service log tự động ghi nhận hành động thay đổi trạng thái hoặc người làm vào bảng `activity_logs` mỗi khi task cập nhật thành công.  
  *Milestone:* Bất kỳ thay đổi nào trên task đều sinh ra bản ghi nhật ký hoạt động chính xác.

- [ ] **Task 4.2: APIs đệ trình và phê duyệt hoàn thành nhiệm vụ**  
  Viết endpoints phục vụ phê duyệt:
  - `POST /api/tasks/:id/submit-approval`: Staff nộp link báo cáo và mô tả kết quả, chuyển trạng thái sang `Reviewing`.
  - `POST /api/approvals/:id/review`: PM/Admin phê duyệt (`Approve` -> chuyển sang `Done`) hoặc từ chối (`Reject` -> trả về `In Progress` kèm feedback).

- [ ] **Task 4.3: Giao diện hàng đợi phê duyệt (Approval Queue) cho PM/Admin**  
  Xây dựng màn hình gom nhóm các nhiệm vụ đang chờ phê duyệt, hiển thị báo cáo, đính kèm link tài liệu và form nhập feedback từ chối.  
  *Milestone:* Thao tác duyệt/từ chối thành công trên giao diện và cập nhật trạng thái nhiệm vụ.

---

### Giai Đoạn 5: Kiểm Thử UAT & Mock Database (Ngày 14–15)

- [ ] **Task 5.1: Xây dựng bộ kịch bản kiểm thử Happy Path & E2E**  
  Thực hiện kiểm thử đầu cuối: Admin tạo dự án -> PM giao task -> Staff nhận task và đổi trạng thái -> Staff gửi yêu cầu duyệt -> PM duyệt hoàn thành.  
  *Milestone:* Các kịch bản chạy thử nghiệm vượt qua thành công.

- [ ] **Task 5.2: Triển khai CSDL giả lập LocalStorage vào file db.js**  
  Tích hợp logic mock database vào tệp `db.js` giúp liên kết các portal HTML để chạy demo UAT độc lập ở client-side mà không cần khởi động backend server.  
  *Milestone:* Chạy thử nghiệm toàn bộ luồng hệ thống mượt mà trên browser.

- [ ] **Task 5.3: Đóng gói và viết hướng dẫn triển khai sản xuất**  
  Viết Docker Compose và file README hướng dẫn cách chạy ứng dụng thực tế.  
  *Milestone:* Toàn bộ dự án được đóng gói hoàn chỉnh.

---

## 3. Cấu Trúc Database PostgreSQL Chi Tiết (DDL)

```sql
-- Kích hoạt extension sinh UUID tự động
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG USERS (Nhân sự)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Project Manager', 'Staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG PROJECTS (Dự án)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pm_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG TASKS (Công việc)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Reviewing', 'Done')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG COMMENTS (Bình luận)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG APPROVAL_REQUESTS (Phê duyệt)
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    submitter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    report_text TEXT NOT NULL,
    report_link VARCHAR(512),
    approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG ACTIVITY_LOGS (Nhật ký)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo Indexes tối ưu hóa truy vấn
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_approvals_task ON approval_requests(task_id);
CREATE INDEX idx_logs_task ON activity_logs(task_id);
```

---

## 4. Kế Hoạch Kiểm Thử & Xác Minh (Test Plan)

### Kiểm Thử Tự Động (Automated Tests)
1. **RBAC middleware tests**: Giả lập request từ tài khoản Staff gửi lên API <code>POST /api/projects</code> để kiểm tra phản hồi lỗi 403 Forbidden.
2. **Approval Flow unit tests**: Giả lập đổi trạng thái task của Staff lên `Done` mà không qua Approval Queue, kiểm tra xem hệ thống có tự động ném lỗi và từ chối cập nhật trạng thái không.

### Kiểm Thử Thủ Công (Manual UAT Validation)
1. **UAT 1: Luồng tạo và giao việc**
   - Đăng nhập dưới quyền Admin tạo dự án, gán PM.
   - Đăng nhập dưới quyền PM tạo task và gán cho Staff. Kiểm tra xem task có xuất hiện trên Kanban Board của dự án.
2. **UAT 2: Luồng đệ trình duyệt việc**
   - Đăng nhập dưới quyền Staff cập nhật task sang `In Progress`, sau đó bấm "Gửi duyệt" điền link báo cáo.
   - Đăng nhập PM kiểm tra danh sách Approval Queue, xem báo cáo và bấm Approve/Reject. Xác minh sự thay đổi trạng thái của task trên Kanban Board.
