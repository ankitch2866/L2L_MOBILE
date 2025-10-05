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

export const API_BASE_URL = 'http://192.168.1.27:5002'; // ✅ Updated with your IP!
//export const API_BASE_URL = 'https://l2leprbackv2-production.up.railway.app'; // ✅ Updated with your IP!

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (response) => response,
  async (error) => {
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
