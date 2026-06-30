/**
 * Mock Database Wrapper - Sử dụng LocalStorage để mô phỏng CSDL thực tế cho UAT Demo.
 * File này chứa các hàm CRUD cơ bản để các trang Portal gọi chung.
 */

// Định nghĩa dữ liệu khởi tạo mặc định nếu localStorage trống
const INITIAL_DB = {
    users: [
        { id: "USER_ADMIN_1", email: "admin@kingston.vn", full_name: "Lê Hoàng Admin", role: "Admin" },
        { id: "USER_PM_1", email: "pm1@kingston.vn", full_name: "Phan Văn PM", role: "Project Manager" },
        { id: "USER_STAFF_1", email: "staff1@kingston.vn", full_name: "Nguyễn Văn Staff", role: "Staff" },
        { id: "USER_STAFF_2", email: "staff2@kingston.vn", full_name: "Trần Thị Staff", role: "Staff" }
    ],
    projects: [
        { id: "PROJ_1", name: "Chiến dịch Marketing Kingston Q3", description: "Chiến dịch truyền thông và ra mắt các sản phẩm mới trong Q3 tại Kingston.", pm_id: "USER_PM_1", status: "Active" },
        { id: "PROJ_2", name: "Nâng cấp Website Office v2", description: "Tái cấu trúc giao diện và tăng tốc backend cho website văn phòng chính thức.", pm_id: "USER_PM_1", status: "Active" },
        { id: "PROJ_3", name: "Thiết kế nội thất sảnh chính", description: "Cải tạo lại toàn bộ không gian tiếp khách và trưng bày tại sảnh văn phòng.", pm_id: "USER_ADMIN_1", status: "On Hold" }
    ],
    tasks: [
        { id: "TASK_1", project_id: "PROJ_1", title: "Thiết kế Banner quảng cáo sảnh", description: "Thiết kế bộ banner khổ lớn để treo tại sảnh chính và đăng web.", assignee_id: "USER_STAFF_1", priority: "High", plan_start_date: "2026-06-25", actual_start_date: "2026-06-27", due_date: "2026-06-30", actual_end_date: null, status: "In Progress" },
        { id: "TASK_2", project_id: "PROJ_1", title: "Viết bài PR khai trương", description: "Soạn thảo bài viết quảng bá đăng trên các báo điện tử Dân trí, VnExpress.", assignee_id: "USER_STAFF_2", priority: "Medium", plan_start_date: "2026-07-02", actual_start_date: null, due_date: "2026-07-05", actual_end_date: null, status: "To Do" },
        { id: "TASK_3", project_id: "PROJ_2", title: "Thiết lập CSDL PostgreSQL", description: "Chạy các script DDL và seed data chuẩn bị cho môi trường staging.", assignee_id: "USER_STAFF_1", priority: "High", plan_start_date: "2026-06-20", actual_start_date: "2026-06-22", due_date: "2026-06-25", actual_end_date: "2026-06-24", status: "Done" },
        { id: "TASK_4", project_id: "PROJ_3", title: "Vẽ layout 3D mặt bằng", description: "Sử dụng SketchUp dựng trước phối cảnh 3D nội thất.", assignee_id: "", priority: "Low", plan_start_date: "2026-07-10", actual_start_date: null, due_date: "2026-07-15", actual_end_date: null, status: "To Do" }
    ],
    comments: [
        { id: "COMM_1", task_id: "TASK_1", user_id: "USER_PM_1", content: "Hãy chú ý dùng đúng tone màu của thương hiệu Kingston nhé.", createdAt: "2026-06-27T09:00:00.000Z" },
        { id: "COMM_2", task_id: "TASK_1", user_id: "USER_STAFF_1", content: "Vâng em đang dựng demo theo tone màu xanh navy và vàng gold.", createdAt: "2026-06-27T09:30:00.000Z" }
    ],
    approval_requests: [
        { id: "APP_1", task_id: "TASK_3", submitter_id: "USER_STAFF_1", report_text: "Đã thiết lập xong toàn bộ schema và deploy lên RDS.", report_link: "https://github.com/kingston/db-schema", approver_id: "USER_PM_1", status: "Approved", feedback: "Làm rất tốt, database hoạt động ổn định.", createdAt: "2026-06-25T10:00:00.000Z" }
    ],
    activity_logs: [
        { id: "LOG_1", task_id: "TASK_1", user_id: "USER_PM_1", action: "Đã tạo công việc và phân công cho Nguyễn Văn Staff", createdAt: "2026-06-27T08:00:00.000Z" },
        { id: "LOG_2", task_id: "TASK_1", user_id: "USER_STAFF_1", action: "Đã chuyển trạng thái từ To Do sang In Progress", createdAt: "2026-06-27T08:30:00.000Z" },
        { id: "LOG_3", task_id: "TASK_3", user_id: "USER_STAFF_1", action: "Gửi yêu cầu phê duyệt hoàn thành", createdAt: "2026-06-25T09:45:00.000Z" },
        { id: "LOG_4", task_id: "TASK_3", user_id: "USER_PM_1", action: "Phê duyệt công việc sang trạng thái Done", createdAt: "2026-06-25T10:00:00.000Z" }
    ],
    notifications: [
        { id: "NOTI_1", user_id: "USER_PM_1", text: "Staff Nguyễn Văn Staff đã nộp báo cáo phê duyệt cho task 'Thiết lập CSDL PostgreSQL'", read: false, createdAt: "2026-06-25T09:45:00.000Z" },
        { id: "NOTI_2", user_id: "USER_STAFF_1", text: "PM Phan Văn PM đã phê duyệt task 'Thiết lập CSDL PostgreSQL' của bạn", read: true, createdAt: "2026-06-25T10:00:00.000Z" }
    ]
};

