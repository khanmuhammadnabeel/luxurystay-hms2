import { useState, useCallback, useEffect } from 'react';
import guestService from '../services/guestService';

export const useGuest = () => {
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [loading, setLoading] = useState({});
    const [errors, setErrors] = useState({});

    const setModuleLoading = (module, value) => {
        setLoading(prev => ({ ...prev, [module]: value }));
    };

    const setModuleError = (module, value) => {
        setErrors(prev => ({ ...prev, [module]: value }));
    };

    // Fetch Profile
    const fetchProfile = useCallback(async () => {
        setModuleLoading('profile', true);
        try {
            const response = await guestService.getProfile();
            if (response.success) {
                setProfile(response.data);
            }
        } catch (err) {
            setModuleError('profile', err.message);
        } finally {
            setModuleLoading('profile', false);
        }
    }, []);

    // Fetch Bookings
    const fetchBookings = useCallback(async (status) => {
        setModuleLoading('bookings', true);
        try {
            const response = await guestService.getMyBookings(status);
            if (response.success) {
                setBookings(response.data);
            }
        } catch (err) {
            setModuleError('bookings', err.message);
        } finally {
            setModuleLoading('bookings', false);
        }
    }, []);

    // Fetch Invoices
    const fetchInvoices = useCallback(async (status) => {
        setModuleLoading('invoices', true);
        try {
            const response = await guestService.getMyInvoices(status);
            if (response.success) {
                setInvoices(response.data);
            }
        } catch (err) {
            setModuleError('invoices', err.message);
        } finally {
            setModuleLoading('invoices', false);
        }
    }, []);

    // Fetch Service Requests
    const fetchServiceRequests = useCallback(async (status) => {
        setModuleLoading('requests', true);
        try {
            const response = await guestService.getMyServiceRequests(status);
            if (response.success) {
                setServiceRequests(response.data);
            }
        } catch (err) {
            setModuleError('requests', err.message);
        } finally {
            setModuleLoading('requests', false);
        }
    }, []);

    // Update Profile
    const updateProfile = async (data) => {
        setModuleLoading('profileUpdate', true);
        try {
            const response = await guestService.updateProfile(data);
            if (response.success) {
                setProfile(response.data);
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setModuleLoading('profileUpdate', false);
        }
    };

    // Update Avatar
    const updateAvatar = async (url) => {
        setModuleLoading('avatarUpdate', true);
        try {
            const response = await guestService.updateAvatar(url);
            if (response.success) {
                setProfile(prev => ({ ...prev, avatar: url }));
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setModuleLoading('avatarUpdate', false);
        }
    };

    return {
        profile,
        bookings,
        invoices,
        serviceRequests,
        loading,
        errors,
        fetchProfile,
        fetchBookings,
        fetchInvoices,
        fetchServiceRequests,
        updateProfile,
        updateAvatar
    };
};

export default useGuest;
