/**
 * ============================================================================
 * PHÂN TÍCH TRADE-OFF: BIẾN ĐỔI MẢNG TRỰC TIẾP VS BẢN SAO BẤT BIẾN
 * ============================================================================
 *
 * 1. Bảng so sánh Trade-off (Độ phức tạp thuật toán):
 * ----------------------------------------------------------------------------
 * | Phương thức       | Vị trí thao tác  | Độ phức tạp | Lý do kỹ thuật
 * ----------------------------------------------------------------------------
 * | push() / pop()    | Cuối mảng (End)  | O(1)        | Rất nhanh, do chỉ thao tác ở vị trí cuối, không cần dịch chuyển các phần tử còn lại.
 * | unshift()/shift() | Đầu mảng         | O(N)        | Chậm khi N lớn. Bắt buộc phải đánh lại chỉ số (index) cho toàn bộ N-1 phần tử phía sau.
 * | splice(index, ...)| Giữa mảng        | O(N)        | Phải dịch chuyển các phần tử phía sau vị trí chèn/xóa để lấp chỗ trống hoặc nhường chỗ.
 *
 * 2. Giải thích chi tiết cơ chế Re-indexing trong V8 Engine:
 * - Mảng trong JavaScript được cấp phát một vùng nhớ liên tục (hoặc mô phỏng liên tục).
 * - Khi gọi hàm queue.shift() để lấy phần tử đầu tiên, phần tử ở index 0 bị xóa đi.
 * - Để lấp đầy khoảng trống ở đầu mảng, V8 Engine buộc phải thực hiện vòng lặp ngầm để dịch chuyển TẤT CẢ các
 *   phần tử còn lại lên trước 1 vị trí (phần tử ở index 1 chuyển sang index 0, index 2 sang index 1...).
 * - Nếu mảng có 10.000 xe (N = 10.000), hệ thống phải thực hiện 9.999 thao tác dịch chuyển cho MỖI LẦN gọi shift().
 *   => Đây là nguyên nhân khiến hệ thống chậm đi rõ rệt trong đợt nghỉ lễ.
 *
 * 3. Giải pháp cải tiến (Tối ưu hóa):
 * - Thay vì dùng shift() để xóa vật lý phần tử đầu mảng (gây ra O(N)), ta sẽ giữ nguyên mảng và dùng một
 *   biến con trỏ `headIndex` (trỏ đến chỉ số của phần tử đầu tiên hợp lệ hiện tại).
 * - Khi lấy xe vào sạc (dequeue), ta chỉ cần lấy `queue[headIndex]` và cộng `headIndex` thêm 1.
 * - Thao tác này biến thời gian xử lý từ O(N) xuống mức lý tưởng O(1) (tức thời).
 */

// ============================================================================
// CÀI ĐẶT MÃ NGUỒN TỐI ƯU CHO HÀNG ĐỢI TRẠM SẠC
// ============================================================================

class ChargingStationQueue {
  constructor() {
    this.queue = [];
    this.headIndex = 0; // Con trỏ ảo chỉ định vị trí đầu hàng hiện tại
  }

  // Thêm xe mới vào hàng đợi (push: O(1))
  enqueue(vehicleId) {
    this.queue.push(vehicleId);
    console.log(`[Xếp hàng] Xe ${vehicleId} vừa vào hàng đợi.`);
  }

  // Lấy xe đầu tiên ra khỏi hàng đợi (sử dụng con trỏ: O(1) thay vì shift O(N))
  dequeue() {
    // Nếu con trỏ đã trỏ vượt qua số lượng phần tử của mảng -> Hết hàng đợi
    if (this.headIndex >= this.queue.length) {
      console.log("Hiện không có xe nào trong hàng đợi sạc.");
      return null;
    }

    // Lấy xe hiện tại ở vị trí con trỏ
    const nextVehicle = this.queue[this.headIndex];

    // Tăng con trỏ lên 1 để trỏ vào phần tử tiếp theo (không làm thay đổi cấu trúc mảng gốc)
    this.headIndex++;

    console.log(`[Vào sạc]  Xe ${nextVehicle} được điều phối vào sạc.`);
    return nextVehicle;
  }

  // Tính toán số lượng xe ĐANG CHỜ thực tế
  getWaitingCount() {
    return this.queue.length - this.headIndex;
  }
}

// ============================================================================
// TEST NGHIỆP VỤ HÀNG ĐỢI
// ============================================================================

console.log("--- KHỞI TẠO TRẠM SẠC ---");
const vinfastQueue = new ChargingStationQueue();

// Xe lần lượt tới xếp hàng (Mô phỏng đợt cao điểm)
vinfastQueue.enqueue("29A-123.45");
vinfastQueue.enqueue("30E-678.90");
vinfastQueue.enqueue("51K-111.11");
vinfastQueue.enqueue("43D-999.99");

console.log(`Số xe đang chờ: ${vinfastQueue.getWaitingCount()} xe\n`);

console.log("--- ĐIỀU PHỐI XE VÀO SẠC ---");
// Lấy xe vào sạc với độ phức tạp O(1)
vinfastQueue.dequeue(); // Lấy 29A-123.45
vinfastQueue.dequeue(); // Lấy 30E-678.90

console.log(`\nSố xe đang chờ hiện tại: ${vinfastQueue.getWaitingCount()} xe`);
// Hàng đợi lúc này có length là 4, nhưng headIndex là 2 => Chỉ còn 2 xe đang chờ (51K, 43D). Mảng không bị xóa tốn tài nguyên.
