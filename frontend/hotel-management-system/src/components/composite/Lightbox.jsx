import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import styles from './Lightbox.module.css';
import { createPortal } from 'react-dom';

const Lightbox = ({
    isOpen,
    onClose,
    images = [], // Array of { src, alt }
    initialIndex = 0
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    // Sync index when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsZoomed(false);
            document.body.style.overflow = 'hidden'; // Lock scroll
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, initialIndex]);

    // Keyboard Nav
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]); // eslint-disable-line

    const nextImage = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsZoomed(false);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsZoomed(false);
    }, [images.length]);

    const toggleZoom = (e) => {
        e.stopPropagation();
        setIsZoomed(!isZoomed);
    };

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];
    if (!currentImage) return null; // Safe guard

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            {/* Header */}
            {/* Header */}
            <div className={styles.header} onClick={(e) => e.stopPropagation()}>
                <span className={`${styles.counter} select-none cursor-default`}>{currentIndex + 1} / {images.length}</span>
                <div className={styles.headerActions}>
                    <button className={`${styles.closeBtn} cursor-pointer`} onClick={toggleZoom} title={isZoomed ? "Zoom Out" : "Zoom In"}>
                        {isZoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
                    </button>
                    <button className={`${styles.closeBtn} cursor-pointer`} onClick={onClose} title="Close">
                        <X size={28} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.content} onClick={toggleZoom}>
                <button
                    className={`${styles.navBtn} ${styles.prev} cursor-pointer select-none`}
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                    <ChevronLeft size={32} />
                </button>

                <div
                    className={styles.imageContainer}
                    style={{ transform: isZoomed ? 'scale(1.5)' : 'scale(1)' }}
                >
                    <img
                        src={currentImage.src}
                        alt={currentImage.alt || `Image ${currentIndex + 1}`}
                        className={styles.image}
                    />
                </div>

                <button
                    className={`${styles.navBtn} ${styles.next} cursor-pointer select-none`}
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Thumbnails */}
            <div className={styles.thumbnails} onClick={(e) => e.stopPropagation()}>
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        className={`${styles.thumbBtn} ${idx === currentIndex ? styles.active : ''} cursor-pointer`}
                        onClick={() => setCurrentIndex(idx)}
                    >
                        <img src={img.src} alt="Thumbnail" className={`${styles.thumbImg} select-none`} />
                    </button>
                ))}
            </div>
        </div>,
        document.body
    );
};

Lightbox.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    images: PropTypes.arrayOf(PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string
    })),
    initialIndex: PropTypes.number
};

export default Lightbox;
