// Solando Warranty Prototype - Shared Mock Database Engine
const INITIAL_MOCK_DATA = {
    products: {
        "SOL-INV-5KW": { sku: "SOL-INV-5KW", name: "Inverter Hybrid Solando 5kW", category: "Inverter", warranty: 60, hasSerial: true },
        "SOL-INV-10KW": { sku: "SOL-INV-10KW", name: "Inverter Hybrid Solando 10kW", category: "Inverter", warranty: 60, hasSerial: true },
        "SOL-BAT-5KWH": { sku: "SOL-BAT-5KWH", name: "Pin Lithium Storage 5kWh (LFP)", category: "Pin Storage", warranty: 120, hasSerial: true },
        "SOL-BAT-10KWH": { sku: "SOL-BAT-10KWH", name: "Pin Lithium Storage 10kWh (LFP)", category: "Pin Storage", warranty: 120, hasSerial: true },
        "SOL-PANEL-450W": { sku: "SOL-PANEL-450W", name: "Tấm Pin Solar Solando 450W Mono", category: "Tấm Pin Solar", warranty: 144, hasSerial: false },
        "SOL-PANEL-550W": { sku: "SOL-PANEL-550W", name: "Tấm Pin Solar Solando 550W Mono", category: "Tấm Pin Solar", warranty: 144, hasSerial: false },
        "SOL-ACC-CABLE": { sku: "SOL-ACC-CABLE", name: "Cáp Điện Solar DC 4mm2 (Cuộn 100m)", category: "Phụ kiện", warranty: 0, hasSerial: false },
        "SOL-ACC-MC4": { sku: "SOL-ACC-MC4", name: "Đầu nối Jack MC4 chuyên dụng (Cặp)", category: "Phụ kiện", warranty: 0, hasSerial: false }
    },
    customers: {
        "KH0001": { code: "KH0001", name: "Công ty TNHH Năng Lượng Xanh Solando", phone: "0905111222", location: "Đà Nẵng" },
        "KH0002": { code: "KH0002", name: "Công ty Cổ Phần Điện Nước Solar Miền Trung", phone: "0914333444", location: "Nha Trang" },
        "KH0003": { code: "KH0003", name: "Điện Nước Thành Phát", phone: "0988555666", location: "TP. HCM" },
        "KH0004": { code: "KH0004", name: "Solartech Hà Nội", phone: "0904888999", location: "Hà Nội" },
        "KH0005": { code: "KH0005", name: "Điện Mặt Trời Mekong Solar", phone: "0939111333", location: "Cần Thơ" }
    },
    invoices: {
        "HD000456": {
            id: "HD000456",
            customerCode: "KH0001",
            customerName: "Công ty TNHH Năng Lượng Xanh Solando",
            soldDate: "2026-06-25",
            status: "Pending", // 'Pending' or 'Completed'
            products: [
                { sku: "SOL-INV-5KW", name: "Inverter Hybrid Solando 5kW", qty: 2, mapped: [] },
                { sku: "SOL-BAT-10KWH", name: "Pin Lithium Storage 10kWh (LFP)", qty: 1, mapped: [] }
            ]
        },
        "HD000123": {
            id: "HD000123",
            customerCode: "KH0002",
            customerName: "Công ty Cổ Phần Điện Nước Solar Miền Trung",
            soldDate: "2026-06-20",
            status: "Completed",
            products: [
                { sku: "SOL-INV-5KW", name: "Inverter Hybrid Solando 5kW", qty: 1, mapped: ["SLD-INV-5K-09238"] }
            ]
        },
        "HD000789": {
            id: "HD000789",
            customerCode: "KH0003",
            customerName: "Điện Nước Thành Phát",
            soldDate: "2026-06-26",
            status: "Pending",
            products: [
                { sku: "SOL-INV-5KW", name: "Inverter Hybrid Solando 5kW", qty: 1, mapped: [] },
                { sku: "SOL-PANEL-450W", name: "Tấm Pin Solar Solando 450W Mono", qty: 23, mapped: [] }
            ]
        },
        "HD000111": {
            id: "HD000111",
            customerCode: "KH0004",
            customerName: "Solartech Hà Nội",
            soldDate: "2026-06-24",
            status: "Completed",
            products: [
                { sku: "SOL-INV-10KW", name: "Inverter Hybrid Solando 10kW", qty: 2, mapped: ["SLD-INV-10K-88123", "SLD-INV-10K-88124"] },
                { sku: "SOL-BAT-10KWH", name: "Pin Lithium Storage 10kWh (LFP)", qty: 2, mapped: ["SLD-BAT-10K-99234", "SLD-BAT-10K-99235"] }
            ]
        },
        "HD000222": {
            id: "HD000222",
            customerCode: "KH0005",
            customerName: "Điện Mặt Trời Mekong Solar",
            soldDate: "2026-06-23",
            status: "Pending",
            products: [
                { sku: "SOL-BAT-5KWH", name: "Pin Lithium Storage 5kWh (LFP)", qty: 1, mapped: [] }
            ]
        },
        "HD000333": {
            id: "HD000333",
            customerCode: "KH0001",
            customerName: "Công ty TNHH Năng Lượng Xanh Solando",
            soldDate: "2026-06-26",
            status: "Completed",
            products: [
                { sku: "SOL-PANEL-550W", name: "Tấm Pin Solar Solando 550W Mono", qty: 2, mapped: [] }
            ]
        },
        "HD000444": {
            id: "HD000444",
            customerCode: "KH0003",
            customerName: "Điện Nước Thành Phát",
            soldDate: "2026-06-27",
            status: "Pending",
            products: [
                { sku: "SOL-BAT-5KWH", name: "Pin Lithium Storage 5kWh (LFP)", qty: 2, mapped: [] }
            ]
        }
    },
    imports: {
        "NK000101": {
            id: "NK000101",
            partner: "Solando International Factory",
            importDate: "2026-06-25",
            status: "Pending", // 'Pending' or 'Completed'
            products: [
                { sku: "SOL-INV-5KW", name: "Inverter Hybrid Solando 5kW", qty: 2, mapped: [] },
                { sku: "SOL-BAT-10KWH", name: "Pin Lithium Storage 10kWh (LFP)", qty: 1, mapped: [] }
            ]
        },
        "NK000102": {
            id: "NK000102",
            partner: "Lithium Power Tech Co.",
            importDate: "2026-06-20",
            status: "Completed",
            products: [
                { sku: "SOL-BAT-5KWH", name: "Pin Lithium Storage 5kWh (LFP)", qty: 1, mapped: ["SLD-BAT-5K-01122"] }
            ]
        }
    },
    serials: {
        "SLD-INV-5K-09238": {
            serialNumber: "SLD-INV-5K-09238",
            sku: "SOL-INV-5KW",
            name: "Inverter Hybrid Solando 5kW",
            invoiceCode: "HD000123",
            soldDate: "2026-06-20",
            status: "Activated",
            warranty: {
                customerName: "Nguyễn Văn Hùng",
                customerPhone: "0905666777",
                address: "123 Hải Phòng, Thanh Khê, Đà Nẵng",
                activationDate: "2026-06-21",
                expiryDate: "2031-06-21",
                duration: 60,
                dealer: "Công ty Cổ Phần Điện Nước Solar Miền Trung"
            }
        },
        "SLD-INV-10K-88123": {
            serialNumber: "SLD-INV-10K-88123",
            sku: "SOL-INV-10KW",
            name: "Inverter Hybrid Solando 10kW",
            invoiceCode: "HD000111",
            soldDate: "2026-06-24",
            status: "Activated",
            warranty: {
                customerName: "Trần Minh Tâm",
                customerPhone: "0987111222",
                address: "Khu đô thị Ciputra, Tây Hồ, Hà Nội",
                activationDate: "2026-06-25",
                expiryDate: "2031-06-25",
                duration: 60,
                dealer: "Solartech Hà Nội"
            }
        },
        "SLD-INV-10K-88124": {
            serialNumber: "SLD-INV-10K-88124",
            sku: "SOL-INV-10KW",
            name: "Inverter Hybrid Solando 10kW",
            invoiceCode: "HD000111",
            soldDate: "2026-06-24",
            status: "InStock",
            warranty: null
        },
        "SLD-BAT-10K-99234": {
            serialNumber: "SLD-BAT-10K-99234",
            sku: "SOL-BAT-10KWH",
            name: "Pin Lithium Storage 10kWh (LFP)",
            invoiceCode: "HD000111",
            soldDate: "2026-06-24",
            status: "InStock",
            warranty: null
        },
        "SLD-BAT-10K-99235": {
            serialNumber: "SLD-BAT-10K-99235",
            sku: "SOL-BAT-10KWH",
            name: "Pin Lithium Storage 10kWh (LFP)",
            invoiceCode: "HD000111",
            soldDate: "2026-06-24",
            status: "InStock",
            warranty: null
        },
        "SLD-BAT-5K-01122": {
            serialNumber: "SLD-BAT-5K-01122",
            sku: "SOL-BAT-5KWH",
            name: "Pin Lithium Storage 5kWh (LFP)",
            invoiceCode: "NK000102",
            soldDate: "2026-06-20",
            status: "InStock",
            warranty: null
        },
        "SLD-INV-5K-00111": {
            serialNumber: "SLD-INV-5K-00111",
            sku: "SOL-INV-5KW",
            name: "Inverter Hybrid Solando 5kW",
            invoiceCode: "NK000101",
            soldDate: "2026-06-25",
            status: "InStock",
            warranty: null
        },
        "SLD-INV-5K-00222": {
            serialNumber: "SLD-INV-5K-00222",
            sku: "SOL-INV-5KW",
            name: "Inverter Hybrid Solando 5kW",
            invoiceCode: "NK000101",
            soldDate: "2026-06-25",
            status: "InStock",
            warranty: null
        },
        "SLD-BAT-5K-00333": {
            serialNumber: "SLD-BAT-5K-00333",
            sku: "SOL-BAT-5KWH",
            name: "Pin Lithium Storage 5kWh (LFP)",
            invoiceCode: "NK000102",
            soldDate: "2026-06-20",
            status: "InStock",
            warranty: null
        },
        "SLD-BAT-10K-00444": {
            serialNumber: "SLD-BAT-10K-00444",
            sku: "SOL-BAT-10KWH",
            name: "Pin Lithium Storage 10kWh (LFP)",
            invoiceCode: "NK000101",
            soldDate: "2026-06-25",
            status: "InStock",
            warranty: null
        }
    },
    endCustomers: {
        "0905666777": {
            name: "Nguyễn Văn Hùng",
            phone: "0905666777",
            address: "123 Hải Phòng, Thanh Khê, Đà Nẵng",
            dealer: "Công ty Cổ Phần Điện Nước Solar Miền Trung",
            serials: ["SLD-INV-5K-09238"]
        },
        "0987111222": {
            name: "Trần Minh Tâm",
            phone: "0987111222",
            address: "Khu đô thị Ciputra, Tây Hồ, Hà Nội",
            dealer: "Solartech Hà Nội",
            serials: ["SLD-INV-10K-88123"]
        }
    },
    tickets: {
        "SLD-INV-5K-09238": [],
        "SLD-INV-10K-88123": [
            { id: "TK-0001", requester: "0987111222", description: "Báo lỗi mất kết nối Wifi module, inverter chạy bình thường.", status: "Resolved", date: "2026-06-26" }
        ],
        "SLD-INV-10K-88124": [],
        "SLD-BAT-10K-99234": [],
        "SLD-BAT-10K-99235": [],
        "SLD-BAT-5K-01122": [],
        "SLD-INV-5K-00111": [],
        "SLD-INV-5K-00222": [],
        "SLD-BAT-5K-00333": [],
        "SLD-BAT-10K-00444": []
    },
    filters: {
        invoices: { search: '', status: 'ALL', dealer: 'ALL' },
        imports: { search: '', status: 'ALL' }, // Add imports filters
        products: { search: '', category: 'ALL' },
        dealers: { search: '' },
        activatedDevices: { search: '', status: 'ALL' },
        endCustomers: { search: '' }
    }
};

let MOCK_DATA = {};

function loadDB() {
    const raw = localStorage.getItem('SOLANDO_MOCK_DATA');
    if (raw) {
        try {
            MOCK_DATA = JSON.parse(raw);
            // Ensure filters structure matches
            if (!MOCK_DATA.filters) {
                MOCK_DATA.filters = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA.filters));
            }
        } catch (e) {
            console.error("Lỗi parse dữ liệu DB, tải lại cấu hình mặc định.", e);
            MOCK_DATA = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
            saveDB();
        }
    } else {
        MOCK_DATA = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
        saveDB();
    }
}

function saveDB() {
    localStorage.setItem('SOLANDO_MOCK_DATA', JSON.stringify(MOCK_DATA));
}

function resetDB() {
    MOCK_DATA = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    saveDB();
    if (typeof renderDataLists === 'function') {
        renderDataLists();
    }
    showToast("Cơ sở dữ liệu giả lập đã được khôi phục mặc định!");
}

// Load database immediately
loadDB();
