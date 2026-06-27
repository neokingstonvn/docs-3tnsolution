# Kế Hoạch Triển Khai MVP — Task Kingston

> **Mục tiêu:** Xây dựng hệ thống quản lý công việc văn phòng tối giản, phân quyền chặt chẽ theo vai trò (RBAC), Kanban Board kéo thả cập nhật tiến độ tự động, tích hợp luồng phê duyệt trạng thái nhiệm vụ nghiêm ngặt và lưu vết hoạt động (Activity Log / Comments). Hệ thống hoạt động độc lập, lưu trữ dữ liệu giả lập (mock data) thông qua `localStorage` ở client-side để phục vụ kiểm thử UAT nhanh chóng và dễ dàng chuyển đổi sang PostgreSQL/Express API ở giai đoạn sau.

---

## 1. Tại Sao Xây Dựng Task Kingston?

Dưới đây là bảng so sánh hiệu quả giữa cách quản lý thủ công truyền thống so với việc sử dụng hệ thống chuyên biệt Task Kingston:

| Tiêu Chí Đánh Giá | Quản Lý Thủ Công (Excel/Slack) | Hệ Thống Task Kingston (MVP) |
| :--- | :--- | :--- |
| **Phân quyền truy cập** | ❌ Rất khó kiểm soát, mọi thành viên đều có thể đọc/sửa dữ liệu chung. | ✅ Phân quyền chặt chẽ dựa trên vai trò (RBAC: Admin, PM, Staff). |
| **Kiểm soát chất lượng** | ❌ Staff tự ý báo xong (Done) mà không qua kiểm duyệt thực tế của quản lý. | ✅ Luồng phê duyệt (Approval Flow) khóa trạng thái Done, bắt buộc PM duyệt. |
| **Theo dõi lịch sử** | ❌ Dòng chat trôi nhanh, không rõ ai đã sửa đổi trạng thái task vào lúc nào. | ✅ Tự động ghi nhận Activity Log khi thay đổi trạng thái và gán người làm. |
| **Tính đồng bộ & Tiến độ** | ❌ Phải tính toán thủ công phần trăm hoàn thành của từng dự án. | ✅ Tự động cập nhật % tiến độ dự án dựa trên số lượng task Done thực tế. |

---

## 2. Ưu Điểm Giải Pháp Tự Lập Trình (Custom Build)

* **Trải nghiệm giao diện (UX) xuất sắc**: Thiết kế sáng màu thanh lịch v2 với bảng Kanban trực quan giúp tăng năng suất làm việc của nhân sự văn phòng.
* **Bảo mật & Kiểm soát chặt chẽ**: Quản lý quyền truy cập dữ liệu trực tiếp trong code, hạn chế rò rỉ thông tin dự án nội bộ.
* **Kiến trúc module độc lập**: Cấu trúc Clean Architecture 3 lớp giúp tách biệt hoàn toàn Logic nghiệp vụ với Cơ sở dữ liệu, cho phép dễ dàng tích hợp CSDL PostgreSQL ở giai đoạn sản xuất.
* **Mock LocalStorage thông minh**: Giúp chạy thử nghiệm toàn bộ luồng nghiệp vụ trên trình duyệt mà không cần cài đặt server backend phức tạp.

---

## 3. Sơ Đồ Khung Kết Nối

```
┌────────────────────────────────────────────────────────┐
│                      GATEWAY PORTAL                    │
│           (Đăng nhập / Lựa chọn Vai trò Người dùng)    │
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  ADMIN PORTAL  │ │   PM PORTAL    │ │  STAFF PORTAL  │
│- Tạo/Sửa Dự án │ │- Tạo/Sửa Task  │ │- Nhận việc     │
│- Gán PM        │ │- Gán việc/Prior│ │- Đổi trạng thái│
│- Quản lý RBAC  │ │- Duyệt báo cáo │ │- Gửi yêu cầu   │
└────────┬───────┘ └────────┬───────┘ └────────┬───────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
           ┌─────────────────────────────────┐
           │        CSDL LOCALSTORAGE        │
           │ (Mock Entities: users, projects)│
           └─────────────────────────────────┘
```

---

## 4. Thiết Kế Cơ Sở Dữ Liệu Rút Gọn

Hệ thống quản lý dữ liệu thông qua 5 bảng thực thể chính được giả lập trong `db.js`:

1. **Table `users` (Danh sách nhân sự & Phân quyền)**
   - `id`: Định danh duy nhất (UUID)
   - `email`: Địa chỉ email nhân viên
   - `full_name`: Họ và tên
   - `role`: Vai trò hệ thống (`Admin`, `Project Manager`, `Staff`)

2. **Table `projects` (Danh mục dự án)**
   - `id`: Định danh duy nhất
   - `name`: Tên dự án
   - `description`: Mô tả dự án
   - `pm_id`: ID của Project Manager phụ trách (Liên kết `users.id`)
   - `status`: Trạng thái dự án (`Active`, `On Hold`, `Completed`)

