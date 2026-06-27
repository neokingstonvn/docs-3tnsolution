/**
 * Unified UAT Portal Logic - Task Kingston
 * Xử lý phân quyền động (RBAC), chuyển đổi 3 góc nhìn (Views) và tương tác CSDL LocalStorage.
 */

// Trạng thái ứng dụng (State)
let currentUser = null;
let currentRole = null;
let currentTab = 'view-projects';
let activeKanbanProject = 'all';
let activeDetailTask = null;
let currentViewStyle = 'kanban'; // kanban hoặc list

// Mẫu công việc chuẩn theo loại dự án
const PROJECT_TEMPLATES = {
    software: [
        { title: 'Thiết lập môi trường & Cấu hình CSDL', description: 'Cài đặt PostgreSQL, tạo schema DDL SQL và chạy seed data ban đầu.', priority: 'High', offsetDays: 3 },
        { title: 'Phát triển giao diện Frontend (UI/UX)', description: 'Xây dựng layout Dashboard, Kanban board và các màn hình UAT theo thiết kế Figma.', priority: 'High', offsetDays: 10 },
        { title: 'Xây dựng hệ thống API backend', description: 'Phát triển các endpoints API đồng bộ dự án, quản lý công việc và phân quyền RBAC.', priority: 'High', offsetDays: 10 },
        { title: 'Kiểm thử hệ thống & Viết tài liệu UAT', description: 'Tiến hành viết test cases, chạy thử nghiệm đầu cuối và bàn giao tài liệu nghiệm thu.', priority: 'Medium', offsetDays: 14 }
    ],
    marketing: [
        { title: 'Nghiên cứu thị trường và đối thủ cạnh tranh', description: 'Phân tích các đối thủ cùng phân khúc, định vị thương hiệu Kingston.', priority: 'High', offsetDays: 3 },
        { title: 'Thiết kế bộ Banner quảng cáo thương hiệu', description: 'Lên ý tưởng thiết kế các ấn phẩm truyền thông, kích thước banner sảnh và website.', priority: 'High', offsetDays: 7 },
        { title: 'Viết bài PR khai trương đăng báo', description: 'Soạn thảo nội dung PR đăng trên các báo điện tử lớn (VnExpress, Dân trí).', priority: 'Medium', offsetDays: 10 },
        { title: 'Lên kế hoạch ngân sách chạy Ads', description: 'Tối ưu hóa ngân sách các kênh Ads Facebook, Google và TikTok.', priority: 'Medium', offsetDays: 5 }
    ],
    interior: [
        { title: 'Khảo sát hiện trạng mặt bằng sảnh', description: 'Đo đạc diện tích thực tế tại sảnh chính, lập báo cáo kết cấu chịu lực.', priority: 'Medium', offsetDays: 2 },
        { title: 'Vẽ phối cảnh 3D nội thất chi tiết', description: 'Sử dụng SketchUp dựng thiết kế 3D không gian lễ tân và tiếp khách.', priority: 'High', offsetDays: 7 },
        { title: 'Dự toán chi phí vật tư thi công', description: 'Bóc tách khối lượng vật liệu, báo giá chi tiết gỗ, đá, hệ thống đèn chiếu sáng.', priority: 'Medium', offsetDays: 5 },
        { title: 'Nghiệm thu mặt bằng và bàn giao sảnh', description: 'Nghiệm thu chất lượng hoàn thiện công trình và lập biên bản bàn giao.', priority: 'High', offsetDays: 14 }
    ]
};

// DOM Elements
const userSwitcher = document.getElementById('user-switcher');
const currentUserAvatar = document.getElementById('current-user-avatar');
const activeRoleBadge = document.getElementById('active-role-badge');
const topTitle = document.getElementById('top-title');

// Sidebar nav buttons
const menuProjects = document.getElementById('menu-projects');
const menuKanban = document.getElementById('menu-kanban');
const menuApprovals = document.getElementById('menu-approvals');
const menuRbac = document.getElementById('menu-rbac');

// Notification elements
const btnNotiBell = document.getElementById('btn-noti-bell');
const notiCountBadge = document.getElementById('noti-count');
const notiDropdownBox = document.getElementById('noti-dropdown-box');
const notiListContainer = document.getElementById('noti-list-container');
const btnClearNoti = document.getElementById('btn-clear-noti');

// View panels
const panels = {
    'view-projects': document.getElementById('view-projects'),
    'view-kanban': document.getElementById('view-kanban'),
    'view-approvals': document.getElementById('view-approvals'),
    'view-rbac': document.getElementById('view-rbac')
};

