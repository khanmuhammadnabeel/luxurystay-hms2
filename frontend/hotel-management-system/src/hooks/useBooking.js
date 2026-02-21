import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { useNotification } from '../contexts/NotificationContext';
import { useLocalization } from '../contexts/LocalizationContext';

export const ADD_ONS = [
    { id: 'breakfast', name: 'Breakfast', nameUr: 'ناشتہ', price: 25, description: 'Daily breakfast buffet' },
    { id: 'airport', name: 'Airport Transfer', nameUr: 'ایئرپورٹ ٹرانسفر', price: 50, description: 'Round trip' },
    { id: 'spa', name: 'Spa Access', nameUr: 'سپا تک رسائی', price: 75, description: 'One 60-min treatment' }
];

export const useBooking = (roomId) => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotification();
    const { t } = useLocalization();

    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation handled by route
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: '',
        addOns: [] // Array of add-on IDs
    });

    const [paymentData, setPaymentData] = useState({
        method: 'card', // card, paypal, hotel
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    const [guests, setGuests] = useState(2);
    const [bookingDates, setBookingDates] = useState({
        checkIn: null,
        checkOut: null
    });

    const selectedAddOns = useMemo(() => {
        return ADD_ONS.filter(addon => formData.addOns.includes(addon.id));
    }, [formData.addOns]);

    const addOnsTotal = useMemo(() => {
        return selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
    }, [selectedAddOns]);

    const nights = useMemo(() => {
        if (!bookingDates.checkIn || !bookingDates.checkOut) return 0;
        const start = new Date(bookingDates.checkIn);
        const end = new Date(bookingDates.checkOut);

        // Reset hours to midnight for accurate day difference
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffTime = end - start;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }, [bookingDates.checkIn, bookingDates.checkOut]);

    const updateFormData = useCallback((updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    const updatePaymentData = useCallback((updates) => {
        setPaymentData(prev => ({ ...prev, ...updates }));
    }, []);

    const toggleAddOn = useCallback((addonId) => {
        setFormData(prev => {
            const isSelected = prev.addOns.includes(addonId);
            const newAddOns = isSelected
                ? prev.addOns.filter(id => id !== addonId)
                : [...prev.addOns, addonId];
            return { ...prev, addOns: newAddOns };
        });
    }, []);

    const handleNextStep = useCallback(() => {
        setStep(prev => Math.min(prev + 1, 2));
    }, []);

    const handlePrevStep = useCallback(() => {
        setStep(prev => Math.max(prev - 1, 1));
    }, []);

    const createBooking = async (roomPricePerNight) => {
        setLoading(true);
        setError(null);
        try {
            const totalAmount = addOnsTotal + (roomPricePerNight * nights);

            // 1. Check availability again just in case
            const isAvailable = await bookingService.checkRoomAvailability(
                roomId,
                bookingDates.checkIn,
                bookingDates.checkOut
            );

            // Unwrap the API response — backend returns { success, data: { available, ... } }
            const available = isAvailable?.data?.available ?? isAvailable?.available ?? true;
            if (!available) {
                throw new Error(t('booking.notAvailable'));
            }

            // Payment is simulated — no real payment gateway in this build.
            // If a gateway is added later, replace this block.
            if (paymentData.method === 'card') {
                // Basic client-side validation already enforced in PaymentMethod.jsx
                // (cardNumber and cardName must be non-empty to enable the button)
                await new Promise(resolve => setTimeout(resolve, 600)); // simulate processing
            }

            // 3. Create Booking
            const bookingResult = await bookingService.createBooking({
                roomId,
                checkInDate: bookingDates.checkIn,
                checkOutDate: bookingDates.checkOut,
                guestName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                numberOfGuests: guests,
                specialRequests: formData.specialRequests,
                addOns: formData.addOns,
                totalAmount: totalAmount,
                paymentMethod: paymentData.method,
                paymentStatus: paymentData.method === 'hotel' ? 'pending' : 'paid'
            });

            showSuccess(t('booking.success'));
            navigate(`/booking/confirmation/${bookingResult.data.id || bookingResult.data._id}`);
        } catch (err) {
            const msg = err.message || 'Booking failed';
            setError(msg);
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        setStep,
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
        loading,
        error,
        handleNextStep,
        handlePrevStep,
        createBooking,
        ADD_ONS
    };
};
