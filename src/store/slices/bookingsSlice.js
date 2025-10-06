import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all bookings
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      
      const response = await api.get(`/transaction/bookings?${params.toString()}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch bookings');
    }
  }
);

// Create new booking
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transaction/bookings', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create booking');
    }
  }
);

// Fetch booking by ID
export const fetchBookingById = createAsyncThunk(
  'bookings/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transaction/bookings/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch booking');
    }
  }
);

// Update booking
export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transaction/bookings/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update booking');
    }
  }
);

// Delete booking
export const deleteBooking = createAsyncThunk(
  'bookings/deleteBooking',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transaction/bookings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete booking');
    }
  }
);

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/transaction/bookings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update booking status');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      status: null,
      project_id: null,
      customer_id: null,
    },
    statistics: {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        project_id: null,
        customer_id: null,
      };
    },
    clearCurrentBooking: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStatistics: (state) => {
      const bookings = state.list;
      state.statistics = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
        // Auto-update statistics
        const bookings = state.list;
        state.statistics = {
          total: bookings.length,
          pending: bookings.filter(b => b.status === 'pending').length,
          confirmed: bookings.filter(b => b.status === 'confirmed').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length,
        };
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch booking by ID
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update booking
      .addCase(updateBooking.fulfilled, (state, action) => {
        const index = state.list.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      // Delete booking
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.list = state.list.filter(b => b.id !== action.payload);
      })
      // Update booking status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearCurrentBooking, 
  clearError,
  updateStatistics 
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
