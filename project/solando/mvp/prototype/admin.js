// Solando CRM Admin Portal Controller Logic

// VIEW CONTROLLER
function switchTab(event, role) {
    if (event) event.preventDefault();

    // 1. Cập nhật Sidebar Desktop
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));

    const activeItem = document.getElementById(`nav-${role}`);
    if (activeItem) activeItem.classList.add('active');

    const activePanel = document.getElementById(`view-${role}`);
    if (activePanel) activePanel.classList.add('active');

    // 2. Cập nhật Bottom Nav Mobile tương ứng (nếu có trên view admin di động)
    document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const mActiveItem = document.getElementById(`m-nav-${role}`);
    if (mActiveItem) mActiveItem.classList.add('active');

    // Cập nhật tiêu đề breadcrumb
    const labelMap = {
        'storekeeper': 'Phần hệ: Thủ Kho Nhập Kho',
        'activated-devices': 'Phần hệ: Quản Lý Thiết Bị Bảo Hành',
        'end-customers': 'Phần hệ: Danh Sách Khách Hàng Cuối',
        'cskh': 'Phần hệ: CSKH & Hỗ Trợ Kỹ Thuật',
        'invoices': 'KiotViet Sync: Danh Sách Đơn Hàng (Hóa Đơn)',
        'products': 'KiotViet Sync: Danh Mục SKU Sản Phẩm',
        'dealers': 'KiotViet Sync: Danh Sách Đại Lý & Khách Hàng B2B'
    };
    document.getElementById('active-view-title').textContent = labelMap[role] || 'Hệ thống Bảo Hành';

    // Đóng dropdown kiotviet nếu đang mở
    const dropdown = document.getElementById('kiotviet-dropdown');
    if (dropdown) dropdown.classList.remove('show');
}

// MOBILE SPECIFIC NAV CONTROLLER
function switchTabMobile(role) {
    switchTab(null, role);
}

function selectKiotVietTab(role) {
    switchTab(null, role);
    document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
}

