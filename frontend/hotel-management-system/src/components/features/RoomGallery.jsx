// src/components/features/RoomGallery.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui';
import Lightbox from '../composite/Lightbox';
import styles from './RoomGallery.module.css';

/**
 * RoomGallery Component
 * Displays a main image and a thumbnail strip with Lightbox integration.
 */
const RoomGallery = ({ images = [], discount = null }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!images || images.length === 0) return null;

    // Format images for Lightbox
    const lightboxImages = images.map((src, index) => ({
        src,
        alt: `Room Gallery Image ${index + 1}`
    }));

    const handleThumbnailClick = (index) => {
        setActiveIdx(index);
    };

    const handleMainImageClick = () => {
        setIsLightboxOpen(true);
    };

    return (
        <div className={styles.container}>
            {/* Main Large Image */}
            <div className={styles.mainImageWrapper} onClick={handleMainImageClick}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={images[activeIdx]}
                        src={images[activeIdx]}
                        alt="Room detail"
                        className={styles.mainImage}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    />
                </AnimatePresence>

                {/* Discount Badge */}
                {discount && (
                    <Badge variant="gold" className={styles.badge}>
                        -{discount}%
                    </Badge>
                )}

                {/* Image Count Indicator */}
                <div className={styles.countIndicator}>
                    <ImageIcon size={16} />
                    <span>{activeIdx + 1} / {images.length}</span>
                </div>
            </div>

            {/* Thumbnails Strip */}
            <div className={styles.thumbnailsStrip}>
                {images.map((src, idx) => (
                    <button
                        key={idx}
                        className={`${styles.thumbBtn} ${idx === activeIdx ? styles.active : ''}`}
                        onClick={() => handleThumbnailClick(idx)}
                    >
                        <img src={src} alt={`Thumbnail ${idx + 1}`} className={styles.thumbImage} />
                        <div className={styles.thumbOverlay} />
                    </button>
                ))}
            </div>

            {/* Lightbox Implementation */}
            <Lightbox
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={lightboxImages}
                initialIndex={activeIdx}
            />
        </div>
    );
};

RoomGallery.propTypes = {
    images: PropTypes.arrayOf(PropTypes.string),
    discount: PropTypes.number
};

export default RoomGallery;
