// Unified Portal JavaScript Business Logic with Batch Rendering & Layout Specifications

let currentUserId = "USER_MERCHANT_1"; // Default
let currentUserRole = "Merchant";     // Default
let uploadedProducts = [];            // Merchant uploaded product images list
let activeRenderLayoutId = null;       // Currently rendering layout
let isBeforeAfterDragging = false;

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    switchTab('products');
    
    // Close custom select dropdowns when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest('.custom-select-wrapper')) {
            document.querySelectorAll('.custom-select-options-panel').forEach(panel => {
                panel.style.display = 'none';
            });
            document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
                wrapper.classList.remove('active-focus');
            });
        }
    });
});

// Tab switcher logic
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
    });

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });

    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    const menuEl = document.getElementById('menu-' + tabId);
    if (menuEl) {
        menuEl.classList.add('active');
    }

    // Update Breadcrumb & Trigger Tab Functions
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    if (tabId === 'products') {
        breadcrumbTitle.textContent = "Kho Sản Phẩm Tách Nền";
        renderUploadedProducts();
    } else if (tabId === 'studio') {
        breadcrumbTitle.textContent = "AI Studio Workspace";
        populateMerchantTemplateSelect();
        populateMerchantProductSelect();
    } else if (tabId === 'gallery') {
        breadcrumbTitle.textContent = "Thư Viện Ảnh Lịch Sử";
        renderGallery();
    } else if (tabId === 'templates') {
        breadcrumbTitle.textContent = "Kho Template Console";
        populateAdminGroupSelect();
        renderTemplatesTable();
    } else if (tabId === 'logs') {
        breadcrumbTitle.textContent = "Audit Logs System";
        renderLogsTable();
    }
}


/* ==================== MERCHANT BATCH & LAYOUT LOGIC ==================== */

// Handle Create Product
function handleCreateProduct(event) {
    event.preventDefault();
    const code = document.getElementById('prod-code').value.trim();
    const name = document.getElementById('prod-name').value.trim();
    
    // Check duplication
    const all = dbFindAll('products');
    if (all.some(p => p.product_code === code)) {
        alert("Mã sản phẩm (SKU) này đã tồn tại trên hệ thống!");
        return;
    }

    const newProd = {
        product_code: code,
        product_name: name
    };

    dbCreate('products', newProd);
    dbCreateLog(currentUserId, "CREATE_PRODUCT", `Khởi tạo sản phẩm mới: ${name} (${code})`);
    
    document.getElementById('create-product-form').reset();
    renderUploadedProducts();
    alert("Khởi tạo sản phẩm thành công!");
}

function triggerProductFileInput(prodId) {
    document.getElementById(`prod-file-input-${prodId}`).click();
}

// Handle folder / files upload selection for a specific SKU product
function handleProductFileSelect(event, productId) {
    const files = event.target.files;
    if (files.length > 0) {
        const dbImages = dbFindAll('product_images');
        const startIdx = dbImages.length;

        // Mocked product image list based on filenames and save to DB
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const nextId = 'PROD_IMG_' + (startIdx + i + 1);
            
            // Choose nice mock images depending on order
            let mockRaw = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"; // Red shoe
            let mockPng = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTUsNjUgTDMwLDQwIEw0NSwzNSBMODAsMzUgTDg1LDQ1IEw3MCw3MCBMMjAsNzAgWiBNNDUsMzUgTDUwLDQ1IE01NSwzNSBMNjAsNDUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI2RjMjYyNiIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMyIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1MCIgeT0iNjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R0lBWSBETzwvdGV4dD48L3N2Zz4=';
            
            if (i === 1) {
                mockRaw = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80"; // White sneaker
                mockPng = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTUsNjUgTDMwLDQwIEw0NSwzNSBMODAsMzUgTDg1LDQ1IEw3MCw3MCBMMjAsNzAgWiBNNDUsMzUgTDUwLDQ1IE01NSwzNSBMNjAsNDUiIHN0cm9rZT0iIzY0NzQ4YiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjZjFmNWY5Ii8+PGNpcmNsZSBjeD0iMzUiIGN5PSI1MCIgcj0iMyIgZmlsbD0iIzY0NzQ4YiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMiIGZpbGw9IiM2NDc0OGIiLz48dGV4dCB4PSI1MCIgeT0iNjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2NDc0OGIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HSUFZIFRSQU5HPC90ZXh0Pjwvc3ZnPg=='; // Transparent shoe
            } else if (i >= 2) {
                mockRaw = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80"; // Pink sneakers
                mockPng = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTUsNjUgTDMwLDQwIEw0NSwzNSBMODAsMzUgTDg1LDQ1IEw3MCw3MCBMMjAsNzAgWiBNNDUsMzUgTDUwLDQ1IE01NSwzNSBMNjAsNDUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI2VjNDg5OSIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMyIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1MCIgeT0iNjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R0lBWSBIT05HPC90ZXh0Pjwvc3ZnPg==';
            }
            
            const newImg = {
                id: nextId,
                product_id: productId,
                name: f.name,
                raw_url: mockRaw,
                processed_url: mockPng,
                status: 'Processing' // Call background removal API
            };

            dbCreate('product_images', newImg);
        }
        
        renderUploadedProducts();
        dbCreateLog(currentUserId, "UPLOAD_BATCH", `Tải lên ${files.length} ảnh cho sản phẩm ID: ${productId}`);
        
        // Simulate Background Removal API calls in parallel (staggered delay)
        const allImages = dbFindAll('product_images');
        const newlyUploaded = allImages.filter(img => img.status === 'Processing');

        newlyUploaded.forEach((img, idx) => {
            setTimeout(() => {
                const fullDb = getDB();
                const item = fullDb.product_images.find(i => i.id === img.id);
                if (item) {
                    item.status = 'Completed';
                    localStorage.setItem('mock_db', JSON.stringify(fullDb));
                }
                
                renderUploadedProducts();
                dbCreateLog(currentUserId, "API_BACKGROUND_REMOVAL", `Gọi API tách nền thành công cho file: ${img.name}`);
            }, 1000 + (idx * 500));
        });
    }
}

