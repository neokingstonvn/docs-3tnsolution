# Tài Liệu Đặc Tả Tính Năng Nghiệp Vụ (Functional Specification) - Solando Solar

Hệ thống **Solando ERP & Portal** được định hướng phát triển theo phương án tự xây dựng (Native Custom) để làm chủ hoàn toàn dữ liệu, tự động hóa quy trình bán hàng B2B, quản lý hạn mức công nợ, gạch nợ tự động qua VietQR và truy vết bảo hành sản phẩm thông qua quét mã QR Code.

Tài liệu này tập trung làm rõ cấu trúc 9 module nghiệp vụ, phân tách cụ thể giữa **Tính năng Hệ thống (System/Backend Logic & Rules)** và **Tính năng Sử dụng (User/Frontend Actions)** dành cho từng vai trò người dùng trong hệ thống.

---

## Phân Nhóm Vai Trò Người Dùng (User Roles)

Hệ thống được thiết kế để phục vụ các nhóm đối tượng người dùng sau:
1. **Admin (Ban Giám Đốc / Quản Trị Viên):** Kiểm soát toàn bộ hệ thống, cấu hình tham số, phê duyệt các yêu cầu vượt hạn mức hoặc chiết khấu đặc biệt.
2. **Kinh Doanh (Sale Staff):** Lập báo giá, theo dõi đơn hàng, quản lý tệp đại lý được phân công chăm sóc.
3. **Kế Toán (Accountant):** Kiểm soát công nợ, đối soát thanh toán, duyệt hạn mức công nợ, xuất hóa đơn tài chính.
4. **Nhân Viên Kho (Warehouse Staff):** Quản lý nhập/xuất kho theo lô, quét số Serial Number bằng thiết bị di động (PWA Web Scanner).
5. **Đại Lý (Dealer Portal):** Tự đăng nhập hệ thống để tra cứu bảng giá theo Tier, lập đơn hàng, theo dõi công nợ và lịch sử thanh toán.
6. **Thợ Lắp Đặt / Khách Hàng Cuối (Public Users):** Quét mã QR trên thiết bị để kích hoạt bảo hành thông qua trang Web công cộng (không cần tài khoản đăng nhập).

---

## Đặc Tả Chi Tiết 9 Module Nghiệp Vụ

### 🔑 1. Module Xác Thực & Phân Quyền (Authentication & Authorization)
*Quản lý danh tính người dùng và kiểm soát quyền hạn truy cập dựa trên vai trò.*

#### A. Tính năng Hệ thống (System Features)
*   **Mã hóa thông tin:** Tự động mã hóa mật khẩu người dùng bằng thuật toán Bcrypt trước khi lưu vào cơ sở dữ liệu.
*   **Cấp phát Token định danh:** Sinh mã JWT Token có thời hạn sử dụng đi kèm thông tin Role & Permissions khi đăng nhập thành công.
*   **Kiểm soát quyền truy cập (RBAC):** Chặn đứng các truy cập API trái phép từ cấp độ Route điều hướng. Chỉ cho phép các API Request có Token hợp lệ và khớp với phân quyền của Role thực hiện.
*   **Giám sát phiên làm việc:** Tự động ghi nhận lịch sử đăng nhập, IP truy cập và thiết bị sử dụng của nhân viên để phục vụ mục đích kiểm toán (Audit Logs).

#### B. Tính năng Sử dụng (User Features)
*   **Cổng đăng nhập dùng chung:** Giao diện đăng nhập dành cho nhân viên Solando (Admin, Sale, Kế toán, Kho).
*   **Cổng đăng nhập Đại lý (Dealer Portal Login):** Giao diện đăng nhập riêng biệt dành cho Đại lý để truy cập không gian B2B cá nhân.
*   **Trang cá nhân:** Cho phép người dùng thay đổi mật khẩu và cập nhật thông tin cá nhân cơ bản.
*   **Màn hình Quản trị Tài khoản (Dành cho Admin):** 
    *   Tạo mới, khóa hoặc mở khóa tài khoản nhân viên.
    *   Gán vai trò (Role) cho từng tài khoản nhân viên.
    *   Cấp tài khoản đăng nhập Portal cho các Đại lý mới.

---

### ⚙️ 2. Module Dữ Liệu Dùng Chung (Master Data)
*Cấu hình các tham số nền tảng và danh mục cơ sở của toàn bộ hệ thống.*

