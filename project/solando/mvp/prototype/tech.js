// Solando Technician Portal Controller Logic

let activationSerials = [];

// VIEW CONTROLLER
function switchTab(event, role) {
    if (event) event.preventDefault();

    // Ẩn hiện các view-panel
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
    const activePanel = document.getElementById(`view-${role}`);
    if (activePanel) activePanel.classList.add('active');

    // Cập nhật Active Tab ở Bottom Nav
    document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const mActiveItem = document.getElementById(`m-nav-${role}`);
    if (mActiveItem) mActiveItem.classList.add('active');

    // Ẩn hiện thanh mô phỏng QR ở tab quét của khách hàng
    if (role === 'customer') {
        document.getElementById('sim-barcode-bar').style.display = 'flex';
    } else {
        const barcodeBar = document.getElementById('sim-barcode-bar');
        if (barcodeBar) barcodeBar.style.display = 'none';
    }
}

function switchTabMobile(role) {
    switchTab(null, role);
}

function showToast(msg) {
    const toast = document.getElementById('toast-banner');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ----------------------------------------------------
// KHÁCH HÀNG / KỸ THUẬT: LOGIC QUÉT QR KÍCH HOẠT HÀNG LOẠT
// ----------------------------------------------------
function simulateQRAccess(serial) {
    const input = document.getElementById('cust-serial-input');
    if (input) {
        input.value = serial;
        addSerialToActivationList();
    }
    const bar = document.getElementById('sim-barcode-bar');
    if (bar) bar.style.display = 'none';
}

function addSerialToActivationList() {
    const input = document.getElementById('cust-serial-input');
    if (!input) return;
    const serial = input.value.trim();
    if (!serial) {
        alert("Vui lòng nhập hoặc quét số Serial thiết bị!");
        return;
    }
    // Load database mới nhất từ localStorage để cập nhật
    loadDB();
    
    const dbSerial = MOCK_DATA.serials[serial];
    if (!dbSerial) {
        alert("Số Serial này không tồn tại trong hệ thống hoặc chưa được xuất bán. Vui lòng quét thử Serial mẫu có sẵn.");
        return;
    }
    if (dbSerial.status === 'Activated') {
        alert(`Thiết bị có Serial ${serial} đã được kích hoạt bảo hành điện tử trước đó!`);
        return;
    }
    if (activationSerials.includes(serial)) {
        alert(`Số Serial ${serial} đã có trong danh sách kích hoạt!`);
        return;
    }
    activationSerials.push(serial);
    input.value = '';
    renderActivationSerials();
    showToast(`Đã thêm Serial ${serial} vào danh sách.`);
}

function removeSerialFromActivationList(serial) {
    activationSerials = activationSerials.filter(s => s !== serial);
    renderActivationSerials();
    showToast("Đã xóa Serial khỏi danh sách.");
}

function renderActivationSerials() {
    const list = document.getElementById('activation-serials-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (activationSerials.length === 0) {
        list.innerHTML = `<span style="color: var(--text-dim); font-size: 0.8rem; font-style: italic;">Chưa có thiết bị nào trong danh sách kích hoạt...</span>`;
        return;
    }
    
    // Load database để check tên thiết bị
    loadDB();
    
    activationSerials.forEach(serial => {
        const dbSerial = MOCK_DATA.serials[serial];
        const name = dbSerial ? dbSerial.name : 'Thiết bị';
        
        const chip = document.createElement('span');
        chip.className = 'serial-chip';
        chip.innerHTML = `
            🔌 <strong>${serial}</strong> <span style="font-size:0.65rem; opacity:0.85;">(${name})</span>
            <button class="btn-remove-chip" onclick="removeSerialFromActivationList('${serial}')" title="Xóa">×</button>
        `;
        list.appendChild(chip);
    });
}

function simulateQRScanningMulti() {
    // Load database mới nhất
    loadDB();
    
    const isInv = Math.random() < 0.5;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const mockSerial = isInv ? `SLD-INV-5K-${randomSuffix}` : `SLD-BAT-10K-${randomSuffix}`;
    const sku = isInv ? "SOL-INV-5KW" : "SOL-BAT-10KWH";
    const name = isInv ? "Inverter Hybrid Solando 5kW" : "Pin Lithium Storage 10kWh (LFP)";
    
    MOCK_DATA.serials[mockSerial] = {
        serialNumber: mockSerial,
        sku: sku,
        name: name,
        invoiceCode: "NK000101",
        soldDate: new Date().toISOString().split('T')[0],
        status: "InStock",
        warranty: null
    };
    MOCK_DATA.tickets[mockSerial] = [];
    
    // Lưu thông tin xuất bán giả lập
    saveDB();
    
    activationSerials.push(mockSerial);
    renderActivationSerials();
    showToast(`Mô phỏng quét QR: Đã quét thiết bị S/N ${mockSerial}`);
}

function activateWarranty() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const dealerCode = document.getElementById('cust-dealer').value;
    
    // Load database để lấy tên dealer
    loadDB();
    const dealerName = MOCK_DATA.customers[dealerCode]?.name || dealerCode;

    if (activationSerials.length === 0) {
        alert("Vui lòng quét hoặc nhập ít nhất một số Serial thiết bị trước khi kích hoạt!");
        return;
    }

    if (!name || !phone || !address) {
        alert("Vui lòng điền đầy đủ các thông tin khách hàng bắt buộc!");
        return;
    }

    const actDate = new Date();
    const formatActDate = actDate.toLocaleDateString('vi-VN');

    // Duyệt qua danh sách Serial và kích hoạt từng cái
    activationSerials.forEach(serial => {
        const dbSerial = MOCK_DATA.serials[serial];
        if (!dbSerial) return;

        const productInfo = MOCK_DATA.products[dbSerial.sku];
        const duration = productInfo ? productInfo.warranty : 60;
        const expDate = new Date();
        expDate.setMonth(expDate.getMonth() + duration);
        const formatExpDate = expDate.toLocaleDateString('vi-VN');

        dbSerial.status = 'Activated';
        dbSerial.warranty = {
            customerName: name,
            customerPhone: phone,
            address: address,
            activationDate: formatActDate,
            expiryDate: formatExpDate,
            duration: duration,
            dealer: dealerName
        };

        // Cập nhật cơ sở dữ liệu khách hàng cuối
        if (!MOCK_DATA.endCustomers[phone]) {
            MOCK_DATA.endCustomers[phone] = {
                name: name,
                phone: phone,
                address: address,
                dealer: dealerName,
                serials: [serial]
            };
        } else {
            if (!MOCK_DATA.endCustomers[phone].serials.includes(serial)) {
                MOCK_DATA.endCustomers[phone].serials.push(serial);
            }
            MOCK_DATA.endCustomers[phone].address = address;
            MOCK_DATA.endCustomers[phone].name = name;
            MOCK_DATA.endCustomers[phone].dealer = dealerName;
        }
    });

    saveDB(); // Save to local storage

    const activatedList = [...activationSerials];
    activationSerials = [];
    renderActivationSerials();
    displayCert(activatedList, name, phone, address);
    showToast("Kích hoạt bảo hành điện tử thành công!");
}

