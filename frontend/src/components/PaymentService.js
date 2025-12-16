import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const paymentService = {

  createOrder: async (bookingId, amount) => {
    try {
      const response = await api.post('/payments/create-order', {
        bookingId,
        amount
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create order failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create payment order' 
      };
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/verify-payment', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Payment verification failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Payment verification failed' 
      };
    }
  },


  getPaymentStatus: async (bookingId) => {
    try {
      const response = await api.get(`/payments/booking/${bookingId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get payment status failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get payment status' 
      };
    }
  }
};