// Render catalog of products and their separated images
function renderUploadedProducts() {
    const listContainer = document.getElementById('products-catalog-list');
    if (!listContainer) return;
    
    const dbProds = dbFindAll('products');
    if (dbProds.length === 0) {
        listContainer.innerHTML = `<p style="text-align: center; color: var(--text-dim); padding: 1.5rem;">Kho chưa có sản phẩm nào. Hãy khởi tạo sản phẩm ở Bước 1.</p>`;
        return;
    }

    listContainer.innerHTML = '';

    dbProds.forEach(prod => {
        const itemImages = dbFindAll('product_images').filter(img => img.product_id === prod.id);

        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.background = '#ffffff';
        card.style.border = '1px solid var(--border)';
        card.style.padding = '1.25rem';
        card.style.marginBottom = '0.5rem';

        // Build internal images gallery html
        let imagesHtml = '';
        if (itemImages.length === 0) {
            imagesHtml = `<p style="font-size: 0.78rem; color: var(--text-dim); margin-top: 0.5rem; grid-column: span 4;">Sản phẩm chưa có ảnh góc chụp nào. Bấm nút phía trên để tải lên.</p>`;
        } else {
            itemImages.forEach(img => {
                if (img.status === 'Processing') {
                    imagesHtml += `
                        <div class="product-thumb-card" style="border: 1px dashed var(--border); padding: 5px;">
                            <div style="position: relative; width: 100%; aspect-ratio: 1/1; background: rgba(0,0,0,0.03); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 4px;">
                                <div class="spinner-ring" style="width: 18px; height: 18px; border-width: 2px; margin-bottom: 0.25rem; border-left-color: var(--accent);"></div>
                                <span style="font-size: 0.55rem; color: var(--accent); font-weight:700;">AI Tách...</span>
                            </div>
                            <span style="font-size:0.6rem;">${img.name}</span>
                        </div>
                    `;
                } else {
                    imagesHtml += `
                        <div class="product-thumb-card" style="border: 1px solid var(--border); padding: 5px; background: #faf8fc;">
                            <div style="position: relative; width: 100%; aspect-ratio: 1/1; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:4px; overflow:hidden;">
                                <img src="${img.processed_url}" style="width: 90%; height: 90%; object-fit: contain;">
                                <span class="status-badge" style="position: absolute; bottom: 2px; right: 2px; font-size: 0.5rem; padding: 0.1rem 0.2rem; background:#22c55e; color:white; border-radius:3px;">API OK</span>
                            </div>
                            <span style="font-size:0.6rem; font-weight:600;">${img.name}</span>
                        </div>
                    `;
                }
            });
        }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:0.75rem; margin-bottom:0.75rem; flex-wrap:wrap; gap:10px;">
                <div>
                    <span class="status-badge badge-info" style="font-family:var(--font-mono); font-size:0.75rem; padding:0.25rem 0.6rem;">${prod.product_code}</span>
                    <strong style="font-size: 1.05rem; color: var(--accent); margin-left: 8px;">${prod.product_name}</strong>
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="triggerProductFileInput('${prod.id}')" style="padding: 0.45rem 1rem; font-size: 0.8rem;">
                        📁 Tải ảnh góc chụp (Upload folder)
                    </button>
                    <input type="file" id="prod-file-input-${prod.id}" style="display:none;" multiple onchange="handleProductFileSelect(event, '${prod.id}')">
                </div>
            </div>
            
            <div class="product-thumbnail-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; width: 100%;">
                ${imagesHtml}
            </div>
        `;

        listContainer.appendChild(card);
    });
}

// Populate template group select for merchant
function populateMerchantTemplateSelect() {
    const select = document.getElementById('select-merchant-template');
    if (!select) return;

    select.innerHTML = '<option value="">-- Chọn Template --</option>';
    const groups = dbFindAll('templates');
    
    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.name;
        select.appendChild(opt);
    });
}

// Load layouts inside the chosen template group
function loadTemplateLayoutsForMerchant() {
    const groupId = document.getElementById('select-merchant-template').value;
    const productId = document.getElementById('select-merchant-product').value;
    const layoutsSec = document.getElementById('merchant-layouts-section');
    const layoutsGrid = document.getElementById('merchant-layouts-grid');
    
    if (!groupId || !productId) {
        layoutsSec.style.display = 'none';
        return;
    }

    layoutsSec.style.display = 'block';
    layoutsGrid.innerHTML = '';

    const allLayouts = dbFindAll('template_layouts');
    const filteredLayouts = allLayouts.filter(l => l.template_id === groupId);

    if (filteredLayouts.length === 0) {
        layoutsGrid.innerHTML = `<p style="text-align: center; color: var(--text-dim); padding: 1.5rem;">Template này chưa có hình mẫu nào được cấu hình.</p>`;
        return;
    }

    filteredLayouts.forEach(layout => {
        const card = document.createElement('div');
        card.className = 'layout-item-card';
        card.id = `layout-card-${layout.id}`;
        
        card.innerHTML = `
            <!-- Live Preview Area -->
            <div style="display:flex; flex-direction:column; gap:10px;">
                <div class="editor-preview-card" style="width:100%; aspect-ratio:1/1;">
                    <!-- Loading Queue Overlay -->
                    <div class="queue-overlay-state" id="processing-${layout.id}" style="display:none;">
                        <div class="spinner-ring"></div>
                        <h4 style="font-size:1rem; font-weight:800; margin-bottom:4px;" id="queue-status-${layout.id}">Xử lý...</h4>
                        <p style="font-size:0.7rem; color:#cbd5e1;" id="queue-wait-${layout.id}">Đang hàng đợi...</p>
                        <div style="width:100%; background:rgba(255,255,255,0.2); height:4px; border-radius:99px; overflow:hidden; margin-top:8px;">
                            <div id="queue-progress-${layout.id}" style="background:var(--accent); height:100%; width:10%;"></div>
                        </div>
                    </div>
                    
                    <!-- Slider result -->
                    <div class="before-after-slider-container" id="slider-wrap-${layout.id}" style="display:none; width:100%; height:100%;">
                        <img src="" id="slider-after-${layout.id}" class="slider-img slider-img-foreground">
                        <img src="" id="slider-before-${layout.id}" class="slider-img slider-img-background">
                        <div class="slider-bar-control" id="slider-ctrl-${layout.id}" style="left:50%;">
                            <div class="slider-button" style="width:28px; height:28px; font-size:0.7rem;">↔</div>
                        </div>
                    </div>

                    <!-- Interactive Live preview container -->
                    <div class="canvas-container-mock" id="canvas-${layout.id}">
                        <img src="${layout.background_url}" class="canvas-background">
                        <div id="shadow-${layout.id}" class="canvas-shadow-layer"></div>
                        <img src="" id="product-layer-${layout.id}" class="canvas-product-layer" style="display:none;">
                        ${layout.overlay_url ? `<img src="${layout.overlay_url}" class="canvas-overlay-layer">` : ''}
                    </div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="status-badge badge-info">${layout.scale} Ratio</span>
                    <a href="" id="btn-download-${layout.id}" class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.75rem; display:none;" download="composite_${layout.id}.jpg">💾 Tải ảnh</a>
                </div>
            </div>

            <!-- Form Edit Specifications & Adjustments -->
            <div class="layout-editor-column">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 0.25rem;">
                    <h3 style="font-size:1.05rem; font-weight:700; color:var(--accent);">Cấu Hình Cho Bối Cảnh</h3>
                </div>

                <!-- Product SKU Display (From Filter) -->
                <div style="font-weight:700; font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; margin-top:2px;">Sản phẩm thiết lập:</div>
                <div class="form-row" style="margin-bottom:0.75rem;">
                    <div style="font-size:0.85rem; font-weight:700; color:var(--text); display:flex; align-items:center; gap:6px;">
                        <span class="status-badge badge-info" id="card-sku-badge-${layout.id}">SKU</span>
                    </div>
                </div>

                <!-- Custom Product Image Selector inside Card (Scoped to Product SKU) -->
                <div class="form-group" style="margin-bottom:0.75rem;">
                    <label for="pair-select-${layout.id}" style="font-weight:700;">Góc Chụp Đã Tách Nền (Theo SKU)</label>
                    <select id="pair-select-${layout.id}" onchange="selectAngleForCard('${layout.id}')" style="width:100%; border-color:var(--accent); font-weight:700;">
                        <option value="">-- Chọn góc chụp --</option>
                        <!-- Populated via JS -->
                    </select>
                </div>

                <div style="font-weight:700; font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; margin-top:2px;">Thông Số Kỹ Thuật (Có Quyền Sửa):</div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="meta-title-${layout.id}">Tiêu Đề Bối Cảnh</label>
                        <input type="text" id="meta-title-${layout.id}" value="${layout.title}">
                    </div>
                    <div class="form-group">
                        <label for="meta-type-${layout.id}">Loại Mẫu (Type)</label>
                        <select id="meta-type-${layout.id}">
                            <option value="Studio" ${layout.layout_type === 'Studio' ? 'selected' : ''}>Studio</option>
                            <option value="Outdoor" ${layout.layout_type === 'Outdoor' ? 'selected' : ''}>Outdoor</option>
                            <option value="Action" ${layout.layout_type === 'Action' ? 'selected' : ''}>Action</option>
                            <option value="Abstract" ${layout.layout_type === 'Abstract' ? 'selected' : ''}>Abstract</option>
                            <option value="Holiday" ${layout.layout_type === 'Holiday' ? 'selected' : ''}>Holiday</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="meta-desc-${layout.id}">Mô Tả Chi Tiết</label>
                    <textarea id="meta-desc-${layout.id}" rows="1" style="font-size:0.8rem; padding:0.4rem 0.6rem;">${layout.description || ''}</textarea>
                </div>

                <div style="font-weight:700; font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; margin-top:4px;">Chỉnh Sửa Layout & Bóng Đổ:</div>

                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="scale-${layout.id}">Co giãn (Scale)</label>
                        <input type="range" id="scale-${layout.id}" min="0.5" max="2.0" step="0.05" value="1.0" oninput="updateLayoutPreview('${layout.id}')">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="offset-x-${layout.id}">Lệch X</label>
                        <input type="range" id="offset-x-${layout.id}" min="-50" max="50" step="2" value="0" oninput="updateLayoutPreview('${layout.id}')">
                    </div>
                    <div class="form-group">
                        <label for="offset-y-${layout.id}">Lệch Y</label>
                        <input type="range" id="offset-y-${layout.id}" min="-50" max="50" step="2" value="0" oninput="updateLayoutPreview('${layout.id}')">
                    </div>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px; border-top:1px solid var(--border); padding-top:0.75rem;">
                    <button class="btn btn-secondary" onclick="resetSingleLayout('${layout.id}')" style="padding:0.5rem 1rem;">🧹 Xóa</button>
                    <button class="btn btn-success" id="btn-render-${layout.id}" disabled onclick="renderSingleLayout('${layout.id}')" style="padding:0.5rem 1.25rem;">
                        ✨ Tạo Phối Cảnh (Render)
                    </button>
                </div>
            </div>
        `;
        
        layoutsGrid.appendChild(card);
        
        // Populate display fields & trigger preview
        setTimeout(() => {
            const prod = dbFindById('products', productId);
            const skuBadge = document.getElementById(`card-sku-badge-${layout.id}`);
            if (skuBadge) skuBadge.textContent = prod ? prod.product_code : '';
            
            const selectEl = document.getElementById(`pair-select-${layout.id}`);
            if (selectEl) {
                const imgs = dbFindAll('product_images').filter(img => img.product_id === productId && img.status === 'Completed');
                selectEl.innerHTML = '<option value="">-- Chọn góc chụp --</option>';
                imgs.forEach(img => {
                    const opt = document.createElement('option');
                    opt.value = img.id;
                    opt.textContent = img.name;
                    selectEl.appendChild(opt);
                });
                
                // Auto select first angle if available
                if (imgs.length > 0) {
                    selectEl.value = imgs[0].id;
                    selectAngleForCard(layout.id);
                }
            }
            updateLayoutPreview(layout.id);
        }, 10);
    });
}

// Toggle Product SKU dropdown options list
function toggleProductDropdown(layoutId) {
    const panel = document.getElementById(`custom-prod-options-${layoutId}`);
    if (!panel) return;
    const wrapper = panel.closest('.custom-select-wrapper');

    if (panel.style.display === 'none') {
        document.querySelectorAll('.custom-select-options-panel').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('active-focus'));
        
        if (wrapper) wrapper.classList.add('active-focus');
        panel.innerHTML = '';
        
        const prods = dbFindAll('products');
        prods.forEach(p => {
            const item = document.createElement('div');
            item.className = 'custom-option-item';
            item.innerHTML = `
                <span class="status-badge badge-info" style="font-family:var(--font-mono); font-size:0.6rem; padding:0.1rem 0.35rem; margin-right:4px;">${p.product_code}</span>
                <strong>${p.product_name}</strong>
            `;
            item.onclick = (e) => {
                e.stopPropagation();
                selectProductForLayoutCard(layoutId, p.id, p.product_code, p.product_name);
            };
            panel.appendChild(item);
        });

        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
        if (wrapper) wrapper.classList.remove('active-focus');
    }
}

// Select Product SKU item handler
function selectProductForLayoutCard(layoutId, productId, productCode, productName) {
    document.getElementById(`selected-prod-id-${layoutId}`).value = productId;
    document.getElementById(`custom-prod-display-${layoutId}`).innerHTML = `
        <span class="status-badge badge-info" style="font-family:var(--font-mono); font-size:0.65rem; padding:0.15rem 0.4rem; margin-right:4px;">${productCode}</span>
        <strong>${productName}</strong>
    `;
    const panel = document.getElementById(`custom-prod-options-${layoutId}`);
    panel.style.display = 'none';
    const wrapper = panel.closest('.custom-select-wrapper');
    if (wrapper) wrapper.classList.remove('active-focus');

    // Reset Dropdown B (Images)
    document.getElementById(`pair-select-${layoutId}`).value = '';
    document.getElementById(`custom-img-display-${layoutId}`).innerHTML = `
        <span style="color:var(--text-dim); font-size:0.8rem;">-- Click chọn ảnh góc chụp đã tách --</span>
    `;

    // Show Dropdown B group
    document.getElementById(`image-select-group-${layoutId}`).style.display = 'block';

    // Reset Canvas product preview layer
    document.getElementById(`product-layer-${layoutId}`).style.display = 'none';
    document.getElementById(`btn-render-${layoutId}`).disabled = true;
}

// Toggle Image dropdown options list (only completes images of selected product)
function toggleImageDropdown(layoutId) {
    const productId = document.getElementById(`selected-prod-id-${layoutId}`).value;
    const panel = document.getElementById(`custom-img-options-${layoutId}`);
    if (!productId || !panel) return;
    const wrapper = panel.closest('.custom-select-wrapper');

    if (panel.style.display === 'none') {
        document.querySelectorAll('.custom-select-options-panel').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('active-focus'));
        
        if (wrapper) wrapper.classList.add('active-focus');
        panel.innerHTML = '';

        // Default empty option
        const emptyItem = document.createElement('div');
        emptyItem.className = 'custom-option-item';
        emptyItem.innerHTML = `<span style="color:var(--text-dim);">-- Chọn ảnh góc chụp đã tách --</span>`;
        emptyItem.onclick = (e) => {
            e.stopPropagation();
            selectImageForLayoutCard(layoutId, "", "-- Chọn ảnh góc chụp đã tách --", "");
        };
        panel.appendChild(emptyItem);

        // Read images belonging to selected product
        const imgs = dbFindAll('product_images').filter(img => img.product_id === productId && img.status === 'Completed');

        if (imgs.length === 0) {
            const emptyTip = document.createElement('div');
            emptyTip.style.padding = '10px';
            emptyTip.style.fontSize = '0.75rem';
            emptyTip.style.color = 'var(--text-dim)';
            emptyTip.style.textAlign = 'center';
            emptyTip.textContent = "Sản phẩm chưa có ảnh tách nền. Hãy tải lên tại Kho Sản Phẩm!";
            panel.appendChild(emptyTip);
        } else {
            imgs.forEach(img => {
                const item = document.createElement('div');
                item.className = 'custom-option-item';
                item.innerHTML = `
                    <img src="${img.processed_url}">
                    <span>${img.name}</span>
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    selectImageForLayoutCard(layoutId, img.id, img.name, img.processed_url);
                };
                panel.appendChild(item);
            });
        }

        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
        if (wrapper) wrapper.classList.remove('active-focus');
    }
}

