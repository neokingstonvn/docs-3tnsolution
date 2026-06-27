// File: admin.js
// Logic điều khiển giao diện Admin Portal

document.addEventListener("DOMContentLoaded", () => {
    // Current user context
    const currentUserId = "USER_ADMIN_1";
    
    // DOM Elements
    const menuProjects = document.getElementById("menu-projects");
    const menuApprovals = document.getElementById("menu-approvals");
    const menuRbac = document.getElementById("menu-rbac");
    
    const viewProjects = document.getElementById("view-projects");
    const viewApprovals = document.getElementById("view-approvals");
    const viewRbac = document.getElementById("view-rbac");
    
    const topTitle = document.getElementById("top-title");
    
    // Tab switching
    function switchTab(activeMenu, activeView, titleText) {
        // Remove active class from all menu items and views
        [menuProjects, menuApprovals, menuRbac].forEach(m => m.classList.remove("active"));
        [viewProjects, viewApprovals, viewRbac].forEach(v => v.classList.remove("active"));
        
        activeMenu.classList.add("active");
        activeView.classList.add("active");
        topTitle.textContent = titleText;
    }
    
    menuProjects.addEventListener("click", () => switchTab(menuProjects, viewProjects, "Dự án Console & UAT"));
    menuApprovals.addEventListener("click", () => switchTab(menuApprovals, viewApprovals, "Hàng đợi Phê duyệt"));
    menuRbac.addEventListener("click", () => switchTab(menuRbac, viewRbac, "Cấu hình Nhân sự & RBAC"));

    // Toast Notification helper
    function showToast(message, isSuccess = true) {
        const toast = document.getElementById("toast-notify");
        const toastIcon = document.getElementById("toast-icon");
        const toastMsg = document.getElementById("toast-message");
        
        toastIcon.textContent = isSuccess ? "✅" : "⚠️";
        toastMsg.textContent = message;
        toast.style.background = isSuccess ? "#10b981" : "#ef4444";
        
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // ============================================================================
    // TAB 1: DỰ ÁN & DASHBOARD LOGIC
    // ============================================================================
    const projectPmSelect = document.getElementById("project-pm");
    const formCreateProject = document.getElementById("form-create-project");
    const tbodyProjects = document.getElementById("tbody-projects");
    const filterProjectStatus = document.getElementById("filter-project-status");

    // Thống kê nhanh
    function updateDashboardStats() {
        const projects = dbFindAll("projects");
        const tasks = dbFindAll("tasks");
        
        document.getElementById("stat-total-projects").textContent = projects.length;
        
        // Active tasks count
        const activeTasks = tasks.filter(t => t.status === "In Progress" || t.status === "Reviewing").length;
        document.getElementById("stat-active-tasks").textContent = activeTasks;
        
        // Overdue tasks count (Due date < current date & not Done)
        const currentDate = new Date().toISOString().split('T')[0];
        const overdueTasks = tasks.filter(t => t.status !== "Done" && t.due_date < currentDate).length;
        document.getElementById("stat-overdue-tasks").textContent = overdueTasks;
    }

    // Load list PM to select box
    function loadPMSelect() {
        const users = dbFindAll("users");
        const pms = users.filter(u => u.role === "Project Manager" || u.role === "Admin");
        
        projectPmSelect.innerHTML = pms.map(pm => `
            <option value="${pm.id}">${pm.full_name} (${pm.role})</option>
        `).join('');
    }

    // Render projects list table
    function renderProjects() {
        const projects = dbFindAll("projects");
        const users = dbFindAll("users");
        const statusFilter = filterProjectStatus.value;
        
        const filteredProjects = projects.filter(p => {
            if (statusFilter === "all") return true;
            return p.status === statusFilter;
        });

        tbodyProjects.innerHTML = filteredProjects.map(proj => {
            const pmUser = users.find(u => u.id === proj.pm_id);
            const pmName = pmUser ? pmUser.full_name : "Chưa chỉ định";
            const progress = getProjectProgress(proj.id);
            
            // Badge color based on status
            let badgeClass = "badge-info";
            if (proj.status === "Completed") badgeClass = "badge-success";
            else if (proj.status === "On Hold") badgeClass = "badge-warning";
            
            // Action button based on status
            let actionBtn = "";
            if (proj.status !== "Completed") {
                actionBtn = `<button class="btn btn-secondary btn-complete-proj" data-id="${proj.id}" style="padding: 0.3rem 0.6rem; font-size: 0.72rem; border-color: var(--green); color: #34d399;">Hoàn thành</button>`;
            } else {
                actionBtn = `<button class="btn btn-secondary btn-reopen-proj" data-id="${proj.id}" style="padding: 0.3rem 0.6rem; font-size: 0.72rem; border-color: var(--accent); color: #a5b4fc;">Mở lại</button>`;
            }

            return `
                <tr>
                    <td style="font-weight: 700;">${proj.name}</td>
                    <td style="color: var(--text-dim); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${proj.description}</td>
                    <td>${pmName}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex-grow: 1; background: rgba(255,255,255,0.05); height: 6px; border-radius: 3px; overflow: hidden; width: 80px;">
                                <div style="background: var(--accent); width: ${progress}%; height: 100%;"></div>
                            </div>
                            <span style="font-size: 0.75rem; font-weight: bold; font-family: monospace;">${progress}%</span>
                        </div>
                    </td>
                    <td><span class="status-badge ${badgeClass}">${proj.status}</span></td>
                    <td>
                        <div style="display: flex; gap: 4px;">
                            ${actionBtn}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Link actions
        document.querySelectorAll(".btn-complete-proj").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const projId = e.target.getAttribute("data-id");
                dbUpdate("projects", projId, { status: "Completed" });
                showToast("Đã đóng và hoàn thành dự án!");
                renderProjects();
                updateDashboardStats();
            });
        });

        document.querySelectorAll(".btn-reopen-proj").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const projId = e.target.getAttribute("data-id");
                dbUpdate("projects", projId, { status: "Active" });
                showToast("Đã kích hoạt hoạt động lại dự án!");
                renderProjects();
                updateDashboardStats();
            });
        });
    }

    // Submit form create project
    formCreateProject.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("project-name").value;
        const pmId = projectPmSelect.value;
        const description = document.getElementById("project-desc").value;
        
        const newProj = dbCreate("projects", {
            name: name,
            pm_id: pmId,
            description: description,
            status: "Active"
        });

        // Send fake notification to PM
        sendNotification(pmId, `Bạn được phân công làm Project Manager cho dự án mới: '${name}'`);
        
        showToast("Tạo dự án thành công!");
        formCreateProject.reset();
        renderProjects();
        updateDashboardStats();
    });

    filterProjectStatus.addEventListener("change", renderProjects);

    // ============================================================================
    // TAB 2: HÀNG ĐỢI PHÊ DUYỆT LOGIC
    // ============================================================================
    const tbodyApprovals = document.getElementById("tbody-approvals");
    const approvalModal = document.getElementById("approval-modal");
    const btnModalCancel = document.getElementById("btn-modal-cancel");
    const btnModalApprove = document.getElementById("btn-modal-approve");
    const btnModalReject = document.getElementById("btn-modal-reject");
    const reviewFeedback = document.getElementById("review-feedback");
    
    let activeTaskId = null;

    // Render list waiting approvals
    function renderApprovals() {
        const tasks = dbFindAll("tasks");
        const projects = dbFindAll("projects");
        const users = dbFindAll("users");
        const approvals = dbFindAll("approval_requests");
        
        // Filter tasks in Reviewing
        const reviewingTasks = tasks.filter(t => t.status === "Reviewing");

        if (reviewingTasks.length === 0) {
            tbodyApprovals.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">Không có công việc nào đang chờ duyệt.</td></tr>`;
            return;
        }

        tbodyApprovals.innerHTML = reviewingTasks.map(task => {
            const proj = projects.find(p => p.id === task.project_id);
            const projName = proj ? proj.name : "N/A";
            const staffUser = users.find(u => u.id === task.assignee_id);
            const staffName = staffUser ? staffUser.full_name : "N/A";
            
            // Find active approval request of this task
            const appReq = approvals.find(a => a.task_id === task.id && a.status === "Pending");
            const reportText = appReq ? appReq.report_text : "-";
            const reportLink = appReq && appReq.report_link ? `<a href="${appReq.report_link}" target="_blank" class="clickable-item" style="color: #a5b4fc;">Xem tài liệu</a>` : "Không có";

            return `
                <tr>
                    <td style="font-weight: 700;">${task.title}</td>
                    <td>${projName}</td>
                    <td>${staffName}</td>
                    <td style="color: var(--text-dim); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${reportText}</td>
                    <td>${reportLink}</td>
                    <td>
                        <button class="btn btn-primary btn-evaluate-task" data-id="${task.id}" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Đánh giá</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Link event evaluation
        document.querySelectorAll(".btn-evaluate-task").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const taskId = e.target.getAttribute("data-id");
                openApprovalModal(taskId);
            });
        });
    }

    function openApprovalModal(taskId) {
        activeTaskId = taskId;
        const task = dbFindById("tasks", taskId);
        const approvals = dbFindAll("approval_requests");
        const appReq = approvals.find(a => a.task_id === taskId && a.status === "Pending");
        
        document.getElementById("modal-task-title").textContent = task.title;
        document.getElementById("modal-report-text").textContent = appReq ? appReq.report_text : "-";
        
        const modalLink = document.getElementById("modal-report-link");
        if (appReq && appReq.report_link) {
            modalLink.href = appReq.report_link;
            modalLink.textContent = appReq.report_link;
            modalLink.style.display = "inline-block";
        } else {
            modalLink.style.display = "none";
        }

        reviewFeedback.value = "";
        approvalModal.classList.add("show");
    }

    btnModalCancel.addEventListener("click", () => {
        approvalModal.classList.remove("show");
        activeTaskId = null;
    });

    // Action APPROVE
    btnModalApprove.addEventListener("click", () => {
        if (!activeTaskId) return;
        const task = dbFindById("tasks", activeTaskId);
        const approvals = dbFindAll("approval_requests");
        const appReq = approvals.find(a => a.task_id === activeTaskId && a.status === "Pending");
        const feedback = reviewFeedback.value.trim() || "Phê duyệt hoàn thành.";

        // Update task state Done
        dbUpdate("tasks", activeTaskId, { status: "Done" });
        
        // Update request Approve
        if (appReq) {
            dbUpdate("approval_requests", appReq.id, {
                status: "Approved",
                approver_id: currentUserId,
                feedback: feedback
            });
        }

        // Send activity log & notify
        createActivityLog(activeTaskId, currentUserId, `Đã phê duyệt công việc sang Done. Nội dung phản hồi: ${feedback}`);
        sendNotification(task.assignee_id, `Task '${task.title}' của bạn đã được Admin phê duyệt.`);

        showToast("Đã phê duyệt công việc!");
        approvalModal.classList.remove("show");
        activeTaskId = null;
        
        renderApprovals();
        renderProjects();
        updateDashboardStats();
    });

    // Action REJECT
    btnModalReject.addEventListener("click", () => {
        if (!activeTaskId) return;
        const feedback = reviewFeedback.value.trim();
        if (!feedback) {
            alert("Bắt buộc nhập lý do phản hồi nếu Reject!");
            return;
        }

        const task = dbFindById("tasks", activeTaskId);
        const approvals = dbFindAll("approval_requests");
        const appReq = approvals.find(a => a.task_id === activeTaskId && a.status === "Pending");

        // Update task state back to In Progress
        dbUpdate("tasks", activeTaskId, { status: "In Progress" });
        
        // Update request Reject
        if (appReq) {
            dbUpdate("approval_requests", appReq.id, {
                status: "Rejected",
                approver_id: currentUserId,
                feedback: feedback
            });
        }

        // Send activity log & notify
        createActivityLog(activeTaskId, currentUserId, `Từ chối duyệt task, trả lại cột In Progress. Lý do: ${feedback}`);
        sendNotification(task.assignee_id, `Admin đã từ chối phê duyệt task '${task.title}'. Yêu cầu sửa đổi: ${feedback}`);

        showToast("Đã từ chối và trả lại công việc!", false);
        approvalModal.classList.remove("show");
        activeTaskId = null;
        
        renderApprovals();
        renderProjects();
        updateDashboardStats();
    });

    // ============================================================================
    // TAB 3: RBAC LOGIC
    // ============================================================================
    const tbodyRbac = document.getElementById("tbody-rbac");

    function renderRbac() {
        const users = dbFindAll("users");
        
        tbodyRbac.innerHTML = users.map(user => {
            const isSelf = user.id === currentUserId;
            const disabledAttr = isSelf ? "disabled" : "";
            
            // Selected check
            const optAdmin = user.role === "Admin" ? "selected" : "";
            const optPM = user.role === "Project Manager" ? "selected" : "";
            const optStaff = user.role === "Staff" ? "selected" : "";

            return `
                <tr>
                    <td style="font-weight: bold;">${user.full_name} ${isSelf ? "(Bạn)" : ""}</td>
                    <td style="color: var(--text-dim);">${user.email}</td>
                    <td>
                        <span class="status-badge ${user.role === 'Admin' ? 'badge-indigo' : user.role === 'Project Manager' ? 'badge-amber' : 'badge-green'}">
                            ${user.role}
                        </span>
                    </td>
                    <td>
                        <select class="change-role-select" data-id="${user.id}" ${disabledAttr} style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 0.35rem 0.5rem; border-radius: 4px; color: var(--text); font-size: 0.8rem; outline: none; cursor: pointer;">
                            <option value="Admin" ${optAdmin}>Admin</option>
                            <option value="Project Manager" ${optPM}>Project Manager</option>
                            <option value="Staff" ${optStaff}>Staff</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        // Link event role change
        document.querySelectorAll(".change-role-select").forEach(select => {
            select.addEventListener("change", (e) => {
                const targetUserId = e.target.getAttribute("data-id");
                const newRole = e.target.value;
                
                dbUpdate("users", targetUserId, { role: newRole });
                
                const targetUser = dbFindById("users", targetUserId);
                showToast(`Đã chuyển vai trò của ${targetUser.full_name} sang ${newRole}!`);
                
                renderRbac();
                loadPMSelect();
                renderProjects();
            });
        });
    }

    // Init Page Load
    updateDashboardStats();
    loadPMSelect();
    renderProjects();
    renderApprovals();
    renderRbac();
});
