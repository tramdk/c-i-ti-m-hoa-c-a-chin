import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { File, Image as ImageIcon, Download, Trash2, Loader2, ExternalLink, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ENDPOINTS } from '../constants';

interface FileViewerProps {
    objectId: string | number;
    objectType: 'product' | 'post' | 'user' | 'review';
    refreshTrigger?: any;
    onDeleteSuccess?: (fileId: string | number) => void;
    className?: string;
    allowDelete?: boolean;
    viewOnly?: boolean;
}

interface FileData {
    id: string;
    fileName: string;
    filePath: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
    viewUrl?: string;
    downloadUrl?: string;
}

export const FileViewer: React.FC<FileViewerProps> = ({
    objectId,
    objectType,
    refreshTrigger,
    onDeleteSuccess,
    className = "",
    allowDelete = false,
    viewOnly = false
}) => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const isImageFile = (file: FileData) => {
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.fileName) ||
            file.contentType?.toLowerCase().includes('image');
    };
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | number | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (selectedImage || confirmDelete) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedImage, confirmDelete]);

    useEffect(() => {
        if (objectId && objectId !== 'new') {
            viewFiles();
        } else {
            setFiles([]);
            setPreviewFile(null);
            setLoading(false);
        }
    }, [objectId, objectType, refreshTrigger]);

    const imageFiles = files.filter(f => isImageFile(f));

    useEffect(() => {
        let timer: any;
        if (viewOnly && imageFiles.length > 1) {
            timer = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % imageFiles.length);
            }, 3000);
        }
        return () => clearInterval(timer);
    }, [viewOnly, imageFiles.length]);



    const viewFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('objectId', objectId.toString());
            const response = await fetch(ENDPOINTS.FILES.METADATA, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('chinchin_token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const fetchedFiles: FileData[] = Array.isArray(data) ? data : (data ? [data] : []);
                setFiles(fetchedFiles);

                // Default preview the first image, if none, take the first file
                const firstImage = fetchedFiles.find(f => isImageFile(f));
                if (firstImage) {
                    setPreviewFile(firstImage);
                } else if (fetchedFiles.length > 0) {
                    setPreviewFile(fetchedFiles[0]);
                } else {
                    setPreviewFile(null);
                }
            } else {
                setFiles([]);
                setPreviewFile(null);
            }
        } catch (err) {
            setError('Không thể tải danh sách tệp');
            setPreviewFile(null);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileId: string | number) => {
        try {
            const response = await fetch(ENDPOINTS.FILES.DELETE(fileId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('chinchin_token')}`
                }
            });

            if (response.ok) {
                setFiles(prev => {
                    const newFiles = prev.filter(f => f.id !== fileId);
                    if (previewFile?.id === fileId) {
                        const nextImage = newFiles.find(f => isImageFile(f));
                        setPreviewFile(nextImage || newFiles[0] || null);
                    }
                    return newFiles;
                });
                onDeleteSuccess?.(fileId);
                showToast('Xóa tệp thành công');
            } else {
                showToast('Không thể xóa tệp', 'error');
            }
        } catch (err) {
            showToast('Lỗi khi xóa tệp', 'error');
            console.error(err);
        } finally {
            setConfirmDelete(null);
        }
    };



    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileUrl = (file: FileData) => file.viewUrl || ENDPOINTS.FILES.VIEW(file.id);
    const getDownloadUrl = (file: FileData) => file.downloadUrl || ENDPOINTS.FILES.DOWNLOAD(file.id);

    if (viewOnly) {
        if (loading && files.length === 0) {
            return (
                <div className={`flex items-center justify-center p-12 ${className}`}>
                    <Loader2 className="animate-spin text-floral-rose" size={32} />
                </div>
            );
        }

        const isSmall = className.includes('w-12') || className.includes('h-12');

        if (imageFiles.length === 0) {
            return (
                <div className={`relative bg-stone-100 border border-stone-100 flex items-center justify-center text-stone-200 ${!className.includes('aspect-') ? 'aspect-video' : ''} ${!className.includes('rounded-') ? 'rounded-[2.5rem]' : ''} ${className}`}>
                    <ImageIcon size={isSmall ? 20 : 48} />
                </div>
            );
        }

        return (
            <div className={`relative group overflow-hidden bg-floral-petal pointer-events-none ${!className.includes('aspect-') ? 'aspect-video' : ''} ${!className.includes('shadow-') ? 'shadow-2xl' : ''} ${!className.includes('rounded-') ? 'rounded-[2.5rem]' : ''} ${className}`}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={imageFiles[currentImageIndex]?.id || 'empty'}
                        src={imageFiles[currentImageIndex] ? getFileUrl(imageFiles[currentImageIndex]) : ''}
                        alt="Product Gallery"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Primary Image Preview Section */}
            <div className="relative aspect-video w-full bg-stone-100 rounded-[2.5rem] border border-stone-100 overflow-hidden flex items-center justify-center group shadow-inner">
                {previewFile ? (
                    isImageFile(previewFile) ? (
                        <>
                            <img
                                src={getFileUrl(previewFile)}
                                alt={previewFile.fileName}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                                onClick={() => setSelectedImage(getFileUrl(previewFile))}
                            />
                            <div className="absolute inset-0 bg-floral-deep/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <ImageIcon className="text-white drop-shadow-lg" size={32} />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-stone-400 p-8 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-2 border border-stone-100">
                                <File size={40} className="text-stone-300" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-stone-600 truncate max-w-xs mx-auto mb-1">
                                    {previewFile.fileName}
                                </p>
                                <p className="text-xs text-stone-400">
                                    {formatSize(previewFile.fileSize)} • {previewFile.contentType}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <a
                                    href={getFileUrl(previewFile)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-floral-rose/10 text-floral-rose rounded-xl text-sm font-medium hover:bg-floral-rose/20 transition-colors"
                                >
                                    <ExternalLink size={16} /> Xem
                                </a>
                                <a
                                    href={getDownloadUrl(previewFile)}
                                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors"
                                >
                                    <Download size={16} /> Tải về
                                </a>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center gap-3 text-stone-300 hidden">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <ImageIcon size={32} />
                        </div>
                        <p className="text-sm font-medium italic">Chưa có tệp nào</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {files.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-100 hidden">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-stone-200">
                            <File size={32} />
                        </div>
                        <p className="text-stone-400 text-sm italic">Chưa có tệp nào khác</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <AnimatePresence>
                            {files.map((file) => (
                                <motion.div
                                    key={file.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group relative bg-white border rounded-2xl p-3 transition-all duration-300
                                      ${previewFile?.id === file.id ? 'border-floral-rose/30 shadow-md ring-1 ring-floral-rose/10' : 'border-stone-100 hover:border-stone-200 hover:shadow-sm'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border transition-all
                                              ${previewFile?.id === file.id ? 'border-floral-rose bg-floral-rose/5' : 'border-stone-100 bg-stone-100 text-stone-400'}`}
                                            onClick={() => setPreviewFile(file)}
                                        >
                                            {isImageFile(file) ? (
                                                <img src={getFileUrl(file)} alt={file.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <File size={20} />
                                            )}
                                        </div>

                                        <div className="flex-grow min-w-0" onClick={() => setPreviewFile(file)}>
                                            <p className={`text-sm font-bold truncate transition-colors ${previewFile?.id === file.id ? 'text-floral-rose' : 'text-floral-deep'}`} title={file.fileName}>
                                                {file.fileName}
                                            </p>
                                            <p className="text-[10px] text-stone-400 font-medium">
                                                {formatSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <a
                                                href={getFileUrl(file)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-stone-300 hover:text-floral-rose hover:bg-stone-100 rounded-lg transition-colors"
                                                title="Xem trực tiếp"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                            <a
                                                href={getDownloadUrl(file)}
                                                className="p-2 text-stone-300 hover:text-emerald-500 hover:bg-stone-100 rounded-lg transition-colors"
                                                title="Tải về"
                                            >
                                                <Download size={14} />
                                            </a>
                                            {allowDelete && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setConfirmDelete(file.id);
                                                    }}
                                                    className="p-2 text-stone-300 hover:text-rose-500 hover:bg-stone-100 rounded-lg transition-colors"
                                                    title="Xóa tệp"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Lightbox, Confirmation, and Toasts rendered via Portals to escape container context */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {/* Image Preview Lightbox */}
                    <AnimatePresence>
                        {selectedImage && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute inset-0 bg-floral-deep/90 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative max-w-5xl max-h-full"
                                >
                                    <img src={selectedImage} alt="Preview" className="rounded-3xl shadow-2xl" />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute -top-4 -right-4 w-10 h-10 bg-white text-floral-deep rounded-full flex items-center justify-center shadow-xl hover:bg-floral-rose hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Delete Confirmation Popup */}
                    <AnimatePresence>
                        {confirmDelete && (
                            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setConfirmDelete(null)}
                                    className="absolute inset-0 bg-floral-deep/40 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-stone-100"
                                >
                                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Trash2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-floral-deep mb-2">Xác nhận xóa?</h3>
                                    <p className="text-sm text-stone-500 mb-8">
                                        Bạn có chắc chắn muốn xóa tệp này? Hành động này không thể hoàn tác.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete(null)}
                                            className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(confirmDelete)}
                                            className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                                        >
                                            Xóa ngay
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Toast Notification */}
                    <AnimatePresence>
                        {toast && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[1200] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border
                                  ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'}`}
                            >
                                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                <span className="text-sm font-bold">{toast.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}
        </div>
    );
};
