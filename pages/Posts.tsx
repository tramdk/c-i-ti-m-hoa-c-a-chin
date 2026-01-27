
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, User, ArrowRight, MessageSquare, Star, Bookmark, Filter, ChevronRight } from 'lucide-react';
import { ENDPOINTS } from '../constants';
import { api } from '../backend';

import { Post, PostCategory } from '../types';

export const MOCK_POSTS: Post[] = [
    {
        id: 1,
        title: "Nghệ thuật cắm hoa: Bí quyết giữ hoa tươi lâu",
        excerpt: "Làm thế nào để giữ những đóa hoa từ ChinChin rực rỡ suốt tuần lễ? Hãy cùng khám phá những mẹo nhỏ nhưng cực kỳ hiệu quả...",
        content: "",
        category: 'blog',
        author: "Thảo Vy",
        date: "20 Jan 2026",
        image: "https://images.unsplash.com/photo-1591886861324-42861e6992d1?auto=format&fit=crop&q=80",
        readTime: "5 phút đọc"
    },
    {
        id: 2,
        title: "Feedback: Chị Lan Anh - Giỏ hoa kỷ niệm 10 năm",
        excerpt: "Cảm ơn ChinChin đã giúp vợ chồng mình có một ngày kỷ niệm thật ý nghĩa. Giỏ hoa thực sự đẹp hơn cả mong đợi...",
        content: "",
        category: 'feedback',
        author: "Lan Anh",
        date: "18 Jan 2026",
        image: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80",
        readTime: "2 phút đọc",
        rating: 5
    },
    {
        id: 3,
        title: "Giới thiệu bộ sưu tập 'Nắng Ban Mai'",
        excerpt: "Lấy cảm hứng từ ánh bình minh rạng rỡ, bộ sưu tập mang đến cảm giác ấm áp, hy vọng và khởi đầu mới...",
        content: "",
        category: 'intro',
        author: "ChinChin Team",
        date: "15 Jan 2026",
        image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80",
        readTime: "4 phút đọc"
    },
    {
        id: 4,
        title: "Ý nghĩa của các loài hoa trong tình yêu",
        excerpt: "Mỗi loài hoa mang một ngôn ngữ riêng. Tại sao hoa hồng đỏ là vĩnh cửu, còn hoa tulip lại là sự chân thành?...",
        content: "",
        category: 'blog',
        author: "Minh Tuấn",
        date: "12 Jan 2026",
        image: "https://images.unsplash.com/photo-1522673607200-164883eecd4c?auto=format&fit=crop&q=80",
        readTime: "6 phút đọc"
    },
    {
        id: 5,
        title: "Feedback: Anh Hoàng - Món quà bất ngờ cho mẹ",
        excerpt: "Dịch vụ giao hoa ẩn danh của tiệm rất tuyệt vời. Mẹ mình đã rất xúc động và ngạc nhiên...",
        content: "",
        category: 'feedback',
        author: "Quốc Hoàng",
        date: "10 Jan 2026",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80",
        readTime: "3 phút đọc",
        rating: 5
    }
];

const DEFAULT_CATEGORIES = [
    { id: 'all', name: 'Tất cả' },
    { id: 'blog', name: 'Blog' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'intro', name: 'Giới thiệu' }
];

interface PostsProps {
    onSelectPost: (id: string | number) => void;
}