// Select Product Image item handler
function selectImageForLayoutCard(layoutId, imageId, imageName, imageUrl) {
    document.getElementById(`pair-select-${layoutId}`).value = imageId;
    const panel = document.getElementById(`custom-img-options-${layoutId}`);
    panel.style.display = 'none';
    const wrapper = panel.closest('.custom-select-wrapper');
    if (wrapper) wrapper.classList.remove('active-focus');

    const displayDiv = document.getElementById(`custom-img-display-${layoutId}`);
    if (imageId) {
        displayDiv.innerHTML = `
            <img src="${imageUrl}" style="width:24px; height:24px; object-fit:cover; border-radius:3px; border:1px solid var(--border);">
            <span style="font-weight:700; font-size:0.82rem;">${imageName}</span>
        `;
    } else {
        displayDiv.innerHTML = `<span style="color:var(--text-dim); font-size:0.8rem;">${imageName}</span>`;
    }

    // Trigger canvas update
    pairProductToLayout(layoutId);
}

// Compatibility dummy
function updateMerchantLayoutDropdowns() {
    // Custom selects update dynamically, no action required.
}

// Triggered when a product is paired with a layout
function pairProductToLayout(layoutId) {
    const hiddenInput = document.getElementById(`pair-select-${layoutId}`);
    const productLayer = document.getElementById(`product-layer-${layoutId}`);
    const renderBtn = document.getElementById(`btn-render-${layoutId}`);
    
    if (!hiddenInput || !hiddenInput.value) {
        productLayer.style.display = 'none';
        renderBtn.disabled = true;
        return;
    }

    const prod = dbFindById('product_images', hiddenInput.value);
    if (prod) {
        productLayer.src = prod.processed_url;
        productLayer.style.display = 'block';
        renderBtn.disabled = false;
        
        updateLayoutPreview(layoutId);
    }
}

