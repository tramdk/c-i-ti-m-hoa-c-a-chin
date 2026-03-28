# 📚 Hướng Dẫn React cho Người Mới – Dự Án "Tiệm Hoa của ChinChin"

---

## 🎯 Mục Tiêu
- Hiểu **cơ bản** và **nâng cao** về React thông qua một dự án thực tế.
- Nắm vững **các khái niệm quan trọng**: component, props, state, hooks, context, routing, performance, testing.
- Áp dụng **React** trong môi trường **Vite + TypeScript** và tích hợp **Three.js**, **Framer Motion**, **Lucide Icons**.

---

## 📦 Công Nghệ & Công Cụ
| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| **React** | 19.2.0 | Thư viện UI hiện đại, hỗ trợ hooks và concurrent rendering |
| **TypeScript** | 5.8.2 | Kiểm tra kiểu tĩnh, giúp tránh lỗi runtime |
| **Vite** | 6.2.0 | Build tool nhanh, hot‑module‑replacement (HMR) |
| **Three.js** | 0.181.1 | Đồ họa 3D trên web |
| **@react-three/fiber** | 9.4.0 | Renderer React cho Three.js |
| **Framer Motion** | 12.23.24 | Animation mượt mà, declarative |
| **Lucide‑React** | 0.553.0 | Bộ icon nhẹ, tùy biến |
| **TailwindCSS (CDN)** | – | Utility‑first CSS, dùng trong `index.html` |
| **Node.js** | >= 18 | Runtime JavaScript |
| **npm** | – | Quản lý package |

---

## 🛠️ Cài Đặt Môi Trường
```bash
# 1. Clone dự án (hoặc tạo mới)
git clone <repo‑url>
cd "cái-tiệm-hoa-của-chin"

# 2. Cài dependencies
npm install

# 3. Chạy dev server
npm run dev   # Mở http://localhost:5173
```
> **Lưu ý**: Dự án sử dụng `importmap` để load React/React‑DOM từ CDN, vì vậy không cần cài `react` và `react-dom` trong `node_modules` (được Vite xử lý).

---

## 📂 Cấu Trúc Thư Mục (React‑centric)
```
src/
├─ components/          # Các component UI tái sử dụng
│   ├─ AboutUs.tsx
│   ├─ AdminDashboard.tsx
│   ├─ FloralScene.tsx      # Three.js scene
│   ├─ ProductSection.tsx   # Danh sách sản phẩm + filter
│   └─ ...
├─ App.tsx                # Root component, quản lý routing & layout
├─ index.tsx              # Entry point, mount React vào #root
├─ types.ts               # Định nghĩa TypeScript cho Product, User, …
└─ index.css              # Global Tailwind + custom CSS
```
> **Tip**: Mỗi component nên có một file `.tsx` duy nhất, chứa **logic**, **UI**, và **styles** (via Tailwind). Khi cần tách style, tạo file `.module.css`.

---

## ⚛️ Các Khái Niệm Cơ Bản
### 1. Component
- **Function Component**: `const MyComponent: React.FC = () => { … }`
- **JSX**: Cú pháp giống HTML, cho phép nhúng biểu thức JavaScript `{expr}`.
- **Props**: Truyền dữ liệu từ parent → child.
```tsx
type GreetingProps = { name: string };
const Greeting: React.FC<GreetingProps> = ({ name }) => <h1>Hello, {name}!</h1>;
```
### 2. State & Hook `useState`
```tsx
const [count, setCount] = useState<number>(0);
```
- Khi `setCount` được gọi, component **re‑render**.
### 3. Effect Hook `useEffect`
```tsx
useEffect(() => {
  // chạy một lần khi component mount
  fetchProducts();
}, []);
```
- Dependency array (`[]`) quyết định khi nào effect chạy lại.
### 4. Custom Hook
- Tách logic tái sử dụng thành hàm.
```tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  // …sync to localStorage
  return [value, setValue] as const;
}
```
---

## 📦 Ứng Dụng Thực Tế – Các Thành Phần Chính
### 1. `App.tsx` – Router & Layout
- Sử dụng **conditional rendering** (`view === 'home' | 'admin' | 'about'`).
- Khi dự án mở rộng, có thể chuyển sang **React Router**.
### 2. `ProductSection.tsx`
- **State**: `displayProducts`, `categories`, `filter`, `loading`.
- **Data fetching**: `fetch('/api/products')` → fallback LocalStorage.
- **Filtering**: `filteredProducts = filter === 'all' ? …`.
- **Modal**: `selectedProduct` hiển thị chi tiết.
- **Animation**: `framer‑motion` cho hover, layout, modal.
### 3. `FloralScene.tsx`
- **Three.js** được bọc trong **React Three Fiber**.
- Tạo **scene**, **camera**, **lights**, **meshes**.
- Tham khảo tài liệu `@react-three/fiber` để hiểu `Canvas` component.
### 4. `AdminDashboard.tsx`
- Quản lý CRUD sản phẩm, danh mục.
- Sử dụng **LocalStorage** làm mock backend.
- Kiểm tra **role** (`user?.role === 'admin'`).
---

