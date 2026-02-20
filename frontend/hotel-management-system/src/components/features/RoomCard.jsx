import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Star, ArrowRight } from 'lucide-react';
import { Card, Badge, Button, Rating } from '../ui';
import Lightbox from '../composite/Lightbox';
import { useLocalization } from '../../contexts';
import { exchangeRates } from '../../data/roomsData';

/**
 * RoomCard Component
 * Displays a detailed card for a room, including images, amenities, price, and rating.
 * Integrates with Lightbox for image viewing.
 */
const RoomCard = ({ room, onClick, className = '' }) => {
    const { t, language, activeCurrency } = useLocalization();
    const navigate = useNavigate();
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const isUrdu = language === 'Urdu';

    // Format images for Lightbox
    const lightboxImages = room.images.map((src, index) => ({
        src,
        alt: `${room.name} - Image ${index + 1}`
    }));

    // Format price based on active currency and exchange rates
    const formatPrice = (usdPrice) => {
        const rate = exchangeRates[activeCurrency?.code] ?? 1;
        const converted = Math.round(usdPrice * rate);
        const formatted = converted.toLocaleString();
        return `${activeCurrency?.symbol ?? '$'}${formatted}`;
    };

    return (
        <>
            <Card
                variant="interactive"
                className={`group h-full flex flex-col ${className}`}
                onClick={onClick}
            >
                {/* Card Image Section - Matches Homepage exactly (height 220px) */}
                <div className="relative h-[220px] overflow-hidden group">
                    <Card.Image
                        src={room.images[0]}
                        alt={isUrdu ? room.nameUr || room.name : room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLightboxOpen(true);
                        }}
                    />
                    {/* Dark gradient overlay matching homepage image style */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    {/* Discount Badge */}
                    {room.discount && (
                        <Badge
                            variant="gold"
                            className="absolute top-3 left-3 z-10 font-bold px-2 py-0.5 text-[10px]"
                        >
                            -{room.discount}%
                        </Badge>
                    )}
                    {/* Hover shimmer overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Content Section - Matches FeaturedRooms layout exactly */}
                <Card.Header>
                    <div className="flex items-start justify-between gap-3 w-full">
                        <span className="font-serif text-[1rem] sm:text-[1.1rem] text-[var(--color-text-primary)] leading-snug">
                            {isUrdu ? room.nameUr || room.name : room.name}
                        </span>
                        <Badge variant="gold" size="md" className="shrink-0 whitespace-nowrap px-3 py-1 text-[11px] font-bold">
                            {formatPrice(room.price)}
                        </Badge>
                    </div>
                </Card.Header>

                <Card.Content className="flex-1 flex flex-col pt-2 pb-4">
                    <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)] line-clamp-3 mb-4">
                        {isUrdu ? room.descriptionUr || room.description : room.description}
                    </p>

                    {/* Amenities matching Homepage style */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {(isUrdu ? room.amenitiesUr || room.amenities : room.amenities).slice(0, 3).map((amenity, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-tight text-[var(--color-text-secondary)] border border-[var(--glass-border)] bg-white/5"
                            >
                                {amenity}
                            </span>
                        ))}
                        {room.amenities.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-[#CFAF7E] border border-[#CFAF7E]/10 bg-[#CFAF7E]/5">
                                +{room.amenities.length - 3} {isUrdu ? 'مزید' : 'more'}
                            </span>
                        )}
                    </div>
                </Card.Content>

                <Card.Footer className="border-t border-[var(--glass-border)] py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Rating value={room.rating} size={13} />
                        <span className="text-[12px] font-bold text-[var(--color-text-secondary)]">
                            {room.rating} · {isUrdu ? 'لگژری' : 'Luxury'}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-secondary)] opacity-70">
                            ({room.reviews} {isUrdu ? 'جائزے' : 'reviews'})
                        </span>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ArrowRight size={14} />}
                        className="font-bold tracking-wide shrink-0 whitespace-nowrap"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rooms/${room.id}`);
                        }}
                    >
                        {t('rooms_listing.view')}
                    </Button>
                </Card.Footer>
            </Card>

            {/* Lightbox Implementation */}
            <Lightbox
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={lightboxImages}
                initialIndex={0}
            />
        </>
    );
};

RoomCard.propTypes = {
    room: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        nameUr: PropTypes.string,
        description: PropTypes.string.isRequired,
        descriptionUr: PropTypes.string,
        price: PropTypes.number.isRequired,
        currency: PropTypes.string,
        rating: PropTypes.number.isRequired,
        reviews: PropTypes.number.isRequired,
        images: PropTypes.arrayOf(PropTypes.string).isRequired,
        amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
        amenitiesUr: PropTypes.arrayOf(PropTypes.string),
        discount: PropTypes.number,
        type: PropTypes.string,
        beds: PropTypes.string,
        maxGuests: PropTypes.number
    }).isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string
};

export default RoomCard;