// ============================================================================
// 1. KHỞI TẠO ỨNG DỤNG (INITIALIZATION)
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Load danh sách người dùng vào bộ switcher ở sidebar
    const users = dbFindAll('users');
    userSwitcher.innerHTML = '';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.full_name} (${user.role === 'Project Manager' ? 'PM' : user.role})`;
        userSwitcher.appendChild(option);
    });

    // 2. Lấy user đăng nhập cuối cùng hoặc mặc định là Admin
    let savedUserId = localStorage.getItem('uat_active_user_id');
    if (!savedUserId || !dbFindById('users', savedUserId)) {
        savedUserId = users[0].id; // Thường là Admin
    }
    userSwitcher.value = savedUserId;

    // 3. Đăng ký sự kiện chuyển người dùng
    userSwitcher.addEventListener('change', (e) => {
        switchUser(e.target.value);
    });

    // 4. Sự kiện chuyển đổi Tab điều hướng
    setupNavigation();

    // 5. Khởi động tài khoản hiện tại
    switchUser(savedUserId);

    // 6. Đăng ký các sự kiện form & tương tác nghiệp vụ
    setupBusinessEventListeners();
}

// Thiết lập sự kiện click menu sidebar
function setupNavigation() {
    const navItems = [
        { btn: menuProjects, id: 'view-projects', title: 'Thư mục Dự án' },
        { btn: menuKanban, id: 'view-kanban', title: 'Bảng Công Việc' },
        { btn: menuApprovals, id: 'view-approvals', title: 'Hàng Đợi Phê Duyệt' },
        { btn: menuRbac, id: 'view-rbac', title: 'Nhân Sự & Phân Quyền (RBAC)' }
    ];

    navItems.forEach(item => {
        if (item.btn) {
            item.btn.addEventListener('click', (e) => {
                e.preventDefault();
                switchTab(item.id, item.title);
            });
        }
    });

    // Toggle view Kanban / List
    const btnToggleKanban = document.getElementById('btn-toggle-kanban');
    const btnToggleList = document.getElementById('btn-toggle-list');
    
    if (btnToggleKanban && btnToggleList) {
        btnToggleKanban.addEventListener('click', () => {
            btnToggleKanban.classList.add('active');
            btnToggleList.classList.remove('active');
            currentViewStyle = 'kanban';
            document.getElementById('container-kanban-view').style.display = 'block';
            document.getElementById('container-list-view').style.display = 'none';
            renderKanbanTasks();
        });
        
        btnToggleList.addEventListener('click', () => {
            btnToggleList.classList.add('active');
            btnToggleKanban.classList.remove('active');
            currentViewStyle = 'list';
            document.getElementById('container-kanban-view').style.display = 'none';
            document.getElementById('container-list-view').style.display = 'block';
            renderListTasks();
        });
    }
}

// Chuyển tab hiển thị
function switchTab(tabId, title) {
    currentTab = tabId;
    topTitle.textContent = title;
    
    // Gỡ active cũ, thêm active mới
    document.querySelectorAll('.app-sidebar .nav-item').forEach(el => el.classList.remove('active'));
    
    const activeMenuBtn = document.getElementById(tabId.replace('view-', 'menu-'));
    if (activeMenuBtn) activeMenuBtn.classList.add('active');

    // Ẩn tất cả panels, hiển thị panel được chọn
    for (const key in panels) {
        if (panels[key]) {
            if (key === tabId) {
                panels[key].classList.add('active');
            } else {
                panels[key].classList.remove('active');
            }
        }
    }

    // Tải dữ liệu tương ứng của Tab
    refreshCurrentTabData();
}

function refreshCurrentTabData() {
    if (currentTab === 'view-projects') {
        renderProjectsView();
    } else if (currentTab === 'view-kanban') {
        renderKanbanView();
    } else if (currentTab === 'view-approvals') {
        renderApprovalsView();
    } else if (currentTab === 'view-rbac') {
        renderRBACView();
    }
}

// ============================================================================
// 2. XỬ LÝ CHUYỂN ĐỔI GÓC NHÌN DỰA TRÊN RBAC (ROLE SWITCHING)
// ============================================================================
function switchUser(userId) {
    const user = dbFindById('users', userId);
    if (!user) return;

    currentUser = user;
    currentRole = user.role; // Admin, Project Manager, Staff
    localStorage.setItem('uat_active_user_id', userId);

    // Cập nhật giao diện thông tin người dùng ở sidebar
    currentUserAvatar.textContent = getInitials(user.full_name);
    activeRoleBadge.textContent = `Vai trò: ${currentRole}`;

    // Cập nhật màu sắc chủ đạo của avatar dựa trên vai trò
    if (currentRole === 'Admin') {
        currentUserAvatar.style.background = 'var(--accent)'; // Indigo
        activeRoleBadge.className = 'status-badge badge-info';
    } else if (currentRole === 'Project Manager') {
        currentUserAvatar.style.background = 'var(--amber)'; // Amber
        activeRoleBadge.className = 'status-badge badge-warning';
    } else {
        currentUserAvatar.style.background = 'var(--green)'; // Green
        activeRoleBadge.className = 'status-badge badge-success';
    }

    // Cấu hình hiển thị menu điều hướng theo RBAC
    adjustMenuVisibility();

    // Reset bộ lọc Kanban dự án
    activeKanbanProject = 'all';

    // Đóng các dropdown & modal đang mở
    notiDropdownBox.classList.remove('show');
    closeAllModals();

    // Điều hướng đến Tab mặc định cho từng vai trò
    if (currentRole === 'Admin') {
        switchTab('view-projects', 'Thư mục Dự án');
    } else if (currentRole === 'Project Manager') {
        switchTab('view-projects', 'Thư mục Dự án');
    } else {
        switchTab('view-kanban', 'Bảng Công Việc Cá Nhân');
    }

    // Tải thông báo & đếm thông báo
    loadNotifications();
}

function adjustMenuVisibility() {
    // Admin thấy tất cả menu
    if (currentRole === 'Admin') {
        menuProjects.style.display = 'flex';
        menuKanban.style.display = 'flex';
        menuApprovals.style.display = 'flex';
        menuRbac.style.display = 'flex';
        
        document.getElementById('label-projects').textContent = 'Quản lý dự án';
        document.getElementById('label-kanban').textContent = 'Xem mọi task dự án';
        document.getElementById('label-approvals').textContent = 'Hàng đợi phê duyệt';
    } 
    // PM thấy Dự án, Kanban và Approvals, ẩn RBAC
    else if (currentRole === 'Project Manager') {
        menuProjects.style.display = 'flex';
        menuKanban.style.display = 'flex';
        menuApprovals.style.display = 'flex';
        menuRbac.style.display = 'none';

        document.getElementById('label-projects').textContent = 'Dự án quản lý';
        document.getElementById('label-kanban').textContent = 'Kanban & Giao việc';
        document.getElementById('label-approvals').textContent = 'Duyệt báo cáo Staff';
    } 
    // Staff thấy Dự án (chỉ xem) và Kanban (task cá nhân), ẩn Approvals & RBAC
    else {
        menuProjects.style.display = 'flex';
        menuKanban.style.display = 'flex';
        menuApprovals.style.display = 'none';
        menuRbac.style.display = 'none';

        document.getElementById('label-projects').textContent = 'Danh sách dự án';
        document.getElementById('label-kanban').textContent = 'Công việc cá nhân';
    }
}

// ============================================================================
// 3. TAB 1: THƯ MỤC DỰ ÁN & WIDGETS
// ============================================================================
function renderProjectsView() {
    const db = getDB();
    const projects = db.projects || [];
    const tasks = db.tasks || [];

    // 1. Tính toán các widget thống kê
    let visibleProjects = projects;
    if (currentRole === 'Project Manager') {
        visibleProjects = projects.filter(p => p.pm_id === currentUser.id);
    }
    
    // Đếm số task đang chạy và overdue
    let activeTasksCount = 0;
    let overdueTasksCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach(t => {
        // Kiểm tra xem task này có thuộc dự án hiển thị hay không
        const isProjectVisible = visibleProjects.some(p => p.id === t.project_id);
        
        // Với Staff, chỉ thống kê task được giao
        const isUserTask = currentRole !== 'Staff' || t.assignee_id === currentUser.id;

        if (isProjectVisible && isUserTask) {
            if (t.status !== 'Done') {
                activeTasksCount++;
                if (t.due_date && t.due_date < todayStr) {
                    overdueTasksCount++;
                }
            }
        }
    });

    document.getElementById('stat-total-projects').textContent = visibleProjects.length;
    document.getElementById('stat-active-tasks').textContent = activeTasksCount;
    document.getElementById('stat-overdue-tasks').textContent = overdueTasksCount;

    // 2. Xử lý hiển thị form tạo dự án mới (Chỉ dành cho Admin)
    const cardCreateProject = document.getElementById('card-create-project');
    if (currentRole === 'Admin') {
        cardCreateProject.style.display = 'block';
        // Tải danh sách PM vào select gán PM
        const pmSelect = document.getElementById('project-pm');
        pmSelect.innerHTML = '';
        const pms = dbFindAll('users').filter(u => u.role === 'Project Manager' || u.role === 'Admin');
        pms.forEach(pm => {
            const opt = document.createElement('option');
            opt.value = pm.id;
            opt.textContent = pm.full_name;
            pmSelect.appendChild(opt);
        });
    } else {
        cardCreateProject.style.display = 'none';
    }

    // 3. Render bảng danh sách dự án
    const tbody = document.getElementById('tbody-projects');
    tbody.innerHTML = '';

    // Lọc theo trạng thái dự án
    const filterStatus = document.getElementById('filter-project-status').value;
    let filteredProjects = visibleProjects;
    if (filterStatus !== 'all') {
        filteredProjects = visibleProjects.filter(p => p.status === filterStatus);
    }

    // Tiêu đề cột hành động (Chỉ Admin mới có nút thao tác đổi trạng thái dự án)
    const thAction = document.getElementById('th-project-action');
    if (currentRole === 'Admin') {
        thAction.style.display = 'table-cell';
    } else {
        thAction.style.display = 'none';
    }

    if (filteredProjects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${currentRole === 'Admin' ? 6 : 5}" style="text-align: center; color: var(--text-dim);">Chưa có dự án nào được ghi nhận.</td></tr>`;
        return;
    }

    filteredProjects.forEach(proj => {
        const pm = dbFindById('users', proj.pm_id);
        const progress = getProjectProgress(proj.id);
        
        let statusBadgeClass = 'badge-info';
        if (proj.status === 'On Hold') statusBadgeClass = 'badge-warning';
        if (proj.status === 'Completed') statusBadgeClass = 'badge-success';

        const tr = document.createElement('tr');
        
        // Cột Hành động thay đổi trạng thái (chỉ hiện cho Admin)
        let actionCell = '';
        if (currentRole === 'Admin') {
            actionCell = `
                <td>
                    <select class="form-control" style="font-size:0.75rem; padding:2px;" onchange="updateProjectStatus('${proj.id}', this.value)">
                        <option value="Active" ${proj.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="On Hold" ${proj.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                        <option value="Completed" ${proj.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
            `;
        }

        tr.innerHTML = `
            <td><strong style="color:var(--text);">${proj.name}</strong></td>
            <td style="font-size: 0.8rem; color: var(--text-dim); max-width: 250px;">${proj.description}</td>
            <td><span style="font-weight: 500;">${pm ? pm.full_name : 'Chưa có'}</span></td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex-grow:1; background: var(--border); height:6px; border-radius:3px; overflow:hidden; width:80px;">
                        <div style="background: var(--accent); height: 100%; width: ${progress}%"></div>
                    </div>
                    <span style="font-size:0.75rem; font-weight:700;">${progress}%</span>
                </div>
            </td>
            <td><span class="status-badge ${statusBadgeClass}">${proj.status}</span></td>
            ${actionCell}
        `;
        tbody.appendChild(tr);
    });
}

