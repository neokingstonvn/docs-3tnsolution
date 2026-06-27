// File: pm.js
// Logic điều khiển giao diện Project Manager Portal

document.addEventListener("DOMContentLoaded", () => {
    // Current PM user context
    const currentUserId = "USER_PM_1";
    
    // DOM Elements
    const menuDashboard = document.getElementById("menu-pm-dashboard");
    const menuKanban = document.getElementById("menu-pm-kanban");
    const menuApprovals = document.getElementById("menu-pm-approvals");
    
    const viewDashboard = document.getElementById("view-pm-dashboard");
    const viewKanban = document.getElementById("view-pm-kanban");
    const viewApprovals = document.getElementById("view-pm-approvals");
    
    const topTitle = document.getElementById("top-title");

    // Tab switching
    function switchTab(activeMenu, activeView, titleText) {
        [menuDashboard, menuKanban, menuApprovals].forEach(m => m.classList.remove("active"));
        [viewDashboard, viewKanban, viewApprovals].forEach(v => v.classList.remove("active"));
        
        activeMenu.classList.add("active");
        activeView.classList.add("active");
        topTitle.textContent = titleText;
    }
    
    menuDashboard.addEventListener("click", () => switchTab(menuDashboard, viewDashboard, "Dashboard quản lý của PM"));
    menuKanban.addEventListener("click", () => {
        switchTab(menuKanban, viewKanban, "Bảng công việc Kanban & Phân công");
        loadKanbanFilters();
        renderKanban();
    });
    menuApprovals.addEventListener("click", () => {
        switchTab(menuApprovals, viewApprovals, "Duyệt báo cáo công việc");
        renderPMApprovals();
    });

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
    // TAB 1: PM DASHBOARD LOGIC
    // ============================================================================
    const tbodyPmProjects = document.getElementById("tbody-pm-projects");

    function renderPMProjects() {
        const projects = dbFindAll("projects");
        const myProjects = projects.filter(p => p.pm_id === currentUserId);

        if (myProjects.length === 0) {
            tbodyPmProjects.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">Bạn chưa được gán quản lý dự án nào.</td></tr>`;
            return;
        }

        tbodyPmProjects.innerHTML = myProjects.map(proj => {
            const progress = getProjectProgress(proj.id);
            let badgeClass = "badge-info";
            if (proj.status === "Completed") badgeClass = "badge-success";
            else if (proj.status === "On Hold") badgeClass = "badge-warning";

            return `
                <tr>
                    <td style="font-weight: 700;">${proj.name}</td>
                    <td style="color: var(--text-dim);">${proj.description}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex-grow: 1; background: rgba(255,255,255,0.05); height: 6px; border-radius: 3px; overflow: hidden; width: 100px;">
                                <div style="background: var(--accent); width: ${progress}%; height: 100%;"></div>
                            </div>
                            <span style="font-size: 0.75rem; font-weight: bold; font-family: monospace;">${progress}%</span>
                        </div>
                    </td>
                    <td><span class="status-badge ${badgeClass}">${proj.status}</span></td>
                </tr>
            `;
        }).join('');
    }

    // ============================================================================
    // TAB 2: KANBAN & GIAO VIỆC LOGIC
    // ============================================================================
    const taskProjectSelect = document.getElementById("task-project");
    const taskAssigneeSelect = document.getElementById("task-assignee");
    const filterKanbanProject = document.getElementById("filter-kanban-project");
    const formCreateTask = document.getElementById("form-create-task");

    function loadKanbanFilters() {
        const projects = dbFindAll("projects");
        const myProjects = projects.filter(p => p.pm_id === currentUserId);
        
        // Load dropdown projects for task creation and filter
        const optionsHtml = myProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        taskProjectSelect.innerHTML = optionsHtml;
        filterKanbanProject.innerHTML = `<option value="all">Tất cả dự án phụ trách</option>` + optionsHtml;

        // Load dropdown staff/assignee
        const users = dbFindAll("users");
        const staffs = users.filter(u => u.role === "Staff");
        taskAssigneeSelect.innerHTML = `<option value="">-- Chưa phân công --</option>` + staffs.map(s => `
            <option value="${s.id}">${s.full_name}</option>
        `).join('');
    }

    filterKanbanProject.addEventListener("change", renderKanban);

    // Render Kanban columns
    function renderKanban() {
        const tasks = dbFindAll("tasks");
        const projects = dbFindAll("projects");
        const users = dbFindAll("users");
        
        // Filter projects assigned to this PM
        const myProjectIds = projects.filter(p => p.pm_id === currentUserId).map(p => p.id);
        
        const selectedProjId = filterKanbanProject.value;
        const filteredTasks = tasks.filter(task => {
            if (!myProjectIds.includes(task.project_id)) return false; // Must belong to PM projects
            if (selectedProjId !== "all" && task.project_id !== selectedProjId) return false;
            return true;
        });

        const columns = {
            "To Do": document.getElementById("kanban-todo-list"),
            "In Progress": document.getElementById("kanban-inprogress-list"),
            "Reviewing": document.getElementById("kanban-reviewing-list"),
            "Done": document.getElementById("kanban-done-list")
        };

        // Reset columns
        Object.values(columns).forEach(col => col.innerHTML = "");

        let countTodo = 0, countInprogress = 0, countReviewing = 0, countDone = 0;

        filteredTasks.forEach(task => {
            const assignee = users.find(u => u.id === task.assignee_id);
            const assigneeName = assignee ? assignee.full_name : "Chưa phân công";
            
            // Priority badge styling
            let prioColor = "var(--text-dim)";
            if (task.priority === "High") prioColor = "var(--red)";
            else if (task.priority === "Medium") prioColor = "var(--amber)";
            else if (task.priority === "Low") prioColor = "var(--green)";

            // Check overdue
            const currentDate = new Date().toISOString().split('T')[0];
            const isOverdue = task.status !== "Done" && task.due_date < currentDate;
            const overdueLabel = isOverdue ? `<span style="color: var(--red); font-weight: bold; font-size: 0.65rem; border: 1px solid var(--red); padding: 1px 4px; border-radius: 3px; animation: pulse 1.5s infinite;">QUÁ HẠN</span>` : "";

            const taskCardHtml = `
                <div class="kanban-task-card" data-id="${task.id}">
                    <div class="task-card-title">${task.title}</div>
                    <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${task.description}
                    </div>
                    <div class="task-meta">
                        <span style="color: ${prioColor}; font-weight: 700;">${task.priority}</span>
                        <span style="font-size: 0.7rem;">👤 ${assigneeName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.68rem; color: var(--text-dim);">
                        <span>📅 Hạn: ${task.due_date}</span>
                        ${overdueLabel}
                    </div>
                </div>
            `;

            if (task.status === "To Do") {
                columns["To Do"].innerHTML += taskCardHtml;
                countTodo++;
            } else if (task.status === "In Progress") {
                columns["In Progress"].innerHTML += taskCardHtml;
                countInprogress++;
            } else if (task.status === "Reviewing") {
                columns["Reviewing"].innerHTML += taskCardHtml;
                countReviewing++;
            } else if (task.status === "Done") {
                columns["Done"].innerHTML += taskCardHtml;
                countDone++;
            }
        });

        // Set counts
        document.getElementById("count-todo").textContent = countTodo;
        document.getElementById("count-inprogress").textContent = countInprogress;
        document.getElementById("count-reviewing").textContent = countReviewing;
        document.getElementById("count-done").textContent = countDone;

        // Add event click to task card
        document.querySelectorAll(".kanban-task-card").forEach(card => {
            card.addEventListener("click", (e) => {
                // Find parent kanban-task-card if child clicked
                const cardEl = e.target.closest(".kanban-task-card");
                const taskId = cardEl.getAttribute("data-id");
                openTaskDetailModal(taskId);
            });
        });
    }

    // Submit form create task
    formCreateTask.addEventListener("submit", (e) => {
        e.preventDefault();
        const projId = taskProjectSelect.value;
        const assigneeId = taskAssigneeSelect.value;
        const title = document.getElementById("task-title").value;
        const priority = document.getElementById("task-priority").value;
        const dueDate = document.getElementById("task-due-date").value;
        const desc = document.getElementById("task-desc").value;

        const newTask = dbCreate("tasks", {
            project_id: projId,
            title: title,
            description: desc,
            assignee_id: assigneeId,
            priority: priority,
            due_date: dueDate,
            status: "To Do"
        });

        // Write log
        createActivityLog(newTask.id, currentUserId, `Đã tạo công việc và giao phó cho ${assigneeId ? dbFindById("users", assigneeId).full_name : "chưa phân công"}`);

        // Send notification to Staff
        if (assigneeId) {
            sendNotification(assigneeId, `Bạn được giao một công việc mới: '${title}'`);
        }

        showToast("Tạo và giao việc thành công!");
        formCreateTask.reset();
        renderKanban();
        renderPMProjects();
    });

    // ============================================================================
    // TAB 3: PM APPROVAL QUEUE LOGIC
    // ============================================================================
    const tbodyPmApprovals = document.getElementById("tbody-pm-approvals");
    const pmApprovalModal = document.getElementById("pm-approval-modal");
    const btnPmModalCancel = document.getElementById("btn-pm-modal-cancel");
    const btnPmModalApprove = document.getElementById("btn-pm-modal-approve");
    const btnPmModalReject = document.getElementById("btn-pm-modal-reject");
    const pmReviewFeedback = document.getElementById("pm-review-feedback");

    let pmActiveTaskId = null;

    // Render approval requests for projects managed by this PM
    function renderPMApprovals() {
        const tasks = dbFindAll("tasks");
        const projects = dbFindAll("projects");
        const users = dbFindAll("users");
        const approvals = dbFindAll("approval_requests");

        // Filter projects managed by current PM
        const myProjIds = projects.filter(p => p.pm_id === currentUserId).map(p => p.id);
        
        // Filter reviewing tasks
        const reviewingTasks = tasks.filter(t => t.status === "Reviewing" && myProjIds.includes(t.project_id));

        if (reviewingTasks.length === 0) {
            tbodyPmApprovals.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">Không có yêu cầu phê duyệt nào.</td></tr>`;
            return;
        }

        tbodyPmApprovals.innerHTML = reviewingTasks.map(task => {
            const proj = projects.find(p => p.id === task.project_id);
            const projName = proj ? proj.name : "N/A";
            const staffUser = users.find(u => u.id === task.assignee_id);
            const staffName = staffUser ? staffUser.full_name : "N/A";
            
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
                        <button class="btn btn-primary btn-pm-evaluate" data-id="${task.id}" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Đánh giá</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Link event click
        document.querySelectorAll(".btn-pm-evaluate").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const taskId = e.target.getAttribute("data-id");
                openPMApprovalModal(taskId);
            });
        });
    }

    function openPMApprovalModal(taskId) {
        pmActiveTaskId = taskId;
        const task = dbFindById("tasks", taskId);
        const approvals = dbFindAll("approval_requests");
        const appReq = approvals.find(a => a.task_id === taskId && a.status === "Pending");
        
        document.getElementById("modal-pm-task-title").textContent = task.title;
        document.getElementById("modal-pm-report-text").textContent = appReq ? appReq.report_text : "-";
        
        const modalLink = document.getElementById("modal-pm-report-link");
        if (appReq && appReq.report_link) {
            modalLink.href = appReq.report_link;
            modalLink.textContent = appReq.report_link;
            modalLink.style.display = "inline-block";
        } else {
            modalLink.style.display = "none";
        }

        pmReviewFeedback.value = "";
        pmApprovalModal.classList.add("show");
    }

    btnPmModalCancel.addEventListener("click", () => {
        pmApprovalModal.classList.remove("show");
        pmActiveTaskId = null;
    });

    // PM Approve
    btnPmModalApprove.addEventListener("click", () => {
        if (!pmActiveTaskId) return;
        const task = dbFindById("tasks", pmActiveTaskId);
        const approvals = dbFindAll("approval_requests");
        const appReq = approvals.find(a => a.task_id === pmActiveTaskId && a.status === "Pending");
        const feedback = pmReviewFeedback.value.trim() || "PM phê duyệt hoàn thành.";

        dbUpdate("tasks", pmActiveTaskId, { status: "Done" });
        
        if (appReq) {
            dbUpdate("approval_requests", appReq.id, {
                status: "Approved",
                approver_id: currentUserId,
                feedback: feedback
            });
        }

        createActivityLog(pmActiveTaskId, currentUserId, `Project Manager đã phê duyệt công việc. Phản hồi: ${feedback}`);
        sendNotification(task.assignee_id, `PM đã phê duyệt hoàn thành task '${task.title}' của bạn.`);

        showToast("Đã phê duyệt công việc!");
        pmApprovalModal.classList.remove("show");
        pmActiveTaskId = null;
        
        renderPMApprovals();
        renderPMProjects();
    });

    // PM Reject
    btnPmModalReject.addEventListener("click", () => {
        if (!pmActiveTaskId) return;
        const feedback = pmReviewFeedback.value.trim();
        if (!feedback) {
            alert("Bắt buộc nhập lý do phản hồi nếu Reject!");
            return;
        }

        const task = dbFindById("tasks", pmActiveTaskId);
        const approvals = dbFindAll("approval_requests");
        const appReq = approvals.find(a => a.task_id === pmActiveTaskId && a.status === "Pending");

        dbUpdate("tasks", pmActiveTaskId, { status: "In Progress" });
        
        if (appReq) {
            dbUpdate("approval_requests", appReq.id, {
                status: "Rejected",
                approver_id: currentUserId,
                feedback: feedback
            });
        }

        createActivityLog(pmActiveTaskId, currentUserId, `PM từ chối duyệt task, trả lại cột In Progress. Lý do: ${feedback}`);
        sendNotification(task.assignee_id, `PM từ chối phê duyệt task '${task.title}'. Yêu cầu sửa đổi: ${feedback}`);

        showToast("Đã từ chối và yêu cầu Staff chỉnh sửa!", false);
        pmApprovalModal.classList.remove("show");
        pmActiveTaskId = null;
        
        renderPMApprovals();
        renderPMProjects();
    });

    // ============================================================================
    // MODAL CHI TIẾT TASK & LOGS & COMMENTS
    // ============================================================================
    const taskDetailModal = document.getElementById("task-detail-modal");
    const btnTdClose = document.getElementById("btn-td-close");
    const tabBtnComments = document.getElementById("tab-btn-comments");
    const tabBtnLogs = document.getElementById("tab-btn-logs");
    const tdPanelComments = document.getElementById("td-panel-comments");
    const tdPanelLogs = document.getElementById("td-panel-logs");
    
    const tdCommentsList = document.getElementById("td-comments-list");
    const tdLogsList = document.getElementById("td-logs-list");
    const tdNewCommentText = document.getElementById("td-new-comment-text");
    const btnTdSubmitComment = document.getElementById("btn-td-submit-comment");

    let activeDetailTaskId = null;

    function openTaskDetailModal(taskId) {
        activeDetailTaskId = taskId;
        const task = dbFindById("tasks", taskId);
        const projects = dbFindAll("projects");
        const users = dbFindAll("users");

        const proj = projects.find(p => p.id === task.project_id);
        const assignee = users.find(u => u.id === task.assignee_id);
        const creatorName = proj ? users.find(u => u.id === proj.pm_id)?.full_name || "Admin" : "N/A";

        // Fill task details
        document.getElementById("td-modal-title").textContent = `Nhiệm vụ: ${task.title}`;
        document.getElementById("td-modal-project").textContent = proj ? proj.name : "-";
        document.getElementById("td-modal-creator").textContent = creatorName;
        document.getElementById("td-modal-assignee").textContent = assignee ? assignee.full_name : "Chưa giao";
        document.getElementById("td-modal-due-date").textContent = task.due_date;
        document.getElementById("td-modal-priority").textContent = task.priority;
        document.getElementById("td-modal-status").textContent = task.status;
        document.getElementById("td-modal-desc").textContent = task.description || "Không có mô tả thêm.";

        // Default open tab comments
        switchDetailTab("comments");
        
        loadTaskComments(taskId);
        loadTaskLogs(taskId);
        
        taskDetailModal.classList.add("show");
    }

    btnTdClose.addEventListener("click", () => {
        taskDetailModal.classList.remove("show");
        activeDetailTaskId = null;
    });

    function switchDetailTab(tab) {
        if (tab === "comments") {
            tabBtnComments.style.color = "var(--accent)";
            tabBtnComments.style.borderBottom = "2px solid var(--accent)";
            tabBtnLogs.style.color = "var(--text-dim)";
            tabBtnLogs.style.borderBottom = "none";
            tdPanelComments.style.display = "block";
            tdPanelLogs.style.display = "none";
        } else {
            tabBtnLogs.style.color = "var(--accent)";
            tabBtnLogs.style.borderBottom = "2px solid var(--accent)";
            tabBtnComments.style.color = "var(--text-dim)";
            tabBtnComments.style.borderBottom = "none";
            tdPanelComments.style.display = "none";
            tdPanelLogs.style.display = "block";
        }
    }

    tabBtnComments.addEventListener("click", () => switchDetailTab("comments"));
    tabBtnLogs.addEventListener("click", () => switchDetailTab("logs"));

    // Render Comments
    function loadTaskComments(taskId) {
        const comments = dbFindAll("comments").filter(c => c.task_id === taskId);
        const users = dbFindAll("users");

        if (comments.length === 0) {
            tdCommentsList.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-dim); text-align: center; padding: 1rem 0;">Chưa có bình luận nào.</div>`;
            return;
        }

        // Sort comments from old to new
        comments.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));

        tdCommentsList.innerHTML = comments.map(c => {
            const author = users.find(u => u.id === c.user_id);
            const authorName = author ? author.full_name : "Hệ thống";
            const dateStr = new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " " + new Date(c.createdAt).toLocaleDateString();
            
            return `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 0.4rem 0.6rem; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.68rem; margin-bottom: 2px;">
                        <strong style="color: #a5b4fc;">${authorName}</strong>
                        <span style="color: var(--text-dim);">${dateStr}</span>
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text);">${c.content}</p>
                </div>
            `;
        }).join('');
        
        // Auto scroll to bottom
        tdCommentsList.scrollTop = tdCommentsList.scrollHeight;
    }

    // Render Activity Logs
    function loadTaskLogs(taskId) {
        const logs = dbFindAll("activity_logs").filter(l => l.task_id === taskId);
        const users = dbFindAll("users");

        if (logs.length === 0) {
            tdLogsList.innerHTML = `<div style="text-align: center; padding: 1rem 0;">Không có logs hoạt động.</div>`;
            return;
        }

        // Sort logs from new to old
        logs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        tdLogsList.innerHTML = logs.map(l => {
            const user = users.find(u => u.id === l.user_id);
            const userName = user ? user.full_name : "Hệ thống";
            const dateStr = new Date(l.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " " + new Date(l.createdAt).toLocaleDateString();

            return `
                <div style="border-left: 2px solid var(--accent); padding-left: 8px; margin-bottom: 6px;">
                    <div>${l.action}</div>
                    <div style="font-size: 0.65rem; color: var(--text-dim);">${userName} • ${dateStr}</div>
                </div>
            `;
        }).join('');
    }

    // Post Comment
    btnTdSubmitComment.addEventListener("click", () => {
        if (!activeDetailTaskId) return;
        const text = tdNewCommentText.value.trim();
        if (!text) return;

        dbCreate("comments", {
            task_id: activeDetailTaskId,
            user_id: currentUserId,
            content: text
        });

        tdNewCommentText.value = "";
        loadTaskComments(activeDetailTaskId);
    });

    // Enter Key comments input support
    tdNewCommentText.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            btnTdSubmitComment.click();
        }
    });

    // Init Page Load
    renderPMProjects();
});
