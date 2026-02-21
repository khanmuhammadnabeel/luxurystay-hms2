import api from './api';

const guestService = {
    // Profile
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (data) => api.put('/api/users/profile', data),
    updateAvatar: (avatarUrl) => api.post('/api/users/avatar', { avatarUrl }),

    // Bookings
    getMyBookings: (status) => api.get('/api/bookings/my', { params: { status } }),
    getBookingDetails: (id) => api.get(`/api/bookings/${id}`),
    cancelBooking: (id) => api.delete(`/api/bookings/${id}`),

    // Invoices
    getMyInvoices: (status) => api.get('/api/invoices/my', { params: { status } }),
    getInvoiceDetails: (id) => api.get(`/api/invoices/${id}`),

    // Service Requests
    getMyServiceRequests: (status) => api.get('/api/services/my-requests', { params: { status } }),
    requestService: (data) => api.post('/api/services/request', data),

    // Feedback
    submitFeedback: (data) => api.post('/api/feedback', data),
    getMyReviews: () => api.get('/api/feedback/my-reviews'),
    submitComplaint: (data) => api.post('/api/feedback/complaints', data),
    getMyComplaints: () => api.get('/api/feedback/my-complaints'),
};

export default guestService;