function toggleMobileKiotVietMenu() {
    const dropdown = document.getElementById('kiotviet-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast-banner');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close mobile dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('kiotviet-dropdown');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (dropdown && menuBtn && !dropdown.contains(event.target) && !menuBtn.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// ----------------------------------------------------
// CORE DATABASE & LIST RENDERERS
// ----------------------------------------------------
function renderDataLists() {
    renderSyncedInvoices();
    renderSyncedProducts();
    renderSyncedDealers();
    renderActivatedDevices();
    renderEndCustomers();
}

// 1. DỮ LIỆU ĐỒNG BỘ: DANH SÁCH ĐƠN HÀNG (KIOTVIET)
function renderSyncedInvoices() {
    const tbody = document.getElementById('ui-invoices-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filter = MOCK_DATA.filters.invoices;

    Object.values(MOCK_DATA.invoices).forEach(inv => {
        const matchesSearch = inv.id.toLowerCase().includes(filter.search.toLowerCase()) || 
                              inv.customerName.toLowerCase().includes(filter.search.toLowerCase());
        
        const matchesDealer = filter.dealer === 'ALL' || inv.customerCode === filter.dealer;
        
        const matchesStatus = filter.status === 'ALL' || 
                              (filter.status === 'PENDING' && inv.status === 'Pending') ||
                              (filter.status === 'COMPLETED' && inv.status === 'Completed');

        if (!matchesSearch || !matchesDealer || !matchesStatus) return;

        let totalQtyToMap = 0;
        let totalMapped = 0;

        inv.products.forEach(p => {
            const prodInfo = MOCK_DATA.products[p.sku];
            if (prodInfo && prodInfo.hasSerial) {
                totalQtyToMap += p.qty;
                totalMapped += p.mapped.filter(val => val !== '').length;
            }
        });

        const isCompleted = inv.status === 'Completed';
        let statusText = '';
        let statusClass = '';

        if (totalQtyToMap === 0) {
            statusText = 'Không cần Serial';
            statusClass = 'badge-info';
        } else if (totalMapped === 0) {
            statusText = 'Chờ Gán Serial';
            statusClass = 'badge-warning';
        } else if (totalMapped < totalQtyToMap) {
            statusText = `Đang Gán (${totalMapped}/${totalQtyToMap})`;
            statusClass = 'badge-warning';
        } else {
            statusText = 'Đã Gán Đủ';
            statusClass = 'badge-success';
        }

        const actionBtn = isCompleted || totalQtyToMap === 0
            ? `<button class="btn btn-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.72rem;" onclick="quickOpenInvoice('${inv.id}')">Xem Chi Tiết</button>`
            : `<button class="btn btn-primary" style="padding: 0.3rem 0.65rem; font-size: 0.72rem;" onclick="quickOpenInvoice('${inv.id}')">Gán Serial</button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 700; color: #a5b4fc; cursor: pointer;" onclick="quickOpenInvoice('${inv.id}')">${inv.id}</td>
            <td class="clickable-item" onclick="filterInvoicesByDealer('${inv.customerCode}')">${inv.customerName}</td>
            <td>${inv.soldDate}</td>
            <td style="text-align: center;"><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td style="text-align: center;">${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function quickOpenInvoice(invoiceId) {
    switchTab(null, 'storekeeper');
    switchStorekeeperSubTab('export');
    document.getElementById('store-invoice-id').value = invoiceId;
    simFetchExportOrder();
}

function filterInvoicesByDealer(dealerCode) {
    MOCK_DATA.filters.invoices.dealer = dealerCode;
    const filterSelect = document.getElementById('filter-inv-dealer');
    if (filterSelect) filterSelect.value = dealerCode;
    switchTab(null, 'invoices');
    renderSyncedInvoices();
}

// 2. DỮ LIỆU ĐỒNG BỘ: DANH MỤC SẢN PHẨM (KIOTVIET)
function renderSyncedProducts() {
    const tbody = document.getElementById('ui-products-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filter = MOCK_DATA.filters.products;

    Object.values(MOCK_DATA.products).forEach(p => {
        const matchesSearch = p.sku.toLowerCase().includes(filter.search.toLowerCase()) || 
                              p.name.toLowerCase().includes(filter.search.toLowerCase());
        
        const matchesCategory = filter.category === 'ALL' || p.category === filter.category;

        if (!matchesSearch || !matchesCategory) return;

        const isSerialText = p.hasSerial ? 'Bắt buộc Serial' : 'Số lượng (Không Serial)';
        const isSerialClass = p.hasSerial ? 'badge-info' : 'badge-warning';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: 'Fira Code', monospace; color: #fbbf24; font-weight: 600;">${p.sku}</td>
            <td style="font-weight: 600;">${p.name}</td>
            <td>${p.category}</td>
            <td style="text-align: center; color: var(--green); font-weight: 600;">${p.warranty > 0 ? p.warranty + ' Tháng' : 'Không có'}</td>
            <td style="text-align: center;"><span class="status-badge ${isSerialClass}">${isSerialText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. DỮ LIỆU ĐỒNG BỘ: DANH SÁCH ĐẠI LÝ B2B (KIOTVIET CRM)
function renderSyncedDealers() {
    const tbody = document.getElementById('ui-dealers-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filter = MOCK_DATA.filters.dealers;

    Object.values(MOCK_DATA.customers).forEach(c => {
        const matchesSearch = c.code.toLowerCase().includes(filter.search.toLowerCase()) || 
                              c.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                              c.location.toLowerCase().includes(filter.search.toLowerCase());

        if (!matchesSearch) return;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: 'Fira Code', monospace; color: #a5b4fc;">${c.code}</td>
            <td class="clickable-item" style="font-weight: 700;" onclick="filterInvoicesByDealer('${c.code}')">${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.location}</td>
            <td style="text-align: center;">
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; font-weight: 600;" onclick="filterInvoicesByDealer('${c.code}')">Xem Đơn</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 4. NGHIỆP VỤ: DANH SÁCH THIẾT BỊ ĐÃ KÍCH HOẠT BẢO HÀNH (ACTIVATED DEVICES)
function renderActivatedDevices() {
    const tbody = document.getElementById('ui-activated-devices-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filter = MOCK_DATA.filters.activatedDevices;

    Object.values(MOCK_DATA.serials).forEach(s => {
        if (s.status !== 'Activated' || !s.warranty) return;

        const matchesSearch = s.serialNumber.toLowerCase().includes(filter.search.toLowerCase()) || 
                              s.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                              s.warranty.customerName.toLowerCase().includes(filter.search.toLowerCase()) ||
                              s.warranty.customerPhone.includes(filter.search);

        if (!matchesSearch) return;

        const expParts = s.warranty.expiryDate.split('/');
        const expDateObj = new Date(expParts[2], expParts[1] - 1, expParts[0]);
        const now = new Date();
        const isExpired = now > expDateObj;

        const statusText = isExpired ? 'Hết Bảo Hành' : 'Đang Bảo Hành';
        const statusClass = isExpired ? 'badge-danger' : 'badge-success';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: 'Fira Code', monospace; font-weight:600; color: #34d399; cursor:pointer;" class="clickable-item" onclick="quickSearchSerial('${s.serialNumber}')">${s.serialNumber}</td>
            <td style="font-weight: 600;">${s.name}</td>
            <td>${s.warranty.customerName} (<span style="color:var(--text-dim);">${s.warranty.customerPhone}</span>)</td>
            <td style="font-size:0.75rem;">${s.warranty.address}</td>
            <td style="font-size:0.75rem; color:var(--text-dim);">${s.warranty.dealer}</td>
            <td style="text-align: center;">${s.warranty.activationDate}</td>
            <td style="text-align: center; color: #34d399; font-weight:600;">${s.warranty.expiryDate}</td>
            <td style="text-align: center;"><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function quickSearchSerial(serialNumber) {
    document.getElementById('cskh-search-serial').value = serialNumber;
    switchTab(null, 'cskh');
    searchWarrantyHistory();
}

// 5. NGHIỆP VỤ: DANH SÁCH KHÁCH HÀNG CUỐI (END CUSTOMERS)
function renderEndCustomers() {
    const tbody = document.getElementById('ui-end-customers-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filter = MOCK_DATA.filters.endCustomers;

    Object.values(MOCK_DATA.endCustomers).forEach(cust => {
        const matchesSearch = cust.name.toLowerCase().includes(filter.search.toLowerCase()) || 
                              cust.phone.includes(filter.search) ||
                              cust.address.toLowerCase().includes(filter.search.toLowerCase());

        if (!matchesSearch) return;

        const serialsListHtml = cust.serials.map(sn => {
            return `<span class="status-badge badge-info clickable-item" style="font-family:'Fira Code', monospace; margin: 2px;" onclick="quickSearchSerial('${sn}')">${sn}</span>`;
        }).join(' ');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 700; color: #f1f5f9;">${cust.name}</td>
            <td style="font-weight: 600; color: #a5b4fc;">${cust.phone}</td>
            <td style="font-size:0.78rem;">${cust.address}</td>
            <td style="font-size:0.78rem; color:var(--text-dim);">${cust.dealer}</td>
            <td>${serialsListHtml}</td>
            <td style="text-align: center; font-weight:700; color:var(--green);">${cust.serials.length} Thiết bị</td>
        `;
        tbody.appendChild(tr);
    });
}

// ----------------------------------------------------
// THỦ KHO: LOGIC GÁN SERIAL KHI NHẬP KHO NHẬP KHẨU
// ----------------------------------------------------
// ----------------------------------------------------
// THỦ KHO: LOGIC QUẢN LÝ KHO 2 BƯỚC (NHẬP KHO / XUẤT KHO)
// ----------------------------------------------------
let activeImportReceipt = null;
let activeExportOrder = null;

function switchStorekeeperSubTab(tab) {
    const importTab = document.getElementById('subtab-import');
    const exportTab = document.getElementById('subtab-export');
    const importPanel = document.getElementById('store-import-panel');
    const exportPanel = document.getElementById('store-export-panel');

    if (tab === 'import') {
        importTab.className = 'btn btn-primary';
        exportTab.className = 'btn btn-secondary';
        importPanel.style.display = 'block';
        exportPanel.style.display = 'none';
        resetExportView();
    } else {
        importTab.className = 'btn btn-secondary';
        exportTab.className = 'btn btn-primary';
        importPanel.style.display = 'none';
        exportPanel.style.display = 'block';
        resetImportView();
    }
}

// --- 1. LOGIC PHÂN HỆ NHẬP KHO ---
function simFetchImport() {
    const importId = document.getElementById('store-import-id').value.trim();
    const imp = MOCK_DATA.imports[importId];

    if (!imp) {
        alert(`Không tìm thấy phiếu nhập kho ${importId}! Vui lòng nhập NK000101 hoặc NK000102.`);
        return;
    }

    activeImportReceipt = JSON.parse(JSON.stringify(imp)); // Clone object
    document.getElementById('import-title').textContent = `Phiếu Nhập Kho: ${activeImportReceipt.id}`;
    document.getElementById('import-partner').textContent = `Đối tác: ${activeImportReceipt.partner} • Ngày nhập: ${activeImportReceipt.importDate}`;
    
    const isCompleted = activeImportReceipt.status === 'Completed';
    const badge = document.getElementById('import-status');
    badge.textContent = isCompleted ? 'Đã Gán Đủ Serial' : 'Chờ Gán Serial';
    badge.className = `status-badge ${isCompleted ? 'badge-success' : 'badge-warning'}`;

    const grid = document.getElementById('import-products-grid');
    grid.innerHTML = '';

    activeImportReceipt.products.forEach((prod, prodIdx) => {
        const productInfo = MOCK_DATA.products[prod.sku];
        if (!productInfo || !productInfo.hasSerial) {
            const row = document.createElement('div');
            row.className = 'product-item-card';
            row.style.opacity = '0.7';
            row.innerHTML = `
                <div class="product-info">
                    <h4>${prod.name}</h4>
                    <p>Mã SKU: ${prod.sku} | Số lượng: ${prod.qty}</p>
                </div>
                <div style="color: var(--text-dim); font-size: 0.8rem; font-style: italic;">
                    Sản phẩm này không yêu cầu quản lý số Serial.
                </div>
                <div style="text-align: right;">
                    <span class="status-badge badge-success">Bỏ qua</span>
                </div>
            `;
            grid.appendChild(row);
            return;
        }

        for (let i = 0; i < prod.qty; i++) {
            const idx = `${prodIdx}-${i}`;
            const serialValue = prod.mapped[i] || '';

            const row = document.createElement('div');
            row.className = 'product-item-card';
            row.innerHTML = `
                <div class="product-info">
                    <h4>${prod.name}</h4>
                    <p>Mã SKU: ${prod.sku} | Số Serial: ${i + 1}/${prod.qty}</p>
                </div>
                <div class="serial-input-wrap">
                    <input type="text" id="serial-${idx}" class="store-serial-input" data-sku="${prod.sku}" data-name="${prod.name}" data-idx="${i}" data-prodidx="${prodIdx}" placeholder="Quét hoặc điền số Serial" value="${serialValue}">
                    <button class="scan-icon-btn" onclick="autoFillSerial('${idx}', '${prod.sku}')" title="Mô phỏng quét mã vạch">📷</button>
                </div>
                <div style="text-align: right;">
                    <span class="status-badge ${serialValue ? 'badge-success' : 'badge-warning'}" id="status-badge-${idx}">
                        ${serialValue ? 'Đã Gán' : 'Chờ Gán'}
                    </span>
                </div>
            `;
            grid.appendChild(row);
        }
    });

    document.getElementById('import-results-card').style.display = 'block';
    showToast("Đã đồng bộ hóa dữ liệu phiếu nhập kho!");
}

function autoFillSerial(idx, sku) {
    const input = document.getElementById(`serial-${idx}`);
    const badge = document.getElementById(`status-badge-${idx}`);
    if (!input) return;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    let prefix = 'SLD-GEN';
    if (sku.includes('INV-5K')) prefix = 'SLD-INV-5K';
    else if (sku.includes('INV-10K')) prefix = 'SLD-INV-10K';
    else if (sku.includes('BAT-10K')) prefix = 'SLD-BAT-10K';
    else if (sku.includes('BAT-5K')) prefix = 'SLD-BAT-5K';

    const serialVal = `${prefix}-${randomSuffix}`;
    input.value = serialVal;
    badge.className = 'status-badge badge-success';
    badge.textContent = 'Đã Gán';
    showToast("Mô phỏng: Quét mã vạch nhập kho thành công!");
}

function saveImportSerials() {
    const inputs = document.querySelectorAll('.store-serial-input');
    let allFilled = true;

    inputs.forEach(input => {
        const val = input.value.trim();
        if (!val) {
            allFilled = false;
            input.style.borderColor = 'var(--red)';
        } else {
            input.style.borderColor = 'var(--border)';
        }
    });

    if (!allFilled) {
        alert("Vui lòng quét hoặc nhập đủ số Serial của các thiết bị chính trước khi nhập kho!");
        return;
    }

    inputs.forEach(input => {
        const val = input.value.trim();
        const sku = input.dataset.sku;
        const name = input.dataset.name;
        const idx = parseInt(input.dataset.idx);
        const prodidx = parseInt(input.dataset.prodidx);

        MOCK_DATA.imports[activeImportReceipt.id].products[prodidx].mapped[idx] = val;

        if (!MOCK_DATA.serials[val]) {
            MOCK_DATA.serials[val] = {
                serialNumber: val,
                sku: sku,
                name: name,
                invoiceCode: activeImportReceipt.id,
                soldDate: activeImportReceipt.importDate,
                status: "InStock",
                warranty: null
            };
            MOCK_DATA.tickets[val] = [];
        }
    });

    MOCK_DATA.imports[activeImportReceipt.id].status = "Completed";

    saveDB(); // Save to local storage
    renderDataLists();
    showToast("Đã lưu thông tin Serial thiết bị nhập kho!");
    resetImportView();
}

function resetImportView() {
    const resultsCard = document.getElementById('import-results-card');
    if (resultsCard) resultsCard.style.display = 'none';
    const input = document.getElementById('store-import-id');
    if (input) input.value = '';
    activeImportReceipt = null;
}

// --- 2. LOGIC PHÂN HỆ XUẤT KHO ---
function simFetchExportOrder() {
    const invoiceId = document.getElementById('store-invoice-id').value.trim();
    const inv = MOCK_DATA.invoices[invoiceId];

    if (!inv) {
        alert(`Không tìm thấy hóa đơn KiotViet ${invoiceId}! Vui lòng kiểm tra lại tab "Đơn Hàng KiotViet" để lấy mã.`);
        return;
    }

    activeExportOrder = JSON.parse(JSON.stringify(inv)); // Clone object
    document.getElementById('export-title').textContent = `Hóa Đơn: ${activeExportOrder.id}`;
    document.getElementById('export-dealer').textContent = `Đại lý: ${activeExportOrder.customerName} • Ngày lập đơn: ${activeExportOrder.soldDate}`;
    
    const isCompleted = activeExportOrder.status === 'Completed';
    const badge = document.getElementById('export-status');
    badge.textContent = isCompleted ? 'Đã Xuất Kho' : 'Chờ Xuất Kho';
    badge.className = `status-badge ${isCompleted ? 'badge-success' : 'badge-warning'}`;

    const grid = document.getElementById('export-products-grid');
    grid.innerHTML = '';

    activeExportOrder.products.forEach((prod, prodIdx) => {
        const productInfo = MOCK_DATA.products[prod.sku];
        if (!productInfo || !productInfo.hasSerial) {
            const row = document.createElement('div');
            row.className = 'product-item-card';
            row.style.opacity = '0.7';
            row.innerHTML = `
                <div class="product-info">
                    <h4>${prod.name}</h4>
                    <p>Mã SKU: ${prod.sku} | Số lượng: ${prod.qty}</p>
                </div>
                <div style="color: var(--text-dim); font-size: 0.8rem; font-style: italic;">
                    Sản phẩm này không yêu cầu quản lý số Serial.
                </div>
                <div style="text-align: right;">
                    <span class="status-badge badge-success">Bỏ qua</span>
                </div>
            `;
            grid.appendChild(row);
            return;
        }

        // Get list of available InStock serials for this SKU
        const availableSerials = Object.values(MOCK_DATA.serials).filter(s => s.sku === prod.sku && s.status === 'InStock');

        for (let i = 0; i < prod.qty; i++) {
            const idx = `${prodIdx}-${i}`;
            const selectedSerial = prod.mapped[i] || '';

            // Generate dropdown options
            let optionsHtml = `<option value="">-- Chọn Serial trong kho --</option>`;
            availableSerials.forEach(s => {
                const selectedAttr = s.serialNumber === selectedSerial ? 'selected' : '';
                optionsHtml += `<option value="${s.serialNumber}" ${selectedAttr}>${s.serialNumber}</option>`;
            });

            // If there are no available serials and it's not mapped yet, show warning option
            if (availableSerials.length === 0 && !selectedSerial) {
                optionsHtml = `<option value="">⚠️ Hết hàng InStock trong kho!</option>`;
            }

            const row = document.createElement('div');
            row.className = 'product-item-card';
            row.innerHTML = `
                <div class="product-info">
                    <h4>${prod.name}</h4>
                    <p>Mã SKU: ${prod.sku} | Thiết bị: ${i + 1}/${prod.qty}</p>
                </div>
                <div class="serial-input-wrap">
                    <select id="export-serial-${idx}" class="store-export-select" data-sku="${prod.sku}" data-name="${prod.name}" data-idx="${i}" data-prodidx="${prodIdx}" style="width: 100%; background: #1e293b; border: 1px solid var(--border); color: var(--text); padding: 8px; border-radius: 6px;" onchange="updateExportBadge('${idx}')">
                        ${optionsHtml}
                    </select>
                    <button class="scan-icon-btn" onclick="autoFillExportSerial('${idx}', '${prod.sku}')" title="Quét chọn tự động">📷</button>
                </div>
                <div style="text-align: right;">
                    <span class="status-badge ${selectedSerial ? 'badge-success' : 'badge-warning'}" id="export-badge-${idx}">
                        ${selectedSerial ? 'Đã Chọn' : 'Chờ Chọn'}
                    </span>
                </div>
            `;
            grid.appendChild(row);
        }
    });

    document.getElementById('export-results-card').style.display = 'block';
    showToast("Đã đồng bộ hóa dữ liệu hóa đơn!");
}

function updateExportBadge(idx) {
    const select = document.getElementById(`export-serial-${idx}`);
    const badge = document.getElementById(`export-badge-${idx}`);
    if (select && badge) {
        if (select.value) {
            badge.className = 'status-badge badge-success';
            badge.textContent = 'Đã Chọn';
        } else {
            badge.className = 'status-badge badge-warning';
            badge.textContent = 'Chờ Chọn';
        }
    }
}

function autoFillExportSerial(idx, sku) {
    const select = document.getElementById(`export-serial-${idx}`);
    if (!select) return;

    // Find all currently selected serials in other dropdowns to avoid duplicate selection
    const selectedVals = Array.from(document.querySelectorAll('.store-export-select'))
                              .map(s => s.value)
                              .filter(v => v !== '');

    // Get list of InStock serials not yet selected
    const available = Object.values(MOCK_DATA.serials).filter(s => s.sku === sku && s.status === 'InStock' && !selectedVals.includes(s.serialNumber));

    if (available.length === 0) {
        alert(`Không còn số Serial nào của SKU ${sku} đang ở trạng thái InStock trong kho! Vui lòng nhập kho hàng mới trước.`);
        return;
    }

    const randomSerialObj = available[Math.floor(Math.random() * available.length)];
    
    // Add option if not exists (safeguard)
    let exists = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === randomSerialObj.serialNumber) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        const opt = document.createElement('option');
        opt.value = randomSerialObj.serialNumber;
        opt.textContent = randomSerialObj.serialNumber;
        select.appendChild(opt);
    }
    
    select.value = randomSerialObj.serialNumber;
    updateExportBadge(idx);
    showToast("Mô phỏng: Chọn ngẫu nhiên Serial trong kho thành công!");
}

function saveExportSerials() {
    const selects = document.querySelectorAll('.store-export-select');
    let allSelected = true;
    const selectedSerials = [];

    selects.forEach(select => {
        const val = select.value;
        if (!val) {
            allSelected = false;
            select.style.borderColor = 'var(--red)';
        } else {
            select.style.borderColor = 'var(--border)';
            selectedSerials.push(val);
        }
    });

    if (!allSelected) {
        alert("Vui lòng gán đầy đủ số Serial cho tất cả các thiết bị xuất kho!");
        return;
    }

    // Check for duplicate selections
    const uniqueSerials = [...new Set(selectedSerials)];
    if (uniqueSerials.length !== selectedSerials.length) {
        alert("Lỗi: Không được chọn trùng một số Serial cho nhiều thiết bị khác nhau!");
        return;
    }

    selects.forEach(select => {
        const val = select.value;
        const idx = parseInt(select.dataset.idx);
        const prodidx = parseInt(select.dataset.prodidx);

        // Update sales order mapping
        MOCK_DATA.invoices[activeExportOrder.id].products[prodidx].mapped[idx] = val;

        // Update Serial state to Sold and link to invoice
        if (MOCK_DATA.serials[val]) {
            MOCK_DATA.serials[val].status = "Sold";
            MOCK_DATA.serials[val].invoiceCode = activeExportOrder.id;
            MOCK_DATA.serials[val].soldDate = new Date().toISOString().split('T')[0];
        }
    });

    MOCK_DATA.invoices[activeExportOrder.id].status = "Completed";

    saveDB(); // Save to local storage
    renderDataLists();
    showToast("Đã xuất kho và lưu thông tin Serial thành công!");
    resetExportView();
}

function resetExportView() {
    const resultsCard = document.getElementById('export-results-card');
    if (resultsCard) resultsCard.style.display = 'none';
    const input = document.getElementById('store-invoice-id');
    if (input) input.value = '';
    activeExportOrder = null;
}

// ----------------------------------------------------
// CSKH: TRA CỨU SỰ CỐ & TICKET BẢO TRÌ
// ----------------------------------------------------
let activeCskhSerial = null;

function searchWarrantyHistory() {
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
        document.getElementById('cskh-cust-name').textContent = 'Chưa đăng ký (Chờ người dùng quét QR)';
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

    tickets.forEach((ticket, idx) => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.gap = '12px';

        const statusBadgeClass = ticket.status === 'Resolved' ? 'badge-success' : 'badge-warning';
        
        let actionBtnHtml = '';
        if (ticket.status === 'Pending') {
            actionBtnHtml = `<button class="btn btn-success" style="padding: 4px 8px; font-size: 11px; margin-left: 8px;" onclick="resolveTicket(${idx})">Xử Lý Xong</button>`;
        }

        card.innerHTML = `
            <div class="ticket-info" style="flex: 1;">
                <h5>[${ticket.id}] ${ticket.description}</h5>
                <p>Người yêu cầu: ${ticket.requester} • Ngày báo lỗi: ${ticket.date}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge ${statusBadgeClass}">${ticket.status === 'Resolved' ? 'Đã Xử Lý' : 'Chờ Xử Lý'}</span>
                ${actionBtnHtml}
            </div>
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
    renderDataLists();
    renderTickets();
    closeTicketModal();
    showToast(`Đã khởi tạo Ticket sự cố ${ticketId} thành công!`);
}

function resolveTicket(idx) {
    if (!activeCskhSerial) return;
    
    MOCK_DATA.tickets[activeCskhSerial][idx].status = 'Resolved';
    saveDB(); // Save to local storage
    
    renderDataLists();
    renderTickets();
    showToast("Đã xử lý xong ticket sự cố và cập nhật trạng thái!");
}

// ----------------------------------------------------
// REAL-TIME SEARCH & FILTER EVENT LISTENERS
// ----------------------------------------------------
function initEventListeners() {
    const searchInv = document.getElementById('search-inv');
    if (searchInv) {
        searchInv.addEventListener('input', (e) => {
            MOCK_DATA.filters.invoices.search = e.target.value;
            renderSyncedInvoices();
        });
    }

    const filterInvStatus = document.getElementById('filter-inv-status');
    if (filterInvStatus) {
        filterInvStatus.addEventListener('change', (e) => {
            MOCK_DATA.filters.invoices.status = e.target.value;
            renderSyncedInvoices();
        });
    }

    const filterInvDealer = document.getElementById('filter-inv-dealer');
    if (filterInvDealer) {
        filterInvDealer.innerHTML = '<option value="ALL">-- Tất cả Đại lý mua --</option>';
        Object.values(MOCK_DATA.customers).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.code;
            opt.textContent = c.name;
            filterInvDealer.appendChild(opt);
        });

        filterInvDealer.addEventListener('change', (e) => {
            MOCK_DATA.filters.invoices.dealer = e.target.value;
            renderSyncedInvoices();
        });
    }

    const searchProd = document.getElementById('search-prod');
    if (searchProd) {
        searchProd.addEventListener('input', (e) => {
            MOCK_DATA.filters.products.search = e.target.value;
            renderSyncedProducts();
        });
    }

    const filterProdCat = document.getElementById('filter-prod-cat');
    if (filterProdCat) {
        filterProdCat.addEventListener('change', (e) => {
            MOCK_DATA.filters.products.category = e.target.value;
            renderSyncedProducts();
        });
    }

    const searchDealer = document.getElementById('search-dealer');
    if (searchDealer) {
        searchDealer.addEventListener('input', (e) => {
            MOCK_DATA.filters.dealers.search = e.target.value;
            renderSyncedDealers();
        });
    }

    const searchAct = document.getElementById('search-act');
    if (searchAct) {
        searchAct.addEventListener('input', (e) => {
            MOCK_DATA.filters.activatedDevices.search = e.target.value;
            renderActivatedDevices();
        });
    }

    const searchEndCust = document.getElementById('search-end-cust');
    if (searchEndCust) {
        searchEndCust.addEventListener('input', (e) => {
            MOCK_DATA.filters.endCustomers.search = e.target.value;
            renderEndCustomers();
        });
    }
}

// KHỞI CHẠY HỆ THỐNG
window.onload = function() {
    renderDataLists();
    initEventListeners();
    switchTab(null, 'end-customers');
};