3. **Table `tasks` (Danh sách công việc)**
   - `id`: Định danh duy nhất
   - `project_id`: ID dự án trực thuộc (Liên kết `projects.id`)
   - `title`: Tiêu đề công việc
   - `assignee_id`: ID nhân viên được giao (Liên kết `users.id`)
   - `priority`: Độ ưu tiên (`High`, `Medium`, `Low`)
   - `due_date`: Hạn chót
   - `status`: Trạng thái (`To Do`, `In Progress`, `Reviewing`, `Done`)

4. **Table `approval_requests` (Hàng đợi phê duyệt trạng thái)**
   - `id`: Định danh duy nhất
   - `task_id`: ID công việc cần duyệt (Liên kết `tasks.id`)
   - `submitter_id`: ID nhân viên nộp báo cáo (Liên kết `users.id`)
   - `report_text`: Nội dung kết quả/Báo cáo công việc
   - `report_link`: Link tài liệu đính kèm (Drive/OneDrive)
   - `status`: Trạng thái duyệt (`Pending`, `Approved`, `Rejected`)
   - `feedback`: Lý do từ chối (nếu bị PM reject)

5. **Table `activity_logs` (Nhật ký hoạt động & Bình luận)**
   - `id`: Định danh duy nhất
   - `task_id`: ID công việc trực thuộc (Liên kết `tasks.id`)
   - `user_id`: ID người thực hiện hành động (Liên kết `users.id`)
   - `action`: Nội dung hành động (ví dụ: chuyển trạng thái, bình luận mới)

---

## 5. Quy Trình Vận Hành Hệ Thống

### 🎯 Luồng A: Thiết Lập Dự Án & Chỉ Định Vai Trò (Admin)
* **Bước 1:** Admin đăng nhập, truy cập Dashboard và tạo dự án mới (ví dụ: `"Tái cấu trúc Website Kingston"`).
* **Bước 2:** Admin lựa chọn gán một Project Manager chịu trách nhiệm quản lý dự án đó.
* **Bước 3:** Admin cấu hình/gán vai trò (RBAC) cho các nhân viên khác trong văn phòng.

### 🎯 Luồng B: Phân Công Công Việc & Đặt Hạn Chót (Project Manager)
* **Bước 1:** PM vào chi tiết dự án được giao phụ trách, click tạo công việc mới.
* **Bước 2:** PM điền tiêu đề task (ví dụ: `"Thiết kế Layout Homepage"`), gán độ ưu tiên High và thiết lập hạn chót (Due date).
* **Bước 3:** PM gán task cho một Staff thực hiện ➔ Hệ thống tự động đẩy thông báo giả lập và cập nhật Kanban Board của dự án.

### 🎯 Luồng C: Thực Hiện Công Việc & Luồng Phê Duyệt Trạng Thái (Staff ➔ PM)
* **Bước 1:** Staff vào Dashboard cá nhân, thấy công việc được giao và cập nhật trạng thái từ `To Do` sang `In Progress`.
* **Bước 2:** Khi hoàn thành, Staff click "Gửi duyệt" ➔ Điền link báo cáo tài liệu và chuyển trạng thái task sang `Reviewing`. Hệ thống khóa tính năng kéo thả của Staff đối với task này.
* **Bước 3:** PM hoặc Admin mở Hàng đợi phê duyệt (Approval Queue), xem báo cáo và đưa ra quyết định:
  * **Approve:** Chuyển trạng thái task sang `Done`, ghi nhận hoàn thành.
  * **Reject:** Chuyển trạng thái task về lại `In Progress`, bắt buộc điền Feedback lý do từ chối.

---

## 6. Kiến Trúc Mã Nguồn Custom Build

Kiến trúc thư mục được thiết kế theo hướng module hóa chặt chẽ và độc lập:
* **Frontend**: HTML5 + Vanilla CSS (Slate v2) + Vanilla JS. Mỗi Portal (admin, pm, staff) được tách thành một tệp HTML giao diện và một tệp Javascript xử lý logic nghiệp vụ riêng.
* **Database Mock Layer (`db.js`)**: Giả lập CSDL thông qua đối tượng Javascript kết nối với API `localStorage` của trình duyệt. Tự động khởi tạo dữ liệu mẫu (seed data) khi chạy ứng dụng lần đầu.

---

## 7. Lộ Trình Triển Khai Tổng Thể (Phases)

* **Phase 1: Setup Nền Tảng & Cơ Sở Dữ Liệu**: Thiết lập Clean Architecture, tạo database DDL SQL và phát triển core middleware RBAC.
* **Phase 2: APIs & Kanban Board**: Xây dựng APIs/Mock DB CRUD dự án/công việc và hoàn thiện giao diện Kanban Board.
* **Phase 3: Log Engine & Bình Luận**: Phát triển cơ chế tự động ghi Activity log và module bình luận trao đổi trong task.
* **Phase 4: Luồng Phê Duyệt Nhiệm Vụ**: Phát triển Approval Queue, khóa trạng thái Done đối với Staff và hoàn thiện form feedback từ chối.
* **Phase 5: Kiểm Thử UAT & Go-live**: Thực hiện các kịch bản Happy Paths và bàn giao mã nguồn prototype UAT.
