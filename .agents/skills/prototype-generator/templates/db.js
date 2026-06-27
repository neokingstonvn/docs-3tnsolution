/**
 * Mock Database Wrapper - Sử dụng LocalStorage để mô phỏng CSDL thực tế cho UAT Demo.
 * File này chứa các hàm CRUD cơ bản để các trang Portal gọi chung.
 */

// Định nghĩa dữ liệu khởi tạo mặc định nếu localStorage trống
const INITIAL_DB = {
    // Agent sẽ tự động sinh các bảng mock dữ liệu dựa trên DB Schema ở bước trước.
    // Ví dụ:
    // products: [...],
    // invoices: [...],
    // serials: [...]
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

// Các hàm Helpers CRUD mẫu (Agent sẽ sinh thêm tùy theo dự án):

// 1. Lấy danh sách từ bảng
function dbFindAll(table) {
    const db = getDB();
    return db[table] || [];
}

// 2. Tìm kiếm theo ID
function dbFindById(table, id) {
    const list = dbFindAll(table);
    return list.find(item => item.id === id);
}

// 3. Tạo mới bản ghi
function dbCreate(table, record) {
    const db = getDB();
    if (!db[table]) db[table] = [];
    
    // Gán ID ngẫu nhiên nếu chưa có
    if (!record.id) {
        record.id = 'MOCK_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    record.createdAt = new Date().toISOString();
    
    db[table].push(record);
    saveDB(db);
    return record;
}

// 4. Cập nhật bản ghi
function dbUpdate(table, id, updatedFields) {
    const db = getDB();
    const list = db[table] || [];
    const index = list.findIndex(item => item.id === id);
    
    if (index !== -1) {
        list[index] = { ...list[index], ...updatedFields, updatedAt: new Date().toISOString() };
        db[table] = list;
        saveDB(db);
        return list[index];
    }
    return null;
}

// Gọi khởi tạo DB
initMockDB();
