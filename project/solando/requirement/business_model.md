# Mô Hình Nghiệp Vụ & Quy Trình Vận Hành Cốt Lõi (Solando ERP & Portal)

Tài liệu này chuẩn hóa mô hình nghiệp vụ của hệ thống **Solando Solar** dựa trên các yêu cầu cốt lõi về quản lý sản phẩm lẻ, báo giá B2B, quản lý kho kèm truy vết giá và vòng đời thiết bị qua mã QR kích hoạt bảo hành.

---

## 1. Bản Đồ Nghiệp Vụ 6 Trụ Cột Cốt Lõi

Hệ thống được thiết kế xoay quanh 6 nghiệp vụ chính dưới đây:

```
                  ┌──────────────────────────────────────────────┐
                  │          1. Quản lý Sản Phẩm (Lẻ)            │
                  │  - Quản lý SKU thiết bị độc lập (Inverter,   │
                  │    Pin Lithium, Tấm pin, Phụ kiện)           │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │        2. Báo Giá & Quản lý Giá B2B          │
                  │  - Cấu hình bảng giá theo phân hạng đại lý   │
                  │  - Tạo, xuất PDF gửi báo giá chuyên nghiệp   │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       3. Quản lý Kho & Truy vết Giá          │
                  │  - Theo dõi tồn kho vật lý và giá vốn COGS   │
                  │  - Lưu lịch sử giá nhập và giá xuất từng lô  │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       4. Quản lý Đại lý & Khách Đại lý       │
                  │  - Quản lý tệp Đại lý phân phối B2B          │
                  │  - Quản lý thông tin Khách cuối (End-User)   │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       5. Kích Hoạt QR & Liên Kết Tréo        │
                  │  - Quét mã QR liên kết:                      │
                  │    [Số Serial] ── [Đại lý] ── [Khách cuối]   │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       6. Chăm Sóc Khách Hàng Đặc Biệt        │
                  │  - Đại lý ngừng hoạt động -> Solando hỗ trợ  │
                  │    trực tiếp khách cuối qua truy vết QR      │
                  └──────────────────────────────────────────────┘
```

---

## 2. Chi Tiết Vận Hành Từng Trụ Cột

### Trụ cột 1: Quản lý Sản phẩm (Linh kiện đơn lẻ)
*   **Đặc điểm:** Tập trung quản lý các thiết bị, linh kiện đơn lẻ của hệ thống Điện mặt trời. Không đặt nặng đóng gói combo phức tạp, chú trọng vào thông số kỹ thuật chuẩn hóa của từng SKU.
*   **Tính năng Hệ thống:**
    *   Tự động phân loại danh mục sản phẩm (Tấm pin Solar, Inverter biến tần, Pin lưu trữ Lithium, Phụ kiện thi công).
    *   Lưu trữ thông số kỹ thuật cốt lõi (Công suất, Điện áp, Dung lượng) phục vụ việc tra cứu nhanh của Sale khi tư vấn.
*   **Tính năng Sử dụng:**
    *   Màn hình danh sách sản phẩm: Thêm mới, cập nhật hình ảnh, thông số kỹ thuật, tài liệu kỹ thuật (Datasheet, CO/CQ).
    *   Đại lý Portal: Tra cứu danh sách sản phẩm kèm file hướng dẫn lắp đặt và thông số kỹ thuật chính thức từ Solando.

### Trụ cột 2: Hệ thống Báo giá & Quản lý Giá B2B
*   **Đặc điểm:** Phục vụ mô hình B2B. Giá sản phẩm được áp dụng linh hoạt dựa trên cấp độ hợp tác của Đại lý.
*   **Tính năng Hệ thống:**
    *   **Pricing Engine:** Tự động điền đơn giá tương ứng khi Sale chọn tên Đại lý trong báo giá (Giá Tier 1, Giá Tier 2, Giá bán lẻ).
    *   Tự động tính toán tổng giá trị đơn hàng, thuế VAT, tỷ lệ chiết khấu và tổng số tiền Đại lý phải thanh toán.
