// API Configuration
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT: Update this with your computer's local IP address
// Find your IP:
// - Mac/Linux: Run in terminal: ifconfig | grep "inet " | grep -v 127.0.0.1
// - Windows: Run in terminal: ipconfig
// 
// Example: 'http://192.168.1.100:5002/api'
// DO NOT use 'localhost' - it won't work on mobile devices!

//export const API_BASE_URL = 'http://192.168.1.62:5002'; // ✅ Updated with your IP!
export const API_BASE_URL = 'https://l2leprbackv2-production.up.railway.app'; // Production server

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request logging for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    // List of optional endpoints that may not exist - don't log 404 errors for these
    const optionalEndpoints = [
      '/generate-allotment',
      '/api/master/documents/customer/',
      '/api/transaction/unit-transfer/co-applicants/',
      '/api/transaction/customers/',
      '/feedbacks',
    ];
    
    // Check if this is a 404 error for an optional endpoint
    const isOptionalEndpoint404 = error.response?.status === 404 && 
                                   optionalEndpoints.some(endpoint => 
                                     error.config?.url?.includes(endpoint)
                                   );
    
    // Only log errors that are not expected 404s for optional endpoints
    if (!isOptionalEndpoint404) {
      console.error('API Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigate to login screen (will be handled by navigation)
    }
    return Promise.reject(error);
  }
);

export default api;
