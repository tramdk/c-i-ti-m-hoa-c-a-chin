export interface Product {
    id: string | number;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
    badge?: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
}

export interface Post {
    id: string | number;
    title: string;
    excerpt: string;
    content?: string;
    category: string;
    categoryId?: string;
    author: string;
    date: string;
    image: string;
    readTime?: string;
    rating?: number;
    viewCount?: number;
    commentCount?: number;
}

export interface PostCategory {
    id: string;
    name: string;
}

export interface UserProfile {
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
}