function displayCert(serialsList, name, phone, address) {
    const listContainer = document.getElementById('cert-prod-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    serialsList.forEach(serial => {
        const dbSerial = MOCK_DATA.serials[serial];
        if (!dbSerial || !dbSerial.warranty) return;

        const devCard = document.createElement('div');
        devCard.style.padding = '0.5rem';
        devCard.style.background = 'rgba(255, 255, 255, 0.04)';
        devCard.style.border = '1px solid rgba(16, 185, 129, 0.15)';
        devCard.style.borderRadius = '0.35rem';
        devCard.style.display = 'flex';
        devCard.style.justifyContent = 'space-between';
        devCard.style.alignItems = 'center';
        devCard.style.gap = '0.5rem';
        
        devCard.innerHTML = `
            <div style="text-align: left;">
                <strong style="color: #a7f3d0; font-size: 0.82rem;">${dbSerial.name}</strong>
                <div style="font-family: 'Fira Code', monospace; font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">S/N: ${serial}</div>
            </div>
            <div style="text-align: right; font-size: 0.72rem; flex-shrink: 0;">
                <div style="color: #34d399; font-weight: 600;">BH đến: ${dbSerial.warranty.expiryDate}</div>
                <div style="color: var(--text-dim); font-size: 0.65rem;">(${dbSerial.warranty.duration} Tháng)</div>
            </div>
        `;
        listContainer.appendChild(devCard);
    });

    document.getElementById('cert-cust-name').textContent = name;
    document.getElementById('cert-cust-phone').textContent = phone;
    document.getElementById('cert-address').textContent = address;

    const certCard = document.getElementById('warranty-certificate');
    certCard.style.display = 'block';
    certCard.scrollIntoView({ behavior: 'smooth' });
}

