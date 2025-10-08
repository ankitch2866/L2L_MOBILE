import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all cheques
export const fetchCheques = createAsyncThunk(
  'cheques/fetchCheques',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.bank_id) params.append('bank_id', filters.bank_id);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/transaction/cheque/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch cheques');
    }
  }
);

// Create new cheque
export const createCheque = createAsyncThunk(
  'cheques/createCheque',
  async (chequeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/transaction/cheque', chequeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create cheque');
    }
  }
);

// Fetch cheque by ID
export const fetchChequeById = createAsyncThunk(
  'cheques/fetchChequeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/cheque/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch cheque');
    }
  }
);

// Update cheque
export const updateCheque = createAsyncThunk(
  'cheques/updateCheque',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/cheque/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update cheque');
    }
  }
);

// Send cheque to bank
export const sendToBank = createAsyncThunk(
  'cheques/sendToBank',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/cheque/${id}/send-to-bank`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to send cheque to bank');
    }
  }
);

// Update cheque feedback (cleared/bounced)
export const updateFeedback = createAsyncThunk(
  'cheques/updateFeedback',
  async ({ id, feedback }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/cheque/${id}/bank-feedback`, feedback);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update cheque feedback');
    }
  }
);

// Fetch cheque statistics
export const fetchStatistics = createAsyncThunk(
  'cheques/fetchStatistics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.project_id) params.append('project_id', filters.project_id);
      
      const response = await api.get(`/api/transaction/cheque/dashboard?${params.toString()}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch statistics');
    }
  }
);

const chequesSlice = createSlice({
  name: 'cheques',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      status: null,
      bank_id: null,
      customer_id: null,
      date_from: null,
      date_to: null,
      search: '',
      page: 1,
      limit: 20,
    },
    statistics: {
      total_count: 0,
      pending_count: 0,
      submitted_count: 0,
      cleared_count: 0,
      bounced_count: 0,
      cancelled_count: 0,
      total_amount: 0,
      cleared_amount: 0,
      pending_amount: 0,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        bank_id: null,
        customer_id: null,
        date_from: null,
        date_to: null,
        search: '',
        page: 1,
        limit: 20,
      };
    },
    clearCurrentCheque: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocalStatistics: (state) => {
      const cheques = state.list;
      const stats = {
        total_count: cheques.length,
        pending_count: 0,
        submitted_count: 0,
        cleared_count: 0,
        bounced_count: 0,
        cancelled_count: 0,
        total_amount: 0,
        cleared_amount: 0,
        pending_amount: 0,
      };
      
      cheques.forEach(cheque => {
        const amount = parseFloat(cheque.amount) || 0;
        stats.total_amount += amount;
        
        switch (cheque.status?.toLowerCase()) {
          case 'pending':
            stats.pending_count++;
            stats.pending_amount += amount;
            break;
          case 'submitted':
          case 'sent to bank':
            stats.submitted_count++;
            stats.pending_amount += amount;
            break;
          case 'cleared':
            stats.cleared_count++;
            stats.cleared_amount += amount;
            break;
          case 'bounced':
          case 'bounce':
            stats.bounced_count++;
            break;
          case 'cancelled':
            stats.cancelled_count++;
            break;
          default:
            stats.pending_count++;
            stats.pending_amount += amount;
        }
      });
      
      state.statistics = stats;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cheques
      .addCase(fetchCheques.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheques.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && !Array.isArray(action.payload)) {
          // Handle paginated response
          state.list = action.payload.data || [];
          state.pagination = action.payload.pagination || state.pagination;
          state.statistics = action.payload.statistics || state.statistics;
        } else {
          // Handle array response (legacy)
          state.list = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchCheques.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create cheque
      .addCase(createCheque.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheque.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createCheque.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch cheque by ID
      .addCase(fetchChequeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChequeById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchChequeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update cheque
      .addCase(updateCheque.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCheque.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(c => c.cheque_id === action.payload.cheque_id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.cheque_id === action.payload.cheque_id) {
          state.current = action.payload;
        }
      })
      .addCase(updateCheque.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send to bank
      .addCase(sendToBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendToBank.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(c => c.cheque_id === action.payload.cheque_id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.cheque_id === action.payload.cheque_id) {
          state.current = action.payload;
        }
      })
      .addCase(sendToBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update feedback
      .addCase(updateFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(c => c.cheque_id === action.payload.cheque_id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.cheque_id === action.payload.cheque_id) {
          state.current = action.payload;
        }
      })
      .addCase(updateFeedback.rejected, (state, action) => {
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
  clearCurrentCheque, 
  clearError,
  updateLocalStatistics 
} = chequesSlice.actions;

export default chequesSlice.reducer;