// Cập nhật trạng thái dự án (Admin gọi từ select trong bảng)
window.updateProjectStatus = function(projectId, newStatus) {
    if (currentRole !== 'Admin') return;
    
    const proj = dbFindById('projects', projectId);
    if (!proj) return;

    dbUpdate('projects', projectId, { status: newStatus });
    
    // Nếu chuyển sang Completed, tự động ghi logs và tạo thông báo cho PM
    if (newStatus === 'Completed') {
        sendNotification(proj.pm_id, `Dự án '${proj.name}' đã hoàn thành! Trạng thái các task chưa xong đã bị đóng băng.`);
    }

    showToast(`Đã chuyển trạng thái dự án sang ${newStatus}!`);
    renderProjectsView();
};

// ============================================================================
// 4. TAB 2: KANBAN & TASK MANAGEMENT
// ============================================================================
function renderKanbanView() {
    const db = getDB();
    const projects = db.projects || [];
    const filterKanbanProject = document.getElementById('filter-kanban-project');

    // 1. Cấu hình form giao việc (card-create-task)
    const cardCreateTask = document.getElementById('card-create-task');
    if (currentRole === 'Admin' || currentRole === 'Project Manager') {
        cardCreateTask.style.display = 'block';

        // Điền danh sách dự án vào form giao việc dựa trên quyền quản lý
        const taskProjectSelect = document.getElementById('task-project');
        taskProjectSelect.innerHTML = '';
        
        const managedProjects = projects.filter(p => currentRole === 'Admin' || p.pm_id === currentUser.id);
        managedProjects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            taskProjectSelect.appendChild(opt);
        });

        // Điền danh sách Staff vào form giao việc
        const taskAssigneeSelect = document.getElementById('task-assignee');
        taskAssigneeSelect.innerHTML = '<option value="">-- Chọn nhân viên thực hiện --</option>';
        const staffs = dbFindAll('users').filter(u => u.role === 'Staff');
        staffs.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.full_name;
            taskAssigneeSelect.appendChild(opt);
        });
    } else {
        cardCreateTask.style.display = 'none';
    }

    // 2. Điền danh sách dự án vào Dropdown Bộ lọc Kanban
    filterKanbanProject.innerHTML = '';
    
    // Lọc danh sách dự án mà user có liên quan
    let availableProjects = projects;
    if (currentRole === 'Project Manager') {
        availableProjects = projects.filter(p => p.pm_id === currentUser.id);
    }

    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = currentRole === 'Project Manager' ? 'Tất cả dự án quản lý' : 'Tất cả dự án';
    filterKanbanProject.appendChild(allOpt);

    availableProjects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        filterKanbanProject.appendChild(opt);
    });

    filterKanbanProject.value = activeKanbanProject;

    // Lắng nghe thay đổi bộ lọc dự án
    filterKanbanProject.onchange = (e) => {
        activeKanbanProject = e.target.value;
        renderTasks();
    };

    // 3. Render danh sách các Tasks
    renderTasks();
}

function renderTasks() {
    if (currentViewStyle === 'kanban') {
        renderKanbanTasks();
    } else {
        renderListTasks();
    }
}

// Lấy danh sách task được lọc theo phân quyền và bộ lọc dự án
function getFilteredTasks() {
    const db = getDB();
    let tasks = db.tasks || [];
    
    // Lọc theo dự án được chọn
    if (activeKanbanProject !== 'all') {
        tasks = tasks.filter(t => t.project_id === activeKanbanProject);
    } else {
        // Nếu chọn "Tất cả dự án", với PM thì chỉ hiện task của các dự án PM đó quản lý
        if (currentRole === 'Project Manager') {
            const managedProjIds = (db.projects || []).filter(p => p.pm_id === currentUser.id).map(p => p.id);
            tasks = tasks.filter(t => managedProjIds.includes(t.project_id));
        }
    }

    // Phân quyền nâng cao: Staff chỉ nhìn thấy task được giao cho chính họ
    if (currentRole === 'Staff') {
        tasks = tasks.filter(t => t.assignee_id === currentUser.id);
    }

    return tasks;
}