## 🧩 Các Hook Quan Trọng trong Dự Án
| Hook | Mục Đích | Ví Dụ |
|---|---|---|
| `useState` | Quản lý state cục bộ | `const [authModalOpen, setAuthModalOpen] = useState(false);` |
| `useEffect` | Side‑effects (fetch, event listeners) | `useEffect(() => { window.addEventListener('scroll', …); }, []);` |
| `useRef` | Tham chiếu DOM hoặc giá trị không gây re‑render | `const scrollRef = useRef<HTMLDivElement>(null);` |
| `useMemo` | Memoize tính toán tốn kém | `const filtered = useMemo(() => …, [filter, products]);` |
| `useCallback` | Memoize hàm để tránh re‑render con | `const handleClick = useCallback(() => …, []);` |
| `useContext` | Chia sẻ dữ liệu toàn app (optional) | Tạo `AuthContext` cho user info. |
---

## 🚦 Thực Hành – Bước Đến Thành Thạo
### Bước 1: Khám Phá `App.tsx`
1. Mở file `src/App.tsx`.
2. Xác định **state**: `view`, `user`, `menuOpen`.
3. Thay đổi `view` bằng các nút navigation, quan sát UI thay đổi.
### Bước 2: Thêm Component Mới
- Tạo `src/components/FeatureCard.tsx` để hiển thị một tính năng (icon, title, desc).
- Sử dụng **props** để truyền dữ liệu.
- Import vào `App.tsx` và đặt trong `features` section.
### Bước 3: Tương Tác với API Mock
- Mở `src/components/ProductSection.tsx`.
- Thêm **search bar** (input + state `searchTerm`).
- Lọc `displayProducts` dựa trên `searchTerm`.
### Bước 4: Tích Hợp React Router (Optional)
```bash
npm install react-router-dom@^6
```
- Thay `view` bằng `<Routes>` và `<Route>`.
- Lợi ích: URL thân thiện, khả năng bookmark.
### Bước 5: Viết Test với React Testing Library
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```
- Tạo `src/components/__tests__/ProductSection.test.tsx`.
- Kiểm tra render danh sách, filter, loading state.
---

## 🛡️ Kiểm Tra & Debugging
- **Console**: `console.log` trong `useEffect` để kiểm tra data flow.
- **React DevTools**: Kiểm tra component tree, props, state.
- **Network Tab**: Xem request `/api/products`.
- **Error Boundaries**: Tạo component `ErrorBoundary` để bắt lỗi runtime.
---

## 📈 Best Practices (React + TypeScript)
1. **Typed Props & State** – luôn khai báo kiểu cho props và state.
2. **Component nhỏ gọn** – mỗi component chỉ làm một việc.
3. **Avoid Inline Functions** trong JSX nếu không cần (use `useCallback`).
4. **Lazy Loading** – `React.lazy` + `Suspense` cho các route lớn.
5. **CSS‑in‑JS vs Tailwind** – dùng Tailwind cho layout nhanh, CSS modules cho style đặc thù.
6. **Performance** – `React.memo` cho component không thay đổi, `useMemo`/`useCallback` cho giá trị/hàm tốn kém.
7. **Accessibility** – thêm `aria‑label`, `role`, `alt` cho hình ảnh.
---

## 📚 Tài Nguyên Học Tập
| Loại | Link |
|---|---|
| **Official Docs** | https://react.dev |
| **TypeScript + React** | https://www.typescriptlang.org/docs/handbook/react.html |
| **React Three Fiber** | https://docs.pmnd.rs/react-three-fiber/getting-started/introduction |
| **Framer Motion** | https://www.framer.com/motion/ |
| **Tailwind CSS** | https://tailwindcss.com/docs |
| **Testing Library** | https://testing-library.com/docs/react-testing-library/intro |
| **YouTube** | "React Crash Course" – Traversy Media |
| **Books** | *Fullstack React* – Accomazzo et al. |

---

## 🎉 Kết Thúc
Bạn đã có **bản đồ học React** dựa trên dự án thực tế "Tiệm hoa của ChinChin". Hãy **thực hành** từng bước, **đặt câu hỏi**, và **đóng góp** vào dự án để củng cố kiến thức. Chúc bạn thành công và tạo ra những trải nghiệm web **đẹp mắt, mượt mà**!

---

*Được tạo bởi Antigravity – trợ lý AI chuyên nghiệp*