*   **Tính năng Sử dụng:**
    *   Màn hình lập báo giá: Sale chọn Đại lý, chọn các SKU thiết bị lẻ, nhập số lượng, điều chỉnh phần trăm chiết khấu thêm nếu có.
    *   **Xuất bản báo giá:** Hệ thống hỗ trợ nút "Xuất báo giá" để tạo file PDF chuyên nghiệp hoặc sinh đường link (Web Page) báo giá trực tuyến gửi cho Đại lý duyệt qua Zalo/Email.
    *   Đại lý Portal: Xem danh sách các báo giá đang chờ phản hồi, nhấn nút "Đồng ý" để xác nhận đặt hàng.

### Trụ cột 3: Kho Hàng (Tồn kho, Lịch sử & Giá Nhập/Xuất)
*   **Đặc điểm:** Kiểm soát chặt chẽ giá vốn của hàng nhập khẩu để tính toán lợi nhuận và truy vết lịch sử di chuyển của từng thiết bị.
*   **Tính năng Hệ thống:**
    *   **Quản lý giá vốn thực tế (COGS):** Ghi nhận giá nhập của từng lô hàng cụ thể. Khi xuất kho, hệ thống ghi nhận chính xác giá xuất bán của thiết bị đó trên hóa đơn.
    *   **Lịch sử di chuyển:** Tự động ghi log mỗi khi hàng hóa biến động (Nhập kho -> Chuyển kho nội bộ -> Xuất kho cho đại lý -> Kích hoạt bảo hành -> Trả hàng bảo hành).
*   **Tính năng Sử dụng:**
    *   Màn hình quản lý Lô hàng nhập (Batch): Ghi nhận giá vốn nhập khẩu của lô.
    *   Màn hình Phiếu Nhập/Xuất kho: Thủ kho kiểm tra số lượng, import danh sách mã Serial tương ứng đối với các thiết bị chính (Inverter, Pin).
    *   Màn hình Tra cứu Lịch sử Serial: Nhập mã Serial để hiển thị lịch sử nhập từ lô nào (với giá nhập bao nhiêu), xuất cho đại lý nào trên đơn hàng nào (với giá xuất bao nhiêu).

### Trụ cột 4: Quản lý Đại lý & Khách hàng của Đại lý
*   **Đặc điểm:** Quản lý mối quan hệ đa tầng (Solando -> Đại lý B2B -> Khách hàng cuối sử dụng hệ thống Solar).
*   **Tính năng Hệ thống:**
    *   Lưu giữ hồ sơ chi tiết của Đại lý (Thông tin doanh nghiệp, hạn mức công nợ, phân hạng Tier 1/Tier 2).
    *   Lưu trữ hồ sơ End-User (Thông tin chủ đầu tư lắp đặt dự án).
*   **Tính năng Sử dụng:**
    *   Màn hình quản lý Đại lý: Quản lý danh sách đối tác B2B, doanh số tích lũy, Sale phụ trách.
    *   Màn hình quản lý Khách cuối (End-User): Lưu danh sách khách hàng sử dụng cuối cùng, số điện thoại, địa chỉ lắp đặt hệ thống để phục vụ công tác CSKH và bảo hành trực tiếp khi cần.

### Trụ cột 5: Kích Hoạt QR & Xác Thực Thực Địa Thiết Bị
*   **Đặc điểm:** Kết nối vật lý thiết bị bán ra với hệ thống thông qua việc kích hoạt bảo hành, đồng thời hỗ trợ nhân viên kỹ thuật xác thực nguồn gốc thiết bị trực tiếp tại công trình.
*   **Tính năng Hệ thống:**
    *   **QR Mapping Engine:** Khi kích hoạt bảo hành, hệ thống liên kết:
        $$\text{Số Serial sản phẩm} \longleftrightarrow \text{Đại lý mua từ Solando} \longleftrightarrow \text{Khách hàng cuối sử dụng}$$
    *   **Xác thực nguồn gốc:** Khi quét số Serial/QR của thiết bị, hệ thống lập tức kiểm tra cơ sở dữ liệu để xác nhận đây có phải là thiết bị chính hãng do Solando phân phối hay không, ngăn ngừa trường hợp đại lý trà trộn hàng ngoài hệ thống để yêu cầu bảo hành.
