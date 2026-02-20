import React, { useState } from 'react';
import { Range, getTrackBackground } from 'react-range';
import { Star, X } from 'lucide-react';
import { useLocalization } from '../../contexts';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import Radio from '../ui/Radio';
import FilterSection from './FilterSection';
import RangePicker from '../composite/RangePicker';
import styles from './RoomFilters.module.css';

import { roomsData, getFilterOptions } from '../../data/roomsData';

// Derive options dynamically from the actual data
const options = getFilterOptions(roomsData);
const ROOM_TYPES = options.roomTypes;
const BED_TYPES = options.bedTypes;
const AMENITIES_LIST = options.amenities;

const RoomFilters = ({
    filters,
    onChange,
    isOpen,
    onClose,
    className = '',
    filteredCount,
    variant = 'auto' // 'auto' | 'sidebar' | 'drawer'
}) => {
    const { t } = useLocalization();
    const [showAllAmenities, setShowAllAmenities] = useState(false);

    // Helper to get localized label for filters
    const getLabel = (key) => t(`rooms_listing.filter_labels.${key}`);

    // Date Range Handler
    const handleRangeChange = (range) => {
        onChange({
            ...filters,
            dateRange: {
                checkIn: range.start,
                checkOut: range.end
            }
        });
    };

    // Guests Handler
    const updateGuests = (type, delta) => {
        const currentVal = filters.guests[type] || 0;
        const newVal = Math.max(0, currentVal + delta);
        onChange({
            ...filters,
            guests: { ...filters.guests, [type]: newVal }
        });
    };

    // Generic Change Handler for Arrays (Checkbox/Radio)
    const handleRoomTypeChange = (checked, value) => {
        const current = filters.roomTypes;
        const newTypes = checked
            ? [...current, value]
            : current.filter(t => t !== value);
        onChange({ ...filters, roomTypes: newTypes });
    };

    const handleAmenityChange = (checked, value) => {
        const current = filters.amenities;
        const newAmenities = checked
            ? [...current, value]
            : current.filter(a => a !== value);
        onChange({ ...filters, amenities: newAmenities });
    };

    const content = (
        <>
            {/* 1. Date Range Filter using RangePicker */}
            <FilterSection title={t('rooms_listing.section_titles.dates')}>
                <RangePicker
                    value={{
                        start: filters.dateRange.checkIn,
                        end: filters.dateRange.checkOut
                    }}
                    onChange={handleRangeChange}
                    minDate={new Date()}
                    className="w-full"
                />
            </FilterSection>

            {/* 2. Guests Filter */}
            <FilterSection title={t('rooms_listing.section_titles.guests')}>
                <div className="space-y-4">
                    {['adults', 'children'].map(type => (
                        <div key={type} className="flex justify-between items-center">
                            <span className="capitalize font-medium text-[var(--color-text-primary)]">
                                {getLabel(type)}
                            </span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => updateGuests(type, -1)}
                                    className={styles.counterBtn}
                                    disabled={filters.guests[type] <= (type === 'adults' ? 1 : 0)}
                                >-</button>
                                <span className="w-6 text-center text-lg font-semibold text-[var(--color-text-primary)]">
                                    {filters.guests[type]}
                                </span>
                                <button
                                    onClick={() => updateGuests(type, 1)}
                                    className={styles.counterBtn}
                                    disabled={filters.guests[type] >= 10}
                                >+</button>
                            </div>
                        </div>
                    ))}
                </div>
            </FilterSection>

            {/* 3. Price Range Filter */}
            <FilterSection title={t('rooms_listing.section_titles.price')}>
                <div className="px-2 py-6">
                    <Range
                        step={10}
                        min={50}
                        max={1500}
                        values={filters.priceRange}
                        onChange={(values) => onChange({ ...filters, priceRange: values })}
                        renderTrack={({ props, children }) => (
                            <div
                                {...props}
                                className="h-1.5 w-full rounded-full"
                                style={{
                                    ...props.style,
                                    background: getTrackBackground({
                                        values: filters.priceRange,
                                        colors: [
                                            'rgba(207, 175, 126, 0.1)',
                                            '#CFAF7E',
                                            'rgba(207, 175, 126, 0.1)'
                                        ],
                                        min: 50,
                                        max: 1500
                                    }),
                                }}
                            >
                                {children}
                            </div>
                        )}
                        renderThumb={({ props, index }) => (
                            <div
                                {...props}
                                key={`thumb-${index}`}
                                className="w-6 h-6 bg-[var(--color-primary)] rounded-full shadow-lg border-2 border-[#CFAF7E] outline-none flex items-center justify-center focus:scale-110 active:scale-125 transition-transform"
                                style={{ ...props.style }}
                            >
                                <div className="w-1.5 h-1.5 bg-[#CFAF7E] rounded-full" />
                            </div>
                        )}
                    />
                    <div className="flex justify-between text-sm text-[var(--color-text-primary)] mt-6 font-semibold">
                        <span className="bg-[var(--color-secondary)] px-2 py-1 rounded border border-[var(--glass-border)]">${filters.priceRange[0]}</span>
                        <span className="bg-[var(--color-secondary)] px-2 py-1 rounded border border-[var(--glass-border)]">${filters.priceRange[1]}+</span>
                    </div>
                </div>
            </FilterSection>

            {/* 4. Room Type Filter */}
            <FilterSection title={t('rooms_listing.section_titles.roomType')}>
                <div className="flex flex-col gap-2">
                    {ROOM_TYPES.map(type => (
                        <Checkbox
                            key={type}
                            label={getLabel(type)}
                            checked={filters.roomTypes.includes(type)}
                            onChange={(checked) => handleRoomTypeChange(checked, type)}
                            className="text-sm"
                        />
                    ))}
                </div>
            </FilterSection>

            {/* 5. Amenities Filter */}
            <FilterSection title={t('rooms_listing.section_titles.amenities')}>
                <div className="flex flex-col gap-2">
                    {AMENITIES_LIST.slice(0, showAllAmenities ? AMENITIES_LIST.length : 5).map(amenity => (
                        <Checkbox
                            key={amenity}
                            label={getLabel(amenity)}
                            checked={filters.amenities.includes(amenity)}
                            onChange={(checked) => handleAmenityChange(checked, amenity)}
                            className="text-sm"
                        />
                    ))}
                </div>
                {AMENITIES_LIST.length > 5 && (
                    <button
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        className="text-[var(--color-accent)] text-xs mt-3 hover:underline font-medium ml-1"
                    >
                        {showAllAmenities
                            ? t('rooms_listing.showLess')
                            : t('rooms_listing.resultsMore').replace('{count}', AMENITIES_LIST.length - 5)}
                    </button>
                )}
            </FilterSection>

            {/* 6. Bed Type Filter */}
            <FilterSection title={t('rooms_listing.section_titles.bedType')}>
                <div className="flex flex-col gap-2">
                    {BED_TYPES.map(type => (
                        <Radio
                            key={type}
                            label={getLabel(type)}
                            name="bedType"
                            checked={filters.bedTypes.includes(type)}
                            onChange={() => onChange({ ...filters, bedTypes: [type] })}
                            className="text-sm"
                        />
                    ))}
                    <Radio
                        label="Any"
                        name="bedType"
                        checked={filters.bedTypes.length === 0}
                        onChange={() => onChange({ ...filters, bedTypes: [] })}
                        className="text-sm text-[var(--color-text-placeholder)]"
                    />
                </div>
            </FilterSection>

            {/* 7. Rating Filter */}
            <FilterSection title={t('rooms_listing.section_titles.rating')}>
                <div className="space-y-1">
                    {[5, 4, 3].map(rating => (
                        <button
                            key={rating}
                            onClick={() => onChange({
                                ...filters,
                                rating: filters.rating === rating ? null : rating
                            })}
                            className={`${styles.ratingBtn} ${filters.rating === rating ? styles.active : ''}`}
                        >
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < rating ? '#CFAF7E' : 'rgba(207, 175, 126, 0.2)'}
                                        className={i < rating ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-placeholder)]'}
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium">& up</span>
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* 8. Action Buttons (Sticky) */}
            <div className={styles.stickyActions}>
                <Button
                    variant="primary"
                    size="md"
                    className="w-full mb-3"
                    onClick={() => { if (isOpen) onClose(); }} // Close drawer on mobile
                >
                    {t('common.show').replace('{count}', filteredCount) || `Show ${filteredCount} Results`}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[var(--color-text-secondary)] hover:text-[var(--color-destructive)]"
                    onClick={() => {
                        onChange({
                            dateRange: { checkIn: null, checkOut: null },
                            guests: { adults: 2, children: 0, infants: 0 },
                            priceRange: [50, 1500],
                            roomTypes: [],
                            amenities: [],
                            bedTypes: [],
                            rating: null
                        });
                    }}
                >
                    {t('rooms_listing.clearAll')}
                </Button>
            </div>
        </>
    );

    // Render logic: Desktop Sidebar vs Mobile Drawer
    const showSidebar = variant === 'auto' || variant === 'sidebar';
    const showDrawer = variant === 'auto' || variant === 'drawer';

    return (
        <>
            {/* Desktop Sidebar */}
            {showSidebar && (
                <div className={`${styles.filtersContainer} ${className} ${variant === 'auto' ? 'hidden lg:block' : ''}`}>
                    {content}
                </div>
            )}

            {/* Mobile Drawer */}
            {showDrawer && (
                <>
                    <div
                        className={`${styles.overlay} ${isOpen ? styles.visible : ''} ${variant === 'auto' ? 'lg:hidden' : ''}`}
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <div className={`${styles.mobileDrawer} ${isOpen ? styles.open : ''} ${variant === 'auto' ? 'lg:hidden' : ''}`}>
                        <div className={styles.drawerHeader}>
                            <h3 className={styles.drawerTitle}>Filters</h3>
                            <button onClick={onClose} className={styles.closeButton} aria-label="Close filters">
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.drawerContent}>
                            {content}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default RoomFilters;
