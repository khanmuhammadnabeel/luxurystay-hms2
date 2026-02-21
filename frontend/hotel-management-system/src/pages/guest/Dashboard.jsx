import React, { useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Receipt,
  ConciergeBell,
  Clock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGuest } from '../../hooks/useGuest';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Card, Badge, SectionHeader } from '../../components/ui';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { t, currency } = useLocalization();
  const {
    profile,
    bookings,
    invoices,
    serviceRequests,
    fetchProfile,
    fetchBookings,
    fetchInvoices,
    fetchServiceRequests,
    loading
  } = useGuest();

  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchInvoices();
    fetchServiceRequests();
  }, [fetchProfile, fetchBookings, fetchInvoices, fetchServiceRequests]);

  const stats = useMemo(() => [
    {
      label: t('dashboard.stats.active_bookings'),
      value: bookings.filter(b => ['confirmed', 'checked-in'].includes(b.status)).length,
      icon: CalendarDays,
      color: 'gold',
      link: '/dashboard/bookings'
    },
    {
      label: t('dashboard.stats.pending_invoices'),
      value: invoices.filter(i => i.status === 'issued').length,
      icon: Receipt,
      color: 'gold',
      link: '/dashboard/invoices'
    },
    {
      label: t('dashboard.stats.active_requests'),
      value: serviceRequests.filter(r => ['pending', 'preparing'].includes(r.status)).length,
      icon: ConciergeBell,
      color: 'gold',
      link: '/dashboard/services'
    },
  ], [bookings, invoices, serviceRequests, t]);

  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings]);

  if (loading.profile && !profile) {
    return <div className={styles.loading}>{t('common.loading')}...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1 className={styles.title}>{t('dashboard.welcome')}, {profile?.name}!</h1>
          <p className={styles.subtitle}>{t('dashboard.overview_msg')}</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Link to={stat.link} key={index} className={styles.statLink}>
            <Card className={styles.statCard} interactive>
              <div className={styles.statIconWrapper}>
                <stat.icon size={24} className={styles.statIcon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value}</span>
              </div>
              <ChevronRight size={20} className={styles.statArrow} />
            </Card>
          </Link>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Recent Bookings */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <SectionHeader title={t('dashboard.recent_bookings')} compact />
            <Link to="/dashboard/bookings" className={styles.viewAll}>
              {t('common.view_all')}
            </Link>
          </div>

          <div className={styles.bookingList}>
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <Card key={booking._id} className={styles.bookingCard}>
                  <div className={styles.bookingInfo}>
                    <h4 className={styles.roomType}>{booking.roomId?.type || t('common.room')}</h4>
                    <p className={styles.bookingDates}>
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'}>
                    {t(`status.${booking.status}`)}
                  </Badge>
                </Card>
              ))
            ) : (
              <p className={styles.emptyState}>{t('dashboard.no_bookings')}</p>
            )}
          </div>
        </section>

        {/* Activity Feed / Tips */}
        <section className={styles.section}>
          <SectionHeader title={t('dashboard.stay_insights')} compact />
          <Card className={styles.insightCard}>
            <div className={styles.insightIcon}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.insightContent}>
              <h4>{t('dashboard.insights.loyalty_title')}</h4>
              <p>{t('dashboard.insights.loyalty_desc')}</p>
            </div>
          </Card>

          <Card className={styles.insightCard} style={{ marginTop: '1rem' }}>
            <div className={styles.insightIcon}>
              <Clock size={24} />
            </div>
            <div className={styles.insightContent}>
              <h4>{t('dashboard.insights.checkin_title')}</h4>
              <p>{t('dashboard.insights.checkin_desc')}</p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