export const Posts: React.FC<PostsProps> = ({ onSelectPost }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [apiPosts, setApiPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<PostCategory[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch categories
                const catData = await api.postCategories.getAll();
                const fetchedCategories = Array.isArray(catData) ? catData : [];
                setCategories(fetchedCategories);

                // Fetch posts
                const postData = await api.blog.getAll();
                // PostDto: (Guid Id, string Title, string AuthorName, double AverageRating, DateTime CreatedAt, string? CategoryId)
                const posts = Array.isArray(postData) ? postData : (postData.items || []);

                if (posts.length > 0) {
                    const mappedPosts: Post[] = posts.map((p: any) => {
                        const cat = fetchedCategories.find((c: any) => c.id === p.categoryId);
                        return {
                            id: p.id,
                            title: p.title,
                            excerpt: "", // PostDto has no excerpt/content
                            content: "", // PostDto has no content
                            category: cat ? cat.name : (p.categoryId || 'blog'),
                            categoryId: p.categoryId,
                            author: p.authorName || "ChinChin Team",
                            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "23 Jan 2026",
                            image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80", // Placeholder
                            readTime: "5 phút đọc",
                            rating: Math.round(p.averageRating || 0)
                        };
                    });
                    setApiPosts(mappedPosts);
                } else {
                    setApiPosts(MOCK_POSTS);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setApiPosts(MOCK_POSTS);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const displayCategories = categories.length > 0
        ? [{ id: 'all', name: 'Tất cả' }, ...categories]
        : DEFAULT_CATEGORIES;

    const filteredPosts = apiPosts.length > 0 ? apiPosts.filter(post => {
        const matchesFilter = filter === 'all' || post.category === filter || post.categoryId === filter;
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    }) : [];

    return (
        <div className="max-w-7xl mx-auto px-6">
            {/* Header Section */}
            <section className="pt-20 pb-16 text-center">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block mb-4 px-4 py-1.5 bg-floral-rose/10 text-floral-rose text-[10px] font-bold tracking-[0.2em] uppercase rounded-full"
                >
                    Khám phá câu chuyện
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-5xl md:text-7xl text-floral-deep mb-8"
                >
                    Góc Nhỏ <span className="italic text-floral-rose font-normal">Sẻ Chia</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-2xl mx-auto text-stone-500 text-lg md:text-xl font-light leading-relaxed"
                >
                    Nơi lưu giữ những kỷ niệm, cảm nhận của khách hàng và những kiến thức thú vị về thế giới hoa quả nghệ thuật.
                </motion.p>
            </section>

            {/* Controls Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
                <div className="flex bg-white rounded-full p-1.5 shadow-sm border border-stone-100 overflow-x-auto max-w-full no-scrollbar">
                    {displayCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-6 md:px-8 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap ${filter === cat.id ? 'bg-floral-rose text-white shadow-lg shadow-floral-rose/20' : 'text-stone-400 hover:text-floral-rose'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-floral-rose transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-stone-100 rounded-full focus:outline-none focus:ring-2 focus:ring-floral-rose/10 focus:border-floral-rose/30 transition-all text-sm shadow-sm"
                    />
                </div>
            </div>

            {/* Posts Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-floral-rose/30 border-t-floral-rose rounded-full animate-spin mb-4" />
                        <p className="text-stone-400 font-medium italic">Đang tải câu chuyện...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
                        <AnimatePresence mode='popLayout'>
                            {filteredPosts.map((post, index) => (
                                <motion.article
                                    layout
                                    key={post.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col cursor-pointer"
                                    onClick={() => onSelectPost(post.id)}
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        <img
                                            src={post.image || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80"}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <span className="px-5 py-2 bg-white/90 backdrop-blur-md text-floral-deep text-[9px] font-bold tracking-widest uppercase rounded-full shadow-lg">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-10 flex flex-col flex-1">
                                        <div className="flex items-center gap-4 text-[10px] text-stone-400 font-bold tracking-widest uppercase mb-6">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {post.date || "23 Jan 2026"}
                                            </div>
                                            <div className="w-1 h-1 bg-stone-200 rounded-full" />
                                            <div className="flex items-center gap-1.5">
                                                <User size={12} />
                                                {post.author || "ChinChin Team"}
                                            </div>
                                        </div>

                                        <h2 className="font-serif text-2xl text-floral-deep mb-4 group-hover:text-floral-rose transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>

                                        <p className="text-stone-500 font-light leading-relaxed mb-8 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="mt-auto pt-8 border-t border-stone-50 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                {post.category === 'feedback' && post.rating && (
                                                    <div className="flex text-floral-gold">
                                                        {[...Array(post.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                                    </div>
                                                )}
                                                <span className="text-[10px] text-stone-400 font-medium italic">{post.readTime || "5 phút"}</span>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectPost(post.id);
                                                }}
                                                className="flex items-center gap-2 text-floral-deep hover:text-floral-rose font-bold text-xs tracking-widest uppercase transition-colors group/btn"
                                            >
                                                Đọc tiếp
                                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {filteredPosts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-stone-50 mb-20">
                    <div className="w-20 h-20 bg-floral-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="text-floral-rose" size={32} />
                    </div>
                    <h3 className="font-serif text-3xl text-floral-deep mb-2">Không tìm thấy bài viết</h3>
                    <p className="text-stone-400">Hãy thử tìm kiếm với từ khóa khác nhé.</p>
                    <button
                        onClick={() => { setSearchTerm(''); setFilter('all'); }}
                        className="mt-8 px-10 py-3.5 bg-floral-deep text-white rounded-full font-bold text-xs tracking-widest uppercase hover:bg-stone-800 transition-all"
                    >
                        Xem tất cả bài viết
                    </button>
                </div>
            )}

            {/* Popular Feedback Banner */}
            <section className="mb-24 py-20 px-12 bg-floral-deep rounded-[4rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-floral-rose/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="flex gap-1 text-floral-gold mb-6">
                            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                        </div>
                        <h2 className="font-serif text-4xl mb-8 border-l-4 border-floral-rose pl-8 italic">
                            "Mỗi đơn hàng tại ChinChin không chỉ là mua một sản phẩm, mà là nhận được cả một tấm lòng và sự trân trọng."
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-floral-rose">
                                <img src="https://i.pravatar.cc/150?u=lananh" alt="User" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">Chị Lan Anh</p>
                                <p className="text-stone-400 text-sm">Khách hàng thân thiết</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                            <h4 className="font-bold text-floral-rose text-sm mb-2 uppercase tracking-widest">Feedback mới nhất</h4>
                            <p className="font-light text-stone-300">"Vừa nhận hoa xong, thật sự rất ưng ý. Bạn shipper nhiệt tình và lễ phép vô cùng."</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-xs text-stone-500">— Anh Nam, Quận 1</span>
                                <span className="text-[10px] text-stone-600 bg-white/10 px-3 py-1 rounded-full uppercase">Hôm qua</span>
                            </div>
                        </div>
                        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                            <h4 className="font-bold text-floral-rose text-sm mb-2 uppercase tracking-widest">Chia sẻ trải nghiệm</h4>
                            <p className="font-light text-stone-300">"Rất thích phong cách cắm hoa sáng tạo ở đây. Không đụng hàng và rất có gu."</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-xs text-stone-500">— Chị My, Hà Nội</span>
                                <span className="text-[10px] text-stone-600 bg-white/10 px-3 py-1 rounded-full uppercase">3 ngày trước</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
