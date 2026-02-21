import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Download, Calendar, ArrowRight } from 'lucide-react';
import { useLocalization } from '../../contexts';
import { getBookingById } from '../../services/bookingService';
import { Button } from '../../components/ui';
import styles from './BookingConfirmation.module.css';
import { cn } from '../../lib/utils';

const BookingConfirmation = () => {
    const { id } = useParams();
    const { t } = useLocalization();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const result = await getBookingById(id);
                setBooking(result.data);
            } catch (error) {
                console.error('Failed to fetch booking:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-20 min-h-screen">
            <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-500 mb-8 border border-green-500/20">
                    <Check size={40} />
                </div>

                <h1 className="text-4xl font-serif mb-4">{t('booking.confirmed')}</h1>
                <p className="opacity-60 mb-12">
                    {t('booking.confirmationSent').replace('{email}', booking?.email || 'your email')}
                </p>

                <div className="bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] rounded-[var(--radius-xl)] p-8 mb-12 text-left">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <span className="block text-xs uppercase font-bold opacity-50 mb-1">
                                {t('booking.reference')}
                            </span>
                            <span className={cn("text-2xl font-serif font-bold text-[var(--color-accent)]", styles.shimmer)}>
                                #{id.substring(0, 8).toUpperCase()}
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" leftIcon={<Download size={18} />}>
                            {t('booking.downloadInvoice')}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-6 border-y border-[var(--glass-border)]">
                        <div>
                            <span className="block text-xs uppercase font-bold opacity-50 mb-1">Check-in</span>
                            <span className="font-semibold">{new Date(booking?.checkInDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase font-bold opacity-50 mb-1">Check-out</span>
                            <span className="font-semibold">{new Date(booking?.checkOutDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <p className="mt-6 text-sm opacity-60">
                        {t('booking.emailPreview')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        leftIcon={<Calendar size={18} />}
                    >
                        {t('booking.addToCalendar')}
                    </Button>
                    <Button
                        className="w-full sm:w-auto"
                        rightIcon={<ArrowRight size={18} />}
                        as={Link}
                        to="/dashboard"
                    >
                        {t('booking.goToDashboard')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
