// src/services/addressService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/addresses';


const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  return {
    'Authorization': `Bearer ${token}`
  };
};

export const addressService = {
  // Get all addresses for user
  getAddresses: async () => {
    try {
      const response = await axios.get(API_URL, { 
        headers: getAuthHeaders() 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    try {
      const response = await axios.post(API_URL, addressData, { 
        headers: getAuthHeaders() 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await axios.put(`${API_URL}/${addressId}`, addressData, { 
        headers: getAuthHeaders() 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const response = await axios.delete(`${API_URL}/${addressId}`, { 
        headers: getAuthHeaders() 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    try {
      const response = await axios.post(
        `${API_URL}/${addressId}/set-default`, 
        {}, 
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};