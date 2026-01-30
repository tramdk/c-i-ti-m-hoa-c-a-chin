# 🚀 Quick Start Guide - Tính Năng 3D

## 🎯 Tổng Quan Nhanh

Dự án tiệm hoa đã được tích hợp **5 tính năng 3D** sử dụng Three.js để tạo trải nghiệm mua sắm độc đáo.

![3D Features Showcase](../brain/6ac5a329-39ad-4793-869d-f8b0a895e9ba/3d_features_showcase_1769750217492.png)

---

## ⚡ Chạy Ngay

```bash
# Cài đặt dependencies (nếu chưa)
npm install

# Chạy dev server
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## 🎮 Hướng Dẫn Sử Dụng

### 1️⃣ **Bouquet Builder** - Thiết Kế Bó Hoa

**Cách mở:**
- Click nút **"Thiết Kế Bó Hoa Riêng"** ở header

**Cách dùng:**
1. Chọn loại hoa từ menu bên phải
2. Click **"Thêm [Tên Hoa]"** để thêm vào bình
3. Click vào hoa trong 3D để chọn
4. Click **🗑️** để xóa hoa đã chọn
5. Xem tổng giá ở góc dưới
6. Click **"Lưu & Đặt Hàng"** khi hoàn thành

**Loại hoa có sẵn:**
- 🌹 Hồng - 50,000đ
- 🌸 Lily - 60,000đ
- 🌷 Tulip - 45,000đ
- 🌻 Hướng dương - 40,000đ
- 🌺 Lan - 80,000đ
- 🌼 Cúc - 30,000đ

---

### 2️⃣ **3D Product Viewer** - Xem 360°

**Cách mở:**
- Hover vào product card
- Click nút **📦** (Xem 3D)

**Controls:**
- **Xoay:** Click chuột trái và kéo
- **Zoom:** Cuộn chuột hoặc nút +/-
- **Di chuyển:** Click chuột phải và kéo
- **Reset:** Click nút 🔄

---

### 3️⃣ **Virtual Preview** - Xem Trong Không Gian

**Cách mở:**
- Hover vào product card
- Click nút **👁️** (Xem trong không gian)

**Cách dùng:**
1. Chọn không gian: Phòng khách / Văn phòng / Cafe
2. Kéo thanh "Kích thước" để điều chỉnh
3. Kéo thanh "Trái/Phải" và "Trước/Sau" để di chuyển
4. Click **"Đặt Lại"** để reset

---

### 4️⃣ **Flower Growth** - Hoa Nở

**Tự động kích hoạt:**
- Hover chuột vào product card
- Hoa sẽ tự động nở từ nụ

**Không cần thao tác gì!**

---

### 5️⃣ **Enhanced Cart Animation** - Thêm Giỏ Hàng

**Tự động kích hoạt:**
- Click **"Thêm Vào Giỏ"** trên bất kỳ sản phẩm nào
- Xem hoa 3D bay vào giỏ hàng
- Cánh hoa rơi xung quanh

**Không cần thao tác gì!**

---

## 🎨 Tùy Chỉnh

### Thay đổi màu sắc hoa:

**File:** `components/ProductSection.tsx`

```tsx
// Thay đổi màu trong CartFlyingAnimation
<CartFlyingAnimation
  productColor="#FF69B4"  // Đổi màu tại đây
/>

// Thay đổi màu trong FlowerGrowth
<FlowerGrowth 
  color="#FF1493"  // Đổi màu tại đây
/>
```

### Thêm loại hoa mới:

**File:** `components/BouquetBuilder.tsx`

```tsx
const FLOWER_TYPES: FlowerType[] = [
  // ... existing flowers
  { 
    id: 'peony', 
    name: 'Mẫu Đơn', 
    color: '#FFB6C1', 
    price: 70000 
  },
];
```

---

## 🐛 Troubleshooting

### Lỗi: "WebGL not supported"
**Giải pháp:** Sử dụng trình duyệt hiện đại (Chrome, Firefox, Edge)

### Lỗi: Animation lag
**Giải pháp:** 
- Giảm số lượng hoa trong Bouquet Builder
- Tắt một số tab khác
- Kiểm tra GPU acceleration

### Lỗi: Texture không load
**Giải pháp:**
- Kiểm tra đường dẫn ảnh
- Đảm bảo CORS được cấu hình đúng

---

## 📱 Mobile Support

Tất cả tính năng đều hỗ trợ mobile:
- ✅ Touch gestures
- ✅ Responsive UI
- ✅ Optimized performance

**Lưu ý:** 3D Viewer và Bouquet Builder tốt nhất trên tablet/desktop

---

## 🎯 Tips & Tricks

### Tối ưu performance:
1. Đóng các modal không dùng
2. Không mở quá nhiều 3D viewer cùng lúc
3. Clear cache nếu lag

### Tạo bó hoa đẹp:
1. Bắt đầu với hoa to (Hồng, Lily)
2. Thêm hoa nhỏ (Cúc) để lấp đầy
3. Dùng Hướng dương làm điểm nhấn
4. Kết hợp 3-4 màu hài hòa

### Xem preview tốt nhất:
1. Chọn không gian phù hợp với mục đích
2. Điều chỉnh kích thước trước
3. Sau đó mới di chuyển vị trí

---

## 📚 Tài Liệu Chi Tiết

- [3D_FEATURES.md](./3D_FEATURES.md) - Technical documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation summary

---

## 🆘 Cần Trợ Giúp?

1. Xem documentation
2. Check console logs
3. Kiểm tra network tab
4. Đọc error messages

---

**🎉 Chúc bạn trải nghiệm vui vẻ với các tính năng 3D!**
