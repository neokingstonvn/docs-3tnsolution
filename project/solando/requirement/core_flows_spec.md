# Đặc Tả Luồng Nghiệp Vụ Cốt Lõi: Sản Phẩm, Báo Giá & Nhập Xuất Kho

Tài liệu này đi sâu phân tích và thiết lập các quy tắc nghiệp vụ (Business Rules) cùng luồng vận hành thực tế cho 3 module cốt lõi của **Solando Solar**:
1. **Quản lý Sản phẩm & Gói Giải pháp (BOM)**
2. **Báo giá & Pricing Engine**
3. **Quản lý Kho theo Lô & Truy vết Số Serial**

---

## 1. Quản lý Sản phẩm & Gói Giải pháp (BOM)

Đặc thù ngành phân phối thiết bị điện mặt trời (Solar) là sản phẩm có giá trị cao, thông số kỹ thuật khắt khe và thường được bán theo cả dạng thiết bị rời lẫn dạng combo trọn gói (Solution Kits).

### A. Quy tắc Nghiệp vụ (Business Rules)
*   **Quản lý SKU:** Mỗi sản phẩm (Ví dụ: Inverter Solis 5kW, Pin Lithium Deye 100Ah) có một mã SKU duy nhất. Hệ thống lưu trữ các thuộc tính kỹ thuật động để Sale dễ tra cứu: Công suất (W), Điện áp hoạt động (V), Dòng điện tối đa (A), Chu kỳ sạc xả (đối với Pin).
*   **Thời hạn bảo hành mặc định:** Thiết lập thời gian bảo hành tiêu chuẩn (tính theo số tháng) trên từng mã SKU. Ví dụ: Inverter bảo hành 60 tháng, Pin Lithium bảo hành 120 tháng, Tấm pin bảo hành 144 tháng.
*   **Định nghĩa Gói Giải pháp (BOM - Bill of Materials):**
    *   Một gói giải pháp (Ví dụ: `KIT-SOLAR-5KW`) thực chất là một danh mục gồm nhiều SKU thành phần với số lượng định sẵn.
    *   **Tính tùy biến cao:** Khi Sale chọn gói Combo trên báo giá, hệ thống phải cho phép Sale thêm/bớt hoặc thay thế sản phẩm thành phần (Ví dụ: nâng cấp Inverter từ 5kW lên 6kW, hoặc đổi hãng Pin Lithium) mà không làm hỏng định nghĩa gốc của Combo.
*   **Quản lý Tài liệu kỹ thuật:** Mỗi SKU phải gắn liền với các file tài liệu PDF: Datasheet, chứng chỉ CO (Certificate of Origin), CQ (Certificate of Quality). Đây là tài liệu bắt buộc để đại lý nộp cho EVN khi đấu nối lưới điện.

### B. Phân rã Tính năng

#### 1. Tính năng Hệ thống (System Features)
*   **Đồng bộ giá trị BOM:** Tự động tính toán tổng giá bán đề xuất (MSRP) của Combo bằng tổng giá đề xuất của các linh kiện thành phần.
*   **Quản lý phiên bản tài liệu:** Đảm bảo khi cập nhật file Datasheet mới, hệ thống tự động lưu trữ phiên bản cũ và áp dụng file mới cho các báo giá/đơn hàng được tạo từ thời điểm đó.

#### 2. Tính năng Sử dụng (User Features)
*   **Giao diện quản lý SKU (Admin/Product Manager):**
    *   Tạo/Sửa/Xóa SKU, phân loại nhóm sản phẩm (Tấm pin, Inverter, Pin lưu trữ, Thiết bị phụ trợ).
    *   Nhập thông số kỹ thuật chi tiết, thời hạn bảo hành.
    *   Tải lên tài liệu CO/CQ, Datasheet và Catalog.
*   **Màn hình cấu hình Combo BOM:**
    *   Giao diện kéo thả hoặc tìm chọn các SKU thành phần để tạo thành gói giải pháp.
    *   Thiết lập số lượng mặc định cho từng sản phẩm trong combo.
*   **Màn hình Tra cứu của Đại lý (Portal):**
    *   Đại lý xem danh sách sản phẩm, tải trực tiếp tài liệu CO/CQ và Datasheet của thiết bị để làm hồ sơ kỹ thuật.

---

## 2. Báo Giá & Pricing Engine (Cơ chế áp giá & Tính Margin)

