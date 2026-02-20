// src/pages/public/RoomDetail.jsx
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Info, Loader2 } from 'lucide-react';
import { differenceInDays } from 'date-fns';

import { useLocalization } from '../../contexts';
import { useRoom } from '../../hooks/useRoom';
import { Button, Badge } from '../../components/ui';
import RangePicker from '../../components/composite/RangePicker';

// Components                         
import RoomGallery from '../../components/features/RoomGallery';
import RoomInfo from '../../components/features/RoomInfo';
import RoomAmenities from '../../components/features/RoomAmenities';
import RoomReviews from '../../components/features/RoomReviews';
import SimilarRooms from '../../components/features/SimilarRooms';

import styles from './RoomDetail.module.css';

const RoomDetail = () => {
  const { id } = useParams();
  const { t, activeCurrency, language } = useLocalization();
  const { room, loading, error } = useRoom(id);
  const isUrdu = language === 'Urdu';

  // Booking State
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [guests, setGuests] = useState(2);

  // Calculations
  const nights = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return 0;
    return differenceInDays(new Date(dateRange.end), new Date(dateRange.start));
  }, [dateRange]);

  const totalBasePrice = useMemo(() => {
    if (!room) return 0;
    const n = nights || 1; // Show at least one night price if no dates selected
    return room.price * n;
  }, [room, nights]);

  const formatPrice = (val) => {
    const converted = val * (activeCurrency.rate || 1);
    return `${activeCurrency.symbol}${Math.round(converted)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={48} />
        <p className="text-[var(--color-text-secondary)] font-medium">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-serif mb-4">{t('rooms_listing.noRooms')}</h2>
        <Button variant="primary" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Left Column: Content */}
        <div className={styles.mainContent}>
          <RoomGallery images={room.images} discount={room.discount} />

          <div className="space-y-12">
            <RoomInfo room={room} />

            <section>
              <h2 className="text-2xl font-serif font-bold mb-6">
                {t('roomDetail.amenities')}
              </h2>
              <RoomAmenities amenities={room.amenities} />
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold mb-6">
                {t('roomDetail.reviews')}
              </h2>
              <RoomReviews
                reviews={room.reviews}
                rating={room.rating}
                totalReviews={room.reviewsCount}
              />
            </section>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.bookingCard}>
            {/* Price Display as a Professional Pill */}
            <div className="flex items-center justify-between mb-8">
              <Badge variant="gold" size="lg" className="px-4 py-1.5 text-lg font-bold">
                {formatPrice(room.price)}
              </Badge>
              <span className={styles.perNight}>{t('booking.perNight')}</span>
            </div>

            {/* Date Picker */}
            <div className={styles.sidebarSection}>
              <label className={styles.sidebarLabel}>{t('booking.dates')}</label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                minDate={new Date()}
                className="w-full"
              />
            </div>

            {/* Guest Stepper */}
            <div className={styles.sidebarSection}>
              <label className={styles.sidebarLabel}>{t('booking.guests')}</label>
              <div className={styles.stepper}>
                <span className="font-medium">
                  {guests} {t('booking.guests')}
                </span>
                <div className={styles.stepperActions}>
                  <button
                    className={styles.stepperBtn}
                    onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                    disabled={guests <= 1}
                  >-</button>
                  <span className={styles.stepperValue}>{guests}</span>
                  <button
                    className={styles.stepperBtn}
                    onClick={() => setGuests(prev => Math.min(room.sleeps, prev + 1))}
                    disabled={guests >= room.sleeps}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Total & Button */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>{t('booking.total')}</span>
              <div className="text-right">
                <span className={styles.totalValue}>
                  {formatPrice(totalBasePrice)}
                </span>
                <p className={styles.taxesInfo}>{t('booking.includesTaxes')}</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-6 font-bold"
              disabled={!dateRange.start || !dateRange.end}
            >
              {t('booking.bookNow')}
            </Button>

            <div className={styles.cancellation}>
              <Check size={16} />
              <span>{t('booking.freeCancellation')}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Recommendations Grid */}
      <SimilarRooms currentRoomId={room.id} type={room.type} />
    </div>
  );
};

export default RoomDetail;
