import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2, X, Save, Plus } from 'lucide-react';
import { Product, Category } from '../../../types';
import { FileHandler } from '../../../components/FileHandler';
import { api, triggerToast } from '../../../backend';

interface ProductManagerProps {
    products: Product[];
    categories: Category[];
    onRefresh: () => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products, categories, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', category: 'hoa', price: 0, image: '', description: '', badge: ''
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.products.update(editingProduct.id, formData);
            } else {
                await api.products.create(formData);
            }
            onRefresh();
            setIsModalOpen(false);
            triggerToast("Đã lưu sản phẩm thành công", "success");
        } catch (err) {
            // API handles toast
        }
    };

    const handleDeleteProduct = async (id: string | number) => {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await api.products.delete(id);
                onRefresh();
                triggerToast("Đã xóa sản phẩm", "info");
            } catch (err) { }
        }
    };

    const openAddModal = () => {
        const newId = crypto.randomUUID();
        setEditingProduct(null);
        setFormData({ id: newId, name: '', category: String(categories[0]?.id || 'hoa'), price: 0, image: '', description: '', badge: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-8 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-floral-rose/20 transition-all text-sm outline-none"
                        />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-8 py-4 bg-floral-rose text-white rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-floral-deep transition-all shadow-xl shadow-floral-rose/20"
                    >
                        <Plus size={20} /> THÊM SẢN PHẨM
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-200/50">
                                <th className="px-8 py-6 text-[12px] font-bold uppercase tracking-widest text-stone-900">Sản phẩm</th>
                                <th className="px-8 py-6 text-[12px] font-bold uppercase tracking-widest text-stone-900">Danh mục</th>
                                <th className="px-8 py-6 text-[12px] font-bold uppercase tracking-widest text-stone-900">Giá</th>
                                <th className="px-8 py-6 text-[12px] font-bold uppercase tracking-widest text-stone-900 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-stone-200/30 transition-colors">
                                    <td className="px-8 py-6 min-w-[300px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 shrink-0 bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
                                                <FileHandler objectId={product.id} objectType="product" viewOnly={true} className="w-full h-full" fallbackImage={product.image} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-floral-deep text-sm mb-0.5 truncate">{product.name}</p>
                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">ID: {String(product.id).substring(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-stone-500 uppercase tracking-wider">
                                        {categories.find(c => c.id === product.category)?.name || product.category}
                                    </td>
                                    <td className="px-8 py-6 font-mono text-sm font-bold text-floral-rose">
                                        {product.price.toLocaleString()}đ
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(product)} className="p-3 bg-white text-stone-400 hover:text-floral-gold rounded-xl shadow-sm border border-stone-100"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-3 bg-white text-stone-400 hover:text-red-500 rounded-xl shadow-sm border border-stone-100"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-floral-deep/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col p-8 max-h-[90vh] overflow-y-auto" >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-serif text-3xl text-floral-deep">{editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tên sản phẩm</label>
                                        <input required type="text" className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-floral-rose/20" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Danh mục</label>
                                            <select className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Giá (VNĐ)</label>
                                            <input required type="number" className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none font-mono" value={formData.price === 0 ? '' : formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Mô tả</label>
                                        <textarea rows={3} className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Nhãn (Badge)</label>
                                        <input type="text" className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Hình ảnh sản phẩm</label>
                                        <div className="space-y-4">
                                            <FileHandler
                                                objectId={formData.id || 'new'}
                                                objectType="product"
                                                allowUpload={true}
                                                allowDelete={true}
                                                onUploadSuccess={(data) => setFormData(prev => ({ ...prev, image: data.url || data.path }))}
                                                refreshTrigger={formData.image}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="col-span-full py-5 bg-floral-deep text-white rounded-2xl font-bold uppercase shadow-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-3">
                                    <Save size={20} /> LƯU THAY ĐỔI
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
