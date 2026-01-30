
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, X, ShoppingBag, Star, Clock, Truck, Loader2, RefreshCcw, Info, Search, Eye, Box } from 'lucide-react';
import { ENDPOINTS, STORAGE_KEYS } from '../constants';
import { FileHandler } from './FileHandler';
import { api } from '@/backend';
import { useCart } from './CartContext';
import { CartFlyingAnimation } from './CartFlyingAnimation';
import { SimpleFlower } from './SimpleFlower';
import { Product3DViewer } from './Product3DViewer';
import { VirtualPreview } from './VirtualPreview';

import { Product, Category } from '../types';

const FlyingItem = ({ image, targetId, onComplete }: { image: string, targetId: string, onComplete: () => void }) => {
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  }, [targetId]);

  return (
    <motion.div
      initial={{ x: startPos.x, y: startPos.y, scale: 1, opacity: 1, rotate: 0 }}
      animate={{
        x: targetPos.x - 25,
        y: targetPos.y - 25,
        scale: 0.1,
        opacity: 0.5,
        rotate: 360
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={onComplete}
      className="fixed z-[999] w-12 h-12 rounded-full overflow-hidden border-2 border-floral-rose shadow-2xl pointer-events-none"
    >
      <img src={image} className="w-full h-full object-cover" />
    </motion.div>
  );
};

const INITIAL_PRODUCTS: Product[] = [
  // ... (same as before)
  {
    id: 1,
    name: "Giỏ Hoa Sunset Bloom",
    category: 'hoa',
    price: 1250000,
    image: "https://images.pexels.com/photos/1122621/pexels-photo-1122621.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Sự kết hợp hoàn hảo giữa những đóa hồng Cam Spirit rạng rỡ và sắc vàng của Lan Vũ Nữ.",
    badge: 'Mới về'
  },
  {
    id: 2,
    name: "Lãng Trái Cây Nhập Khẩu",
    category: 'trai-cay',
    price: 2100000,
    image: "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Tuyển chọn những loại quả thượng hạng từ Úc và Nhật Bản."
  },
  {
    id: 3,
    name: "Combo Tình Yêu Vĩnh Cửu",
    category: 'combo',
    price: 3500000,
    image: "https://images.pexels.com/photos/931154/pexels-photo-931154.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Bộ quà tặng cao cấp gồm hộp hoa Hồng Ohara nhập khẩu.",
    badge: 'Luxury'
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'hoa', name: 'Hoa' },
  { id: 'trai-cay', name: 'Trái cây' },
  { id: 'combo', name: 'Combo' },
];

export const ProductSection: React.FC = () => {
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [filter, setFilter] = useState<string | number>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [flyingObject, setFlyingObject] = useState<{ image: string; color: string } | null>(null);

  // New 3D feature states
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [viewerProduct, setViewerProduct] = useState<Product | null>(null);
  const [showVirtualPreview, setShowVirtualPreview] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<number | string | null>(null);

  const { addToCart } = useCart();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const prodsData = await api.products.getAll();
      const catsData = await api.productCategories.getAll();

      if (prodsData) {
        setDisplayProducts(prodsData);
        setIsDemoMode(false);
      }
      if (catsData) {
        setCategories([{ id: 'all', name: 'Tất cả' }, ...catsData]);
      }
    } catch (err) {
      const localData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      setDisplayProducts(localData ? JSON.parse(localData) : INITIAL_PRODUCTS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem('chinchin_token');
    if (!token) {
      window.dispatchEvent(new Event('chinchin-login-prompt'));
      return;
    }

    // Trigger animation immediately for better UX
    console.log('🌸 Triggering flying animation');
    setFlyingObject({ image: product.image, color: '#D88C9A' });

    const success = await addToCart(product);
    if (success) {
      console.log('✅ Successfully added to cart');
      setSelectedProduct(null);
    } else {
      console.log('❌ Failed to add to cart');
      // Animation already triggered, so user still sees feedback
    }
  };

  const handle3DView = (product: Product) => {
    setViewerProduct(product);
    setShow3DViewer(true);
  };

  const handleVirtualPreview = (product: Product) => {
    setPreviewProduct(product);
    setShowVirtualPreview(true);
  };

  const filteredProducts = displayProducts.filter(p => {
    const matchesCategory = filter === 'all' || String(p.categoryId) === String(filter);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-6">
      {/* Enhanced 3D Cart Animation */}
      <AnimatePresence>
        {flyingObject && (
          <CartFlyingAnimation
            image={flyingObject.image}
            targetId="cart-icon"
            onComplete={() => setFlyingObject(null)}
            productColor={flyingObject.color}
          />
        )}
      </AnimatePresence>



      {/* 3D Product Viewer */}
      {viewerProduct && (
        <Product3DViewer
          imageUrl={viewerProduct.image}
          productName={viewerProduct.name}
          isOpen={show3DViewer}
          onClose={() => setShow3DViewer(false)}
        />
      )}



      {/* Virtual Preview */}
      {previewProduct && (
        <VirtualPreview
          productImage={previewProduct.image}
          productName={previewProduct.name}
          isOpen={showVirtualPreview}
          onClose={() => setShowVirtualPreview(false)}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="relative">
          <h2 className="font-serif text-5xl md:text-6xl text-floral-deep mb-6 uppercase tracking-tight">Bộ Sưu Tập <br /><span className="italic text-floral-rose">Nghệ Thuật</span></h2>
          <div className="flex items-center gap-4">
            <p className="text-xl text-stone-500 font-light max-w-lg">Tuyển chọn những đóa hoa tươi nhất trong ngày, được thiết kế bởi những nghệ nhân hàng đầu.</p>
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchProducts}
              disabled={loading}
              className={`p-2 rounded-full hover:bg-floral-rose/10 transition-colors text-floral-rose ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCcw size={20} />
            </motion.button>
          </div>


        </div>

        <div className="flex flex-col gap-6 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-floral-rose transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-stone-100 rounded-full shadow-sm outline-none focus:ring-4 focus:ring-floral-rose/5 focus:border-floral-rose/20 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex bg-white rounded-full p-2 shadow-sm border border-stone-100 overflow-hidden overflow-x-auto max-w-full no-scrollbar">
            {categories.map((cat) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-6 md:px-8 py-3 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase transition-all whitespace-nowrap ${filter === cat.id ? 'bg-floral-rose text-white shadow-md' : 'text-stone-400 hover:text-floral-rose'}`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDemoMode && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-floral-petal border border-floral-rose/20 text-floral-deep rounded-2xl flex items-center gap-3 text-sm italic shadow-sm"
          >
            <Info size={18} className="text-floral-rose" />
            Đang hiển thị mẫu sản phẩm demo. Bạn có thể sử dụng bảng quản trị để thay đổi dữ liệu.
          </motion.div>
        )}
      </AnimatePresence>

      {loading && displayProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-stone-300">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-serif text-2xl italic">Đang tải bộ sưu tập...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-12 px-2 md:px-0">
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                key={product.id}
                className="group relative cursor-pointer flex flex-col bg-white md:bg-transparent rounded-[2rem] md:rounded-none overflow-hidden transition-all duration-700"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image Container with sophisticated hover */}
                <div
                  className="relative aspect-[4/5] w-full overflow-hidden bg-stone-50 md:mb-6 shadow-sm group-hover:shadow-[0_30px_60px_-15px_rgba(216,140,154,0.25)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-[2rem] md:rounded-[1.5rem]"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >

                  {/* Image itself */}
                  <div className="w-full h-full overflow-hidden">
                    <FileHandler
                      objectId={product.id}
                      objectType="product"
                      viewOnly={true}
                      fallbackImage={product.image}
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                    />
                  </div>

                  {/* Simple 8-Petal Flower Animation */}
                  {hoveredProduct === product.id && (
                    <SimpleFlower isVisible={true} color="#FF6B9D" />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-floral-deep/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Quick Actions (Top Right) */}
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex flex-col gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    {/* 3D Viewer */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handle3DView(product);
                      }}
                      className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-400 hover:text-floral-rose transition-all shadow-lg group/btn"
                      title="Xem 3D"
                    >
                      <Box size={20} className="transition-transform group-hover/btn:rotate-12" />
                    </motion.button>

                    {/* Virtual Preview */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVirtualPreview(product);
                      }}
                      className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-400 hover:text-floral-rose transition-all shadow-lg"
                      title="Xem trong không gian"
                    >
                      <Eye size={20} />
                    </motion.button>

                    {/* Wishlist */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle wishlist logic if any
                      }}
                      className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-400 hover:text-floral-rose transition-all shadow-lg"
                      title="Yêu thích"
                    >
                      <Heart size={20} className="transition-transform active:scale-125" />
                    </motion.button>
                  </div>

                  {/* Badge (Top Left) */}
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                    {product.badge && (
                      <span className="px-3 py-1 md:px-5 md:py-2 bg-white/90 backdrop-blur-md text-floral-deep text-[8px] md:text-[11px] font-bold tracking-[0.2em] uppercase rounded-full shadow-md border border-floral-rose/10">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Overlay Button (Desktop) */}
                  <div className="hidden md:flex absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-20">
                    <motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full py-4 bg-floral-rose text-white rounded-xl font-bold text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 shadow-xl hover:bg-floral-deep transition-all duration-300 group/btn"
                    >
                      <ShoppingBag size={16} className="transition-transform group-hover/btn:scale-110" />
                      THÊM VÀO GIỎ
                    </motion.button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 md:p-0 md:px-2 text-center transition-transform duration-500 group-hover:translate-y-[-4px]">
                  <p className="text-[10px] md:text-xs text-stone-400 uppercase tracking-[0.2em] mb-2 font-medium opacity-80 group-hover:text-floral-rose/60 transition-colors">
                    {categories.find(c => c.id === product.categoryId)?.name || 'Bộ sưu tập'}
                  </p>
                  <h3 className="font-serif text-base md:text-2xl text-floral-deep mb-2 line-clamp-1 group-hover:text-floral-rose transition-colors duration-500">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-center gap-3">
                    <span className="text-floral-rose font-bold text-sm md:text-xl">
                      {product.price.toLocaleString()}đ
                    </span>
                    <div className="w-1 h-1 rounded-full bg-stone-200" />
                    <div className="flex items-center gap-0.5 text-floral-gold">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] md:text-xs text-stone-400 font-bold">4.9</span>
                    </div>
                  </div>

                  {/* Mobile Add to Cart */}
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="md:hidden mt-4 w-full py-3 bg-floral-rose text-white rounded-xl font-bold text-[10px] tracking-[0.15em] uppercase flex items-center justify-center gap-2 shadow-lg shadow-floral-rose/20 active:bg-floral-deep transition-all"
                  >
                    <Plus size={14} /> THÊM VÀO GIỎ
                  </motion.button>
                </div>

                {/* Subtle border for desktop hover effect */}
                <div className="hidden md:block absolute -inset-4 border border-floral-rose/0 rounded-[2.5rem] group-hover:border-floral-rose/5 transition-colors duration-700 -z-10" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal - Premium Product Detail View */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-floral-deep/80 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-6xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[750px] max-h-[95vh] md:max-h-[92vh]"
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 bg-white/80 md:bg-stone-100 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:bg-floral-rose hover:text-white shadow-sm md:shadow-none transition-all"
              >
                <X size={20} className="md:hidden" />
                <X size={24} className="hidden md:block" />
              </motion.button>

              {/* Product Gallery Section */}
              <div className="w-full md:w-1/2 lg:w-[45%] bg-stone-100 flex-shrink-0">
                <FileHandler
                  objectId={selectedProduct.id}
                  objectType="product"
                  viewOnly={true}
                  fallbackImage={selectedProduct.image}
                  className="h-full rounded-none"
                />
              </div>

              {/* Product Info Section */}
              <div className="w-full md:w-1/2 lg:w-[55%] p-6 md:p-12 flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <span className="px-3 md:px-4 py-1.5 bg-stone-50 text-stone-400 rounded-full text-[10px] md:text-[12px] font-bold uppercase tracking-[0.2em] border border-stone-100">
                    {categories.find(c => c.id === selectedProduct.categoryId)?.name || 'Sản phẩm'}
                  </span>
                  <div className="flex items-center gap-1 text-floral-gold scale-90 md:scale-100 origin-right">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    <span className="text-[10px] md:text-xs text-stone-400 font-bold ml-1 md:ml-2">(4.9/5)</span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl lg:text-5xl text-floral-deep mb-4 uppercase tracking-tight leading-[1.2] md:leading-[1.1]">{selectedProduct.name}</h2>
                <div className="flex items-center gap-4 md:gap-6 mb-6 pb-6 border-b border-stone-100">
                  <p className="text-floral-rose text-2xl md:text-3xl font-bold">{selectedProduct.price.toLocaleString()}đ</p>
                  <div className="h-6 w-px bg-stone-100" />
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] md:text-[11px] font-bold uppercase rounded-lg tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Sẵn có
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-serif text-lg text-floral-deep italic">Cảm hứng nghệ thuật:</h4>
                  <p className="text-stone-500 font-light text-base leading-relaxed line-clamp-3 md:line-clamp-none">
                    "{selectedProduct.description}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  <div className="p-4 bg-stone-50 rounded-[1.5rem] border border-stone-100 group hover:bg-white hover:shadow-lg transition-all duration-500">
                    <div className="flex items-center gap-3 text-floral-deep font-bold text-[11px] tracking-widest uppercase mb-1"><Truck size={16} className="text-floral-rose" /> Dịch vụ giao hỏa tốc</div>
                    <p className="text-[12px] text-stone-400 font-medium leading-relaxed">Giao hàng nhanh tại nội thành.</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-[1.5rem] border border-stone-100 group hover:bg-white hover:shadow-lg transition-all duration-500">
                    <div className="flex items-center gap-3 text-floral-deep font-bold text-[11px] tracking-widest uppercase mb-1"><Heart size={16} className="text-floral-rose" /> Thiệp viết tay</div>
                    <p className="text-[12px] text-stone-400 font-medium leading-relaxed">ChinChin tặng kèm thiệp thiết kế riêng.</p>
                  </div>
                </div>

                <div className="mt-6 md:mt-auto flex gap-3">
                  <motion.button
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-grow py-4 md:py-5 bg-floral-deep text-white rounded-xl md:rounded-[1.2rem] font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 md:gap-4 shadow-xl hover:bg-stone-800 transition-all duration-500"
                  >
                    <ShoppingBag size={20} />
                    THÊM VÀO GIỎ HÀNG
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 md:w-16 md:h-16 border-2 border-stone-100 rounded-xl md:rounded-[1.2rem] flex items-center justify-center text-stone-300 hover:text-floral-rose hover:border-floral-rose/20 transition-all duration-500 group"
                  >
                    <Heart size={24} className="group-hover:fill-current transition-colors" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
