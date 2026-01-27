import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2, X, Save, Plus } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Post, PostCategory } from '../../../types';
import { FileHandler } from '../../../components/FileHandler';
import { api, triggerToast } from '../../../backend';

interface PostManagerProps {
    posts: Post[];
    postCategories: PostCategory[];
    onRefresh: () => void;
}

export const PostManager: React.FC<PostManagerProps> = ({ posts, postCategories, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [postFormData, setPostFormData] = useState<Partial<Post>>({
        title: '', category: '', author: '', date: new Date().toLocaleDateString(), image: '', excerpt: '', content: '', categoryId: ''
    });

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSavePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title: postFormData.title,
                content: postFormData.content,
                categoryId: postFormData.categoryId
            };

            if (editingPost) {
                await api.blog.update(editingPost.id, { ...payload, id: editingPost.id });
            } else {
                await api.blog.create(payload);
            }
            onRefresh();
            setIsPostModalOpen(false);
            triggerToast("Đã lưu bài viết", "success");
        } catch (err) { }
    };

    const handleDeletePost = async (id: string | number) => {
        if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            try {
                await api.blog.delete(id);
                onRefresh();
                triggerToast("Đã xóa bài viết", "info");
            } catch (err) { }
        }
    };

    const openAddModal = () => {
        const newId = crypto.randomUUID();
        setEditingPost(null);
        setPostFormData({ id: newId, title: '', categoryId: postCategories[0]?.id || '', author: '', date: new Date().toLocaleDateString(), image: '', excerpt: '', content: '' });
        setIsPostModalOpen(true);
    };

    const openEditModal = async (post: Post) => {
        try {
            triggerToast("Đang tải dữ liệu bài viết...", "info");
            const fullPost = await api.blog.getOne(post.id);
            const mappedFullPost = {
                ...post,
                content: fullPost.content,
                excerpt: fullPost.excerpt || "",
            };
            setEditingPost(mappedFullPost);
            setPostFormData(mappedFullPost);
            setIsPostModalOpen(true);
        } catch (e) {
            triggerToast("Không thể tải chi tiết bài viết", "error");
        }
    };

    return (
        <>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-8 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tiêu đề bài viết..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-floral-rose/20 transition-all text-sm outline-none"
                        />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-8 py-4 bg-floral-rose text-white rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-floral-deep transition-all shadow-xl shadow-floral-rose/20"
                    >
                        <Plus size={20} /> THÊM BÀI VIẾT
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-100/50">
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">Bài viết</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">Danh mục</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="group hover:bg-stone-100/30 transition-colors">
                                    <td className="px-8 py-6 min-w-[300px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 shrink-0 bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
                                                <FileHandler objectId={post.id} objectType="post" viewOnly={true} className="w-full h-full" fallbackImage={post.image} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-floral-deep text-sm mb-0.5 truncate">{post.title}</p>
                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{post.author} • {post.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                            {postCategories.find(c => c.id === post.categoryId)?.name || post.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(post)} className="p-3 bg-white text-stone-400 hover:text-floral-gold rounded-xl shadow-sm border border-stone-100"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeletePost(post.id)} className="p-3 bg-white text-stone-400 hover:text-red-500 rounded-xl shadow-sm border border-stone-100"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isPostModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostModalOpen(false)} className="absolute inset-0 bg-floral-deep/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-7xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col p-8 max-h-[95vh] overflow-y-auto" >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-serif text-3xl text-floral-deep">{editingPost ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết Mới'}</h3>
                                <button onClick={() => setIsPostModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSavePost} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tiêu đề bài viết</label>
                                        <input required type="text" className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-floral-rose/20" value={postFormData.title} onChange={e => setPostFormData({ ...postFormData, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Đăng bởi</label>
                                            <input required type="text" className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none" value={postFormData.author} onChange={e => setPostFormData({ ...postFormData, author: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Danh mục</label>
                                            <select className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none" value={postFormData.categoryId} onChange={e => setPostFormData({ ...postFormData, categoryId: e.target.value })}>
                                                {postCategories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tóm tắt</label>
                                        <textarea rows={4} className="w-full px-6 py-4 bg-stone-100 rounded-2xl border border-stone-100 outline-none resize-none" value={postFormData.excerpt} onChange={e => setPostFormData({ ...postFormData, excerpt: e.target.value })} />
                                    </div>
                                    <div className="h-[60vh] flex flex-col col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Nội dung chi tiết</label>
                                        <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-stone-100 flex flex-col">
                                            <ReactQuill
                                                theme="snow"
                                                value={postFormData.content || ''}
                                                onChange={(content) => setPostFormData({ ...postFormData, content })}
                                                className="h-full flex flex-col [&_.ql-container]:flex-1 [&_.ql-container]:overflow-hidden [&_.ql-editor]:h-full [&_.ql-editor]:overflow-y-auto [&_.ql-toolbar]:border-stone-100 [&_.ql-container]:border-stone-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Hình ảnh bài viết</label>
                                        <div className="space-y-4">
                                            <FileHandler
                                                objectId={postFormData.id!}
                                                objectType="post"
                                                allowUpload={true}
                                                allowDelete={true}
                                                onUploadSuccess={(data) => setPostFormData(prev => ({ ...prev, image: data.url || data.path }))}
                                                refreshTrigger={postFormData.image}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="col-span-full py-5 bg-floral-deep text-white rounded-2xl font-bold uppercase shadow-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-3">
                                    <Save size={20} /> LƯU BÀI VIẾT
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
