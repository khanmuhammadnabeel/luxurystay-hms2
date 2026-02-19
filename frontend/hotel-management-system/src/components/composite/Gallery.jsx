import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Gallery.module.css';
import ImagePreview from './ImagePreview';
import Lightbox from './Lightbox';
import { cn } from '../../lib/utils';

const Gallery = ({
    images = [],
    variant = 'grid', // grid, masonry
    gap = 'md',
    onDelete,
    onSetPrimary
}) => {
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const handleImageClick = (index) => {
        setLightboxIndex(index);
    };

    const renderItem = (img, index) => (
        <ImagePreview
            key={img.id || index}
            src={img.src}
            alt={img.alt}
            isPrimary={img.isPrimary}
            className="w-full h-full"
            variant="card"
            onDelete={() => onDelete && onDelete(img.id)}
            onSetPrimary={() => onSetPrimary && onSetPrimary(img.id)}
        // Pass click handler via spread or wrapper?
        // ImagePreview doesn't expose onClick, but we can wrap it
        />
    );

    return (
        <div className={styles.container}>
            <div className={cn(
                variant === 'masonry' ? styles.masonry : styles.grid,
                styles[`gap-${gap}`]
            )}>
                {images.map((img, index) => (
                    <div
                        key={img.id || index}
                        className={cn(
                            variant === 'masonry' ? styles.masonryItem : '',
                            "cursor-pointer select-none"
                        )}
                        onClick={() => handleImageClick(index)}
                    >
                        {renderItem(img, index)}
                    </div>
                ))}
            </div>

            <Lightbox
                isOpen={lightboxIndex >= 0}
                initialIndex={lightboxIndex}
                images={images}
                onClose={() => setLightboxIndex(-1)}
            />
        </div>
    );
};

Gallery.propTypes = {
    images: PropTypes.array,
    variant: PropTypes.oneOf(['grid', 'masonry']),
    gap: PropTypes.oneOf(['sm', 'md', 'lg']),
    onDelete: PropTypes.func,
    onSetPrimary: PropTypes.func
};

export default Gallery;
