import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UploadCloud, X, File, Image as ImageIcon, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import styles from './FileUploader.module.css';

// EXIF Stripper stub (would use a library like piexifjs or browser-image-compression in real scenario)
// For now, we just pass the file through as modifying binary data is complex without libs
const stripExif = async (file) => {
    // Determine if image
    if (!file.type.startsWith('image/')) return file;
    // In a real implementation: read ArrayBuffer, remove EXIF segments, recreate Blob/File
    // console.log('Stripping EXIF from', file.name);
    return file;
};

const FileUploader = ({
    variant = 'single', // single, multiple, avatar
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB
    onUpload,
    className
}) => {
    const [files, setFiles] = useState([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef(null);

    // Helpers
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const validateFile = (file) => {
        // Type check (basic)
        // const acceptedTypes = accept.split(',').map(t => t.trim());
        // Simple check for now
        if (!file.type.match(accept.replace('*', '.*'))) {
            return { valid: false, error: 'Invalid file type' };
        }
        if (file.size > maxSize) {
            return { valid: false, error: `File too large (${formatSize(file.size)})` };
        }
        return { valid: true };
    };

    // Handlers
    const handleFiles = async (newFiles) => {
        setUploading(true);
        setProgress(0);

        const validFiles = [];
        const errors = [];

        for (const file of newFiles) {
            const validation = validateFile(file);
            if (validation.valid) {
                const cleanedFile = await stripExif(file);
                // Create preview URL
                const preview = URL.createObjectURL(cleanedFile);
                validFiles.push({
                    file: cleanedFile,
                    preview,
                    id: Date.now() + Math.random(),
                    progress: 0,
                    status: 'pending' // pending, uploading, complete, error
                });
            } else {
                errors.push(`${file.name}: ${validation.error}`);
            }
        }

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        if (validFiles.length > 0) {
            if (variant === 'single' || variant === 'avatar') {
                setFiles([validFiles[0]]);
            } else {
                setFiles(prev => [...prev, ...validFiles]);
            }
            simulateUpload(validFiles);
        } else {
            setUploading(false);
        }
    };

    // Mock Upload Simulation
    const simulateUpload = (currentFiles) => {
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);

            // Update individual file progress if needed
            setFiles(prev => prev.map(f => {
                if (currentFiles.find(cf => cf.id === f.id)) {
                    return { ...f, progress: currentProgress, status: currentProgress >= 100 ? 'complete' : 'uploading' };
                }
                return f;
            }));

            if (currentProgress >= 100) {
                clearInterval(interval);
                setUploading(false);
                if (onUpload) onUpload(currentFiles.map(f => f.file));
            }
        }, 300);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const onPaste = (e) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            handleFiles(Array.from(e.clipboardData.files));
        }
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    // Render Avatar Variant
    if (variant === 'avatar') {
        const hasImage = files.length > 0;
        return (
            <div
                className={`${styles.avatarZone} ${isDragActive ? styles.active : ''} ${className}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={(e) => handleFiles(Array.from(e.target.files))}
                />
                {hasImage ? (
                    <>
                        <img src={files[0].preview} alt="Avatar" className={styles.avatarImage} />
                        <div className={styles.avatarOverlay}>
                            <Camera size={24} />
                        </div>
                    </>
                ) : (
                    <UserIcon />
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-white border-t-accent animate-spin" />
                    </div>
                )}
            </div>
        );
    }

    

    useEffect(() => {
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
}, []);

// Render Standard Dropzone
    return (
        <div className={`${styles.container} ${className}`}>
            <div
                className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={variant === 'multiple'}
                    onChange={(e) => handleFiles(Array.from(e.target.files))}
                />

                <div className={styles.icon}>
                    <UploadCloud size={48} strokeWidth={1.5} />
                </div>
                <p className={styles.text}>
                    {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                </p>
                <p className={styles.subtext}>
                    {variant === 'multiple' ? 'Multiple files allowed' : 'Single file only'} • Max {formatSize(maxSize)}
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className={styles.fileList}>
                    {files.map(file => (
                        <div key={file.id} className={styles.fileItem}>
                            {file.file.type.startsWith('image/') ? (
                                <img src={file.preview} alt="Preview" className={styles.preview} />
                            ) : (
                                <div className={`${styles.preview} flex items-center justify-center`}>
                                    <File size={24} className="text-text-secondary" />
                                </div>
                            )}

                            <div className={styles.fileInfo}>
                                <div className="flex justify-between items-start">
                                    <span className={styles.fileName} title={file.file.name}>{file.file.name}</span>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeFile(file.id)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <span className={styles.fileMeta}>{formatSize(file.file.size)}</span>

                                {file.status !== 'complete' && (
                                    <div className={styles.progressContainer}>
                                        <div
                                            className={styles.progressBar}
                                            style={{ width: `${file.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const UserIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

FileUploader.propTypes = {
    variant: PropTypes.oneOf(['single', 'multiple', 'avatar']),
    accept: PropTypes.string,
    maxSize: PropTypes.number,
    onUpload: PropTypes.func,
    className: PropTypes.string,
};

export default FileUploader;