#### A. Tính năng Hệ thống (System Features)
*   **Lưu trữ cấu hình toàn cục:** Quản lý tập trung các biến cấu hình hệ thống (Ví dụ: tỷ giá USD/VND áp dụng trong ngày, phần trăm Margin tối thiểu để kích hoạt duyệt chiết khấu tự động, công thức tính hạn bảo hành mặc định).
*   **Hỗ trợ đa chi nhánh:** Quản lý dữ liệu phân tách theo Chi nhánh kho (ví dụ: Kho miền Nam, Kho miền Bắc).
*   **Chuyển đổi tiền tệ:** Tự động quy đổi giá trị sản phẩm dựa trên tỷ giá cấu hình khi lập báo giá bằng ngoại tệ.

#### B. Tính năng Sử dụng (User Features)
*   **Giao diện Quản lý Danh mục (Dành cho Admin/Kế toán):**
    *   Quản lý danh sách Đơn vị tính (Bộ, Cái, Tấm, Mét...).
    *   Quản lý danh sách Chi nhánh kho vật lý.
*   **Giao diện Cấu hình Hệ thống (Dành cho Admin):**
    *   Thiết lập tỷ giá USD/VND hiện hành.
    *   Cài đặt ngưỡng duyệt chiết khấu mặc định (Ví dụ: Báo giá có Margin dưới 10% bắt buộc chuyển trạng thái chờ duyệt).
    *   Cấu hình thông tin doanh nghiệp hiển thị trên báo giá và hóa đơn.

---

### 🏢 3. Module Đại Lý & Khách Hàng (Dealers & Customers)
*Quản lý tệp đối tác B2B, phân nhóm khách hàng và kiểm soát hạn mức công nợ.*

#### A. Tính năng Hệ thống (System Features)
*   **Tính toán Công nợ Thực tế:** Công nợ hiện tại của Đại lý được cập nhật tự động theo thời gian thực dựa trên công thức:
    $$\text{Dư nợ hiện tại} = \text{Tổng giá trị hóa đơn đã xuất} - \text{Tổng tiền đại lý đã thanh toán}$$
*   **Cơ chế Chặn Nợ Tự Động (Hard Credit Block):** 
    *   Khi có đơn hàng mới được tạo, hệ thống tự động kiểm tra điều kiện:
        $$\text{Dư nợ hiện tại} + \text{Giá trị đơn mới} > \text{Hạn mức công nợ cấu hình}$$
    *   Nếu điều kiện trên đúng, hệ thống sẽ tự động khóa đơn hàng ở trạng thái **"Chờ duyệt hạn mức"** và không cho phép nhân viên kho xuất hàng cho đến khi có sự phê duyệt vượt hạn mức từ Admin/Kế toán.
*   **Phân hạng Đại lý tự động/thủ công:** Quản lý chính sách phân cấp Đại lý (Tier 1, Tier 2, Khách lẻ) để làm cơ sở cho Pricing Engine áp dụng bảng giá tự động.
*   **Liên kết End-User:** Hỗ trợ lưu thông tin Khách hàng cuối (End-User) và tự động ánh xạ (mapping) với Đại lý phụ trách thi công công trình đó.

#### B. Tính năng Sử dụng (User Features)
*   **Màn hình Quản lý Đại lý (Dành cho Sale / Kế toán):**
    *   Tạo mới hồ sơ Đại lý (Tên, mã số thuế, địa chỉ giao hàng mặc định, số điện thoại).
    *   Thiết lập hạn mức công nợ tối đa cho từng Đại lý (Chỉ Kế toán/Admin có quyền sửa đổi hạn mức nợ).
    *   Gán nhân viên Sale phụ trách theo dõi và chăm sóc Đại lý.
*   **Sổ tay Công nợ Đại lý:** Hiển thị chi tiết các hóa đơn chưa thanh toán, các khoản thanh toán đã nhận và hạn mức công nợ còn lại của Đại lý.
*   **Giao diện Portal Đại lý (Dành cho Đại lý):**
    *   Xem tổng quan hạn mức công nợ được cấp, dư nợ hiện tại và số tiền còn lại được phép mua nợ.
    *   Tra cứu danh sách hóa đơn chưa thanh toán đi kèm link thanh toán nhanh.