// Update layout canvas preview dynamically
function updateLayoutPreview(layoutId) {
    const layout = dbFindById('template_layouts', layoutId);
    if (!layout) return;

    const scaleInput = document.getElementById(`scale-${layoutId}`);
    const xInput = document.getElementById(`offset-x-${layoutId}`);
    const yInput = document.getElementById(`offset-y-${layoutId}`);
    
    if (!scaleInput) return;

    const scale = parseFloat(scaleInput.value);
    const offsetX = parseInt(xInput.value);
    const offsetY = parseInt(yInput.value);
    const shadowType = 'Soft';

    const productLayer = document.getElementById(`product-layer-${layoutId}`);
    const shadowLayer = document.getElementById(`shadow-${layoutId}`);

    // Bounding safe zone values
    const sx = layout.safe_zone_x;
    const sy = layout.safe_zone_y;
    const sw = layout.safe_zone_w;
    const sh = layout.safe_zone_h;

    const scaleWidth = sw * scale;
    const scaleHeight = sh * scale;
    const leftPos = sx + (sw - scaleWidth) / 2 + (offsetX * 0.1);
    const topPos = sy + (sh - scaleHeight) / 2 + (offsetY * 0.1);

    // Apply
    productLayer.style.left = leftPos + '%';
    productLayer.style.top = topPos + '%';
    productLayer.style.width = scaleWidth + '%';
    productLayer.style.height = scaleHeight + '%';

    // Apply Shadow
    if (shadowType === 'None') {
        shadowLayer.style.display = 'none';
    } else {
        shadowLayer.style.display = 'block';
        shadowLayer.style.opacity = 0.55;
        
        const shadowWidth = scaleWidth * 0.75;
        const shadowHeight = scaleHeight * 0.12;
        const shadowLeft = leftPos + (scaleWidth - shadowWidth) / 2;
        let shadowTop = topPos + scaleHeight - (shadowHeight / 2);
        
        if (shadowType === 'Floor') {
            shadowLayer.style.filter = 'blur(8px)';
            shadowLayer.style.transform = 'scaleY(0.4)';
            shadowTop = topPos + scaleHeight;
        } else {
            shadowLayer.style.filter = 'blur(5px)';
            shadowLayer.style.transform = 'scaleY(1)';
        }

        shadowLayer.style.left = shadowLeft + '%';
        shadowLayer.style.top = shadowTop + '%';
        shadowLayer.style.width = shadowWidth + '%';
        shadowLayer.style.height = shadowHeight + 'px';
    }
}

