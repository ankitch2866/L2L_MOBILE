import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all BBAs
export const fetchBBAs = createAsyncThunk(
  'bba/fetchBBAs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.project_id) params.append('project_id', filters.project_id);
      
      const response = await api.get(`/api/bba/records?${params.toString()}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch BBAs');
    }
  }
);

// Create new BBA
export const createBBA = createAsyncThunk(
  'bba/createBBA',
  async (bbaData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/bba/records', bbaData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create BBA');
    }
  }
);

// Fetch BBA by ID
export const fetchBBAById = createAsyncThunk(
  'bba/fetchBBAById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/bba/records/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch BBA');
    }
  }
);

// Update BBA
export const updateBBA = createAsyncThunk(
  'bba/updateBBA',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/bba/records/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update BBA');
    }
  }
);

// Update BBA status
export const updateStatus = createAsyncThunk(
  'bba/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/bba/records/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update BBA status');
    }
  }
);

// Verify BBA
export const verifyBBA = createAsyncThunk(
  'bba/verifyBBA',
  async ({ id, verificationData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/bba/records/${id}/verify`, verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to verify BBA');
    }
  }
);

// Auto-verify BBAs
export const autoVerify = createAsyncThunk(
  'bba/autoVerify',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/bba/records/auto-verify');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to auto-verify BBAs');
    }
  }
);

// Auto-update BBA statuses
export const autoStatusUpdate = createAsyncThunk(
  'bba/autoStatusUpdate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/bba/records/auto-status-update');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to auto-update BBA statuses');
    }
  }
);

// Fetch BBA statistics
export const fetchStatistics = createAsyncThunk(
  'bba/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/bba/records/statistics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch BBA statistics');
    }
  }
);

const bbaSlice = createSlice({
  name: 'bba',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      status: null,
      customer_id: null,
      project_id: null,
    },
    statistics: {
      pending: 0,
      verified: 0,
      completed: 0,
      total: 0,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        customer_id: null,
        project_id: null,
      };
    },
    clearCurrentBBA: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStatistics: (state) => {
      const bbas = state.list;
      state.statistics = {
        total: bbas.length,
        pending: bbas.filter(b => b.status === 'pending').length,
        verified: bbas.filter(b => b.is_verified === true || b.is_verified === 1).length,
        completed: bbas.filter(b => b.status === 'completed').length,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch BBAs
      .addCase(fetchBBAs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBBAs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
        // Auto-update statistics
        const bbas = state.list;
        state.statistics = {
          total: bbas.length,
          pending: bbas.filter(b => b.status === 'pending').length,
          verified: bbas.filter(b => b.is_verified === true || b.is_verified === 1).length,
          completed: bbas.filter(b => b.status === 'completed').length,
        };
      })
      .addCase(fetchBBAs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create BBA
      .addCase(createBBA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBBA.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createBBA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch BBA by ID
      .addCase(fetchBBAById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBBAById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchBBAById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update BBA
      .addCase(updateBBA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBBA.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateBBA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify BBA
      .addCase(verifyBBA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyBBA.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(verifyBBA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Auto-verify
      .addCase(autoVerify.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(autoVerify.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh list after auto-verify
        if (action.payload?.updated) {
          // Optionally update the list with returned data
        }
      })
      .addCase(autoVerify.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Auto-status update
      .addCase(autoStatusUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(autoStatusUpdate.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh list after auto-status update
        if (action.payload?.updated) {
          // Optionally update the list with returned data
        }
      })
      .addCase(autoStatusUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearCurrentBBA, 
  clearError,
  updateStatistics 
} = bbaSlice.actions;

export default bbaSlice.reducer;
