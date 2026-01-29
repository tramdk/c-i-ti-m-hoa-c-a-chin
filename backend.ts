
import { ENDPOINTS, STORAGE_KEYS } from './constants';
import { Product, Category, Post, PostCategory } from './types';

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
}

// Variables cho Refresh Token logic
let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void, reject: (err: unknown) => void }> = [];

// Helper: Phát sự kiện Toast hệ thống
export const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    window.dispatchEvent(new CustomEvent('chinchin-toast', {
        detail: { message, type }
    }));
};

// Helper: Xử lý refresh token
const handleRefreshToken = async (): Promise<string | null> => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const oldToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!refreshToken) {
        isRefreshing = false;
        return null;
    }

    try {
        const response = await fetch(ENDPOINTS.AUTH.REFRESH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: oldToken, refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            const newToken = data.token || data.accessToken;
            const newRefreshToken = data.refreshToken;

            localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
            if (newRefreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            refreshQueue.forEach(req => req.resolve(newToken));
            refreshQueue = [];
            return newToken;
        } else {
            throw new Error("Refresh failed");
        }
    } catch (err) {
        refreshQueue.forEach(req => req.reject(err));
        refreshQueue = [];
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.dispatchEvent(new Event('chinchin-require-auth'));
        return null;
    } finally {
        isRefreshing = false;
    }
};

// Helper: Xử lý phản hồi an toàn
const handleResponse = async (response: Response, originalRequest?: () => Promise<unknown>): Promise<unknown> => {
    if (response.status === 401 && originalRequest) {
        const newToken = await handleRefreshToken();
        if (newToken) {
            return originalRequest(); // Thử lại yêu cầu ban đầu
        }
        triggerToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "info");
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Lỗi hệ thống (${response.status})`;
        // Chỉ trigger toast nếu không phải lỗi 401 đã xử lý ở trên
        if (response.status !== 401) triggerToast(errorMsg, "error");
        throw new Error(errorMsg);
    }

    if (response.status === 204) return true;
    return response.json().catch(() => ({}));
};

const fetchWithAuth = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
    const makeRequest = async () => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        return handleResponse(response, makeRequest) as Promise<T>;
    };

    return await makeRequest();
};

// Raw fetch wrapper for non-auth requests but still using handleResponse
const safeFetch = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    } as RequestInit);
    return handleResponse(response) as Promise<T>;
};

const extractList = <T>(data: any): T[] => {
    if (Array.isArray(data)) return data;
    return data.items || data.payload || data.data || [];
};

export const api = {
    products: {
        getAll: () => safeFetch<any>(ENDPOINTS.PRODUCTS.BASE).then(data => extractList<Product>(data)).catch(e => { throw e; }),
        getOne: (id: string | number) => safeFetch<Product>(ENDPOINTS.PRODUCTS.DETAIL(id)),
        create: (data: Partial<Product>) => fetchWithAuth<Product>(ENDPOINTS.PRODUCTS.BASE, { method: 'POST', body: data }),
        update: (id: string | number, data: Partial<Product>) => fetchWithAuth<Product>(ENDPOINTS.PRODUCTS.DETAIL(id), { method: 'PUT', body: data }),
        delete: (id: string | number) => fetchWithAuth<void>(ENDPOINTS.PRODUCTS.DETAIL(id), { method: 'DELETE' }),
    },
    productCategories: {
        getAll: () => safeFetch<any>(ENDPOINTS.PRODUCT_CATEGORIES.BASE).then(data => extractList<Category>(data)),
        create: (data: Partial<Category>) => fetchWithAuth<Category>(ENDPOINTS.PRODUCT_CATEGORIES.BASE, { method: 'POST', body: data }),
        update: (id: string | number, data: Partial<Category>) => fetchWithAuth<Category>(ENDPOINTS.PRODUCT_CATEGORIES.DETAIL(id), { method: 'PUT', body: data }),
        delete: (id: string | number) => fetchWithAuth<void>(ENDPOINTS.PRODUCT_CATEGORIES.DETAIL(id), { method: 'DELETE' }),
    },
    postCategories: {
        getAll: () => safeFetch<any>(ENDPOINTS.POST_CATEGORIES.BASE).then(data => extractList<PostCategory>(data)),
        create: (data: Partial<PostCategory>) => fetchWithAuth<PostCategory>(ENDPOINTS.POST_CATEGORIES.BASE, { method: 'POST', body: data }),
        update: (id: string | number, data: Partial<PostCategory>) => fetchWithAuth<PostCategory>(ENDPOINTS.POST_CATEGORIES.DETAIL(id), { method: 'PUT', body: data }),
        delete: (id: string | number) => fetchWithAuth<void>(ENDPOINTS.POST_CATEGORIES.DETAIL(id), { method: 'DELETE' }),
    },
    blog: {
        getAll: () => safeFetch<any>(ENDPOINTS.POSTS.BASE).then(data => extractList<Post>(data)),
        getOne: (id: string | number) => safeFetch<Post>(ENDPOINTS.POSTS.DETAIL(id)),
        create: (data: Partial<Post>) => fetchWithAuth<Post>(ENDPOINTS.POSTS.BASE, { method: 'POST', body: data }),
        update: (id: string | number, data: Partial<Post>) => fetchWithAuth<Post>(ENDPOINTS.POSTS.DETAIL(id), { method: 'PUT', body: data }),
        delete: (id: string | number) => fetchWithAuth<void>(ENDPOINTS.POSTS.DETAIL(id), { method: 'DELETE' }),
        rate: (id: string | number, rating: number) => fetchWithAuth<void>(ENDPOINTS.POSTS.RATE(id), { method: 'POST', body: { rating } }),
    },
    cart: {
        get: () => fetchWithAuth<any>(ENDPOINTS.CART.BASE),
        add: (productId: any, quantity: number = 1) => fetchWithAuth<any>(ENDPOINTS.CART.ADD, { method: 'POST', body: { productId, quantity } }),
        remove: (productId: string | number) => fetchWithAuth<any>(ENDPOINTS.CART.REMOVE(productId), { method: 'DELETE' }),
    }
};

export default api;