// Render Single layout UAT
function renderSingleLayout(layoutId) {
    const layout = dbFindById('template_layouts', layoutId);
    if (!layout) return;

    const select = document.getElementById(`pair-select-${layoutId}`);
    if (!select || !select.value) return;

    const product = dbFindById('product_images', select.value);
    
    // UI elements
    const overlay = document.getElementById(`processing-${layoutId}`);
    const statusText = document.getElementById(`queue-status-${layoutId}`);
    const waitText = document.getElementById(`queue-wait-${layoutId}`);
    const progressBar = document.getElementById(`queue-progress-${layoutId}`);
    
    overlay.style.display = 'flex';
    progressBar.style.width = '10%';
    
    // Step 1: Connecting API
    statusText.textContent = "Kết nối API tách nền...";
    waitText.textContent = "Gửi product image lên Remove.bg.";
    
    setTimeout(() => {
        progressBar.style.width = '40%';
        statusText.textContent = "Nhận diện & Tách biên...";
        waitText.textContent = "Đang xử lý làm mượt viền (Edge Smoothing).";
        
        setTimeout(() => {
            progressBar.style.width = '75%';
            statusText.textContent = "Ghép phối cảnh & Bóng đổ...";
            waitText.textContent = "Lồng ghép vào Safe Zone & Render shadow.";
            
            setTimeout(() => {
                progressBar.style.width = '100%';
                statusText.textContent = "Hoàn thành!";
                waitText.textContent = "Lưu thông số kỹ thuật tùy chỉnh.";
                
                setTimeout(() => {
                    overlay.style.display = 'none';
                    showLayoutRenderResult(layoutId, product, layout);
                }, 400);
            }, 800);
        }, 1000);
    }, 1000);
}