// Render giao diện Kanban
function renderKanbanTasks() {
    const tasks = getFilteredTasks();
    
    const lists = {
        'To Do': document.getElementById('kanban-todo-list'),
        'In Progress': document.getElementById('kanban-inprogress-list'),
        'Reviewing': document.getElementById('kanban-reviewing-list'),
        'Done': document.getElementById('kanban-done-list')
    };

    // Reset danh sách
    for (const key in lists) {
        if (lists[key]) lists[key].innerHTML = '';
    }

    const counts = { 'To Do': 0, 'In Progress': 0, 'Reviewing': 0, 'Done': 0 };
    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach(task => {
        const assignee = dbFindById('users', task.assignee_id);
        const project = dbFindById('projects', task.project_id);
        
        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `card-${task.id}`;
        
        // Kiểm tra quá hạn
        const isOverdue = task.status !== 'Done' && task.due_date && task.due_date < todayStr;
        if (isOverdue) {
            card.classList.add('overdue');
        }

        // Ưu tiên badge
        let pColor = 'var(--text-dim)';
        if (task.priority === 'High') pColor = 'var(--red)';
        if (task.priority === 'Medium') pColor = 'var(--amber)';

        card.innerHTML = `
            <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">${project ? project.name : 'Không có'}</span>
            <h4 style="margin: 0.25rem 0; font-size: 0.85rem; font-weight: 700; line-height: 1.3;">${task.title}</h4>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; font-size: 0.72rem;">
                <span style="color: ${pColor}; font-weight: 700;">● ${task.priority}</span>
                <span style="color: var(--text-dim);">Due: ${task.due_date || 'N/A'}</span>
            </div>
            <div style="border-top: 1px solid var(--border); margin-top: 0.5rem; padding-top: 0.4rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.7rem; color: var(--text-dim);">
                <span>👤 ${assignee ? assignee.full_name : 'Chưa phân công'}</span>
            </div>
        `;

        // Click để xem chi tiết task
        card.addEventListener('click', () => {
            showTaskDetailModal(task.id);
        });

        // Thiết lập kéo thả (Chỉ PM/Admin được drag)
        if (currentRole === 'Admin' || currentRole === 'Project Manager') {
            card.setAttribute('draggable', 'true');
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', task.id);
                card.style.opacity = '0.5';
            });
            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
            });
        }

        if (lists[task.status]) {
            lists[task.status].appendChild(card);
            counts[task.status]++;
        }
    });

    // Cập nhật count badge trên đầu cột
    document.getElementById('count-todo').textContent = counts['To Do'];
    document.getElementById('count-inprogress').textContent = counts['In Progress'];
    document.getElementById('count-reviewing').textContent = counts['Reviewing'];
    document.getElementById('count-done').textContent = counts['Done'];

    // Thiết lập vùng nhận Drop (PM/Admin)
    if (currentRole === 'Admin' || currentRole === 'Project Manager') {
        setupDragAndDropHandlers();
    }
}

// Cấu hình dragover và drop cho các cột Kanban
function setupDragAndDropHandlers() {
    const columns = [
        { id: 'col-todo', status: 'To Do' },
        { id: 'col-inprogress', status: 'In Progress' },
        { id: 'col-reviewing', status: 'Reviewing' },
        { id: 'col-done', status: 'Done' }
    ];

    columns.forEach(col => {
        const el = document.getElementById(col.id);
        if (!el) return;

        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.style.background = 'rgba(79, 70, 229, 0.02)';
        });

        el.style.transition = 'background 0.2s';
        
        el.addEventListener('dragleave', () => {
            el.style.background = '';
        });

        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.style.background = '';
            
            const taskId = e.dataTransfer.getData('text/plain');
            if (taskId) {
                const task = dbFindById('tasks', taskId);
                
                // Nếu dự án đã Completed, không cho sửa trạng thái
                if (task) {
                    const project = dbFindById('projects', task.project_id);
                    if (project && project.status === 'Completed') {
                        showToast('Dự án đã hoàn thành! Bảng công việc bị đóng băng.', '❌');
                        return;
                    }

                    // Nếu PM kéo thả, kiểm tra xem họ có quyền quản lý dự án đó không
                    if (currentRole === 'Project Manager' && project.pm_id !== currentUser.id) {
                        showToast('Bạn chỉ có quyền kéo thả trong dự án mình phụ trách!', '❌');
                        return;
                    }

                    // Kéo thả thay đổi trạng thái
                    updateTaskStatus(taskId, col.status);
                }
            }
        });
    });
}

// Hàm đổi trạng thái task chung (Log hoạt động & notify)
function updateTaskStatus(taskId, newStatus, reportText = '', reportLink = '') {
    const task = dbFindById('tasks', taskId);
    if (!task) return;

    const oldStatus = task.status;
    if (oldStatus === newStatus) return;

    // Cập nhật DB
    dbUpdate('tasks', taskId, { status: newStatus });
    
    // Ghi Log hoạt động
    createActivityLog(taskId, currentUser.id, `Đã chuyển trạng thái từ '${oldStatus}' sang '${newStatus}'`);

    // Gửi thông báo
    const project = dbFindById('projects', task.project_id);
    
    if (newStatus === 'Reviewing') {
        // Staff nộp báo cáo hoàn thành -> gửi thông báo cho PM và Admin
        const request = dbCreate('approval_requests', {
            task_id: taskId,
            submitter_id: currentUser.id,
            report_text: reportText,
            report_link: reportLink,
            approver_id: '',
            status: 'Pending',
            feedback: ''
        });

        if (project) {
            sendNotification(project.pm_id, `Nhân viên ${currentUser.full_name} đã nộp báo cáo duyệt task '${task.title}'`);
        }
    } else if (newStatus === 'Done') {
        // PM phê duyệt duyệt -> gửi thông báo cho Staff thực hiện
        if (task.assignee_id) {
            sendNotification(task.assignee_id, `Nhiệm vụ '${task.title}' của bạn đã được phê duyệt sang trạng thái Done!`);
        }
    } else if (newStatus === 'In Progress' && oldStatus === 'Reviewing') {
        // PM từ chối duyệt task -> chuyển lại In Progress
        if (task.assignee_id) {
            sendNotification(task.assignee_id, `Yêu cầu phê duyệt cho task '${task.title}' đã bị từ chối. Vui lòng kiểm tra phản hồi.`);
        }
    }

    showToast(`Đã chuyển trạng thái task sang ${newStatus}!`);
    renderTasks();
}

