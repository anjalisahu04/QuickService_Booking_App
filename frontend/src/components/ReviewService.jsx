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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const reviewService = {
  // Test backend connection
  testConnection: async () => {
    try {
      const response = await api.get('/reviews/test');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Submit review
  submitReview: async (reviewData) => {
    try {
      console.log('Submitting review:', reviewData);
      const response = await api.post('/reviews', reviewData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Review submission failed:', error);
      
      if (error.response) {
        // Server responded with error status
        return { 
          success: false, 
          error: error.response.data?.message || `Server error: ${error.response.status}` 
        };
      } else if (error.request) {
        // No response received
        return { success: false, error: 'No response from server. Please check your connection.' };
      } else {
        // Other errors
        return { success: false, error: error.message || 'An unexpected error occurred.' };
      }
    }
  },

  // Get provider reviews
  getProviderReviews: async (providerId) => {
    try {
      const response = await api.get(`/reviews/provider/${providerId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get provider reviews failed:', error);
      // return { success: false, error: error.message };
          try {
        console.log('Trying debug endpoint...');
        const debugResponse = await api.get(`/reviews/provider/${providerId}/test`);
        console.log('Debug endpoint response:', debugResponse.data);
        return { 
          success: true, 
          data: { 
            reviews: debugResponse.data.reviews || [],
            providerId: providerId,
            debug: true 
          } 
        };
      } catch (debugError) {
        console.error('Debug endpoint also failed:', debugError);
        
        if (error.response) {
          return { 
            success: false, 
            error: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}` 
          };
        } else if (error.request) {
          return { success: false, error: 'No response from server. Please check if backend is running on port 8080.' };
        } else {
          return { success: false, error: error.message || 'An unexpected error occurred.' };
        }
      }
    }
  },
  canUserReviewBooking: async (bookingId) => {
    try {
      const response = await api.get(`/reviews/can-review/${bookingId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Check review eligibility failed:', error);
      return { success: false, error: error.message };
    }
  }
};