// Display result
function showLayoutRenderResult(layoutId, product, layout) {
    const canvas = document.getElementById(`canvas-${layoutId}`);
    const sliderWrap = document.getElementById(`slider-wrap-${layoutId}`);
    const dlBtn = document.getElementById(`btn-download-${layoutId}`);
    
    canvas.style.display = 'none';
    sliderWrap.style.display = 'block';
    dlBtn.style.display = 'inline-flex';
    
    // Set Slider imgs
    document.getElementById(`slider-before-${layoutId}`).src = product.raw_url;
    
    // Final mock image is background layout
    const finalImgUrl = layout.image_url;
    document.getElementById(`slider-after-${layoutId}`).src = finalImgUrl;
    dlBtn.href = finalImgUrl;

    // Get modified specifications
    const customTitle = document.getElementById(`meta-title-${layoutId}`).value;
    const customType = document.getElementById(`meta-type-${layoutId}`).value;
    const customDesc = document.getElementById(`meta-desc-${layoutId}`).value;

    const scaleVal = parseFloat(document.getElementById(`scale-${layoutId}`).value);
    const offsetX = parseInt(document.getElementById(`offset-x-${layoutId}`).value);
    const offsetY = parseInt(document.getElementById(`offset-y-${layoutId}`).value);
    const shadowType = 'Auto';

    // Save Composition
    const newComp = {
        merchant_id: currentUserId,
        product_image_id: product.id,
        template_layout_id: layoutId,
        scale_factor: scaleVal,
        offset_x: offsetX,
        offset_y: offsetY,
        shadow_type: shadowType,
        shadow_opacity: 0.5,
        title: customTitle,
        description: customDesc,
        layout_type: customType,
        status: "Completed",
        final_image_url: finalImgUrl
    };

    dbCreate('compositions', newComp);

    // Auto-save to product library under SKU with datetime naming rule
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
    
    const productData = dbFindById('products', product.product_id);
    const sku = productData ? productData.product_code : 'SKU';
    const layoutName = layout.title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const fileName = `${sku}_${layoutName}_${formattedDate}.png`;

    const newProductImage = {
        product_id: product.product_id,
        name: fileName,
        raw_url: product.raw_url,
        processed_url: finalImgUrl,
        status: 'Completed'
    };
    dbCreate('product_images', newProductImage);

    // Init Before After slider for this layout
    initSingleLayoutSlider(layoutId);
}

// Slider logic
function initSingleLayoutSlider(layoutId) {
    const container = document.getElementById(`slider-wrap-${layoutId}`);
    const foregroundImg = document.getElementById(`slider-after-${layoutId}`);
    const controlBar = document.getElementById(`slider-ctrl-${layoutId}`);

    function updateSlider(percent) {
        percent = Math.max(0, Math.min(100, percent));
        controlBar.style.left = percent + '%';
        foregroundImg.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
    }

    container.addEventListener('mousedown', () => {
        isBeforeAfterDragging = true;
    });

    window.addEventListener('mouseup', () => {
        isBeforeAfterDragging = false;
    });

    container.addEventListener('mousemove', (e) => {
        if (!isBeforeAfterDragging) return;
        const rect = container.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const pct = (offsetX / rect.width) * 100;
        updateSlider(pct);
    });

    // Touch support
    container.addEventListener('touchstart', () => {
        isBeforeAfterDragging = true;
    });
    window.addEventListener('touchend', () => {
        isBeforeAfterDragging = false;
    });
    container.addEventListener('touchmove', (e) => {
        if (!isBeforeAfterDragging) return;
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        const offsetX = touch.clientX - rect.left;
        const pct = (offsetX / rect.width) * 100;
        updateSlider(pct);
    });

    updateSlider(50);
}

// Reset layout panel back
function resetSingleLayout(layoutId) {
    const canvas = document.getElementById(`canvas-${layoutId}`);
    const sliderWrap = document.getElementById(`slider-wrap-${layoutId}`);
    const dlBtn = document.getElementById(`btn-download-${layoutId}`);
    const prodLayer = document.getElementById(`product-layer-${layoutId}`);
    const select = document.getElementById(`pair-select-${layoutId}`);
    const renderBtn = document.getElementById(`btn-render-${layoutId}`);
    
    canvas.style.display = 'block';
    sliderWrap.style.display = 'none';
    dlBtn.style.display = 'none';
    prodLayer.style.display = 'none';
    
    if (select) select.value = '';
    if (renderBtn) renderBtn.disabled = true;
    
    document.getElementById(`scale-${layoutId}`).value = '1';
    document.getElementById(`offset-x-${layoutId}`).value = '0';
    document.getElementById(`offset-y-${layoutId}`).value = '0';
    
    updateLayoutPreview(layoutId);
}

