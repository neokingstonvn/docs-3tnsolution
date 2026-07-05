/**
 * Mock Database Wrapper - Sử dụng LocalStorage để mô phỏng CSDL thực tế cho UAT Demo.
 * File này chứa các hàm CRUD cơ bản để các trang Portal gọi chung cho AuraStudio.
 * Cập nhật cấu trúc: 1 Template chứa nhiều Hình Mẫu con (template_layouts).
 */

// Định nghĩa dữ liệu khởi tạo mặc định nếu localStorage trống
const INITIAL_DB = {
    users: [
        { id: "USER_ADMIN_1", email: "admin@aurastudio.vn", full_name: "Nguyễn Anh Admin", role: "Admin" },
        { id: "USER_MERCHANT_1", email: "merchant@aurastudio.vn", full_name: "Trần Hùng Merchant", role: "Merchant" }
    ],
    templates: [
        { id: "TEMP_1", name: "Fashion Shoes Pack", created_by: "USER_ADMIN_1" },
        { id: "TEMP_2", name: "E-Commerce Basic", created_by: "USER_ADMIN_1" }
    ],
    template_layouts: [
        { 
            id: "LAY_1", 
            template_id: "TEMP_1",
            title: "Beach Breeze Classic", 
            description: "Bối cảnh cát trắng biển xanh thích hợp cho giày dép đi chơi hè.",
            layout_type: "Outdoor",
            scale: "1:1", 
            image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", 
            background_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", 
            overlay_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="5" y="95" font-family="sans-serif" font-size="6" fill="%238b5cf6" font-weight="bold" opacity="0.6">AURA STUDIO</text></svg>', 
            safe_zone_x: 20, 
            safe_zone_y: 20, 
            safe_zone_w: 60, 
            safe_zone_h: 60 
        },
        { 
            id: "LAY_2", 
            template_id: "TEMP_1",
            title: "Studio Minimalist White", 
            description: "Nền trắng xám tối giản, bóng đổ tiếp xúc nhẹ giúp nổi bật chi tiết giày.",
            layout_type: "Studio",
            scale: "1:1", 
            image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80", 
            background_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", 
            overlay_url: "", 
            safe_zone_x: 15, 
            safe_zone_y: 15, 
            safe_zone_w: 70, 
            safe_zone_h: 70 
        },
        { 
            id: "LAY_3", 
            template_id: "TEMP_2",
            title: "Action Sports Banner", 
            description: "Phong cách thể thao đường phố năng động dạng banner ngang.",
            layout_type: "Action",
            scale: "16:9", 
            image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80", 
            background_url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80", 
            overlay_url: "", 
            safe_zone_x: 40, 
            safe_zone_y: 10, 
            safe_zone_w: 50, 
            safe_zone_h: 80 
        }
    ],
    products: [
        { id: "P_1", product_code: "SP-001", product_name: "Giày Sneaker Thể Thao Đỏ" },
        { id: "P_2", product_code: "SP-002", product_name: "Giày Chạy Bộ Sneaker Trắng" }
    ],
    product_images: [
        {
            id: "PROD_MOCK_1",
            product_id: "P_1",
            name: "red_sneaker_angle_1.jpg",
            raw_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
            processed_url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTUsNjUgTDMwLDQwIEw0NSwzNSBMODAsMzUgTDg1LDQ1IEw3MCw3MCBMMjAsNzAgWiBNNDUsMzUgTDUwLDQ1IE01NSwzNSBMNjAsNDUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI2RjMjYyNiIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMyIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1MCIgeT0iNjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R0lBWSBETzwvdGV4dD48L3N2Zz4=',
            status: "Completed"
        },
        {
            id: "PROD_MOCK_2",
            product_id: "P_2",
            name: "white_sneaker_angle_1.jpg",
            raw_url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
            processed_url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTUsNjUgTDMwLDQwIEw0NSwzNSBMODAsMzUgTDg1LDQ1IEw3MCw3MCBMMjAsNzAgWiBNNDUsMzUgTDUwLDQ1IE01NSwzNSBMNjAsNDUiIHN0cm9rZT0iIzY0NzQ4YiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjZjFmNWY5Ii8+PGNpcmNsZSBjeD0iMzUiIGN5PSI1MCIgcj0iMyIgZmlsbD0iIzY0NzQ4YiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMiIGZpbGw9IiM2NDc0OGIiLz48dGV4dCB4PSI1MCIgeT0iNjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2NDc0OGIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HSUFZIFRSQU5HPC90ZXh0Pjwvc3ZnPg==',
            status: "Completed"
        }
    ],
    compositions: [],   // Danh sách kết quả phối cảnh đã render
    processing_queues: [],
    audit_logs: [
        { id: "LOG_1", user_id: "USER_ADMIN_1", action_type: "INITIALIZE_SYSTEM", details: "Khởi tạo hệ thống AuraStudio UAT.", createdAt: "2026-07-05T02:00:00.000Z" }
    ]
};

// Hàm khởi tạo cơ sở dữ liệu
function initMockDB() {
    if (!localStorage.getItem('mock_db_initialized_v5')) {
        localStorage.setItem('mock_db', JSON.stringify(INITIAL_DB));
        localStorage.setItem('mock_db_initialized_v5', 'true');
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
        record.id = 'MOCK_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    record.createdAt = new Date().toISOString();
    
    db[table].push(record);
    saveDB(db);
    
    // Ghi audit log
    dbCreateLog(record.user_id || record.created_by || "SYSTEM", "CREATE_" + table.toUpperCase(), `Tạo mới bản ghi trong bảng ${table} với ID: ${record.id}`);
    
    return record;
}

// Cập nhật bản ghi
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

// Xóa bản ghi
function dbDelete(table, id) {
    const db = getDB();
    const list = db[table] || [];
    const filtered = list.filter(item => item.id !== id);
    db[table] = filtered;
    saveDB(db);
    return true;
}

// Ghi audit log nhanh
function dbCreateLog(userId, actionType, details) {
    const db = getDB();
    const log = {
        id: 'LOG_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user_id: userId,
        action_type: actionType,
        details: details,
        createdAt: new Date().toISOString()
    };
    db.audit_logs.push(log);
    saveDB(db);
}

// Gọi khởi tạo DB
initMockDB();
