import React, { useState, useEffect } from 'react';
import { Package, Layers, MessageSquare, RefreshCcw } from 'lucide-react';
import { api } from '../backend';
import { Product, Category, Post, PostCategory } from '../types';
import { ProductManager } from './Admin/components/ProductManager';
import { CategoryManager } from './Admin/components/CategoryManager';
import { PostManager } from './Admin/components/PostManager';

const INITIAL_DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Giỏ Hoa Sunset Bloom",
    category: 'hoa',
    price: 1250000,
    image: "https://images.pexels.com/photos/1122621/pexels-photo-1122621.jpeg",
    description: "Mô tả hoa hoàng hôn rạng rỡ."
  },
  {
    id: 2,
    name: "Lãng Trái Cây Nhập Khẩu",
    category: 'trai-cay',
    price: 2100000,
    image: "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg",
    description: "Trái cây nhập khẩu tươi ngon."
  }
];

const INITIAL_DEFAULT_CATEGORIES: Category[] = [
  { id: 'hoa', name: 'Hoa Tươi Nghệ Thuật', description: 'Những đóa hoa tươi thắm được tuyển chọn trong ngày.' },
  { id: 'trai-cay', name: 'Trái Cây Nhập Khẩu', description: 'Trái cây cao cấp nhập khẩu từ Úc, Mỹ, Nhật Bản.' },
  { id: 'combo', name: 'Combo Quà Tặng', description: 'Sự kết hợp hoàn hảo giữa hoa và quà tặng tinh tế.' },
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'posts'>('products');
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]);

  // Load Initial Data
  useEffect(() => {
    loadLocalData();
    fetchRemoteData();
  }, []);

  const loadLocalData = () => {
    const localProds = localStorage.getItem('chinchin_products');
    const localCats = localStorage.getItem('chinchin_categories');
    const localPosts = localStorage.getItem('chinchin_posts');

    if (localProds) setProducts(JSON.parse(localProds));
    else setProducts(INITIAL_DEFAULT_PRODUCTS);

    if (localCats) setCategories(JSON.parse(localCats));
    else setCategories(INITIAL_DEFAULT_CATEGORIES);

    if (localPosts) setPosts(JSON.parse(localPosts));
  };

  const fetchRemoteData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData, postsData, postCatsData] = await Promise.allSettled([
        api.products.getAll(),
        api.productCategories.getAll(),
        api.blog.getAll(),
        api.postCategories.getAll()
      ]);

      if (prodsData.status === 'fulfilled') {
        const data = prodsData.value;
        setProducts(data);
        localStorage.setItem('chinchin_products', JSON.stringify(data));
      }

      if (catsData.status === 'fulfilled') {
        const data = catsData.value;
        setCategories(data);
        localStorage.setItem('chinchin_categories', JSON.stringify(data));
      }

      if (postsData.status === 'fulfilled') {
        const data = postsData.value;
        const mappedPosts = data;
        const formattedPosts = mappedPosts.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: "",
          content: "",
          category: p.categoryId || "blog",
          categoryId: p.categoryId,
          author: p.authorName || "ChinChin Team",
          date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          image: "https://images.unsplash.com/photo-1591886861324-42861e6992d1?auto=format&fit=crop&q=80"
        }));
        setPosts(formattedPosts);
        localStorage.setItem('chinchin_posts', JSON.stringify(formattedPosts));
      }

      if (postCatsData.status === 'fulfilled') {
        setPostCategories(postCatsData.value);
      }
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn("Backend API sync failed. Using local storage.");
      loadLocalData();
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => api.products.getAll().then(data => {
    setProducts(data);
    localStorage.setItem('chinchin_products', JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  });

  const refreshCategories = () => api.productCategories.getAll().then(data => {
    setCategories(data);
    localStorage.setItem('chinchin_categories', JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  });

  const refreshPosts = () => api.blog.getAll().then(data => {
    const mappedPosts = data;
    const formattedPosts = mappedPosts.map((p: any) => ({
      id: p.id,
      title: p.title,
      excerpt: p.content || p.title,
      content: p.content || "",
      category: p.categoryId || "blog",
      categoryId: p.categoryId,
      author: p.authorName || "Admin",
      date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      image: p.image || "https://images.unsplash.com/photo-1591886861324-42861e6992d1?auto=format&fit=crop&q=80"
    }));
    setPosts(formattedPosts);
    localStorage.setItem('chinchin_posts', JSON.stringify(formattedPosts));
    window.dispatchEvent(new Event('storage'));
  });

  return (
    <div className="container mx-auto px-6 pb-20 min-h-screen pt-32">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100 sticky top-32">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all ${activeTab === 'products' ? 'bg-floral-rose text-white shadow-lg shadow-floral-rose/20' : 'text-stone-400 hover:bg-stone-100'}`}
              >
                <div className="flex items-center gap-4">
                  <Package size={20} />
                  <span>Sản phẩm</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  {products.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all ${activeTab === 'categories' ? 'bg-floral-rose text-white shadow-lg shadow-floral-rose/20' : 'text-stone-400 hover:bg-stone-100'}`}
              >
                <div className="flex items-center gap-4">
                  <Layers size={20} />
                  <span>Danh mục</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  {categories.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all ${activeTab === 'posts' ? 'bg-floral-rose text-white shadow-lg shadow-floral-rose/20' : 'text-stone-400 hover:bg-stone-100'}`}
              >
                <div className="flex items-center gap-4">
                  <MessageSquare size={20} />
                  <span>Bài viết</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'posts' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  {posts.length}
                </span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <header className="sticky top-[100px] z-40 bg-floral-petal/95 backdrop-blur-md -mx-6 px-6 py-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300 rounded-b-3xl">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="font-serif text-5xl text-floral-deep">Quản trị Hệ thống</h1>
                <button onClick={fetchRemoteData} className={`p-2 text-stone-300 hover:text-floral-rose ${loading ? 'animate-spin' : ''}`}>
                  <RefreshCcw size={20} />
                </button>
              </div>
              <p className="text-stone-400">Quản lý kho hàng và danh mục của bạn</p>
            </div>
            {/* The "Add New" button was moved inside individual managers for better context */}
          </header>

          {activeTab === 'products' ? (
            <ProductManager
              products={products}
              categories={categories}
              onRefresh={refreshProducts}
            />
          ) : activeTab === 'categories' ? (
            <CategoryManager
              categories={categories}
              products={products}
              onRefresh={refreshCategories}
            />
          ) : (
            <PostManager
              posts={posts}
              postCategories={postCategories}
              onRefresh={refreshPosts}
            />
          )}
        </main>
      </div>
    </div>
  );
};
