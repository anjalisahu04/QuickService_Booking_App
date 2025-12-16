import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const bookingService = {
  // Test authentication first
  testAuth: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error('Authentication failed: ' + (error.response?.data?.message || 'Please login again'));
    }
  },

  createBooking: async (bookingData) => {
    try {
      // Test auth first
      await bookingService.testAuth();
      
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Booking creation error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create booking. Please try again.');
    }
  },

  getUserBookings: async () => {
    try {
      // Test auth first
      await bookingService.testAuth();
      
      const response = await api.get('/bookings/user');
      return response.data;
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to load your bookings. Please try again.');
    }
  },

  getUserBooking: async (bookingId) => {
    try {
      // Test auth first
      await bookingService.testAuth();
      
      const response = await api.get(`/bookings/user/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get user booking error:', error);
      throw new Error(error.response?.data?.message || 'Failed to load booking details.');
    }
  },

  getProviderBookings: async () => {
    try {
      // Test auth first
      await bookingService.testAuth();
      
      const response = await api.get('/bookings/provider');
      return response.data;
    } catch (error) {
      console.error('Get provider bookings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to load service requests. Please check if you are logged in as a provider.');
    }
  },

  getProviderBookingsByStatus: async (status) => {
    try {
      // Test auth first
      await bookingService.testAuth();
      
      const response = await api.get(`/bookings/provider/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Get provider bookings by status error:', error);
      throw new Error(error.response?.data?.message || 'Failed to load service requests.');
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      // Test auth first
      await bookingService.testAuth();
      
      const response = await api.put(`/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update booking status error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update booking status.');
    }
  },
  getUserBookingsWithReviews: async () => {
  try {
    // Test auth first
    await bookingService.testAuth();
    
    const response = await api.get('/bookings/user-with-reviews');
    return response.data;
  } catch (error) {
    console.error('Get user bookings with reviews error:', error);
    throw new Error(error.response?.data?.message || 'Failed to load your bookings. Please try again.');
  }
}
};