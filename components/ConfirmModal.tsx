import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    type = 'danger'
}) => {
    const getColorScheme = () => {
        switch (type) {
            case 'danger': return 'bg-red-50 text-red-500 border-red-100';
            case 'warning': return 'bg-amber-50 text-amber-500 border-amber-100';
            default: return 'bg-floral-rose/10 text-floral-rose border-floral-rose/10';
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-200';
            case 'warning': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
            default: return 'bg-floral-rose hover:bg-floral-deep shadow-floral-rose/20';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-floral-deep/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl"
                    >
                        <button
                            onClick={onCancel}
                            className="absolute top-6 right-6 p-2 text-stone-300 hover:text-stone-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6 border ${getColorScheme()}`}>
                            <AlertCircle size={32} />
                        </div>

                        <h3 className="font-serif text-xl md:text-2xl text-floral-deep mb-4 uppercase tracking-tight">
                            {title}
                        </h3>
                        <p className="text-stone-500 mb-8 md:mb-10 leading-relaxed text-sm">
                            {message}
                        </p>

                        <div className="flex flex-col gap-3">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    onConfirm();
                                }}
                                className={`w-full py-4 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg transition-all text-xs md:text-sm ${getButtonClass()}`}
                            >
                                {confirmText}
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onCancel}
                                className="w-full py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px] md:text-xs hover:text-floral-rose transition-colors"
                            >
                                {cancelText}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