// Render historical gallery compositions
function renderGallery() {
    const tbody = document.getElementById('gallery-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const list = dbFindAll('compositions');
    
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">Chưa có sản phẩm phối cảnh nào.</td></tr>`;
        return;
    }

    const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sorted.forEach(comp => {
        const dateStr = new Date(comp.createdAt).toLocaleString('vi-VN');
        const layout = dbFindById('template_layouts', comp.template_layout_id);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>
                <img src="${comp.final_image_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);">
            </td>
            <td><span class="status-badge badge-success">product.jpg</span></td>
            <td><strong>${layout ? layout.title : 'Hình mẫu đã xóa'}</strong></td>
            <td><span class="status-badge badge-info">${comp.shadow_type}</span></td>
            <td>
                <div style="line-height:1.3; font-size:0.8rem;">
                    <strong>${comp.title}</strong> <span class="status-badge badge-warning" style="font-size:0.58rem; padding:0.1rem 0.25rem;">${comp.layout_type}</span>
                    <div style="font-size:0.7rem; color:var(--text-dim); margin-top:2px;">${comp.description || ''}</div>
                </div>
            </td>
            <td style="font-size: 0.72rem; color: var(--text-dim);">${dateStr}</td>
        `;
        tbody.appendChild(tr);
    });
}


/* ==================== ADMIN LOGIC ==================== */

// Create template group
function handleCreateGroup(event) {
    event.preventDefault();
    const name = document.getElementById('group-name').value;
    
    const newGroup = {
        name: name,
        created_by: currentUserId
    };

    dbCreate('templates', newGroup);
    document.getElementById('group-name').value = '';
    
    populateAdminGroupSelect();
    alert("Tạo Template mới thành công!");
}

// Populate groups select in admin layout creation form
function populateAdminGroupSelect() {
    const select = document.getElementById('layout-group-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Chọn Template --</option>';
    const groups = dbFindAll('templates');
    
    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.name;
        select.appendChild(opt);
    });
}

function triggerAdminLayoutFileInput() {
    document.getElementById('admin-layout-file-input').click();
}

let adminUploadedLayouts = [];

// Handle admin layout folder upload
function handleAdminLayoutFolderSelect(event) {
    const files = event.target.files;
    const groupId = document.getElementById('layout-group-select').value;
    
    if (!groupId) {
        alert("Vui lòng chọn Template Cha trước khi tải ảnh bối cảnh lên!");
        document.getElementById('admin-layout-file-input').value = '';
        return;
    }

    if (files.length > 0) {
        adminUploadedLayouts = [];
        const grid = document.getElementById('admin-layouts-config-grid');
        const section = document.getElementById('admin-layouts-config-section');
        
        section.style.display = 'block';
        grid.innerHTML = '';

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            
            // Assign mock background urls based on names or order
            let mockBg = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"; // Beach
            if (i === 1) {
                mockBg = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"; // Minimal
            } else if (i >= 2) {
                mockBg = "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80"; // Sports
            }

            const cleanName = f.name.replace(/\.[^/.]+$/, ""); // remove extension

            adminUploadedLayouts.push({
                index: i,
                filename: f.name,
                title: cleanName,
                bg_url: mockBg
            });

            // Render config card for this layout
            const card = document.createElement('div');
            card.className = 'layout-item-card';
            card.id = `admin-layout-card-${i}`;

            card.innerHTML = `
                <!-- Visual Safe Zone Preview -->
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="editor-preview-card" style="width:100%; aspect-ratio:1/1; position:relative;">
                        <img src="${mockBg}" style="width:100%; height:100%; object-fit:cover;">
                        <!-- Red Dotted Safe Zone Box Overlay -->
                        <div id="admin-sz-box-${i}" style="position: absolute; border: 2px dashed var(--accent); background: rgba(139, 92, 246, 0.1); pointer-events: none; z-index:10;"></div>
                    </div>
                    <div style="font-size:0.7rem; color:var(--text-dim); text-align:center;">
                        Xem trước vùng an toàn (Safe Zone)
                    </div>
                </div>

                <!-- Fields configuration -->
                <div class="layout-editor-column">
                    <h3 style="font-size:1.05rem; font-weight:700; color:var(--accent);">Thiết Lập Hình Mẫu</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tiêu Đề Hình Mẫu</label>
                            <input type="text" id="admin-lay-title-${i}" value="${cleanName}" required>
                        </div>
                        <div class="form-group">
                            <label>Loại Hình Mẫu</label>
                            <select id="admin-lay-type-${i}">
                                <option value="Studio">Studio (Nền trơn)</option>
                                <option value="Outdoor" selected>Outdoor (Ngoại cảnh)</option>
                                <option value="Action">Action (Thể thao)</option>
                                <option value="Abstract">Abstract (Nghệ thuật)</option>
                                <option value="Holiday">Holiday (Lễ hội)</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Tỷ Lệ Mẫu</label>
                            <select id="admin-lay-scale-${i}">
                                <option value="1:1">Square (1:1)</option>
                                <option value="16:9">Landscape (16:9)</option>
                                <option value="4:3">Portrait (4:3)</option>
                            </select>
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Mô tả bối cảnh</label>
                            <input type="text" id="admin-lay-desc-${i}" placeholder="VD: Nền cát biển cho sandal..." value="Bối cảnh tự nhiên cho sản phẩm thời trang.">
                        </div>
                    </div>

                    <div style="font-weight:700; font-size:0.75rem; color:var(--text-dim); margin-top:2px;">TỌA ĐỘ VÙNG AN TOÀN (SAFE ZONE %):</div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>X (%)</label>
                            <input type="number" id="admin-sz-x-${i}" min="0" max="100" value="20" oninput="updateAdminLayoutPreview(${i})">
                        </div>
                        <div class="form-group">
                            <label>Y (%)</label>
                            <input type="number" id="admin-sz-y-${i}" min="0" max="100" value="20" oninput="updateAdminLayoutPreview(${i})">
                        </div>
                        <div class="form-group">
                            <label>W (%)</label>
                            <input type="number" id="admin-sz-w-${i}" min="1" max="100" value="60" oninput="updateAdminLayoutPreview(${i})">
                        </div>
                        <div class="form-group">
                            <label>H (%)</label>
                            <input type="number" id="admin-sz-h-${i}" min="1" max="100" value="60" oninput="updateAdminLayoutPreview(${i})">
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px; border-top:1px solid var(--border); padding-top:0.75rem;">
                        <button type="button" class="btn btn-secondary" onclick="removeAdminConfigCard(${i})" style="padding:0.4rem 0.8rem; font-size:0.8rem;">Bỏ qua</button>
                        <button type="button" class="btn btn-primary" onclick="saveAdminLayoutConfig(${i}, '${groupId}')" style="padding:0.4rem 1rem; font-size:0.8rem;">💾 Lưu Hình Mẫu Này</button>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
            updateAdminLayoutPreview(i);
        }
    }
}

// Update safe zone visual preview
function updateAdminLayoutPreview(index) {
    const x = parseFloat(document.getElementById(`admin-sz-x-${index}`).value) || 0;
    const y = parseFloat(document.getElementById(`admin-sz-y-${index}`).value) || 0;
    const w = parseFloat(document.getElementById(`admin-sz-w-${index}`).value) || 0;
    const h = parseFloat(document.getElementById(`admin-sz-h-${index}`).value) || 0;

    const szBox = document.getElementById(`admin-sz-box-${index}`);
    if (szBox) {
        szBox.style.left = x + '%';
        szBox.style.top = y + '%';
        szBox.style.width = w + '%';
        szBox.style.height = h + '%';
    }
}

// Remove single layout config card
function removeAdminConfigCard(index) {
    const card = document.getElementById(`admin-layout-card-${index}`);
    if (card) card.remove();
    
    // Check if grid is empty to hide section
    const grid = document.getElementById('admin-layouts-config-grid');
    if (grid.children.length === 0) {
        document.getElementById('admin-layouts-config-section').style.display = 'none';
    }
}

