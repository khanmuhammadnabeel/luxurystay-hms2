import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { useRoom } from '../../hooks/useRoom';
import { useLocalization } from '../../contexts';
import BookingForm from '../../components/features/BookingForm';
import PaymentMethod from '../../components/features/PaymentMethod';
import BookingSummary from '../../components/features/BookingSummary';
import BookingStepper from '../../components/features/BookingStepper';
import { Button } from '../../components/ui';
import styles from './Booking.module.css';

const Booking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLocalization();

    const {
        room,
        loading: roomLoading,
        error: roomError
    } = useRoom(roomId);

    const {
        step,
        formData,
        updateFormData,
        paymentData,
        updatePaymentData,
        toggleAddOn,
        guests,
        setGuests,
        bookingDates,
        setBookingDates,
        selectedAddOns,
        addOnsTotal,
        nights,
        loading: bookingLoading,
        handleNextStep,
        handlePrevStep,
        createBooking,
        ADD_ONS
    } = useBooking(roomId);

    // Initial state from location (passed from RoomDetail)
    useEffect(() => {
        if (location.state?.dates) {
            setBookingDates(location.state.dates);
        }
        if (location.state?.guests) {
            setGuests(location.state.guests);
        }
    }, [location.state, setBookingDates, setGuests]);

    if (roomLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
        </div>
    );

    if (roomError || !room) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-2xl font-serif mb-4 text-red-500">{t('booking.notAvailable')}</h2>
            <p className="opacity-60 mb-8">{roomError || 'Failed to load room details.'}</p>
            <Button onClick={() => navigate('/rooms')}>
                {t('rooms_listing.clearAll')}
            </Button>
        </div>
    );

    const roomPrice = room.price || 0;
    const totalPrice = (roomPrice * nights) + addOnsTotal;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8 flex justify-start">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-[var(--glass-border)] bg-[var(--color-secondary)] hover:border-[var(--color-accent)]/50 transition-all duration-300 group shadow-lg"
                    onClick={() => navigate(-1)}
                    aria-label={t('ui.back')}
                >
                    <ArrowLeft size={20} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors" />
                </Button>
            </div>

            <header className="mb-8 text-center">
                <h1 className="text-4xl font-serif mb-4">{t('nav.bookNow')}</h1>
                <p className="opacity-60 max-w-2xl mx-auto mb-8">
                    {t('booking.securePayment')}
                </p>
                <BookingStepper currentStep={step} />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <BookingForm
                                    step={step}
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    toggleAddOn={toggleAddOn}
                                    onNext={handleNextStep}
                                    addOnsData={ADD_ONS}
                                />
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <PaymentMethod
                                    paymentData={paymentData}
                                    updatePaymentData={updatePaymentData}
                                    onBack={handlePrevStep}
                                    onConfirm={() => createBooking(roomPrice)}
                                    loading={bookingLoading}
                                    totalPrice={totalPrice}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="lg:col-span-1">
                    <BookingSummary
                        room={room}
                        dates={bookingDates}
                        guests={{ adults: guests, children: 0 }}
                        addOns={selectedAddOns}
                        totalPrice={totalPrice}
                        nights={nights}
                    />
                </div>
            </div>
        </div>
    );
};

export default Booking;
