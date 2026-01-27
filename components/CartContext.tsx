
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, triggerToast } from '@/backend';

interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface CartContextType {
    cartItems: CartItem[];
    cartTotal: number;
    loading: boolean;
    refreshCart: () => Promise<void>;
    addToCart: (product: any, quantity?: number) => Promise<boolean>;
    removeFromCart: (productId: string | number) => Promise<void>;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshCart = useCallback(async () => {
        const token = localStorage.getItem('chinchin_token');
        if (!token) return;

        setLoading(true);
        try {
            const data = await api.cart.get();
            // Data structure from backend: { userId, items: [{ productId, productName, price, quantity, imageUrl }], totalPrice }
            setCartItems(data.items || []);
        } catch (err) {
            console.error("Failed to fetch cart", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = async (product: any, quantity: number = 1): Promise<boolean> => {
        const token = localStorage.getItem('chinchin_token');
        if (!token) {
            // Will handle prompt in UI
            return false;
        }

        try {
            await api.cart.add(product.id, quantity);
            triggerToast("Đã thêm vào giỏ hàng!", "success");
            await refreshCart();
            return true;
        } catch (err) {
            return false;
        }
    };

    const removeFromCart = async (productId: string | number) => {
        try {
            await api.cart.remove(productId);
            triggerToast("Đã xóa khỏi giỏ hàng", "info");
            await refreshCart();
        } catch (err) { }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    useEffect(() => {
        refreshCart();
        window.addEventListener('chinchin-login-success', () => refreshCart());
        return () => window.removeEventListener('chinchin-login-success', () => refreshCart());
    }, [refreshCart]);

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, cartTotal, loading, refreshCart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
