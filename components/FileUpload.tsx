
import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENDPOINTS } from '../constants';

interface FileUploadProps {
    objectId: string | number;
    objectType: 'product' | 'post' | 'user' | 'review';
    onUploadSuccess?: (fileData: any) => void;
    onUploadError?: (error: string) => void;
    maxSizeMB?: number;
    accept?: string;
    multiple?: boolean;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    objectId,
    objectType,
    onUploadSuccess,
    onUploadError,
    maxSizeMB = 5,
    accept = "image/*",
    multiple = false
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            processFiles(files);
        }
    };

    const processFiles = (files: File[]) => {
        const validFiles = files.filter(file => {
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
                const errorMsg = `File ${file.name} quá lớn (tối đa ${maxSizeMB}MB)`;
                onUploadError?.(errorMsg);
                return false;
            }
            return true;
        });

        if (!multiple && uploadingFiles.length > 0) {
            // Nếu không cho phép nhiều file, chỉ giữ lại file cuối cùng được chọn
            const singleFile = validFiles[validFiles.length - 1];
            if (singleFile) {
                uploadFile(singleFile);
            }
        } else {
            validFiles.forEach(file => uploadFile(file));
        }
    };

    const uploadFile = async (file: File) => {
        const tempId = Math.random().toString(36).substring(2, 9);
        const newUploadingFile: UploadingFile = {
            id: tempId,
            file,
            progress: 0,
            status: 'uploading'
        };

        setUploadingFiles(prev => multiple ? [...prev, newUploadingFile] : [newUploadingFile]);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('objectId', objectId.toString());
        formData.append('objectType', objectType);

        try {
            // Vì chúng ta không có API thực tế với progress callback ở đây (demo fetch), 
            // chúng ta sẽ giả lập tiến trình
            const response = await fetch(ENDPOINTS.FILES.UPLOAD, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('chinchin_token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setUploadingFiles(prev =>
                    prev.map(f => f.id === tempId ? { ...f, status: 'completed', progress: 100 } : f)
                );
                onUploadSuccess?.(data);

                // Tự động xóa khỏi danh sách sau 3 giây nếu thành công
                setTimeout(() => {
                    setUploadingFiles(prev => prev.filter(f => f.id !== tempId));
                }, 3000);
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            setUploadingFiles(prev =>
                prev.map(f => f.id === tempId ? { ...f, status: 'error', error: 'Lỗi tải lên' } : f)
            );
            onUploadError?.('Không thể tải tệp lên máy chủ');
        }
    };

    const removeFile = (id: string) => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="w-full space-y-4">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4
          ${isDragging
                        ? 'border-floral-rose bg-floral-rose/5 scale-[1.02]'
                        : 'border-stone-200 hover:border-floral-rose/50 hover:bg-stone-100'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                />

                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
          ${isDragging ? 'bg-floral-rose text-white' : 'bg-stone-100 text-stone-400 group-hover:bg-floral-rose/10 group-hover:text-floral-rose'}`}>
                    <Upload size={32} className={isDragging ? 'animate-bounce' : ''} />
                </div>

                <div className="text-center">
                    <p className="font-serif text-xl text-floral-deep">Kéo thả hoặc nhấn để tải ảnh</p>
                    <p className="text-sm text-stone-400 mt-1">Hỗ trợ JPG, PNG (Tối đa {maxSizeMB}MB)</p>
                </div>

                <motion.div
                    initial={false}
                    animate={{ opacity: isDragging ? 1 : 0 }}
                    className="absolute inset-0 bg-floral-rose/5 pointer-events-none rounded-[2rem]"
                />
            </div>

            {/* Progress List */}
            <AnimatePresence>
                {uploadingFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="space-y-2"
                    >
                        {uploadingFiles.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white border border-stone-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-500' :
                                        item.status === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {item.status === 'uploading' && <Loader2 size={20} className="animate-spin" />}
                                    {item.status === 'completed' && <CheckCircle2 size={20} />}
                                    {item.status === 'error' && <AlertCircle size={20} />}
                                </div>

                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm font-medium text-floral-deep truncate">{item.file.name}</p>
                                        <span className="text-[10px] font-bold text-stone-400">
                                            {item.status === 'uploading' ? `${Math.round(item.progress)}%` : item.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: item.status === 'completed' ? '100%' : `${item.progress}%` }}
                                            className={`h-full rounded-full transition-all duration-300
                        ${item.status === 'completed' ? 'bg-emerald-500' :
                                                    item.status === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeFile(item.id)}
                                    className="p-2 text-stone-300 hover:text-rose-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