// Render giao diện List View
function renderListTasks() {
    const tasks = getFilteredTasks();
    const tbody = document.getElementById('tbody-tasks-list');
    tbody.innerHTML = '';

    if (tasks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-dim);">Không tìm thấy nhiệm vụ nào phù hợp.</td></tr>`;
        return;
    }

    tasks.forEach(task => {
        const project = dbFindById('projects', task.project_id);
        const assignee = dbFindById('users', task.assignee_id);
        
        let statusBadge = 'badge-info';
        if (task.status === 'In Progress') statusBadge = 'badge-warning';
        if (task.status === 'Reviewing') statusBadge = 'badge-indigo';
        if (task.status === 'Done') statusBadge = 'badge-success';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code style="font-size:0.75rem;">${task.id}</code></td>
            <td><strong>${task.title}</strong></td>
            <td><span style="font-size: 0.8rem;">${project ? project.name : 'N/A'}</span></td>
            <td><span style="font-size: 0.8rem;">${assignee ? assignee.full_name : 'Chưa phân công'}</span></td>
            <td><span style="font-weight:600;">${task.priority}</span></td>
            <td><span style="font-size: 0.8rem;">${task.due_date || 'N/A'}</span></td>
            <td><span class="status-badge ${statusBadge}">${task.status}</span></td>
            <td><button class="btn btn-secondary" style="font-size:0.75rem; padding: 2px 8px;" onclick="showTaskDetailModal('${task.id}')">Xem chi tiết</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================================
// 5. MODAL CHI TIẾT CÔNG VIỆC (TASK DETAIL MODAL)
// ============================================================================
window.showTaskDetailModal = function(taskId) {
    const task = dbFindById('tasks', taskId);
    if (!task) return;

    activeDetailTask = task;
    const project = dbFindById('projects', task.project_id);
    const creator = dbFindById('users', project ? project.pm_id : '');

    // Cập nhật tiêu đề & nội dung modal
    document.getElementById('td-modal-title').textContent = `Chi tiết: ${task.title}`;
    document.getElementById('td-modal-project-label').textContent = project ? project.name : 'N/A';
    document.getElementById('td-modal-status-badge').textContent = task.status;
    
    // Gán class màu cho status badge
    let statusClass = 'badge-info';
    if (task.status === 'In Progress') statusClass = 'badge-warning';
    if (task.status === 'Reviewing') statusClass = 'badge-indigo';
    if (task.status === 'Done') statusClass = 'badge-success';
    document.getElementById('td-modal-status-badge').className = `status-badge ${statusClass}`;

    // Cài đặt Form Edit Task
    const editTitle = document.getElementById('td-edit-title');
    const editDesc = document.getElementById('td-edit-desc');
    const editAssigneeSelect = document.getElementById('td-edit-assignee');
    const editPrioritySelect = document.getElementById('td-edit-priority');
    const editDueDateInput = document.getElementById('td-edit-due-date');

    editTitle.value = task.title;
    editDesc.value = task.description || '';
    editPrioritySelect.value = task.priority;
    editDueDateInput.value = task.due_date || '';

    // Load danh sách Assignee vào modal sửa
    editAssigneeSelect.innerHTML = '<option value="">Chưa phân công</option>';
    const staffs = dbFindAll('users').filter(u => u.role === 'Staff');
    staffs.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.full_name;
        editAssigneeSelect.appendChild(opt);
    });
    editAssigneeSelect.value = task.assignee_id || '';

    // Kiểm tra quyền chỉnh sửa của user hiện tại (PM dự án hoặc Admin)
    const isProjectManagerOfThis = project && project.pm_id === currentUser.id;
    const canEdit = currentRole === 'Admin' || (currentRole === 'Project Manager' && isProjectManagerOfThis);

    if (canEdit && project.status !== 'Completed') {
        // Cho phép sửa các trường dữ liệu
        editTitle.disabled = false;
        editDesc.disabled = false;
        editAssigneeSelect.disabled = false;
        editPrioritySelect.disabled = false;
        editDueDateInput.disabled = false;
        
        // Hiện nút Lưu thay đổi
        document.getElementById('td-edit-actions').style.display = 'flex';
        
        // Ẩn các label tĩnh
        document.getElementById('td-modal-assignee-label').style.display = 'none';
        document.getElementById('td-modal-priority-label').style.display = 'none';
        document.getElementById('td-modal-due-date-label').style.display = 'none';
    } else {
        // Không cho phép sửa
        editTitle.disabled = true;
        editDesc.disabled = true;
        editAssigneeSelect.disabled = true;
        editPrioritySelect.disabled = true;
        editDueDateInput.disabled = true;
        
        // Ẩn nút lưu thay đổi
        document.getElementById('td-edit-actions').style.display = 'none';

        // Hiển thị các label tĩnh
        const assignee = dbFindById('users', task.assignee_id);
        const assigneeLabel = document.getElementById('td-modal-assignee-label');
        assigneeLabel.textContent = assignee ? assignee.full_name : 'Chưa phân công';
        assigneeLabel.style.display = 'block';
        editAssigneeSelect.style.display = 'none';

        const priorityLabel = document.getElementById('td-modal-priority-label');
        priorityLabel.textContent = task.priority;
        priorityLabel.style.display = 'block';
        editPrioritySelect.style.display = 'none';

        const dueDateLabel = document.getElementById('td-modal-due-date-label');
        dueDateLabel.textContent = task.due_date || 'N/A';
        dueDateLabel.style.display = 'block';
        editDueDateInput.style.display = 'none';
    }

    // Xử lý hiển thị panel Hành động của Staff
    const staffActionBlock = document.getElementById('td-staff-action-block');
    const lockedMessage = document.getElementById('td-locked-status-message');
    const isAssignee = task.assignee_id === currentUser.id;

    if (currentRole === 'Staff' && isAssignee && project.status !== 'Completed') {
        staffActionBlock.style.display = 'flex';
        lockedMessage.style.display = 'none';

        const btnStartWork = document.getElementById('btn-start-work');
        const btnOpenSubmit = document.getElementById('btn-open-submit-approval');

        if (task.status === 'To Do') {
            btnStartWork.style.display = 'block';
            btnOpenSubmit.style.display = 'none';
        } else if (task.status === 'In Progress') {
            btnStartWork.style.display = 'none';
            btnOpenSubmit.style.display = 'block';
        } else {
            // Reviewing hoặc Done
            staffActionBlock.style.display = 'none';
            lockedMessage.style.display = 'block';
        }
    } else {
        staffActionBlock.style.display = 'none';
        lockedMessage.style.display = 'none';
        
        if (project && project.status === 'Completed') {
            lockedMessage.textContent = '🔒 Dự án đã hoàn thành, mọi công việc đã bị đóng băng.';
            lockedMessage.style.display = 'block';
        }
    }

    // Xử lý hiển thị panel Phê duyệt (Approve/Reject) của PM/Admin
    const approverDecisionBlock = document.getElementById('td-approver-decision-block');
    if (canEdit && task.status === 'Reviewing') {
        // Tìm request phê duyệt tương ứng
        const requests = dbFindAll('approval_requests').filter(r => r.task_id === task.id && r.status === 'Pending');
        if (requests.length > 0) {
            const req = requests[requests.length - 1]; // Lấy request mới nhất
            document.getElementById('td-decision-report-text').textContent = req.report_text;
            
            const reqLink = document.getElementById('td-decision-report-link');
            if (req.report_link) {
                reqLink.href = req.report_link;
                reqLink.style.display = 'inline-block';
            } else {
                reqLink.style.display = 'none';
            }
            
            document.getElementById('td-decision-feedback').value = '';
            approverDecisionBlock.style.display = 'block';
        } else {
            approverDecisionBlock.style.display = 'none';
        }
    } else {
        approverDecisionBlock.style.display = 'none';
    }

    // Tải Bình luận & Activity Logs
    renderCommentsList(task.id);
    renderLogsList(task.id);

    // Mở Modal Overlay
    document.getElementById('task-detail-modal').style.display = 'flex';
};