*   **Màn hình Quản lý End-User:** Tra cứu thông tin khách hàng lẻ mua hàng hoặc lắp đặt hệ thống Solar từ các đại lý của Solando.

---

### 🏷️ 4. Module Sản Phẩm & BOM (Products & BOM)
*Quản lý danh mục thiết bị Solar (Inverter, Pin Lithium, Tấm pin) và các gói giải pháp đóng gói sẵn.*

#### A. Tính năng Hệ thống (System Features)
*   **Quản lý thuộc tính kỹ thuật động:** Cho phép định cấu hình các trường thông tin kỹ thuật đặc thù cho từng loại sản phẩm (Ví dụ: Công suất W, Điện áp V, Dung lượng pin Ah, Số pha của Inverter...).
*   **Định nghĩa Gói Giải Pháp (BOM - Bill of Materials):** Cho phép ghép nối nhiều sản phẩm đơn lẻ thành một bộ Combo (Giải pháp) với mã SKU riêng (Ví dụ: Combo 5kW bao gồm 1 Inverter Solando + 2 Pin Lithium + 1 Bộ phụ kiện tủ điện).
*   **Cấu hình thời hạn bảo hành mặc định:** Thiết lập thời gian bảo hành tiêu chuẩn (tính theo số tháng) trên từng mã SKU sản phẩm để hệ thống tự áp dụng khi kích hoạt bảo hành.

#### B. Tính năng Sử dụng (User Features)
*   **Màn hình Quản lý SKU (Dành cho Admin / Kinh doanh):**
    *   Thêm mới sản phẩm, thiết lập mã SKU, Tên sản phẩm, Hãng sản xuất, Hình ảnh đại diện.
    *   Cài đặt Giá bán lẻ đề xuất (MSRP).
    *   Đính kèm file tài liệu kỹ thuật, Catalog, chứng chỉ CO/CQ của sản phẩm.
*   **Thiết lập Gói Giải Pháp (Combo BOM):**
    *   Giao diện lựa chọn các sản phẩm thành phần để đóng gói thành Combo.
    *   Thiết lập cơ chế tính giá tự động cho Combo (tổng giá trị các thành phần hoặc giá trị ấn định riêng biệt).
*   **Tra cứu bảng giá trên Portal Đại lý:** Đại lý tự tra cứu thông tin sản phẩm, tải tài liệu kỹ thuật (Datasheet, CO/CQ) và xem giá bán áp dụng riêng cho cấp hạng (Tier) của mình.

---

### 📋 5. Module Báo Giá & Pricing Engine (Quotations)
*Tính toán giá bán theo đối tượng và lập báo giá chuyên nghiệp.*

#### A. Tính năng Hệ thống (System Features)
*   **Áp dụng Giá theo Tier tự động (Pricing Engine):** Khi Sale tạo báo giá cho một Đại lý, hệ thống tự động kiểm tra Tier của Đại lý đó (Tier 1, Tier 2, Lẻ) và tự động điền đơn giá sản phẩm tương ứng theo chính sách giá đã cấu hình.
*   **Tính toán Biên lợi nhuận (Margin Calculation):** Tự động tính toán Margin % của báo giá dựa trên công thức:
    $$\text{Margin \%} = \frac{\text{Giá bán thỏa thuận} - \text{Giá vốn trung bình của lô hàng hiện tại trong kho}}{\text{Giá bán thỏa thuận}} \times 100\%$$
*   **Quy trình Phê duyệt Chiết khấu Tự động (Discount Approval Flow):**
    *   Nếu nhân viên Sale điều chỉnh chiết khấu làm cho Margin % của báo giá giảm xuống dưới ngưỡng quy định của hệ thống (ví dụ dưới 10%), báo giá sẽ tự động bị khóa và chuyển sang trạng thái **"Chờ duyệt chiết khấu"**.
    *   Hệ thống gửi thông báo (Notification) kèm thông tin chi tiết Margin đến Admin để phê duyệt.

