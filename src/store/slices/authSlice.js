// Auth Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../config/api';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ userId, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { userId, password });
      
      // Save token and user to AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Login failed. Please try again.'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const token = await AsyncStorage.getItem('token');
  const userStr = await AsyncStorage.getItem('user');
  
  if (token && userStr) {
    return {
      token,
      user: JSON.parse(userStr),
    };
  }
  throw new Error('Not authenticated');
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
