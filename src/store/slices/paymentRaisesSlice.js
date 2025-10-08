import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all payment raises
export const fetchPaymentRaises = createAsyncThunk(
  'paymentRaises/fetchPaymentRaises',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/transaction/raise-payment?${params.toString()}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment raises');
    }
  }
);

// Create new payment raise
export const createRaise = createAsyncThunk(
  'paymentRaises/createRaise',
  async (raiseData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/transaction/raise-payment', raiseData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create payment raise');
    }
  }
);

// Fetch payment raise by ID
export const fetchRaiseById = createAsyncThunk(
  'paymentRaises/fetchRaiseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/raise-payment/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment raise');
    }
  }
);

// Update payment raise
export const updateRaise = createAsyncThunk(
  'paymentRaises/updateRaise',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/raise-payment/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update payment raise');
    }
  }
);

// Update payment raise status
export const updateRaiseStatus = createAsyncThunk(
  'paymentRaises/updateRaiseStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/raise-payment/${id}/status`, { status });
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update payment raise status');
    }
  }
);

// Delete payment raise
export const deleteRaise = createAsyncThunk(
  'paymentRaises/deleteRaise',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/transaction/raise-payment/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete payment raise');
    }
  }
);

// Fetch payment raises by project
export const fetchRaisesByProject = createAsyncThunk(
  'paymentRaises/fetchRaisesByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/raise-payment?project_id=${projectId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment raises by project');
    }
  }
);

// Fetch payment raises by customer
export const fetchRaisesByCustomer = createAsyncThunk(
  'paymentRaises/fetchRaisesByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/raise-payment?customer_id=${customerId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment raises by customer');
    }
  }
);

const paymentRaisesSlice = createSlice({
  name: 'paymentRaises',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      project_id: null,
      customer_id: null,
      status: null,
      page: 1,
      limit: 20,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        project_id: null,
        customer_id: null,
        status: null,
        page: 1,
        limit: 20,
      };
    },
    clearCurrentRaise: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment raises
      .addCase(fetchPaymentRaises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentRaises.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPaymentRaises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create payment raise
      .addCase(createRaise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRaise.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createRaise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch payment raise by ID
      .addCase(fetchRaiseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRaiseById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchRaiseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update payment raise
      .addCase(updateRaise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRaise.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(r => r.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateRaise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update payment raise status
      .addCase(updateRaiseStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRaiseStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(r => r.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateRaiseStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete payment raise
      .addCase(deleteRaise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRaise.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(r => r.id !== action.payload);
      })
      .addCase(deleteRaise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch raises by project
      .addCase(fetchRaisesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRaisesByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRaisesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch raises by customer
      .addCase(fetchRaisesByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRaisesByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRaisesByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearCurrentRaise, 
  clearError 
} = paymentRaisesSlice.actions;

export default paymentRaisesSlice.reducer;