#### B. Tính năng Sử dụng (User Features)
*   **Giao diện Lập Báo Giá (Dành cho Sale):**
    *   Lựa chọn Đại lý mua hàng, thêm các sản phẩm/Combo vào báo giá.
    *   Hệ thống hiển thị giá gốc của Tier và cho phép Sale nhập tỷ lệ chiết khấu thêm hoặc nhập giá bán mong muốn.
    *   Hiển thị trực quan chỉ số Margin % thời gian thực để Sale cân đối mức chiết khấu trước khi lưu.
    *   Xuất báo giá ra file PDF chuyên nghiệp (đầy đủ thông tin sản phẩm, điều khoản thanh toán, hiệu lực báo giá) hoặc gửi link báo giá online cho khách hàng.
*   **Màn hình Phê duyệt của Admin:**
    *   Danh sách các báo giá đang bị kẹt do Margin thấp.
    *   Hiển thị so sánh chi tiết giữa giá đề xuất, giá bán thực tế của Sale, giá vốn kho và Margin % hiện tại.
    *   Nút tác vụ: **Phê duyệt** (Cho phép xuất đơn hàng) hoặc **Từ chối** (Sale phải sửa lại giá).
*   **Portal Đại lý:** Đại lý xem danh sách các báo giá Sale gửi tới, ấn nút **Đồng ý báo giá** để chuyển thành đơn hàng chính thức.

---

### 🤝 6. Module Đơn Hàng (Orders)
*Quản lý vòng đời đơn hàng B2B từ lúc chốt báo giá đến khi hoàn thành bàn giao.*

#### A. Tính năng Hệ thống (System Features)
*   **Tạo Đơn tự động từ Báo giá:** Tự động sao chép toàn bộ thông tin sản phẩm, số lượng, đơn giá và chiết khấu từ Báo giá đã được phê duyệt sang Đơn hàng mới mà không cần nhập lại.
*   **Khóa Đơn hàng vượt hạn mức:** Khi đơn hàng chuyển từ trạng thái Draft sang Xác nhận, hệ thống kiểm tra công nợ Đại lý. Nếu vượt hạn mức nợ, đơn hàng bị chuyển trạng thái thành **"Chờ duyệt hạn mức"** và chặn toàn bộ các bước xuất kho tiếp theo.
*   **Lịch sử trạng thái (Order Audit Trail):** Ghi nhận chi tiết thời gian, người thực hiện chuyển đổi trạng thái đơn hàng (Draft -> Chờ duyệt hạn mức -> Đã duyệt -> Đang chuẩn bị hàng -> Đang giao hàng -> Đã hoàn thành -> Đã hủy).

#### B. Tính năng Sử dụng (User Features)
*   **Màn hình Quản lý Đơn hàng (Dành cho Sale / Kế toán):**
    *   Theo dõi trạng thái xử lý của toàn bộ đơn hàng trong hệ thống.
    *   Tìm kiếm đơn hàng theo mã đơn, mã Đại lý, nhân viên Sale phụ trách hoặc khoảng thời gian.
*   **Màn hình Phê duyệt Hạn mức Công nợ (Dành cho Kế toán / Admin):**
    *   Danh sách các đơn hàng vượt hạn mức nợ đang chờ xử lý.
    *   Hiển thị thông tin: Hạn mức nợ Đại lý, Dư nợ hiện tại, Giá trị đơn hàng mới, Số tiền vượt hạn mức.
    *   Nút bấm **Duyệt vượt hạn mức** (Cho phép chuyển tiếp đơn hàng sang trạng thái "Đã duyệt" để kho soạn hàng).
*   **Giao diện Portal Đại lý:** Đại lý tự tạo đơn hàng trực tiếp từ giỏ hàng sản phẩm trên Portal. Theo dõi trạng thái vận chuyển của đơn hàng (Đang chuẩn bị hàng, Đang giao).

---

### 💳 7. Module Hóa Đơn & Thanh Toán (Billing & Payments)
*Tự động hóa quy trình thanh toán và gạch nợ tức thì bằng VietQR động (Không phụ thuộc phần mềm bên thứ ba).*

#### A. Tính năng Hệ thống (System Features)
*   **Sinh VietQR Động tự động:** 
    *   Khi Đại lý hoặc Sale yêu cầu thanh toán đơn hàng/hóa đơn, hệ thống tự động gọi API sinh mã VietQR động theo chuẩn Napas.
    *   Mã QR chứa sẵn các thông tin: Tài khoản nhận tiền của Solando, số tiền chính xác cần thanh toán, nội dung chuyển khoản định dạng chuẩn (Ví dụ: `SLD ORDER 102345`).