Pricing Engine là bộ não giúp Solando tự động hóa việc báo giá B2B, đảm bảo kiểm soát biên lợi nhuận của công ty và ngăn ngừa việc Sale tự ý chiết khấu quá sâu.

### A. Quy tắc Nghiệp vụ (Business Rules)
*   **Bảng giá theo Cấp bậc (Tier Pricing):** Hệ thống hỗ trợ tối thiểu 3 mức giá cho mỗi SKU:
    1.  **Giá Tier 1:** Dành cho Đại lý cấp 1 (Sản lượng mua lớn, chiết khấu cao nhất).
    2.  **Giá Tier 2:** Dành cho Đại lý cấp 2.
    3.  **Giá Bán lẻ (MSRP):** Dành cho khách hàng mua lẻ hoặc đại lý mới thử nghiệm.
*   **Cơ chế Tính Giá vốn thực tế (COGS):**
    *   Giá vốn của sản phẩm không cố định mà phụ thuộc vào từng Lô hàng (Batch) nhập về từ nước ngoài (do biến động tỷ giá và phí vận chuyển).
    *   **Phương pháp đích danh theo số Serial:** Khi lập báo giá, hệ thống tạm tính Margin dựa trên giá vốn của lô hàng khả dụng gần nhất. Khi xuất kho thực tế, giá vốn của sản phẩm được ghi nhận chính xác theo Lô hàng chứa số Serial được quét xuất kho.
*   **Công thức tính Biên lợi nhuận (Margin %):**
    $$\text{Margin \%} = \frac{\text{Đơn giá bán sau chiết khấu} - \text{Giá vốn thực tế của Lô hàng}}{\text{Đơn giá bán sau chiết khấu}} \times 100\%$$
*   **Quy trình Duyệt Chiết khấu (Approval Policy):**
    *   Mức Margin mục tiêu của Solando là $\ge 12\%$.
    *   Nếu Sale tạo báo giá có Margin $\ge 12\%$: Báo giá tự động chuyển sang trạng thái **"Approved"** (Đã duyệt), Sale có thể gửi trực tiếp cho khách hàng.
    *   Nếu Margin nằm trong khoảng $8\% \le \text{Margin} < 12\%$: Báo giá cần Trưởng phòng kinh doanh duyệt.
    *   Nếu Margin $< 8\%$: Báo giá bắt buộc phải do Giám đốc (Admin) phê duyệt.

### B. Phân rã Tính năng

#### 1. Tính năng Hệ thống (System Features)
*   **Pricing Engine tự động:** Khi tạo báo giá và chọn Đại lý, hệ thống tự động truy vấn Tier của Đại lý từ Module Đối tác để áp dụng đơn giá phù hợp mà Sale không cần nhớ giá.
*   **Margin Evaluator:** Hệ thống tự động tính toán Margin tổng của toàn bộ báo giá dựa trên danh sách sản phẩm và đơn giá tương ứng trong kho hàng thực tế.
*   **Khóa trạng thái báo giá:** Chặn không cho chuyển báo giá thành đơn hàng nếu báo giá đó có Margin thấp và chưa được phê duyệt bởi cấp có thẩm quyền.

#### 2. Tính năng Sử dụng (User Features)
*   **Màn hình Lập Báo Giá (Kinh doanh):**
    *   Sale chọn Đại lý -> Hệ thống tự hiển thị thông tin Tier và hạn mức nợ còn lại.
    *   Sale thêm sản phẩm/combo -> Hệ thống hiển thị giá bán theo Tier tương ứng.
    *   Sale nhập phần trăm chiết khấu thêm (Ví dụ: chiết khấu thêm 2% cho đại lý thân thiết) -> Hệ thống lập tức cập nhật Margin % của từng sản phẩm và Margin tổng của toàn bộ báo giá.
    *   Nếu Margin chuyển sang màu đỏ (Dưới ngưỡng tự duyệt), hệ thống hiển thị cảnh báo: *"Báo giá này cần phê duyệt từ Admin trước khi gửi khách hàng"*.
    *   Nút xuất file báo giá PDF hoặc gửi link xem báo giá trực tuyến cho đại lý.
*   **Màn hình Phê duyệt Báo giá (Admin / Trưởng phòng):**
    *   Hiển thị danh sách báo giá chờ duyệt kèm theo lý do (Ví dụ: "Margin đơn hàng là 6.5%, dưới mức an toàn").
    *   Hiển thị chi tiết: Tên đại lý, lịch sử mua hàng, chi tiết giá vốn từng SKU và mức chiết khấu Sale đề xuất.
    *   Nút bấm **Phê duyệt** (Ghi nhận giá đặc cách) hoặc **Từ chối** (Kèm theo ô nhập lý do từ chối để Sale điều chỉnh lại).

