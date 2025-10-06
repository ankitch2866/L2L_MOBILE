import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all payment queries
export const fetchPaymentQueries = createAsyncThunk(
  'paymentQueries/fetchPaymentQueries',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.installment_id) params.append('installment_id', filters.installment_id);
      if (filters.created_by) params.append('created_by', filters.created_by);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/transaction/payment-query?${params.toString()}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment queries');
    }
  }
);

// Generate/Create new payment query
export const generateQuery = createAsyncThunk(
  'paymentQueries/generateQuery',
  async (queryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transaction/payment-query', queryData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to generate payment query');
    }
  }
);

// Fetch payment query by ID
export const fetchQueryById = createAsyncThunk(
  'paymentQueries/fetchQueryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transaction/payment-query/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment query');
    }
  }
);

// Update payment query
export const updateQuery = createAsyncThunk(
  'paymentQueries/updateQuery',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transaction/payment-query/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update payment query');
    }
  }
);

// Delete payment query
export const deleteQuery = createAsyncThunk(
  'paymentQueries/deleteQuery',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transaction/payment-query/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete payment query');
    }
  }
);

// Fetch payment queries by project
export const fetchQueriesByProject = createAsyncThunk(
  'paymentQueries/fetchQueriesByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transaction/payment-query/project/${projectId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment queries by project');
    }
  }
);

const paymentQueriesSlice = createSlice({
  name: 'paymentQueries',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      project_id: null,
      installment_id: null,
      created_by: null,
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
        installment_id: null,
        created_by: null,
        page: 1,
        limit: 20,
      };
    },
    clearCurrentQuery: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment queries
      .addCase(fetchPaymentQueries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentQueries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPaymentQueries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate payment query
      .addCase(generateQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(generateQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch payment query by ID
      .addCase(fetchQueryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQueryById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchQueryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update payment query
      .addCase(updateQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuery.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(q => q.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete payment query
      .addCase(deleteQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(q => q.id !== action.payload);
      })
      .addCase(deleteQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch queries by project
      .addCase(fetchQueriesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQueriesByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchQueriesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearCurrentQuery, 
  clearError 
} = paymentQueriesSlice.actions;

export default paymentQueriesSlice.reducer;