*   **Tích hợp Webhook Ngân Hàng (Casso/SePay):**
    *   Nhận tín hiệu báo biến động số dư tài khoản ngân hàng của Solando qua cổng Webhook trong thời gian thực (real-time).
*   **Tự động Khớp và Gạch nợ (Auto-Reconciliation & Credit Release):**
    *   Hệ thống đọc nội dung chuyển khoản từ Webhook, trích xuất mã hóa đơn/mã đơn hàng.
    *   Nếu khớp mã và số tiền, hệ thống tự động:
        1. Chuyển trạng thái hóa đơn/đơn hàng thành **"Đã thanh toán"**.
        2. Tạo một bản ghi giao dịch thanh toán thành công trong hệ thống.
        3. Khấu trừ trực tiếp số tiền đã thanh toán vào Dư nợ hiện tại của Đại lý đó.
        4. Tự động mở khóa giải phóng hạn mức công nợ (Credit Limit) của Đại lý (xử lý trong vòng 3 giây).

#### B. Tính năng Sử dụng (User Features)
*   **Trang Thanh Toán Hóa Đơn (Hệ thống cung cấp link hoặc hiển thị trên Portal):**
    *   Hiển thị thông tin chi tiết hóa đơn, số tiền cần đóng.
    *   Hiển thị ảnh mã VietQR động để Đại lý dùng app ngân hàng quét và chuyển khoản nhanh.
*   **Màn hình Quản lý Giao dịch & Đối soát (Dành cho Kế toán):**
    *   Hiển thị danh sách các biến động số dư ngân hàng nhận về qua Webhook.
    *   Đánh dấu các giao dịch đã khớp nợ tự động thành công.
    *   Màn hình **Đối soát thủ công** đối với các giao dịch lỗi (Khách chuyển khoản sai số tiền, sai cú pháp nội dung). Cho phép kế toán chọn hóa đơn và thực hiện khớp tay để gạch nợ.

---

### 📦 8. Module Kho & Số Serial (Inventory & Serials)
*Quản lý nhập/xuất kho vật lý theo lô hàng và truy vết nguồn gốc từng thiết bị qua Serial Number.*

#### A. Tính năng Hệ thống (System Features)
*   **Quản lý Tồn kho theo Lô (Batch/Lot Management):**
    *   Mỗi đợt nhập hàng từ nhà sản xuất (PO) được quản lý dưới dạng một Lô hàng (Batch/Lot).
    *   Lưu thông tin giá vốn (COGS) riêng biệt cho từng lô để phục vụ việc tính giá vốn chính xác theo phương pháp FIFO (Nhập trước xuất trước) hoặc đích danh.
*   **Quản lý Trạng thái Số Serial:** 
    *   Mỗi thiết bị có giá trị cao (Inverter, Pin Lithium) bắt buộc phải quản lý bằng một số Serial Number duy nhất.
    *   Hệ thống kiểm soát vòng đời trạng thái của Serial: `In Stock` (Trong kho) -> `Shipped` (Đã xuất bán cho đại lý) -> `Activated` (Đã quét QR kích hoạt bảo hành).
*   **Đồng bộ số lượng tồn kho:** Tự động trừ tồn kho khả dụng khi đơn hàng được duyệt và trừ tồn kho vật lý khi quét Serial xuất kho thành công.

#### B. Tính năng Sử dụng (User Features)
*   **Màn hình Nhập Kho (Dành cho Nhân viên kho):**
    *   Tạo phiếu nhập kho, liên kết với Lô hàng nhập.
    *   Hỗ trợ nhập danh sách số Serial bằng cách upload file Excel danh sách Serial từ nhà sản xuất hoặc quét barcode trực tiếp tại kho.
*   **Ứng dụng Quét Serial Xuất Kho (Web App/PWA Scanner chạy trên điện thoại):**
    *   Giao diện Web tối ưu trên di động, sử dụng camera điện thoại làm máy quét Barcode/QR Code.
    *   Nhân viên kho mở phiếu xuất kho trên điện thoại, quét lần lượt các số Serial của sản phẩm thực tế bốc xếp lên xe.
    *   Hệ thống kiểm tra xem Serial được quét có hợp lệ (đúng mã SKU của đơn hàng, đang ở trạng thái `In Stock`). Nếu hợp lệ, tự động chuyển trạng thái Serial sang `Shipped` khi hoàn thành phiếu xuất.