// ----------------------------------------------------
// CSKH: TRA CỨU SỰ CỐ & TICKET BẢO TRÌ
// ----------------------------------------------------
let activeCskhSerial = null;

function searchWarrantyHistory() {
    loadDB();
    
    const serial = document.getElementById('cskh-search-serial').value.trim();
    const device = MOCK_DATA.serials[serial];

    if (!device) {
        alert(`Không tìm thấy số Serial ${serial} trong hệ thống! Vui lòng tra cứu theo các mã có sẵn.`);
        return;
    }

    activeCskhSerial = serial;
    document.getElementById('cskh-prod-title').textContent = device.name;
    document.getElementById('cskh-serial-title').textContent = `S/N: ${device.serialNumber}`;
    document.getElementById('cskh-inv-code').textContent = device.invoiceCode;
    document.getElementById('cskh-sold-date').textContent = device.soldDate;

    const badge = document.getElementById('cskh-status-badge');
    
    if (device.status === 'Activated') {
        badge.className = 'status-badge badge-success';
        badge.textContent = 'Đang Bảo Hành';
        document.getElementById('cskh-cust-name').textContent = `${device.warranty.customerName} (${device.warranty.customerPhone})`;
        document.getElementById('cskh-cust-address').textContent = device.warranty.address;
        document.getElementById('cskh-duration').textContent = `${device.warranty.duration} Tháng`;
        document.getElementById('cskh-expiry-date').textContent = device.warranty.expiryDate;
    } else {
        badge.className = 'status-badge badge-warning';
        badge.textContent = 'Chưa Kích Hoạt';
        document.getElementById('cskh-cust-name').textContent = 'Chưa đăng ký (Chờ kỹ thuật quét QR)';
        document.getElementById('cskh-cust-address').textContent = 'Chưa lắp đặt';
        
        const productInfo = MOCK_DATA.products[device.sku];
        const defaultDuration = productInfo ? productInfo.warranty : 60;
        document.getElementById('cskh-duration').textContent = `${defaultDuration} Tháng (Mặc định)`;
        document.getElementById('cskh-expiry-date').textContent = 'Chưa áp dụng';
    }

    renderTickets();
    document.getElementById('cskh-results').style.display = 'block';
}

function renderTickets() {
    const list = document.getElementById('cskh-tickets-list');
    if (!list) return;
    list.innerHTML = '';

    const tickets = MOCK_DATA.tickets[activeCskhSerial] || [];

    if (tickets.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 1rem 0; font-size: 0.85rem;">Chưa có nhật ký sự cố bảo trì nào cho thiết bị này.</div>`;
        return;
    }

    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        const statusBadgeClass = ticket.status === 'Resolved' ? 'badge-success' : 'badge-warning';
        card.innerHTML = `
            <div class="ticket-info">
                <h5>[${ticket.id}] ${ticket.description}</h5>
                <p>Người yêu cầu: ${ticket.requester} • Ngày báo lỗi: ${ticket.date}</p>
            </div>
            <span class="status-badge ${statusBadgeClass}">${ticket.status === 'Resolved' ? 'Đã Xử Lý' : 'Chờ Xử Lý'}</span>
        `;
        list.appendChild(card);
    });
}

function openTicketModal() {
    if (!activeCskhSerial) return;
    document.getElementById('ticket-phone').value = MOCK_DATA.serials[activeCskhSerial]?.warranty?.customerPhone || '';
    document.getElementById('ticket-desc').value = '';
    document.getElementById('ticket-modal').classList.add('show');
}

function closeTicketModal() {
    document.getElementById('ticket-modal').classList.remove('show');
}

function submitTicket() {
    const phone = document.getElementById('ticket-phone').value.trim();
    const desc = document.getElementById('ticket-desc').value.trim();

    if (!phone || !desc) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    const ticketId = `TK-000${(MOCK_DATA.tickets[activeCskhSerial]?.length || 0) + 1}`;
    const newTicket = {
        id: ticketId,
        requester: phone,
        description: desc,
        status: "Pending",
        date: new Date().toLocaleDateString('vi-VN')
    };

    MOCK_DATA.tickets[activeCskhSerial].push(newTicket);
    saveDB(); // Save to local storage
    renderTickets();
    closeTicketModal();
    showToast(`Đã khởi tạo Ticket sự cố ${ticketId} thành công!`);
}

// KHỞI CHẠY HỆ THỐNG
window.onload = function() {
    renderActivationSerials();
    switchTab(null, 'customer');
};
