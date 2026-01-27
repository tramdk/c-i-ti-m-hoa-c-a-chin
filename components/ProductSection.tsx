
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, X, ShoppingBag, Star, Clock, Truck, Loader2, RefreshCcw, Info } from 'lucide-react';
import { ENDPOINTS } from '../constants';
import { FileHandler } from './FileHandler';
import { api } from '@/backend';
import { useCart } from './CartContext';

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
  const [flyingObject, setFlyingObject] = useState<string | null>(null);

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
      const localData = localStorage.getItem('chinchin_products');
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

    const success = await addToCart(product);
    if (success) {
      setFlyingObject(product.image);
      setSelectedProduct(null);
    }
  };

  const filteredProducts = filter === 'all' ? displayProducts : displayProducts.filter(p => p.category === filter);

  return (
    <div className="container mx-auto px-6">
      <AnimatePresence>
        {flyingObject && (
          <FlyingItem
            image={flyingObject}
            targetId="cart-icon"
            onComplete={() => setFlyingObject(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="relative">
          <h2 className="font-serif text-5xl md:text-6xl text-floral-deep mb-6 uppercase tracking-tight">Bộ Sưu Tập <br /><span className="italic text-floral-rose">Nghệ Thuật</span></h2>
          <div className="flex items-center gap-4">
            <p className="text-xl text-stone-500 font-light max-w-lg">Tuyển chọn những đóa hoa tươi nhất trong ngày, được thiết kế bởi những nghệ nhân hàng đầu.</p>
            <button
              onClick={fetchProducts}
              disabled={loading}
              className={`p-2 rounded-full hover:bg-floral-rose/10 transition-colors text-floral-rose ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        <div className="flex bg-white rounded-full p-2 shadow-sm border border-stone-100 overflow-hidden overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 md:px-8 py-3 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase transition-all whitespace-nowrap ${filter === cat.id ? 'bg-floral-rose text-white shadow-md' : 'text-stone-400 hover:text-floral-rose'}`}
            >
              {cat.name}
            </button>
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-12">
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                key={product.id}
                className="group cursor-pointer flex md:flex-col bg-white md:bg-transparent p-3 md:p-0 rounded-[2rem] md:rounded-none border border-stone-100 md:border-none shadow-sm md:shadow-none items-center md:items-stretch gap-5 md:gap-0"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative w-28 h-28 md:w-full md:aspect-[4/5] shrink-0 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white md:mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-stone-50">
                  <FileHandler
                    objectId={product.id}
                    objectType="product"
                    viewOnly={true}
                    fallbackImage={product.image}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute top-3 left-3 md:top-6 md:left-6">
                    {product.badge && (
                      <span className="px-3 py-1 md:px-5 md:py-2 bg-floral-rose/90 backdrop-blur-sm text-white text-[8px] md:text-[12px] font-bold tracking-widest uppercase rounded-full shadow-lg" style={{ fontSize: 'clamp(8px, 2vw, 12px)' }}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:block absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-all duration-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full py-5 bg-white text-floral-deep rounded-2xl font-bold text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 shadow-2xl hover:bg-floral-rose hover:text-white transition-all group/btn"
                    >
                      <ShoppingBag size={16} className="text-floral-rose group-hover/btn:text-white transition-colors" /> THÊM VÀO GIỎ
                    </button>
                  </div>
                </div>
                <div className="flex-grow min-w-0 md:px-4 text-left md:text-center">
                  <h3 className="font-serif text-lg md:text-2xl text-floral-deep mb-1 md:mb-2 truncate md:whitespace-normal">{product.name}</h3>
                  <div className="hidden md:block w-12 h-0.5 bg-floral-rose/20 mx-auto mb-3" />
                  <p className="text-floral-rose font-bold text-base md:text-xl">{product.price.toLocaleString()}đ</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="md:hidden mt-3 px-5 py-2.5 bg-floral-rose text-white rounded-xl font-bold text-[10px] tracking-widest uppercase flex items-center gap-2 shadow-lg shadow-floral-rose/20 active:scale-95 transition-transform"
                  >
                    <Plus size={14} /> THÊM
                  </button>
                </div>
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
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 md:top-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 bg-white/80 md:bg-stone-100 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:bg-floral-rose hover:text-white shadow-sm md:shadow-none transition-all">
                <X size={20} className="md:hidden" />
                <X size={24} className="hidden md:block" />
              </button>

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
                    {categories.find(c => c.id === selectedProduct.category)?.name || selectedProduct.category}
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
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-grow py-4 md:py-5 bg-floral-deep text-white rounded-xl md:rounded-[1.2rem] font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 md:gap-4 shadow-xl hover:bg-stone-800 transform md:hover:-translate-y-1 transition-all duration-500"
                  >
                    <ShoppingBag size={18} className="md:hidden" />
                    <ShoppingBag size={20} className="hidden md:block" />
                    THÊM VÀO GIỎ HÀNG
                  </button>
                  <button className="w-14 h-14 md:w-16 md:h-16 border-2 border-stone-100 rounded-xl md:rounded-[1.2rem] flex items-center justify-center text-stone-300 hover:text-floral-rose hover:border-floral-rose/20 transition-all duration-500 group">
                    <Heart size={20} className="md:hidden group-hover:fill-current" />
                    <Heart size={24} className="hidden md:block group-hover:fill-current" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
