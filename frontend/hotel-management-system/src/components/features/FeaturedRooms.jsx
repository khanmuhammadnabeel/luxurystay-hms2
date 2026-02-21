// src/components/features/FeaturedRooms.jsx
import React from 'react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import { featuredRooms, exchangeRates } from '../../data/homepageData';
import { useLocalization } from '../../contexts';
import styles from './FeaturedRooms.module.css';
import { ArrowRight } from 'lucide-react';
import { Rating } from '../ui';

const FeaturedRooms = () => {
    const { activeCurrency, t, language } = useLocalization();
    const isUrdu = language === 'Urdu';

    // Convert a USD base price to the selected currency and format it
    const formatPrice = (usdPrice) => {
        const rate = exchangeRates[activeCurrency?.code] ?? 1;
        const converted = Math.round(usdPrice * rate);
        const formatted = converted.toLocaleString();
        return `${activeCurrency?.symbol ?? '$'}${formatted} ${t('homepage.rooms.perNight')}`;
    };

    return (
        <section className={styles.section} aria-labelledby="featured-rooms-heading">
            <div className={styles.inner}>

                {/* Section Header */}
                <SectionHeader
                    preTitle={t('homepage.rooms.preTitle')}
                    title={t('homepage.rooms.title')}
                    subtitle={t('homepage.rooms.subtitle')}
                />

                {/* Room Grid */}
                <div className={styles.grid}>
                    {featuredRooms.map((room) => (
                        <Card
                            key={room.id}
                            variant="interactive"
                            className={styles.roomCard}
                        >
                            {/* Room Image */}
                            <Card.Image
                                src={room.images[0]}
                                alt={isUrdu ? room.nameUr : room.name}
                                className={styles.cardImage}
                            />

                            {/* Room Name + Price Badge */}
                            <Card.Header>
                                <div className="flex items-start justify-between gap-3 w-full">
                                    <span className="font-serif text-[1rem] sm:text-[1.1rem] text-[var(--color-text-primary)] leading-snug">
                                        {isUrdu ? room.nameUr : room.name}
                                    </span>
                                    <Badge variant="gold" size="md" className="shrink-0 whitespace-nowrap">
                                        {formatPrice(room.price)}
                                    </Badge>
                                </div>
                            </Card.Header>

                            {/* Description + Amenities */}
                            <Card.Content className="flex-1">
                                <p className={styles.description}>
                                    {isUrdu ? room.descriptionUr : room.description}
                                </p>

                                {/* Top 3 amenity tags */}
                                <div className={styles.amenitiesList}>
                                    {(isUrdu ? room.amenitiesUr : room.amenities).slice(0, 3).map((amenity) => (
                                        <span key={amenity} className={styles.amenityTag}>
                                            {amenity}
                                        </span>
                                    ))}
                                    {room.amenities.length > 3 && (
                                        <span className={styles.amenityTag}>
                                            +{room.amenities.length - 3} {t('homepage.rooms.more')}
                                        </span>
                                    )}
                                </div>
                            </Card.Content>

                            {/* Footer: Rating + Book Now */}
                            <Card.Footer className="px-6">
                                <div className="flex items-center gap-2">
                                    <Rating value={5} size={13} />
                                    <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                                        5.0 · {t('ui.luxury')}
                                    </span>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    rightIcon={<ArrowRight size={14} />}
                                    onClick={() => { }}
                                >
                                    {t('homepage.rooms.bookNow')}
                                </Button>
                            </Card.Footer>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedRooms;