// Save config layouts
function saveAdminLayoutConfig(index, groupId) {
    const title = document.getElementById(`admin-lay-title-${index}`).value;
    const type = document.getElementById(`admin-lay-type-${index}`).value;
    const scale = document.getElementById(`admin-lay-scale-${index}`).value;
    const desc = document.getElementById(`admin-lay-desc-${index}`).value;
    const x = parseFloat(document.getElementById(`admin-sz-x-${index}`).value);
    const y = parseFloat(document.getElementById(`admin-sz-y-${index}`).value);
    const w = parseFloat(document.getElementById(`admin-sz-w-${index}`).value);
    const h = parseFloat(document.getElementById(`admin-sz-h-${index}`).value);

    const bgUrl = adminUploadedLayouts.find(l => l.index === index).bg_url;

    const newLayout = {
        template_id: groupId,
        title: title,
        description: desc,
        layout_type: type,
        scale: scale,
        image_url: bgUrl, // Preview equals background
        background_url: bgUrl,
        overlay_url: "",
        safe_zone_x: x,
        safe_zone_y: y,
        safe_zone_w: w,
        safe_zone_h: h
    };

    dbCreate('template_layouts', newLayout);
    dbCreateLog(currentUserId, "ADD_LAYOUT", `Đã lưu và cấu hình hình mẫu mới: ${title}`);
    
    // Refresh table layout list
    renderTemplatesTable();
    
    // Remove card
    removeAdminConfigCard(index);
    
    alert(`Lưu hình mẫu "${title}" thành công!`);
}

// Render layouts in admin console
function renderTemplatesTable() {
    const tbody = document.getElementById('layouts-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const layouts = dbFindAll('template_layouts');

    if (layouts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">Chưa có bối cảnh hình mẫu nào được đăng ký.</td></tr>`;
        return;
    }

    layouts.forEach(lay => {
        const group = dbFindById('templates', lay.template_id);
        const groupName = group ? group.name : 'Unknown';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${lay.image_url}" alt="${lay.title}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);">
            </td>
            <td><strong>${groupName}</strong></td>
            <td>
                <div style="line-height:1.2;">
                    <strong>${lay.title}</strong>
                    <span class="status-badge badge-warning" style="font-size:0.58rem; padding:0.1rem 0.25rem; display:block; width:fit-content; margin-top:2px;">${lay.layout_type}</span>
                </div>
            </td>
            <td><span class="status-badge badge-info">${lay.scale}</span></td>
            <td>
                <code style="font-size: 0.75rem; background: var(--surface-hover); padding: 0.2rem 0.35rem; border-radius: 4px;">
                    X: ${lay.safe_zone_x}%, Y: ${lay.safe_zone_y}%, W: ${lay.safe_zone_w}%, H: ${lay.safe_zone_h}%
                </code>
            </td>
            <td>
                <button class="btn btn-danger" onclick="deleteLayout('${lay.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.72rem;">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Delete Layout
function deleteLayout(id) {
    if (confirm("Bạn có chắc chắn muốn xóa hình mẫu này không?")) {
        const lay = dbFindById('template_layouts', id);
        dbDelete('template_layouts', id);
        dbCreateLog(currentUserId, "DELETE_LAYOUT", `Xóa hình mẫu: ${lay ? lay.title : id}`);
        renderTemplatesTable();
    }
}

// Render Audit Logs list
function renderLogsTable() {
    const tbody = document.getElementById('logs-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const logs = dbFindAll('audit_logs');
    const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sortedLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">Chưa ghi nhận hoạt động nào.</td></tr>`;
        return;
    }

    sortedLogs.forEach(log => {
        const dateStr = new Date(log.createdAt).toLocaleString('vi-VN');
        const user = dbFindById('users', log.user_id);
        const userName = user ? user.full_name : 'Hệ Thống';
        const userRole = user ? user.role : 'System';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim);">${dateStr}</td>
            <td><strong>${userName} (${userRole})</strong></td>
            <td><span class="status-badge badge-warning" style="font-size: 0.65rem;">${log.action_type}</span></td>
            <td style="font-size: 0.8rem; color: var(--text-dim);">${log.details}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Global Filter Helper Functions for Merchant AI Studio Workspace
function populateMerchantProductSelect() {
    const select = document.getElementById('select-merchant-product');
    if (!select) return;

    select.innerHTML = '<option value="">-- Chọn Sản phẩm (SKU) --</option>';
    const products = dbFindAll('products');
    
    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.product_code} - ${p.product_name}`;
        select.appendChild(opt);
    });

    const layoutsSec = document.getElementById('merchant-layouts-section');
    if (layoutsSec) layoutsSec.style.display = 'none';
}

function handleGlobalFilterChange() {
    const templateId = document.getElementById('select-merchant-template').value;
    const productId = document.getElementById('select-merchant-product').value;
    
    const layoutsSec = document.getElementById('merchant-layouts-section');
    
    if (!templateId || !productId) {
        if (layoutsSec) layoutsSec.style.display = 'none';
        return;
    }

    loadTemplateLayoutsForMerchant();
}

// Triggered when merchant selects an angle on a card
function selectAngleForCard(layoutId) {
    const angleId = document.getElementById(`pair-select-${layoutId}`).value;
    const productLayer = document.getElementById(`product-layer-${layoutId}`);
    const renderBtn = document.getElementById(`btn-render-${layoutId}`);
    
    if (!angleId) {
        if (productLayer) productLayer.style.display = 'none';
        if (renderBtn) renderBtn.disabled = true;
        return;
    }

    const img = dbFindById('product_images', angleId);
    if (img && productLayer) {
        productLayer.src = img.processed_url;
        productLayer.style.display = 'block';
    }
    if (renderBtn) {
        renderBtn.disabled = !img;
    }
    updateLayoutPreview(layoutId);
}
