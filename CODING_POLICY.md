# 🚀 TÀI LIỆU QUY CHUẨN LẬP TRÌNH (CODING POLICY)

Tài liệu này định nghĩa các quy chuẩn bắt buộc khi phát triển dự án nhằm đảm bảo **code sạch, dễ bảo trì, và giảm thiểu rủi ro tính năng mới làm hỏng tính năng cũ (regression bugs)**.

---

## 1. 🛡️ QUY TẮC PHÁT TRIỂN & BẢO VỆ TÍNH NĂNG CŨ (NON-BREAKING CHANGES)

### 1.1 Nguyên tắc Mở - Đóng (Open-Closed Principle)
- **Hạn chế sửa đổi trực tiếp hàm/컴포넌트 (Component) đã hoạt động ổn định** nếu chỉ để phục vụ một logic mới.
- Thay vào đó:
  - Dùng **Props** để mở rộng hành vi (ví dụ: cờ `isNewFeature`, `variant="new"`).
  - Viết một Component/Hàm bọc (Wrapper) bên ngoài.
  - Hoặc tạo một Component mới kế thừa logic nếu sự thay đổi quá lớn.

### 1.2 Không thay đổi API/Interface có sẵn
- Khi thay đổi cấu trúc dữ liệu trả về từ (Backend/Mock) hoặc định nghĩa Type/Interface, **luôn giữ lại các trường cũ** (đánh dấu `?` tùy chọn hoặc `@deprecated` nếu cần loại bỏ trong tương lai).
- Các props thay đổi tính chất từ *không bắt buộc (optional)* sang *bắt buộc (required)* sẽ gây lỗi toàn hệ thống. Hãy suy xét kỹ.

### 1.3 Tách biệt logic mới (Isolation)
- Chức năng mới nên được đóng gói vào các file riêng biệt (ví dụ: Custom Hook, Utils mới).
- Tránh việc nhồi nhét quá nhiều if/else vào các file cốt lõi như `App.tsx` hoặc các Component dùng chung (như `Button`, `Header`).

---

## 2. 🧩 QUY CHUẨN REACT & TYPESCRIPT

### 2.1 Định dạng và Đặt tên (Naming Conventions)
- **Component / Interface / Type:** Dùng `PascalCase` (VD: `UserProfile.tsx`, `ICustomer`).
- **Hàm / Biến:** Dùng `camelCase` (VD: `fetchData`, `userList`).
- **Hằng số (Constants):** Dùng `UPPER_SNAKE_CASE` (VD: `MAX_ITEMS_PER_PAGE = 10`).
- Tên hàm phải thể hiện rõ hành động (VD: `handle` dùng cho sự kiện, `get` dùng cho lấy dữ liệu, `is/has` dùng cho boolean).

### 2.2 TypeScript Bắt Buộc
- **TUYỆT ĐỐI KHÔNG** sử dụng kiểu `any` (trừ khi bất khả kháng và phải comment lý do rõ ràng `// eslint-disable-next-line @typescript-eslint/no-explicit-any - Reason:...`).
- Khai báo Type/Interface rõ ràng cho tất cả Props của React Components, dữ liệu API trả về.

### 2.3 Quản lý Side Effects (useEffect)
- Đảm bảo **mọi useEffect đều có cleanup function** (nếu có setTimeout, setInterval, EventListener,...).
- Dependency array của `useEffect` phải chứa đủ các biến được sử dụng bên trong (sử dụng eslint plugin `exhaustive-deps`).
- Tránh gọi API thừa bằng cách dùng các cờ (flags) để chặn re-fetch hoặc huỷ request khi component unmount.

---

## 3. 🎨 CẤU TRÚC THƯ MỤC & STYLING (TAILWIND CSS)

- **Reusable UI:** Các thành phần giao diện nhỏ (Button, Input, Card) phải được đưa vào thư mục `/components/` và dùng chung.
- **Pages:** Mỗi chức năng lớn là một Page nằm trong `/pages/`.
- **CSS / Styling:**
  - Hạn chế tối đa dùng `style={{ ... }}` (Inline Styles).
  - Sử dụng Tailwind CSS qua `className`. 
  - Tránh các lớp Tailwind tự do mâu thuẫn nhau (VD: không xài `p-4` rồi lại thêm `pr-2` vào cùng thẻ).

---

## 4. 🧪 CHECKLIST TRƯỚC KHI LƯU CODE / COMMIT

Trước khi nói "Tôi đã xong", **bắt buộc** tự kiểm tra:

- [ ] Tính năng mới chạy đúng yêu cầu.
- [ ] Tính năng cũ (nằm cạnh hoặc dùng chung Component) KHÔNG bị ảnh hưởng. Nếu có dùng Component chung, phải đi test thử chỗ đang dùng Component đó!
- [ ] Không có cảnh báo lỗi TypeScript (đỏ file) hoặc lỗi React warning (VD: `missing key in map`) trong Console trình duyệt.
- [ ] Chạy lệnh build (`npm run build`) không bị lỗi.
- [ ] Xóa bỏ toàn bộ `console.log`, `debugger`, và các đoạn code bị comment tạm.

---
**Cam kết:** 
> _"Tôi sẽ luôn dọn dẹp phần rác mình sinh ra và nâng niu những dòng code cũ như chính code mới của mình."_