---

## 3. Quản lý Kho theo Lô & Truy vết Số Serial

Đây là module cốt lõi đảm bảo tính chính xác của tồn kho vật lý, giá vốn và là nền tảng để thực hiện các dịch vụ bảo hành sau bán hàng.

### A. Quy tắc Nghiệp vụ (Business Rules)
*   **Tách biệt tồn kho theo Lô hàng (Batch/Lot):**
    *   Mỗi khi nhập hàng mới từ nhà sản xuất, thủ kho bắt buộc phải tạo một mã Lô nhập mới (Ví dụ: `LOT-DEYE-INVERTER-2026-Q2`).
    *   Lô hàng lưu trữ: Số lượng nhập, Ngày nhập, Nhà cung cấp, và Giá vốn nhập khẩu (gồm giá mua + thuế + chi phí vận chuyển phân bổ).
*   **Quản lý Serial Number bắt buộc:**
    *   Các thiết bị chính (Inverter, Pin Lithium) bắt buộc phải đăng ký số Serial Number khi nhập kho. Các phụ kiện nhỏ (dây cáp, ốc vít) quản lý theo số lượng (Quantity).
    *   Một số Serial Number chỉ có thể tồn tại ở một trạng thái duy nhất tại một thời điểm: `In Stock` (Trong kho) -> `Shipped` (Đã xuất bán) -> `Activated` (Đã lắp đặt & kích hoạt bảo hành).
*   **Quy trình quét Serial xuất kho:**
    *   Khi đơn hàng được duyệt xuất kho, hệ thống ghi nhận danh sách SKU cần xuất.
    *   Thủ kho soạn hàng và bắt buộc phải dùng camera quét mã vạch/QR của từng thiết bị thực tế bốc lên xe để gán vào phiếu xuất kho. Hệ thống không cho phép xác nhận xuất kho nếu chưa quét đủ số lượng Serial tương ứng với SKU trong đơn hàng.

### B. Phân rã Tính năng

#### 1. Tính năng Hệ thống (System Features)
*   **Serial COGS Mapping:** Khi đơn hàng được xác nhận xuất kho, hệ thống tự động ánh xạ số Serial được quét với Lô hàng nhập kho gốc để lấy chính xác giá vốn thực tế của thiết bị đó.
*   **Serial Validator:** Khi quét Serial xuất kho, hệ thống kiểm tra:
    *   Serial này có tồn tại trong kho không?
    *   Có đúng mã SKU của đơn hàng không?
    *   Có đang bị trùng lặp với phiếu xuất khác không?
*   **Traceability Logger:** Ghi lại lịch sử di chuyển của Serial: Người nhập kho, Thời gian nhập, Lô hàng nhập, Người xuất kho, Mã đơn hàng xuất, Đại lý mua, Khách hàng cuối sử dụng.

#### 2. Tính năng Sử dụng (User Features)
*   **Giao diện Nhập Kho (Thủ kho):**
    *   Tạo phiếu nhập kho mới, điền thông tin nhà cung cấp và tạo mã Lô.
    *   Upload file Excel danh sách Serial Number được hãng cung cấp sẵn để hệ thống tự động import hàng loạt.
*   **Ứng dụng Quét Serial Xuất Kho di động (PWA Web Scanner):**
    *   Giao diện web responsive tải nhanh trên điện thoại di động của thủ kho.
    *   Nút mở camera điện thoại để quét mã vạch (Barcode) hoặc QR code dán trên vỏ hộp sản phẩm.
    *   Hiển thị danh sách SKU cần quét của đơn hàng:
        *   Ví dụ: *Inverter Deye 5kW: Đã quét 2/5 chiếc.*
    *   Hệ thống phát âm thanh bíp và rung điện thoại khi quét thành công một Serial hợp lệ, báo lỗi đỏ nếu quét trùng hoặc sai sản phẩm.
*   **Màn hình Tra cứu Lịch sử Thiết bị (Admin/Sale/CSKH):**
    *   Nhập số Serial -> Hiển thị toàn bộ lịch sử: Nhập ngày nào, xuất cho đại lý nào, lắp đặt tại dự án nào, ngày hết hạn bảo hành.
