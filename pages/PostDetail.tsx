
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Bookmark, Heart, MessageSquare, Star, Loader2 } from 'lucide-react';
import { MOCK_POSTS } from './Posts';
import { ENDPOINTS, STORAGE_KEYS } from '../constants';
import { api } from '../backend';

import { Post } from '../types';

interface PostDetailProps {
    postId: string | number;
    onBack: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ postId, onBack }) => {
    const [post, setPost] = useState<Post | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostDetail = async () => {
            setLoading(true);
            try {
                // Fetch categories for name mapping if needed
                const cats = await api.postCategories.getAll();
                const categoryList = Array.isArray(cats) ? cats : [];

                const data = await api.blog.getOne(postId);
                if (data) {
                    const cat = categoryList.find((c: any) => c.id === data.categoryId);
                    const mappedPost: Post = {
                        id: data.id,
                        title: data.title,
                        excerpt: "", // DetailDto does not have excerpt
                        content: data.content || "",
                        category: cat ? cat.name : String(data.categoryId || 'blog'),
                        categoryId: data.categoryId,
                        author: data.authorName || "ChinChin Team",
                        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                        image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80",
                        readTime: "5 phút đọc",
                        rating: Math.round(data.averageRating || 0)
                    };
                    setPost(mappedPost);

                    // Fetch related posts
                    const allPostsData = await api.blog.getAll();
                    const allPosts = allPostsData;
                    const related = allPosts
                        .filter((p: any) => p.categoryId === data.categoryId && String(p.id) !== String(postId))
                        .slice(0, 3)
                        .map((p: any) => ({
                            id: p.id,
                            title: p.title,
                            excerpt: p.title,
                            content: p.content || "",
                            category: cat ? cat.name : (p.categoryId || 'blog'),
                            author: "ChinChin Team",
                            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "23 Jan",
                            image: "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80",
                            readTime: "5 min"
                        }));
                    setRelatedPosts(related);
                } else {
                    throw new Error("Post not found");
                }
            } catch (error) {
                console.warn("API Detail failed, falling back to local.");
                const localPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
                const posts: Post[] = localPosts ? JSON.parse(localPosts) : [];
                const foundPost = posts.find(p => String(p.id) === String(postId)) || MOCK_POSTS.find(p => String(p.id) === String(postId));
                setPost(foundPost || null);
            } finally {
                setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        fetchPostDetail();
    }, [postId]);

    if (loading) {
        return (
            <div className="min-h-[100vh] flex flex-col items-center justify-center text-center px-6">
                <Loader2 className="text-floral-rose animate-spin mb-6" size={48} />
                <h2 className="font-serif text-3xl text-floral-deep mb-4 italic">Đang mở trang sách...</h2>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                    <Clock className="text-stone-300 animate-pulse" size={32} />
                </div>
                <h2 className="font-serif text-3xl text-floral-deep mb-4">Đang tìm bài viết...</h2>
                <button onClick={onBack} className="text-floral-rose font-bold flex items-center gap-2 hover:underline">
                    <ArrowLeft size={18} /> Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Header */}
            <header className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={post.image}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-floral-deep via-floral-deep/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-24">
                    <div className="max-w-4xl mx-auto px-6 w-full">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={onBack}
                            className="mb-8 flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-all w-fit"
                        >
                            <ArrowLeft size={18} /> Quay lại
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="inline-block px-4 py-1.5 bg-floral-rose text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-full mb-6">
                                {post.category}
                            </span>
                            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-8">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-8 text-white/80 text-xs md:text-sm font-medium tracking-wide">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full border-2 border-floral-rose overflow-hidden bg-white/10">
                                        <User size={20} className="m-auto mt-2 text-white/50" />
                                    </div>
                                    <span>Bởi <strong className="text-white">{post.author}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-floral-rose" />
                                    <span>{post.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-floral-rose" />
                                    <span>{post.readTime}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex flex-col items-center gap-24">
                    {/* Main Article */}
                    <article className="w-full max-w-2xl mx-auto">
                        <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:text-floral-deep prose-headings:text-center prose-p:text-stone-600 prose-p:leading-relaxed prose-p:font-light prose-img:mx-auto prose-img:rounded-3xl prose-img:shadow-lg prose-figure:mx-auto prose-video:mx-auto [&_iframe]:mx-auto [&_table]:mx-auto">
                            <p className="text-xl md:text-2xl text-stone-500 font-serif italic mb-12 border-l-4 border-floral-rose pl-8 py-2 text-left mx-auto max-w-xl">
                                "{post.excerpt}"
                            </p>

                            {/* Giả lập nội dung bài viết nếu content trống */}
                            {!post.content || post.content === "" ? (
                                <div className="space-y-8">
                                    <p>Chào mừng bạn đến với chuyên mục chia sẻ của <strong>Tiệm hoa của ChinChin</strong>. Chúng tôi rất vui được mang đến cho bạn những thông tin hữu ích và những câu chuyện tràn đầy cảm hứng xung quanh thế giới hoa quả nghệ thuật.</p>

                                    <h3 className="text-3xl mt-12 mb-6">Tại sao điều này quan trọng?</h3>
                                    <p>Mỗi bông hoa, mỗi loại trái cây mà chúng tôi lựa chọn đều mang trong mình một sứ mệnh riêng - không chỉ là vẻ đẹp bên ngoài mà còn là những giá trị tinh thần sâu sắc mà bạn muốn gửi gắm đến người nhận. Trong bài viết này, chúng tôi muốn đi sâu vào những khía cạnh mà có thể bạn chưa từng biết đến.</p>

                                    <div className="my-12 aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
                                        <img src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Floral decor" />
                                    </div>

                                    <p>Chúng tôi luôn nỗ lực để mỗi sản phẩm tạo ra là một tác phẩm nghệ thuật độc bản. Từ khâu tuyển chọn nguyên liệu tươi mới mỗi ngày từ các nhà vườn uy tín, đến khâu thiết kế tỉ mỉ bởi đôi bàn tay khéo léo của các nghệ nhân, mọi thứ đều được thực hiện với tình yêu và sự trân trọng tuyệt đối.</p>

                                    <blockquote className="bg-floral-petal p-10 rounded-[2.5rem] border-l-8 border-floral-rose my-12 text-center">
                                        <p className="text-2xl font-serif text-floral-deep m-0">"Nghệ thuật không nằm ở sự phô trương, mà nằm ở những chi tiết nhỏ bé được thực hiện với sự tận tâm lớn lao."</p>
                                        <footer className="mt-4 font-bold text-floral-rose uppercase tracking-widest text-xs">— ChinChin Philosophy</footer>
                                    </blockquote>

                                    <p>Hy vọng rằng sau bài viết này, bạn sẽ có thêm những góc nhìn mới về cách lựa chọn và thưởng thức hoa quả nghệ thuật. Hãy tiếp tục theo dõi chúng tôi để cập nhật thêm những bí quyết và bộ sưu tập mới nhất nhé!</p>

                                    {post.category === 'feedback' && post.rating && (
                                        <div className="mt-16 p-10 bg-white shadow-2xl rounded-[3rem] border border-stone-100 flex flex-col items-center text-center">
                                            <div className="flex gap-1 text-floral-gold mb-4">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={24} fill={i < post.rating ? "currentColor" : "none"} />)}
                                            </div>
                                            <h4 className="font-serif text-2xl mb-2 text-floral-deep">Đánh giá từ khách hàng</h4>
                                            <p className="text-stone-400 text-sm">Cảm ơn bạn đã tin tưởng dịch vụ của ChinChin ✨</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full [&>*]:mx-auto" dangerouslySetInnerHTML={{ __html: post.content }} />
                            )}
                        </div>

                        {/* Post Interaction */}
                        <div className="mt-20 pt-10 border-t border-stone-100 flex flex-wrap justify-between items-center gap-8">
                            <div className="flex items-center gap-6">
                                <button className="flex items-center gap-2 text-stone-400 hover:text-floral-rose transition-colors">
                                    <Heart size={20} /> <span className="text-sm font-bold">124</span>
                                </button>
                                <button className="flex items-center gap-2 text-stone-400 hover:text-floral-rose transition-colors">
                                    <MessageSquare size={20} /> <span className="text-sm font-bold">18</span>
                                </button>
                                <button className="flex items-center gap-2 text-stone-400 hover:text-floral-rose transition-colors">
                                    <Share2 size={20} /> <span className="text-sm font-bold">Chia sẻ</span>
                                </button>
                            </div>
                            <div className="flex gap-4">
                                <button className="p-3 bg-stone-50 rounded-full text-stone-400 hover:bg-floral-rose hover:text-white transition-all"><Bookmark size={20} /></button>
                            </div>
                        </div>
                    </article>

                    {/* Related Content - Now at Bottom */}
                    <aside className="w-full border-t border-stone-100 pt-20">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                            <div>
                                <span className="text-floral-rose text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">Khám phá thêm</span>
                                <h4 className="font-serif text-3xl text-floral-deep italic">Bài viết cùng chủ đề</h4>
                            </div>
                            <button onClick={() => onBack()} className="text-stone-400 hover:text-floral-rose font-bold text-xs uppercase tracking-widest transition-colors">Xem tất cả</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.length > 0 ? relatedPosts.map((relatedPost) => (
                                <div
                                    key={relatedPost.id}
                                    className="group cursor-pointer flex flex-col gap-4"
                                    onClick={() => {
                                        window.location.href = `/posts/${relatedPost.id}`;
                                    }}
                                >
                                    <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-stone-100 mb-2">
                                        <img src={relatedPost.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={relatedPost.title} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2 text-[10px] font-bold tracking-widest uppercase text-stone-400">
                                            <span>{relatedPost.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                            <span className="text-floral-rose">{relatedPost.category}</span>
                                        </div>
                                        <h5 className="font-serif text-xl text-floral-deep leading-snug group-hover:text-floral-rose transition-colors">{relatedPost.title}</h5>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-3 text-center py-10 text-stone-400 italic">Không có bài viết liên quan nào.</div>
                            )}

                            {/* Newsletter Box as one grid item or separate? Let's make it a wide banner below or just remove to keep it clean. Let's keep it as a box if space permits, or remove. I'll remove the newsletter box from here to keep the related section clean, as it's less relevant in a 'read next' flow than the articles themselves. */}
                        </div>
                    </aside>
                </div>
            </main>

            {/* Footer Navigation */}
            <section className="bg-stone-50 py-24 border-t border-stone-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="text-stone-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-8 block">Tiếp theo trong Blog</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-floral-deep mb-12">Cách chọn bình hoa phù hợp với mọi không gian nội thất</h2>
                    <button onClick={onBack} className="px-12 py-5 border border-floral-deep text-floral-deep rounded-full font-bold text-xs tracking-widest uppercase hover:bg-floral-deep hover:text-white transition-all shadow-xl shadow-stone-200">
                        Quay lại danh sách
                    </button>
                </div>
            </section>
        </div>
    );
};
