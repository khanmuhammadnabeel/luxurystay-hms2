import api from './api';

export const paymentService = {
    getPaymentMethods: async () => {
        try {
            const response = await api.get('/api/payment/methods');
            return response.data || response;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            // Return default methods if API fails for now
            return ['Credit Card', 'PayPal', 'Pay at Hotel'];
        }
    },

    processPayment: async (paymentData) => {
        try {
            const response = await api.post('/api/payment/process', paymentData);
            return response.data || response;
        } catch (error) {
            const message = error?.response?.data?.message ?? error?.message ?? 'Payment failed';
            throw new Error(message);
        }
    }
};

export default paymentService;
