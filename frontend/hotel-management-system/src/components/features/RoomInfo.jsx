// src/components/features/RoomInfo.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Users, Star, Share2, Heart } from 'lucide-react';
import { useLocalization } from '../../contexts';
import { Button, Rating } from '../ui';
import { cn } from '../../lib/utils';
import styles from './RoomInfo.module.css';

/**
 * RoomInfo Component
 * Displays the core details of a room: name, location, capacity, rating, and description.
 */
const RoomInfo = ({ room }) => {
    const { language, t } = useLocalization();
    const [isFavorite, setIsFavorite] = useState(false);
    const isUrdu = language === 'Urdu';

    if (!room) return null;

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <h1 className={styles.title}>
                    {isUrdu ? room.nameUr || room.name : room.name}
                </h1>

                <div className={styles.metaRow}>
                    <div className={styles.metaLeft}>
                        {/* Location */}
                        <div className={styles.location}>
                            <MapPin size={16} className="text-[var(--color-accent)]" />
                            <span>{isUrdu ? room.locationUr || room.location : room.location}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Rating */}
                            <div className={styles.ratingRow}>
                                <Rating value={room.rating} size={14} />
                                <span className="font-bold">{room.rating}</span>
                                <span className="opacity-60">({room.reviewsCount || room.reviews} {t('ui.reviews')})</span>
                            </div>

                            {/* Sleeps */}
                            <div className={styles.guestCapacity}>
                                <Users size={16} />
                                <span>
                                    {t('roomDetail.sleeps_plural').replace('{count}', room.sleeps)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions (Share/Favorite) */}
                    <div className={styles.actions}>
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Share2 size={18} />}
                            className={styles.actionBtn}
                        >
                            {t('roomDetail.share')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Heart size={18} fill={isFavorite ? "currentColor" : "none"} />}
                            className={cn(styles.actionBtn, isFavorite && styles.favoriteActive)}
                            onClick={() => setIsFavorite(!isFavorite)}
                        >
                            {t('roomDetail.favorite')}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Description Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    {t('roomDetail.description')}
                </h2>
                <p className={styles.description}>
                    {isUrdu ? room.fullDescriptionUr || room.fullDescription : room.fullDescription}
                </p>
            </section>
        </div>
    );
};

RoomInfo.propTypes = {
    room: PropTypes.shape({
        name: PropTypes.string.isRequired,
        nameUr: PropTypes.string,
        location: PropTypes.string,
        locationUr: PropTypes.string,
        sleeps: PropTypes.number,
        rating: PropTypes.number,
        reviewsCount: PropTypes.number,
        fullDescription: PropTypes.string,
        fullDescriptionUr: PropTypes.string
    })
};

export default RoomInfo;
