import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { ToastContainer, ToastMessage } from './Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Listen for legacy custom events to bridge the gap during refactor
    useEffect(() => {
        const handleGlobalToast = (e: any) => {
            // Use CustomEvent detail if available, otherwise check generic event properties
            const { message, type } = e.detail || {};
            if (message) {
                addToast(message, type || 'info');
            }
        };

        window.addEventListener('chinchin-toast', handleGlobalToast);
        return () => {
            window.removeEventListener('chinchin-toast', handleGlobalToast);
        };
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
