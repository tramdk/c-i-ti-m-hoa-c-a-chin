
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '../components/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../constants';

export const CartView: React.FC = () => {
    const { cartItems, cartTotal, loading, removeFromCart, addToCart } = useCart();
    const navigate = useNavigate();

    if (loading && cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-floral-rose border-t-transparent rounded-full animate-spin" />
                <p className="font-serif text-2xl text-floral-deep italic">Đang cập nhật giỏ hàng...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="font-serif text-5xl text-floral-deep mb-4 uppercase tracking-tight">Giỏ Hàng Của Bạn</h1>
                        <p className="text-stone-500 font-light flex items-center gap-2">
                            <ShoppingBag size={18} className="text-floral-rose" />
                            Có {cartItems.length} sản phẩm trong giỏ hàng
                        </p>
                    </div>
                    <Link to="/" className="flex items-center gap-2 text-stone-400 hover:text-floral-rose font-bold uppercase tracking-widest text-xs transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Tiếp tục mua sắm
                    </Link>
                </div>

                {cartItems.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-stone-100">
                        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShoppingBag size={48} className="text-stone-200" />
                        </div>
                        <h2 className="font-serif text-3xl text-floral-deep mb-4">Giỏ hàng của bạn đang trống</h2>
                        <p className="text-stone-400 mb-10 max-w-sm mx-auto">Hãy khám phá những sản phẩm nghệ thuật tuyệt vời của chúng tôi để lấp đầy giỏ hàng nhé!</p>
                        <Link to="/" className="px-12 py-5 bg-floral-rose text-white rounded-full font-bold uppercase tracking-widest hover:bg-floral-deep transition-all shadow-xl">KHÁM PHÁ NGAY</Link>
                    </motion.div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Cart Items List */}
                        <div className="flex-grow space-y-6">
                            <AnimatePresence mode='popLayout'>
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.productId}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col md:flex-row items-center gap-8"
                                    >
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-stone-50 shrink-0">
                                            <img
                                                src={item.imageUrl || ENDPOINTS.FILES.VIEW_BY_OBJECT_ID(item.productId)}
                                                className="w-full h-full object-cover"
                                                alt={item.productName}
                                                onError={(e) => {
                                                    // Fallback to placeholder if everything fails
                                                    (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/1122621/pexels-photo-1122621.jpeg?auto=compress&cs=tinysrgb&w=300";
                                                }}
                                            />
                                        </div>

                                        <div className="flex-grow text-center md:text-left">
                                            <h3 className="font-serif text-2xl text-floral-deep mb-2">{item.productName}</h3>
                                            <p className="text-floral-rose font-bold text-lg mb-4">{item.price.toLocaleString()}đ</p>

                                            <div className="flex items-center justify-center md:justify-start gap-4">
                                                <div className="flex items-center bg-stone-50 rounded-full border border-stone-100 p-1">
                                                    <button
                                                        onClick={() => item.quantity > 1 && addToCart({ id: item.productId }, -1)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-white hover:text-floral-rose transition-all disabled:opacity-30"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-8 text-center font-bold text-sm text-floral-deep">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart({ id: item.productId }, 1)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-white hover:text-floral-rose transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.productId)}
                                                    className="p-3 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-bold uppercase tracking-widest text-stone-300 mb-1">Thành tiền</p>
                                            <p className="font-serif text-2xl text-floral-deep">{(item.price * item.quantity).toLocaleString()}đ</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <aside className="w-full lg:w-96 shrink-0">
                            <div className="bg-floral-deep text-white p-10 rounded-[3rem] shadow-2xl sticky top-32">
                                <h2 className="font-serif text-3xl mb-10 border-b border-white/10 pb-6 uppercase tracking-wider text-center">Tóm tắt đơn hàng</h2>

                                <div className="space-y-6 mb-12">
                                    <div className="flex justify-between items-center text-white/60">
                                        <span className="text-sm font-medium">Tạm tính ({cartItems.length} món)</span>
                                        <span className="font-bold">{cartTotal.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-white/60">
                                        <span className="text-sm font-medium">Phí vận chuyển</span>
                                        <span className="font-bold">Miễn phí</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex justify-between items-center text-xl">
                                        <span className="font-serif italic capitalize">Tổng cộng</span>
                                        <span className="text-3xl font-bold text-floral-rose">{cartTotal.toLocaleString()}đ</span>
                                    </div>
                                </div>

                                <button className="w-full py-6 bg-floral-rose text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-white hover:text-floral-deep transition-all duration-500 flex items-center justify-center gap-3">
                                    <CreditCard size={20} /> THANH TOÁN NGAY
                                </button>

                                <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                    <ShieldCheck size={16} /> Thanh toán bảo mật 100%
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};
