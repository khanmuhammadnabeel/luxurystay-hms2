import React from 'react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import { featuredRooms, exchangeRates } from '../../data/homepageData';
import { useLocalization } from '../../contexts';
import styles from './FeaturedRooms.module.css';
import { ArrowRight, Star } from 'lucide-react';

const FeaturedRooms = () => {
    const { activeCurrency } = useLocalization();

    // Convert a USD base price to the selected currency and format it
    const formatPrice = (usdPrice) => {
        const rate = exchangeRates[activeCurrency?.code] ?? 1;
        const converted = Math.round(usdPrice * rate);
        const formatted = converted.toLocaleString();
        return `${activeCurrency?.symbol ?? '$'}${formatted} / night`;
    };

    return (
        <section className={styles.section} aria-labelledby="featured-rooms-heading">
            <div className={styles.inner}>

                {/* Section Header */}
                <SectionHeader
                    preTitle="Curated for You"
                    title="Featured Accommodations"
                    subtitle="From intimate hideaways to palatial suites — each room is a world of its own, crafted for those who expect nothing less than extraordinary."
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
                                alt={room.name}
                                className={styles.cardImage}
                            />

                            {/* Room Name + Price Badge */}
                            <Card.Header>
                                <div className="flex items-start justify-between gap-3 w-full">
                                    <span className="font-serif text-[1rem] sm:text-[1.1rem] text-[var(--color-text-primary)] leading-snug">
                                        {room.name}
                                    </span>
                                    <Badge variant="gold" size="md" className="shrink-0 whitespace-nowrap">
                                        {formatPrice(room.price)}
                                    </Badge>
                                </div>
                            </Card.Header>

                            {/* Description + Amenities */}
                            <Card.Content className="flex-1">
                                <p className={styles.description}>
                                    {room.description}
                                </p>

                                {/* Top 3 amenity tags */}
                                <div className={styles.amenitiesList}>
                                    {room.amenities.slice(0, 3).map((amenity) => (
                                        <span key={amenity} className={styles.amenityTag}>
                                            {amenity}
                                        </span>
                                    ))}
                                    {room.amenities.length > 3 && (
                                        <span className={styles.amenityTag}>
                                            +{room.amenities.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </Card.Content>

                            {/* Footer: Rating + Book Now */}
                            <Card.Footer>
                                <div className="flex items-center gap-1 text-[var(--color-accent)]">
                                    <Star size={13} fill="currentColor" />
                                    <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                                        5.0 · Luxury
                                    </span>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    rightIcon={<ArrowRight size={14} />}
                                    onClick={() => { }}
                                >
                                    Book Now
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
