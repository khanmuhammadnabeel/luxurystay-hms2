import React from 'react';
import { MapPin, Calendar, Users, Check } from 'lucide-react';
import { useLocalization } from '../../contexts';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import styles from './BookingSummary.module.css';

const BookingSummary = ({ room, dates, guests, addOns, totalPrice, nights = 0 }) => {
    const { t, activeCurrency } = useLocalization();

    const formatDate = (date) => {
        if (!date) return '---';
        return format(new Date(date), 'MMM dd, yyyy');
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: activeCurrency.code,
        }).format(amount);
    };

    return (
        <div className={styles.container}>
            <div className={styles.roomInfo}>
                <img
                    src={room?.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={room?.name}
                    className={styles.roomImage}
                />
                <div className={styles.roomDetails}>
                    <h3>{room?.name || 'Deluxe Luxury Room'}</h3>
                    <div className={styles.location}>
                        <MapPin size={14} />
                        <span>{room?.location || 'Downtown Metropolitan'}</span>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <span className={styles.sectionLabel}>{t('booking.dates')}</span>
                <div className={styles.detailRow}>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[var(--color-accent)]" />
                        <span>{formatDate(dates.checkIn)} - {formatDate(dates.checkOut)}</span>
                    </div>
                    <span className="font-medium">{nights} {t('ui.night')}{nights !== 1 ? 's' : ''}</span>
                </div>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionLabel}>{t('booking.guests')}</span>
                <div className={styles.detailRow}>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-[var(--color-accent)]" />
                        <span>{guests.adults} Adults, {guests.children} Children</span>
                    </div>
                </div>
            </div>

            {addOns.length > 0 && (
                <>
                    <div className={styles.divider} />
                    <div className={styles.section}>
                        <span className={styles.sectionLabel}>{t('booking.addOns')}</span>
                        {addOns.map(addon => (
                            <div key={addon.id} className={styles.detailRow}>
                                <div className="flex items-center gap-2">
                                    <Check size={14} className="text-green-500" />
                                    <span>{addon.name}</span>
                                </div>
                                <span>{formatPrice(addon.price)}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className={styles.divider} />

            <div className={styles.section}>
                <div className={styles.detailRow}>
                    <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-500" />
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {t('booking.luxuryStay').replace('{nights}', nights)}
                            </span>
                            <span className="text-xs opacity-60">
                                {t('booking.perNightAt').replace('{price}', formatPrice(room.price))}
                            </span>
                        </div>
                    </div>
                    <span className="font-medium">{formatPrice(nights * room.price)}</span>
                </div>
            </div>

            <div className={styles.totalSection}>
                <div className={styles.detailRow}>
                    <span className={styles.totalLabel}>{t('booking.total')}</span>
                    <div className={cn(styles.totalPrice, styles.shimmer)}>
                        {formatPrice(totalPrice)}
                    </div>
                </div>
                <p className={styles.taxesHint}>{t('booking.includesTaxes')}</p>
            </div>
        </div>
    );
};

export default BookingSummary;
