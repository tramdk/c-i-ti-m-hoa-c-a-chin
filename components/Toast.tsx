
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastProps {
    toasts: ToastMessage[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-24 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <XCircle className="text-rose-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
    };

    const styles = {
        success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
        error: 'bg-rose-50 border-rose-100 text-rose-800',
        info: 'bg-blue-50 border-blue-100 text-blue-800',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg border backdrop-blur-sm min-w-[300px] ${styles[toast.type]}`}
        >
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <div className="flex-grow font-medium text-sm">{toast.message}</div>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};
