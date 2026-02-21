import React, { useState, useEffect } from 'react';
import { useGuest } from '../../hooks/useGuest';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Card, Badge, Button, SectionHeader } from '../../components/ui';
import { Calendar, MapPin, Users, ChevronRight, Filter } from 'lucide-react';
import styles from './Bookings.module.css';
import clsx from 'clsx';

const MyBookings = () => {
    const { t, currency } = useLocalization();
    const { bookings, fetchBookings, loading } = useGuest();
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const tabs = [
        { id: 'upcoming', label: t('dashboard.bookings.upcoming') },
        { id: 'past', label: t('dashboard.bookings.past') },
        { id: 'cancelled', label: t('dashboard.bookings.cancelled') }
    ];

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'upcoming') return ['confirmed', 'checked-in', 'pending'].includes(booking.status);
        if (activeTab === 'past') return booking.status === 'checked-out';
        if (activeTab === 'cancelled') return booking.status === 'cancelled';
        return true;
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <SectionHeader
                    title={t('dashboard.bookings.title')}
                    subtitle={t('dashboard.bookings.subtitle')}
                />
            </header>

            <div className={styles.tabsContainer}>
                <div className={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={clsx(styles.tab, activeTab === tab.id && styles.activeTab)}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                            {activeTab === tab.id && <span className={styles.tabBadge}>{filteredBookings.length}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.bookingGrid}>
                {loading.bookings ? (
                    <div className={styles.loading}>{t('common.loading')}...</div>
                ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <Card key={booking._id} className={styles.bookingCard} variant="elevated">
                            <div className={styles.cardMain}>
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={booking.roomId?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                        alt={booking.roomId?.type}
                                        className={styles.roomImage}
                                    />
                                    <Badge className={styles.statusBadge} variant={getStatusVariant(booking.status)}>
                                        {t(`status.${booking.status}`)}
                                    </Badge>
                                </div>

                                <div className={styles.details}>
                                    <div className={styles.detailsHeader}>
                                        <h3 className={styles.roomName}>{booking.roomId?.type || t('common.room')}</h3>
                                        <p className={styles.price}>
                                            <span className={styles.amount}>{currency.symbol}{booking.totalAmount}</span>
                                            <span className={styles.total}>{t('common.total')}</span>
                                        </p>
                                    </div>

                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <Calendar size={16} />
                                            <span>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Users size={16} />
                                            <span>{booking.numberOfGuests} {t('common.guests')}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <MapPin size={16} />
                                            <span>Room {booking.roomId?.roomNumber || 'TBD'}</span>
                                        </div>
                                    </div>

                                    <div className={styles.actions}>
                                        <Button variant="outline" size="sm" fullWidth>
                                            {t('dashboard.bookings.view_details')}
                                        </Button>
                                        {booking.status === 'confirmed' && (
                                            <Button variant="ghost" size="sm" className={styles.cancelBtn}>
                                                {t('dashboard.bookings.request_cancellation')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Calendar size={48} /></div>
                        <h3>{t('dashboard.bookings.empty_title')}</h3>
                        <p>{t('dashboard.bookings.empty_desc')}</p>
                        <Button as="a" href="/rooms" variant="accent" className={styles.bookNowBtn}>
                            {t('dashboard.bookings.book_now')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const getStatusVariant = (status) => {
    switch (status) {
        case 'confirmed': return 'success';
        case 'checked-in': return 'accent';
        case 'pending': return 'warning';
        case 'cancelled': return 'error';
        default: return 'default';
    }
};

export default MyBookings;
