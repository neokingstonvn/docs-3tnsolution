# Kế Hoạch Dài Hạn (Sau MVP) — Task Kingston

Tài liệu này đặc tả lộ trình phát triển dài hạn (Post-MVP Roadmap) cho dự án **Task Kingston**, tập trung vào các tính năng nâng cao, tích hợp hệ thống và tối ưu hóa quy mô doanh nghiệp sau khi phiên bản MVP đã vận hành ổn định.

---

## 1. Lộ Trình Phân Kỳ Phát Triển Dài Hạn (Phases 6 - 10)

### 📅 Phase 6: Tích Hợp Hệ Thống Thông Báo Đa Kênh
- **Mục tiêu**: Thay thế thông báo giả lập trên giao diện bằng thông báo thời gian thực và gửi trực tiếp qua email/Slack.
- **Các đầu việc chính**:
  - Tích hợp dịch vụ SendGrid/Nodemailer để tự động gửi email nhắc hạn công việc.
  - Xây dựng Slack Webhook/Telegram Bot gửi thông báo tức thì khi có yêu cầu phê duyệt mới.
  - Thiết lập cơ chế cấu hình nhận thông báo theo mong muốn của từng người dùng.

### 📅 Phase 7: Lưu Trữ Tài Liệu Vật Lý & Tải File Trực Tiếp
- **Mục tiêu**: Cho phép tải file đính kèm trực tiếp thay vì dán link thủ công.
- **Các đầu việc chính**:
  - Tích hợp Cloud Storage (như Amazon S3, Google Cloud Storage hoặc MinIO).
  - Viết API upload/download file an toàn, hỗ trợ quét mã độc tự động.
  - Xem trước (preview) trực tiếp các định dạng ảnh, PDF, văn bản Word/Excel trên giao diện.

### 📅 Phase 8: Biểu Đồ Gantt & Phân Tích Năng Suất Nâng Cao
- **Mục tiêu**: Cung cấp công cụ lập kế hoạch trực quan và báo cáo hiệu suất chuyên sâu cho quản lý.
- **Các đầu việc chính**:
  - Phát triển giao diện Biểu đồ Gantt tương tác kéo thả để quản lý dependencies giữa các task.
  - Xây dựng dashboard báo cáo năng suất nhân viên (Workload, Burn-down chart, KPI hoàn thành).
  - Xuất dữ liệu báo cáo dự án ra file Excel/PDF định kỳ.

### 📅 Phase 9: Bảo Mật Enterprise & Xác Thực SSO/JWT
- **Mục tiêu**: Đưa hệ thống lên tiêu chuẩn bảo mật doanh nghiệp lớn.
- **Các đầu việc chính**:
  - Chuyển đổi cơ chế xác thực sang JWT (JSON Web Token) kết hợp Token Refresh.
  - Tích hợp đăng nhập một lần SSO (Single Sign-On) qua Google Workspace, Microsoft 365 hoặc Keycloak.
  - Xây dựng Audit Logs chi tiết toàn hệ thống phục vụ công tác thanh tra bảo mật.

### 📅 Phase 10: Ứng Dụng Di Động Native (Mobile App)
- **Mục tiêu**: Hỗ trợ nhân viên theo dõi và xử lý công việc mọi lúc mọi nơi trên điện thoại di động.
- **Các đầu việc chính**:
  - Phát triển ứng dụng di động Task Kingston bằng React Native hoặc Flutter.
  - Tích hợp Push Notifications gốc trên iOS và Android.
  - Hỗ trợ chế độ làm việc ngoại tuyến (Offline-first Mode) và tự động đồng bộ khi có mạng lại.

---

## 2. So Sánh Động Lực Phát Triển (MVP vs Dài Hạn)

| Đặc tính | Phiên bản MVP | Định Hướng Dài Hạn (Post-MVP) |
| :--- | :--- | :--- |
| **Lưu trữ dữ liệu** | Giả lập localStorage / SQLite đơn giản. | PostgreSQL cluster, AWS RDS, tự động sao lưu định kỳ. |
| **Xác thực & Bảo mật** | Middleware kiểm tra header tĩnh `X-User-Role`. | JWT, SSO (Google/Microsoft), MFA (Mã OTP 2 lớp). |
| **Thông báo** | Giả lập chuông báo nội bộ trên Web UI. | Realtime WebSockets, Email, Slack, Telegram, Mobile Push. |
| **Đính kèm tài liệu** | Chỉ dán Link liên kết ngoài. | Lưu trữ file vật lý trực tiếp trên AWS S3, phân quyền xem file. |
| **Quản trị & Báo cáo** | Thống kê số lượng dạng số đơn giản. | Gantt chart, Burn-down chart, Báo cáo năng suất nhân sự nâng cao. |
