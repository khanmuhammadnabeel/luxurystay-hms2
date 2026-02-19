import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Trash2, RotateCw, Star, Download, Eye, Maximize2 } from 'lucide-react';
import styles from './ImagePreview.module.css';

const ImagePreview = ({
    src,
    alt = 'Preview',
    variant = 'card', // card, list
    isPrimary = false,
    onDelete,
    onSetPrimary,
    onRotate,
    onClick,
    className,
    ...props
}) => {
    const [rotation, setRotation] = useState(0);

    const handleRotate = (e) => {
        e.stopPropagation();
        const newRotation = (rotation + 90) % 360;
        setRotation(newRotation);
        if (onRotate) onRotate(newRotation);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete();
    };

    const handleSetPrimary = (e) => {
        e.stopPropagation();
        if (onSetPrimary) onSetPrimary();
    };

    // List View
    if (variant === 'list') {
        return (
            <div className={`${styles.listContainer} ${className}`}>
                <img src={src} alt={alt} className={styles.listThumb} />
                <div className={styles.listInfo}>
                    <p className="font-medium text-text-primary truncate select-none cursor-default">{alt}</p>
                    <p className="text-xs text-text-secondary select-none cursor-default">Image</p>
                </div>
                <div className={styles.listActions}>
                    <button className={`${styles.actionBtn} ${isPrimary ? styles.starActive : ''}`} onClick={handleSetPrimary} title="Set as Primary">
                        <Star size={14} fill={isPrimary ? "currentColor" : "none"} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.delete}`} onClick={handleDelete} title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    }

    // Card View (Default)
    return (
        <div
            className={`${styles.container} ${isPrimary ? styles.primary : ''} ${className} w-full aspect-square cursor-pointer select-none`}
            onClick={onClick}
            {...props}
        >
            <div className={styles.imageWrapper}>
                <img
                    src={src}
                    alt={alt}
                    className={styles.image}
                    style={{ '--rotation': `${rotation}deg` }}
                />
            </div>

            {isPrimary && (
                <div className={styles.primaryIndicator} title="Primary Image">
                    <Star size={16} fill="currentColor" />
                </div>
            )}

            <div className={styles.overlay}>
                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={handleRotate} title="Rotate">
                        <RotateCw size={16} />
                    </button>
                    <button className={`${styles.actionBtn} ${isPrimary ? styles.starActive : ''}`} onClick={handleSetPrimary} title="Set Primary">
                        <Star size={16} fill={isPrimary ? "currentColor" : "none"} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.delete}`} onClick={handleDelete} title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

ImagePreview.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    variant: PropTypes.oneOf(['card', 'list']),
    isPrimary: PropTypes.bool,
    onDelete: PropTypes.func,
    onSetPrimary: PropTypes.func,
    onRotate: PropTypes.func,
    className: PropTypes.string,
};

export default ImagePreview;
