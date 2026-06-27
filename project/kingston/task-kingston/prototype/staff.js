// File: staff.js
// Logic điều khiển giao diện Staff Portal

document.addEventListener("DOMContentLoaded", () => {
    // Current Staff user context
    const currentUserId = "USER_STAFF_1";
    
    // DOM Elements
    const btnNotiBell = document.getElementById("btn-noti-bell");
    const notiBadge = document.getElementById("noti-count");
    const notiDropdownBox = document.getElementById("noti-dropdown-box");
    const btnClearNoti = document.getElementById("btn-clear-noti");
    const notiListContainer = document.getElementById("noti-list-container");

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
    // NOTIFICATIONS ENGINE
    // ============================================================================
    btnNotiBell.addEventListener("click", (e) => {
        e.stopPropagation();
        notiDropdownBox.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        notiDropdownBox.classList.remove("show");
    });

    notiDropdownBox.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    function renderNotifications() {
        const notis = dbFindAll("notifications").filter(n => n.user_id === currentUserId);
        
        // Sort from new to old
        notis.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        const unreadCount = notis.filter(n => !n.read).length;
        if (unreadCount > 0) {
            notiBadge.textContent = unreadCount;
            notiBadge.style.display = "flex";
        } else {
            notiBadge.style.display = "none";
        }

        if (notis.length === 0) {
            notiListContainer.innerHTML = `<div style="font-size: 0.72rem; color: var(--text-dim); text-align: center; padding: 1.5rem 0;">Không có thông báo mới.</div>`;
            return;
        }

        notiListContainer.innerHTML = notis.map(n => {
            const unreadClass = !n.read ? "unread" : "";
            const dateStr = new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " " + new Date(n.createdAt).toLocaleDateString();

            return `
                <div class="noti-item ${unreadClass}">
                    <div>${n.text}</div>
                    <div style="font-size: 0.6rem; color: var(--text-dim); margin-top: 4px;">${dateStr}</div>
                </div>
            `;
        }).join('');
    }

    // Mark all as read
    btnClearNoti.addEventListener("click", () => {
        const db = getDB();
        const notis = db.notifications || [];
        notis.forEach(n => {
            if (n.user_id === currentUserId) n.read = true;
        });
        db.notifications = notis;
        saveDB(db);
        
        showToast("Đã đọc tất cả thông báo.");
        renderNotifications();
    });

    // ============================================================================
    // TAB 1: KANBAN BOARD LOGIC
    // ============================================================================
    const countTodo = document.getElementById("count-todo");
    const countInprogress = document.getElementById("count-inprogress");
    const countReviewing = document.getElementById("count-reviewing");
    const countDone = document.getElementById("count-done");

    const colTodo = document.getElementById("kanban-todo-list");
    const colInprogress = document.getElementById("kanban-inprogress-list");
    const colReviewing = document.getElementById("kanban-reviewing-list");
    const colDone = document.getElementById("kanban-done-list");

    function renderKanban() {
        const tasks = dbFindAll("tasks").filter(t => t.assignee_id === currentUserId);
        
        // Reset HTML columns
        [colTodo, colInprogress, colReviewing, colDone].forEach(c => c.innerHTML = "");

        let todo = 0, inprogress = 0, reviewing = 0, done = 0;

        tasks.forEach(task => {
            let prioColor = "var(--text-dim)";
            if (task.priority === "High") prioColor = "var(--red)";
            else if (task.priority === "Medium") prioColor = "var(--amber)";
            else if (task.priority === "Low") prioColor = "var(--green)";

            // Check overdue
            const currentDate = new Date().toISOString().split('T')[0];
            const isOverdue = task.status !== "Done" && task.due_date < currentDate;
            const overdueLabel = isOverdue ? `<span style="color: var(--red); font-weight: bold; font-size: 0.65rem; border: 1px solid var(--red); padding: 1px 4px; border-radius: 3px; animation: pulse 1.5s infinite;">QUÁ HẠN</span>` : "";

            const cardHtml = `
                <div class="kanban-task-card" data-id="${task.id}">
                    <div class="task-card-title">${task.title}</div>
                    <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${task.description}
                    </div>
                    <div class="task-meta">
                        <span style="color: ${prioColor}; font-weight: 700;">${task.priority}</span>
                        <span>📅 Hạn: ${task.due_date}</span>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
                        ${overdueLabel}
                    </div>
                </div>
            `;

            if (task.status === "To Do") {
                colTodo.innerHTML += cardHtml;
                todo++;
            } else if (task.status === "In Progress") {
                colInprogress.innerHTML += cardHtml;
                inprogress++;
            } else if (task.status === "Reviewing") {
                colReviewing.innerHTML += cardHtml;
                reviewing++;
            } else if (task.status === "Done") {
                colDone.innerHTML += cardHtml;
                done++;
            }
        });

        countTodo.textContent = todo;
        countInprogress.textContent = inprogress;
        countReviewing.textContent = reviewing;
        countDone.textContent = done;

        // Add event card click
        document.querySelectorAll(".kanban-task-card").forEach(card => {
            card.addEventListener("click", (e) => {
                const cardEl = e.target.closest(".kanban-task-card");
                const taskId = cardEl.getAttribute("data-id");
                openTaskDetailModal(taskId);
            });
        });
    }

    // ============================================================================
    // DETAIL MODAL & COMMENTS LOGIC
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

    // Action elements
    const btnStartWork = document.getElementById("btn-start-work");
    const btnOpenSubmitApproval = document.getElementById("btn-open-submit-approval");
    const tdLockedStatusMessage = document.getElementById("td-locked-status-message");

    let activeDetailTaskId = null;

    function openTaskDetailModal(taskId) {
        activeDetailTaskId = taskId;
        const task = dbFindById("tasks", taskId);
        const projects = dbFindAll("projects");
        const users = dbFindAll("users");

        const proj = projects.find(p => p.id === task.project_id);
        const pmId = proj ? proj.pm_id : null;
        const pmUser = pmId ? users.find(u => u.id === pmId) : null;
        const pmName = pmUser ? pmUser.full_name : "N/A";

        // Fill data
        document.getElementById("td-modal-title").textContent = `Nhiệm vụ: ${task.title}`;
        document.getElementById("td-modal-project").textContent = proj ? proj.name : "-";
        document.getElementById("td-modal-creator").textContent = pmName;
        document.getElementById("td-modal-due-date").textContent = task.due_date;
        document.getElementById("td-modal-priority").textContent = task.priority;
        
        // Status indicator badge
        const tdStatus = document.getElementById("td-modal-status");
        tdStatus.textContent = task.status;
        tdStatus.className = "status-badge";
        if (task.status === "To Do") tdStatus.classList.add("badge-info");
        else if (task.status === "In Progress") tdStatus.classList.add("badge-warning");
        else if (task.status === "Reviewing") tdStatus.classList.add("badge-indigo");
        else if (task.status === "Done") tdStatus.classList.add("badge-success");

        document.getElementById("td-modal-desc").textContent = task.description || "Không có mô tả chi tiết.";

        // Action block setup
        btnStartWork.style.display = "none";
        btnOpenSubmitApproval.style.display = "none";
        tdLockedStatusMessage.style.display = "none";

        if (task.status === "To Do") {
            btnStartWork.style.display = "block";
        } else if (task.status === "In Progress") {
            btnOpenSubmitApproval.style.display = "block";
        } else {
            tdLockedStatusMessage.style.display = "block";
        }

        switchDetailTab("comments");
        
        loadTaskComments(taskId);
        loadTaskLogs(taskId);
        
        taskDetailModal.classList.add("show");
    }

    btnTdClose.addEventListener("click", () => {
        taskDetailModal.classList.remove("show");
        activeDetailTaskId = null;
    });

    // Start working on task
    btnStartWork.addEventListener("click", () => {
        if (!activeDetailTaskId) return;
        const task = dbFindById("tasks", activeDetailTaskId);
        
        dbUpdate("tasks", activeDetailTaskId, { status: "In Progress" });
        createActivityLog(activeDetailTaskId, currentUserId, "Bắt đầu làm việc (Chuyển trạng thái sang In Progress)");
        
        // Send notification to PM
        const proj = dbFindById("projects", task.project_id);
        if (proj && proj.pm_id) {
            sendNotification(proj.pm_id, `Nhân viên Nguyễn Văn Staff bắt đầu làm việc task: '${task.title}'`);
        }

        showToast("Đã bắt đầu công việc. Hãy làm thật tốt nhé!");
        taskDetailModal.classList.remove("show");
        renderKanban();
    });

    // Switch tab
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
        tdCommentsList.scrollTop = tdCommentsList.scrollHeight;
    }

    // Render Logs
    function loadTaskLogs(taskId) {
        const logs = dbFindAll("activity_logs").filter(l => l.task_id === taskId);
        const users = dbFindAll("users");

        if (logs.length === 0) {
            tdLogsList.innerHTML = `<div style="text-align: center; padding: 1rem 0;">Không có logs hoạt động.</div>`;
            return;
        }

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

    // Submit comments
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

    tdNewCommentText.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            btnTdSubmitComment.click();
        }
    });

    // ============================================================================
    // MODAL FORM SUBMIT APPROVAL
    // ============================================================================
    const submitApprovalModal = document.getElementById("submit-approval-modal");
    const btnSaCancel = document.getElementById("btn-sa-cancel");
    const formSubmitApproval = document.getElementById("form-submit-approval");

    btnOpenSubmitApproval.addEventListener("click", () => {
        taskDetailModal.classList.remove("show");
        submitApprovalModal.classList.add("show");
    });

    btnSaCancel.addEventListener("click", () => {
        submitApprovalModal.classList.remove("show");
        taskDetailModal.classList.add("show");
    });

    // Process submit report
    formSubmitApproval.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!activeDetailTaskId) return;
        
        const reportText = document.getElementById("report-text").value;
        const reportLink = document.getElementById("report-link").value;
        
        const task = dbFindById("tasks", activeDetailTaskId);
        const projects = dbFindAll("projects");
        const proj = projects.find(p => p.id === task.project_id);

        // Update task to Reviewing
        dbUpdate("tasks", activeDetailTaskId, { status: "Reviewing" });

        // Create approval request record
        dbCreate("approval_requests", {
            task_id: activeDetailTaskId,
            submitter_id: currentUserId,
            report_text: reportText,
            report_link: reportLink,
            status: "Pending"
        });

        // Write log
        createActivityLog(activeDetailTaskId, currentUserId, `Đã hoàn thành và nộp báo cáo duyệt. Tài liệu: ${reportLink}`);

        // Send notify to PM
        if (proj && proj.pm_id) {
            sendNotification(proj.pm_id, `Nhân viên Nguyễn Văn Staff đã nộp báo cáo hoàn thành cho task: '${task.title}'`);
        }

        showToast("Đã gửi yêu cầu phê duyệt thành công!");
        
        formSubmitApproval.reset();
        submitApprovalModal.classList.remove("show");
        activeDetailTaskId = null;
        
        renderKanban();
    });

    // Init Page Load
    renderNotifications();
    renderKanban();
});
