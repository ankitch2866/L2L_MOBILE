import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all payments
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      
      const response = await api.get(`/transaction/payments?${params.toString()}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payments');
    }
  }
);

// Create new payment
export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transaction/payments', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create payment');
    }
  }
);

// Fetch payment by ID
export const fetchPaymentById = createAsyncThunk(
  'payments/fetchPaymentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transaction/payments/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment');
    }
  }
);

// Update payment
export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transaction/payments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update payment');
    }
  }
);

// Delete payment
export const deletePayment = createAsyncThunk(
  'payments/deletePayment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transaction/payments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete payment');
    }
  }
);

// Fetch customer payments
export const fetchCustomerPayments = createAsyncThunk(
  'payments/fetchCustomerPayments',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transaction/payments/customer/${customerId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch customer payments');
    }
  }
);

// Create credit payment
export const createCreditPayment = createAsyncThunk(
  'payments/createCreditPayment',
  async (creditData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transaction/payments/credit', creditData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create credit payment');
    }
  }
);

// Fetch payment statistics
export const fetchStatistics = createAsyncThunk(
  'payments/fetchStatistics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.project_id) params.append('project_id', filters.project_id);
      
      const response = await api.get(`/transaction/payments/statistics?${params.toString()}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch statistics');
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      customer_id: null,
      project_id: null,
      payment_method: null,
      date_from: null,
      date_to: null,
    },
    statistics: {
      total_amount: 0,
      total_count: 0,
      by_method: {},
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        customer_id: null,
        project_id: null,
        payment_method: null,
        date_from: null,
        date_to: null,
      };
    },
    clearCurrentPayment: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocalStatistics: (state) => {
      const payments = state.list;
      const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const byMethod = payments.reduce((acc, p) => {
        const method = p.payment_method || 'unknown';
        acc[method] = (acc[method] || 0) + (parseFloat(p.amount) || 0);
        return acc;
      }, {});
      
      state.statistics = {
        total_amount: totalAmount,
        total_count: payments.length,
        by_method: byMethod,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch payment by ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete payment
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(p => p.id !== action.payload);
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch customer payments
      .addCase(fetchCustomerPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCustomerPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create credit payment
      .addCase(createCreditPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCreditPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createCreditPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearCurrentPayment, 
  clearError,
  updateLocalStatistics 
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