// Hàm khởi tạo cơ sở dữ liệu
function initMockDB() {
    if (!localStorage.getItem('mock_db_initialized')) {
        localStorage.setItem('mock_db', JSON.stringify(INITIAL_DB));
        localStorage.setItem('mock_db_initialized', 'true');
        console.log('Mock DB initialized successfully in localStorage.');
    }
}

// Lấy toàn bộ Database
function getDB() {
    initMockDB();
    try {
        return JSON.parse(localStorage.getItem('mock_db'));
    } catch (e) {
        console.error('Error parsing mock DB from localStorage:', e);
        return INITIAL_DB;
    }
}

// Lưu Database
function saveDB(db) {
    try {
        localStorage.setItem('mock_db', JSON.stringify(db));
    } catch (e) {
        console.error('Error saving DB to localStorage:', e);
    }
}

// ============================================================================
// CÁC HÀM CRUD HELPERS
// ============================================================================

// Lấy danh sách từ bảng
function dbFindAll(table) {
    const db = getDB();
    return db[table] || [];
}

// Tìm kiếm theo ID
function dbFindById(table, id) {
    const list = dbFindAll(table);
    return list.find(item => item.id === id);
}

// Tạo mới bản ghi
function dbCreate(table, record) {
    const db = getDB();
    if (!db[table]) db[table] = [];
    
    if (!record.id) {
        record.id = 'MOCK_' + table.substring(0, 3).toUpperCase() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    record.createdAt = new Date().toISOString();
    
    db[table].push(record);
    saveDB(db);
    return record;
}

// Cập nhật bản ghi
function dbUpdate(table, id, updatedFields) {
    const db = getDB();
    const list = db[table] || [];
    const index = list.findIndex(item => item.id === id);
    
    if (index !== -1) {
        // Tự động cập nhật ngày bắt đầu/kết thúc thực tế của task
        if (table === 'tasks') {
            const todayStr = new Date().toISOString().split('T')[0];
            if (updatedFields.status === 'In Progress' && !list[index].actual_start_date) {
                updatedFields.actual_start_date = todayStr;
            }
            if (updatedFields.status === 'Done' && !list[index].actual_end_date) {
                updatedFields.actual_end_date = todayStr;
            }
        }
        
        list[index] = { ...list[index], ...updatedFields, updatedAt: new Date().toISOString() };
        db[table] = list;
        saveDB(db);
        return list[index];
    }
    return null;
}

// Xóa bản ghi
function dbDelete(table, id) {
    const db = getDB();
    const list = db[table] || [];
    const filtered = list.filter(item => item.id !== id);
    db[table] = filtered;
    saveDB(db);
    return true;
}

// ============================================================================
// NGHIỆP VỤ ĐẶC THÙ (BUSINESS LOGIC MOCK)
// ============================================================================

// Tạo Log hoạt động
function createActivityLog(taskId, userId, actionText) {
    dbCreate('activity_logs', {
        task_id: taskId,
        user_id: userId,
        action: actionText
    });
}

// Gửi thông báo
function sendNotification(userId, text) {
    dbCreate('notifications', {
        user_id: userId,
        text: text,
        read: false
    });
}

// Tính toán phần trăm tiến độ của dự án
function getProjectProgress(projectId) {
    const tasks = dbFindAll('tasks').filter(t => t.project_id === projectId);
    if (tasks.length === 0) return 0;
    const doneTasks = tasks.filter(t => t.status === 'Done').length;
    return Math.round((doneTasks / tasks.length) * 100);
}

// Khởi tạo DB
initMockDB();