*   **Tính năng Sử dụng:**
    *   **Giao diện Kích hoạt Bảo hành (Sale / Kỹ thuật viên Đại lý):** Nhập/quét Serial để kích hoạt bảo hành khi bàn giao công trình, ghi nhận thông tin End-User và liên kết với Đại lý phụ trách.
    *   **Ứng dụng Quét Xác Thực Thực Địa (Dành cho Kỹ thuật viên Solando):** 
        *   Khi đi kiểm tra thực tế (field service), nhân viên Solando quét mã QR trên thân máy để truy xuất nhanh: Thiết bị này có thuộc hệ thống Solando bán ra không? Trạng thái bảo hành? Đại lý nào đã lắp đặt?

### Trụ cột 6: Chăm Sóc Khách Hàng & Hỗ Trợ Trực Tiếp (CSKH & RMA)
*   **Đặc điểm:** Trên thân máy luôn dán sẵn thông tin liên hệ (Hotline/Zalo CSKH của Solando) để khách hàng chủ động gọi khi có sự cố. Khi tiếp nhận, Solando sẽ cử người hoặc điều phối đại lý xử lý dựa trên trạng thái của Đại lý gốc.
*   **Quy tắc nghiệp vụ đặc biệt:**
    *   Khi nhận được cuộc gọi/yêu cầu từ Khách hàng cuối, nhân viên CSKH Solando tra cứu số Serial trên hệ thống.
    *   Nếu Đại lý thi công gốc vẫn đang hoạt động (`Active`): Solando điều phối ticket hỗ trợ về cho Đại lý đó xử lý bảo hành cho khách hàng của họ.
    *   Nếu Đại lý thi công gốc đã ngừng hoạt động (`Inactive` / ngừng hợp tác):
        1. Hệ thống cảnh báo trạng thái đại lý gốc đã ngừng hoạt động.
        2. Bộ phận CSKH Solando sẽ tiếp nhận xử lý trực tiếp (cử kỹ thuật viên Solando đi thực địa kiểm tra).
        3. Hoặc CSKH Solando điều phối sang một Đại lý đối tác khác đang hoạt động gần khu vực đó để hỗ trợ khách hàng, đảm bảo uy tín bảo hành của Solando Solar.
*   **Tính năng Sử dụng:**
    *   Màn hình CSKH tiếp nhận thông tin sự cố, tra cứu nhanh thông tin thiết bị qua số Serial.
    *   Màn hình quản lý và điều phối Ticket bảo hành: CSKH chuyển giao công việc cho kỹ thuật viên nội bộ hoặc cho Đại lý Active khác trong khu vực. Ghi nhận lịch sử xử lý.

---

## 3. Vòng Đời của Một Thiết Bị (Serial Life-Cycle)

```
 ┌──────────────┐      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
 │  Nhập Kho    │ ───> │   Báo Giá     │ ───> │   Xuất Kho    │ ───> │ Kích Hoạt QR  │
 │  - Lưu Lô    │      │   - Áp giá    │      │   - Quét Serial  │      │ - Link Đại lý │
 │  - Giá vốn   │      │     theo Tier │      │   - Ghi nhận      │      │ - Link Khách  │
 │  - Serial    │      │   - Xuất PDF  │      │     Giá xuất  │      │   - Tính BH   │
 └──────────────┘      └───────────────┘      └───────────────┘      └───────┬───────┘
                                                                             │
                                              ┌──────────────────────────────┴┐
                                              ▼
                                   [Yêu Cầu Hỗ Trợ/Sự Cố]
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
             [Đại Lý Gốc Hoạt Động]                        [Đại Lý Gốc Ngừng Hoạt Động]
             - Chuyển Ticket cho Đại lý                    - Chuyển thẳng về CSKH Solando
             - Đại lý xử lý sự cố                          - CSKH xử lý hoặc chỉ định Đại lý mới
```
