# Hướng Dẫn Sinh UAT Prototype Tương Tác Mock LocalStorage

Tài liệu này hướng dẫn Agent cách thiết lập và tự động sinh mã nguồn cho bản UAT prototype tương tác (`mvp/prototype/`) của dự án mới.

---

## 1. Cơ Chế Mock Dữ Liệu Liên Kết Bằng LocalStorage

Để prototype hoạt động tương tác realtime như một ứng dụng thực tế:
- **Tập trung hóa dữ liệu**: Tất cả các Portal của các role khác nhau phải gọi chung các hàm dữ liệu trong file `db.js`.
- **LocalStorage Sync**: Khi một portal thay đổi dữ liệu (ví dụ: Sale tạo báo giá mới, hoặc Thủ kho xuất serial), dữ liệu đó phải được cập nhật ngay lập tức vào localStorage thông qua `saveDB()`. Portal khác khi load hoặc định kỳ kiểm tra sẽ đọc dữ liệu mới nhất từ `getDB()`.
- **Mock logic nghiệp vụ trong JS**: Agent cần phải tự động sinh mã logic JS tương tác trên giao diện để:
  - Lọc/Tìm kiếm dữ liệu trên bảng.
  - Điền form, validate dữ liệu đầu vào và push bản ghi mới vào DB.
  - Hiển thị Toast notification báo thành công khi hoàn thành thao tác.

---

## 2. Quy Chuẩn Sinh Code HTML Portal Chức Năng

Khi nhân bản template `prototype-portal.html` cho từng role (ví dụ: `admin.html` cho Admin, `user.html` cho người dùng thông thường), Agent phải thay thế các thẻ sau bằng code HTML chất lượng cao:

### A. `{{SIDEBAR_MENU_HTML}}`
- Sinh ra các thẻ `<a class="nav-item">` tương ứng với các phân hệ chức năng mà role đó được phép truy cập. Sử dụng `onclick="switchTab('tab-id')"` để điều khiển hiển thị nội dung động.

### B. `{{WORKSPACE_CONTENT_HTML}}`
- Chứa các panel giao diện dạng `<div id="tab-id" class="view-panel">`. Trong mỗi panel chứa:
  - Form nhập liệu (`glass-card` -> `form-group` -> `input/select/button`).
  - Danh sách hiển thị (`glass-card` -> `search-bar-wrapper` -> `ui-table-wrap` -> `ui-table`).
  - Các badge chỉ số thống kê (`glass-card` -> `grid-3` -> widget cards).

---

## 3. Ví Dụ Sinh Mã JS Điều Khiển Tương Tác (`admin.js` / `user.js`)

Khi sinh file JS xử lý giao diện cho từng portal, Agent phải viết code tương tác sạch sẽ, ví dụ:

```javascript
// Hàm chuyển đổi tab chức năng trong portal
function switchTab(tabId) {
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(tabId);
    if (targetPanel) targetPanel.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    // Thêm active class cho menu tương ứng
}

// Hàm render dữ liệu bảng động
function renderTableData() {
    const list = dbFindAll('items');
    const tbody = document.getElementById('items-tbody');
    if (!tbody) return;

    tbody.innerHTML = list.map(item => `
        <tr>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td><span class="status-badge badge-green">${item.status}</span></td>
        </tr>
    `).join('');
}
```

---

## 4. Nguyên Tắc Tách Biệt Code (Separation of Concerns)

Để đảm bảo mã nguồn sạch sẽ, dễ nâng cấp và bảo trì, Agent khi sinh mã Portal bắt buộc phải tuân theo quy tắc:
1. **Không viết CSS nội tuyến (No Inline/Embedded CSS)**:
   - File HTML tuyệt đối không chứa thẻ `<style>`. Mọi cấu hình CSS phải nằm ở `style.css` hoặc một tệp CSS được định nghĩa riêng (như `admin.css`) được liên kết ở phần `<head>`.
2. **Không viết Javascript nội tuyến (No Embedded JS)**:
   - File HTML tuyệt đối không chứa thẻ `<script>` chứa logic (như logic thao tác DB, cập nhật giao diện, xử lý sự kiện). Thẻ `<script>` trong HTML chỉ dùng để nhúng các tệp JS bên ngoài:
     ```html
     <script src="db.js"></script>
     <script src="admin.js"></script>
     ```
3. **Mã Javascript giao diện độc lập**:
   - Tất cả các sự kiện DOM và logic xử lý giao diện phải được viết trong file Javascript riêng biệt (ví dụ: `admin.js` cho Portal quản trị, `tech.js` cho Portal kỹ thuật).