*   **Báo cáo tồn kho & Lịch sử Serial:** Tra cứu nhanh vị trí kho, số lượng tồn của từng SKU theo từng Lô hàng. Truy xuất vòng đời của một số Serial (Nhập ngày nào, nằm ở lô nào, xuất cho đại lý nào trên đơn hàng nào).

---

### 🛠️ 9. Module Bảo Hành & Kích Hoạt QR (Warranty & Services)
*Kích hoạt bảo hành sản phẩm qua mã QR dán trên thân máy và quản lý quy trình sửa chữa dịch vụ.*

#### A. Tính năng Hệ thống (System Features)
*   **Cơ chế Sinh mã QR Bảo hành:** Hệ thống tự động sinh mã QR chứa link dẫn đến trang kích hoạt bảo hành công cộng chứa tham số ID Serial định danh duy nhất của sản phẩm. Mã QR này được in dán lên thiết bị trước khi xuất kho.
*   **Tính toán Thời hạn Bảo hành:** 
    *   Thời hạn bảo hành bắt đầu tính từ ngày kích hoạt thành công trên Web Form.
    *   $$\text{Ngày hết hạn} = \text{Ngày kích hoạt} + \text{Thời hạn bảo hành chuẩn của SKU (số tháng)}$$
    *   Nếu sản phẩm chưa được kích hoạt bởi người dùng cuối nhưng bị lỗi, hệ thống tự động tính ngày bảo hành dựa trên ngày xuất kho cộng thêm số tháng dự phòng cấu hình sẵn.
*   **Tự động Mapping Thông tin:** Khi khách hàng quét QR kích hoạt, hệ thống đối chiếu Serial với dữ liệu xuất kho để tự động xác định Đại lý phân phối ban đầu, từ đó liên kết chéo hồ sơ (End-User <-> Đại lý <-> Serial Sản phẩm).
*   **Thông báo Tự động (SMS / Zalo ZNS):** Tự động gửi tin nhắn xác nhận kích hoạt bảo hành thành công kèm link tra cứu hạn bảo hành tới số điện thoại của Khách hàng cuối và Đại lý.

#### B. Tính năng Sử dụng (User Features)
*   **Giao diện Form Kích Hoạt Bảo Hành Công Cộng (Không cần đăng nhập):**
    *   Kỹ thuật viên lắp đặt hoặc Khách hàng cuối quét mã QR dán trên thân máy.
    *   Form hiển thị tự động điền sẵn số Serial của máy.
    *   Khách hàng nhập thông tin cá nhân (Tên, Số điện thoại, Địa chỉ lắp đặt).
    *   Chọn tên Đại lý đã thi công lắp đặt cho mình (Hệ thống gợi ý Đại lý đã mua máy từ Solando, cho phép đổi nếu mua lại từ đại lý cấp 2).
    *   Tải lên ảnh chụp thực tế sản phẩm đã lắp đặt và hóa đơn mua hàng để xác thực.
    *   Ấn kích hoạt.
*   **Giao diện Tra cứu Bảo hành Công cộng:** Nhập số Serial để kiểm tra trạng thái bảo hành (Đã kích hoạt chưa, ngày hết hạn bảo hành).
*   **Màn hình Quản lý Thiết bị đã kích hoạt (Dành cho CSKH Solando):**
    *   Xem danh sách hồ sơ thiết bị đã kích hoạt, phê duyệt ảnh chụp kích hoạt của khách hàng nếu cần.
    *   Chỉnh sửa thông tin bảo hành trong trường hợp đặc biệt (ví dụ gia hạn bảo hành thêm cho khách hàng VIP).
*   **Hệ thống Quản lý Ticket Sự Cố (Yêu cầu Sửa chữa/Bảo trì):**
    *   Khách hàng quét QR bảo hành trên máy và chọn nút **"Yêu cầu hỗ trợ/Sự cố"**.
    *   Kỹ thuật viên CSKH tiếp nhận yêu cầu, tạo Ticket hỗ trợ, ghi nhận lỗi, gán kỹ thuật viên đi xử lý.
    *   Cập nhật nhật ký xử lý sự cố (Đã kiểm tra, thay linh kiện gì, kết quả xử lý).