// ============================================================================
// 6. XỬ LÝ BÌNH LUẬN & LOGS HOẠT ĐỘNG
// ============================================================================
function renderCommentsList(taskId) {
    const db = getDB();
    const comments = (db.comments || []).filter(c => c.task_id === taskId);
    const container = document.getElementById('td-comments-list');
    container.innerHTML = '';

    if (comments.length === 0) {
        container.innerHTML = '<div style="font-size:0.75rem; color:var(--text-dim); text-align:center; padding:1rem 0;">Chưa có bình luận nào.</div>';
        return;
    }

    comments.forEach(c => {
        const author = dbFindById('users', c.user_id);
        const div = document.createElement('div');
        div.style.background = 'var(--bg)';
        div.style.border = '1px solid var(--border)';
        div.style.padding = '0.4rem 0.6rem';
        div.style.borderRadius = '0.35rem';
        div.style.fontSize = '0.78rem';
        
        const dateFormatted = new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date(c.createdAt).toLocaleDateString();

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
                <span style="font-weight:700; color:var(--accent);">${author ? author.full_name : 'Người dùng hệ thống'}</span>
                <span style="font-size:0.65rem; color:var(--text-dim);">${dateFormatted}</span>
            </div>
            <p style="color:var(--text); line-height:1.4;">${c.content}</p>
        `;
        container.appendChild(div);
    });
    // Auto scroll xuống đáy comments
    container.scrollTop = container.scrollHeight;
}

function renderLogsList(taskId) {
    const db = getDB();
    const logs = (db.activity_logs || []).filter(l => l.task_id === taskId);
    const container = document.getElementById('td-logs-list');
    container.innerHTML = '';

    if (logs.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:1rem 0;">Chưa có nhật ký hoạt động nào.</div>';
        return;
    }

    // Sắp xếp logs từ mới nhất đến cũ nhất
    logs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    logs.forEach(l => {
        const user = dbFindById('users', l.user_id);
        const div = document.createElement('div');
        div.style.padding = '0.2rem 0';
        div.style.borderBottom = '1px dashed var(--border)';
        
        const timeStr = new Date(l.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        div.innerHTML = `
            <span>🕒 ${timeStr} - <strong>${user ? user.full_name : 'Hệ thống'}</strong>: ${l.action}</span>
        `;
        container.appendChild(div);
    });
}

// Chuyển tab trong modal (Comments vs Logs)
const tabBtnComments = document.getElementById('tab-btn-comments');
const tabBtnLogs = document.getElementById('tab-btn-logs');
const tdPanelComments = document.getElementById('td-panel-comments');
const tdPanelLogs = document.getElementById('td-panel-logs');

if (tabBtnComments && tabBtnLogs) {
    tabBtnComments.onclick = () => {
        tabBtnComments.style.color = 'var(--accent)';
        tabBtnComments.style.borderBottom = '2px solid var(--accent)';
        tabBtnLogs.style.color = 'var(--text-dim)';
        tabBtnLogs.style.borderBottom = 'none';
        
        tdPanelComments.style.display = 'block';
        tdPanelLogs.style.display = 'none';
    };

    tabBtnLogs.onclick = () => {
        tabBtnLogs.style.color = 'var(--accent)';
        tabBtnLogs.style.borderBottom = '2px solid var(--accent)';
        tabBtnComments.style.color = 'var(--text-dim)';
        tabBtnComments.style.borderBottom = 'none';
        
        tdPanelComments.style.display = 'none';
        tdPanelLogs.style.display = 'block';
    };
}

// ============================================================================
// 7. TAB 3: HÀNG ĐỢI PHÊ DUYỆT (APPROVAL QUEUE)
// ============================================================================
function renderApprovalsView() {
    const db = getDB();
    const requests = db.approval_requests || [];
    const tbody = document.getElementById('tbody-approvals');
    tbody.innerHTML = '';

    // Lấy các request đang trạng thái Pending
    let pendingRequests = requests.filter(r => r.status === 'Pending');

    // Nếu vai trò là PM, chỉ hiển thị task thuộc dự án mà PM đó quản lý
    if (currentRole === 'Project Manager') {
        const managedProjectIds = (db.projects || []).filter(p => p.pm_id === currentUser.id).map(p => p.id);
        pendingRequests = pendingRequests.filter(r => {
            const task = dbFindById('tasks', r.task_id);
            return task && managedProjectIds.includes(task.project_id);
        });
    }

    document.getElementById('approvals-desc').textContent = currentRole === 'Admin' 
        ? 'Ban giám đốc phê duyệt chất lượng hoàn thành của mọi nhân sự.' 
        : 'Kiểm duyệt báo cáo hoàn thành công việc của nhân sự trong các dự án của bạn.';

    if (pendingRequests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">Hàng đợi phê duyệt trống. Không có công việc nào chờ kiểm duyệt.</td></tr>`;
        return;
    }

    pendingRequests.forEach(req => {
        const task = dbFindById('tasks', req.task_id);
        const project = task ? dbFindById('projects', task.project_id) : null;
        const staff = dbFindById('users', req.submitter_id);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${task ? task.title : 'N/A'}</strong></td>
            <td><span style="font-size: 0.8rem;">${project ? project.name : 'N/A'}</span></td>
            <td><span style="font-size: 0.8rem;">${staff ? staff.full_name : 'Staff'}</span></td>
            <td><p style="font-size: 0.78rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin:0;" title="${req.report_text}">${req.report_text}</p></td>
            <td><a href="${req.report_link}" target="_blank" style="color:var(--accent); font-size:0.75rem; font-weight:700;">Xem tài liệu ➔</a></td>
            <td>
                <button class="btn btn-primary" style="font-size: 0.72rem; padding: 2px 8px; background:var(--accent);" onclick="showTaskDetailModal('${req.task_id}')">Duyệt việc</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// PM / Admin Phê duyệt hoặc Từ chối hoàn thành
function submitApproverDecision(approve = true) {
    if (!activeDetailTask) return;
    
    const feedback = document.getElementById('td-decision-feedback').value.trim();
    if (!approve && !feedback) {
        showToast('Bắt buộc phải nhập phản hồi khi từ chối phê duyệt!', '⚠️');
        return;
    }

    const db = getDB();
    const requests = (db.approval_requests || []).filter(r => r.task_id === activeDetailTask.id && r.status === 'Pending');
    if (requests.length === 0) return;

    const req = requests[requests.length - 1];
    
    // Cập nhật trạng thái Yêu cầu phê duyệt
    dbUpdate('approval_requests', req.id, {
        status: approve ? 'Approved' : 'Rejected',
        feedback: feedback || (approve ? 'Phê duyệt hoàn thành.' : ''),
        approver_id: currentUser.id
    });

    // Cập nhật trạng thái Task và log hoạt động
    const finalStatus = approve ? 'Done' : 'In Progress';
    dbUpdate('tasks', activeDetailTask.id, { status: finalStatus });

    const decisionText = approve ? 'Phê duyệt hoàn thành công việc' : 'Từ chối phê duyệt công việc (Yêu cầu làm lại)';
    createActivityLog(activeDetailTask.id, currentUser.id, `${decisionText}. Phản hồi: ${feedback || 'N/A'}`);

    // Gửi thông báo cho Staff
    sendNotification(
        activeDetailTask.assignee_id, 
        `Yêu cầu phê duyệt task '${activeDetailTask.title}' đã bị ${approve ? 'ĐỒNG Ý' : 'TỪ CHỐI'} bởi ${currentUser.full_name}`
    );

    showToast(approve ? 'Đã phê duyệt công việc!' : 'Đã trả về yêu cầu chỉnh sửa!');
    closeAllModals();
    refreshCurrentTabData();
}

// ============================================================================
// 8. TAB 4: DANH BẠ NHÂN SỰ & PHÂN QUYỀN RBAC (ADMIN ONLY)
// ============================================================================
function renderRBACView() {
    if (currentRole !== 'Admin') return;

    const users = dbFindAll('users');
    const tbody = document.getElementById('tbody-rbac');
    tbody.innerHTML = '';

    users.forEach(user => {
        const isSelf = user.id === currentUser.id;
        const tr = document.createElement('tr');
        
        // Tạo dropdown thay đổi quyền
        const selectHTML = isSelf 
            ? `<span class="status-badge badge-info" style="font-weight:700;">Admin tối cao (Chính bạn)</span>` 
            : `
                <select class="form-control" style="font-size:0.8rem; padding: 2px 6px;" onchange="updateUserRole('${user.id}', this.value)">
                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                    <option value="Project Manager" ${user.role === 'Project Manager' ? 'selected' : ''}>Project Manager</option>
                    <option value="Staff" ${user.role === 'Staff' ? 'selected' : ''}>Staff</option>
                </select>
            `;

        let roleBadgeClass = 'badge-info';
        if (user.role === 'Project Manager') roleBadgeClass = 'badge-warning';
        if (user.role === 'Staff') roleBadgeClass = 'badge-success';

        tr.innerHTML = `
            <td><strong>${user.full_name}</strong></td>
            <td><code style="font-size:0.75rem;">${user.email}</code></td>
            <td><span class="status-badge ${roleBadgeClass}">${user.role}</span></td>
            <td>${selectHTML}</td>
        `;
        tbody.appendChild(tr);
    });
}

window.updateUserRole = function(userId, newRole) {
    if (currentRole !== 'Admin') return;
    
    const user = dbFindById('users', userId);
    if (!user) return;

    // Cập nhật CSDL
    dbUpdate('users', userId, { role: newRole });

    showToast(`Đã thay đổi vai trò của ${user.full_name} thành ${newRole}`);
    
    // Nạp lại danh sách RBAC
    renderRBACView();
};

// ============================================================================
// 9. THÔNG BÁO MOCK (NOTIFICATIONS)
// ============================================================================
function loadNotifications() {
    const db = getDB();
    const notifications = (db.notifications || []).filter(n => n.user_id === currentUser.id);
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Đếm số lượng để ẩn/hiển thị badge chuông 🔔
    if (unreadCount > 0) {
        notiCountBadge.textContent = unreadCount;
        notiCountBadge.style.display = 'flex';
    } else {
        notiCountBadge.style.display = 'none';
    }

    // Render danh sách trong dropdown
    notiListContainer.innerHTML = '';
    
    if (notifications.length === 0) {
        notiListContainer.innerHTML = '<div class="noti-empty">Bạn chưa có thông báo nào.</div>';
        return;
    }

    // Sắp xếp thông báo mới nhất ở trên
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    notifications.forEach(n => {
        const item = document.createElement('div');
        item.className = `noti-item ${n.read ? '' : 'unread'}`;
        
        const timeStr = new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date(n.createdAt).toLocaleDateString([], {month: 'numeric', day: 'numeric'});

        item.innerHTML = `
            <div>${n.text}</div>
            <div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px;">${timeStr}</div>
        `;
        
        // Click thông báo để đánh dấu đã đọc
        item.addEventListener('click', () => {
            if (!n.read) {
                dbUpdate('notifications', n.id, { read: true });
                loadNotifications();
            }
        });

        notiListContainer.appendChild(item);
    });
}

// Sự kiện bấm chuông thông báo
if (btnNotiBell) {
    btnNotiBell.addEventListener('click', (e) => {
        e.stopPropagation();
        notiDropdownBox.classList.toggle('show');
    });

    // Đóng dropdown thông báo nếu bấm ra ngoài trang
    document.addEventListener('click', () => {
        notiDropdownBox.classList.remove('show');
    });

    notiDropdownBox.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn click bên trong dropdown làm đóng box
    });
}

// Bấm đọc tất cả thông báo
if (btnClearNoti) {
    btnClearNoti.addEventListener('click', () => {
        const db = getDB();
        const myNotis = (db.notifications || []).filter(n => n.user_id === currentUser.id && !n.read);
        myNotis.forEach(n => {
            dbUpdate('notifications', n.id, { read: true });
        });
        showToast('Đã đánh dấu đọc tất cả thông báo!');
        loadNotifications();
    });
}

// ============================================================================
// 10. FORM SUBMISSION & BUSINESS HANDLERS
// ============================================================================
function setupBusinessEventListeners() {
    
    // 1. Tạo dự án mới (Admin)
    const formCreateProject = document.getElementById('form-create-project');
    if (formCreateProject) {
        formCreateProject.addEventListener('submit', (e) => {
            e.preventDefault();
            if (currentRole !== 'Admin') return;

            const name = document.getElementById('project-name').value.trim();
            const pmId = document.getElementById('project-pm').value;
            const desc = document.getElementById('project-desc').value.trim();
            const templateKey = document.getElementById('project-template').value;

            const record = dbCreate('projects', {
                name: name,
                description: desc,
                pm_id: pmId,
                status: 'Active'
            });

            // Tự động tạo task theo template nếu có chọn
            if (templateKey && templateKey !== 'none' && PROJECT_TEMPLATES[templateKey]) {
                const today = new Date();
                PROJECT_TEMPLATES[templateKey].forEach(t => {
                    const due = new Date();
                    due.setDate(today.getDate() + t.offsetDays);
                    const dueStr = due.toISOString().split('T')[0];

                    const taskRecord = dbCreate('tasks', {
                        project_id: record.id,
                        title: t.title,
                        description: t.description,
                        assignee_id: '', // Mặc định chưa phân công để PM tự giao việc
                        priority: t.priority,
                        due_date: dueStr,
                        status: 'To Do'
                    });

                    // Ghi activity log tự động
                    createActivityLog(taskRecord.id, currentUser.id, `Nhiệm vụ được tạo tự động từ mẫu dự án '${templateKey}'`);
                });
            }

            // Log hoạt động cho Admin
            sendNotification(pmId, `Bạn đã được gán làm PM cho dự án mới: '${name}'`);

            showToast(`Khởi tạo dự án '${name}' thành công!`);
            formCreateProject.reset();
            renderProjectsView();
        });
    }

    // 2. PM / Admin Tạo nhiệm vụ mới (Task)
    const formCreateTask = document.getElementById('form-create-task');
    if (formCreateTask) {
        formCreateTask.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const projectId = document.getElementById('task-project').value;
            const assigneeId = document.getElementById('task-assignee').value;
            const title = document.getElementById('task-title').value.trim();
            const priority = document.getElementById('task-priority').value;
            const dueDate = document.getElementById('task-due-date').value;
            const desc = document.getElementById('task-desc').value.trim();

            const project = dbFindById('projects', projectId);
            if (project && project.status === 'Completed') {
                showToast('Dự án đã đóng! Không thể giao việc mới.', '❌');
                return;
            }

            const record = dbCreate('tasks', {
                project_id: projectId,
                title: title,
                description: desc,
                assignee_id: assigneeId,
                priority: priority,
                due_date: dueDate,
                status: 'To Do'
            });

            // Ghi nhận log & notify
            createActivityLog(record.id, currentUser.id, `Đã khởi tạo công việc và phân công cho nhân sự.`);
            
            if (assigneeId) {
                sendNotification(assigneeId, `Bạn được giao công việc mới: '${title}' trong dự án '${project ? project.name : 'N/A'}'`);
            }

            showToast('Đã tạo và giao việc thành công!');
            formCreateTask.reset();
            renderTasks();
        });
    }

    // 3. PM / Admin Lưu chỉnh sửa chi tiết công việc
    const formEditTask = document.getElementById('form-edit-task');
    if (formEditTask) {
        formEditTask.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeDetailTask) return;

            const project = dbFindById('projects', activeDetailTask.project_id);
            if (project && project.status === 'Completed') {
                showToast('Dự án đã kết thúc, không thể thay đổi thông tin.', '❌');
                return;
            }

            const newTitle = document.getElementById('td-edit-title').value.trim();
            const newDesc = document.getElementById('td-edit-desc').value.trim();
            const newAssigneeId = document.getElementById('td-edit-assignee').value;
            const newPriority = document.getElementById('td-edit-priority').value;
            const newDueDate = document.getElementById('td-edit-due-date').value;

            const oldAssigneeId = activeDetailTask.assignee_id;

            // Cập nhật DB
            dbUpdate('tasks', activeDetailTask.id, {
                title: newTitle,
                description: newDesc,
                assignee_id: newAssigneeId,
                priority: newPriority,
                due_date: newDueDate
            });

            // Log hoạt động
            let actionLog = 'Cập nhật nội dung mô tả / hạn chót / ưu tiên của công việc.';
            if (oldAssigneeId !== newAssigneeId) {
                const oldUser = dbFindById('users', oldAssigneeId);
                const newUser = dbFindById('users', newAssigneeId);
                actionLog = `Thay đổi người thực hiện từ '${oldUser ? oldUser.full_name : 'Chưa phân công'}' sang '${newUser ? newUser.full_name : 'Chưa phân công'}'`;
                
                if (newAssigneeId) {
                    sendNotification(newAssigneeId, `Bạn đã được chỉ định làm việc cho task: '${newTitle}'`);
                }
            }

            createActivityLog(activeDetailTask.id, currentUser.id, actionLog);

            showToast('Cập nhật nhiệm vụ thành công!');
            closeAllModals();
            renderTasks();
        });
    }

    // 4. Staff Bắt đầu làm việc (Start Work)
    const btnStartWork = document.getElementById('btn-start-work');
    if (btnStartWork) {
        btnStartWork.addEventListener('click', () => {
            if (!activeDetailTask) return;
            updateTaskStatus(activeDetailTask.id, 'In Progress');
            closeAllModals();
        });
    }

    // 5. Staff Mở Form Nộp Báo Cáo Phê Duyệt
    const btnOpenSubmit = document.getElementById('btn-open-submit-approval');
    if (btnOpenSubmit) {
        btnOpenSubmit.addEventListener('click', () => {
            document.getElementById('report-text').value = '';
            document.getElementById('report-link').value = '';
            document.getElementById('submit-approval-modal').style.display = 'flex';
        });
    }

    // 6. Staff submit báo cáo phê duyệt
    const formSubmitApproval = document.getElementById('form-submit-approval');
    if (formSubmitApproval) {
        formSubmitApproval.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeDetailTask) return;

            const repText = document.getElementById('report-text').value.trim();
            const repLink = document.getElementById('report-link').value.trim();

            updateTaskStatus(activeDetailTask.id, 'Reviewing', repText, repLink);
            
            closeAllModals();
        });
    }

    // 7. Hủy bỏ nộp báo cáo hoàn thành
    const btnSaCancel = document.getElementById('btn-sa-cancel');
    if (btnSaCancel) {
        btnSaCancel.onclick = () => {
            document.getElementById('submit-approval-modal').style.display = 'none';
        };
    }

    // 8. Đóng modal chi tiết task
    const btnTdClose = document.getElementById('btn-td-close');
    if (btnTdClose) {
        btnTdClose.onclick = () => {
            closeAllModals();
        };
    }

    // 9. Nút duyệt (Approve) của PM/Admin trong modal chi tiết
    const btnDecisionApprove = document.getElementById('btn-decision-approve');
    if (btnDecisionApprove) {
        btnDecisionApprove.onclick = () => {
            submitApproverDecision(true);
        };
    }

    // 10. Nút từ chối (Reject) của PM/Admin trong modal chi tiết
    const btnDecisionReject = document.getElementById('btn-decision-reject');
    if (btnDecisionReject) {
        btnDecisionReject.onclick = () => {
            submitApproverDecision(false);
        };
    }

    // 11. Gửi bình luận mới
    const btnTdSubmitComment = document.getElementById('btn-td-submit-comment');
    const newCommentInput = document.getElementById('td-new-comment-text');
    if (btnTdSubmitComment && newCommentInput) {
        btnTdSubmitComment.onclick = () => {
            const txt = newCommentInput.value.trim();
            if (!txt || !activeDetailTask) return;

            dbCreate('comments', {
                task_id: activeDetailTask.id,
                user_id: currentUser.id,
                content: txt
            });

            newCommentInput.value = '';
            renderCommentsList(activeDetailTask.id);
            showToast('Đã gửi bình luận!');
        };
        
        // Gửi bình luận khi gõ Enter
        newCommentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                btnTdSubmitComment.click();
            }
        });
    }
}

// Đóng toàn bộ các modal overlay đang hiển thị
function closeAllModals() {
    document.getElementById('task-detail-modal').style.display = 'none';
    document.getElementById('submit-approval-modal').style.display = 'none';
    activeDetailTask = null;
}

// ============================================================================
// UTILITIES HELPERS
// ============================================================================

// Lấy chữ cái đầu của tên để làm avatar
function getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Hiển thị Toast thông báo ở góc dưới phải
function showToast(message, icon = '✅') {
    const toast = document.getElementById('toast-notify');
    const tIcon = document.getElementById('toast-icon');
    const tMsg = document.getElementById('toast-message');

    if (toast && tIcon && tMsg) {
        tIcon.textContent = icon;
        tMsg.textContent = message;
        toast.classList.add('show');
        
        // Tự tắt sau 3 giây
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
