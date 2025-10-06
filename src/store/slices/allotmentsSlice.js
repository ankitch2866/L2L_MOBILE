import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all allotments
export const fetchAllotments = createAsyncThunk(
  'allotments/fetchAllotments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.status) params.append('status', filters.status);
      
      const response = await api.get(`/transaction/allotments?${params.toString()}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch allotments');
    }
  }
);

// Create new allotment
export const createAllotment = createAsyncThunk(
  'allotments/createAllotment',
  async (allotmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transaction/allotments', allotmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create allotment');
    }
  }
);

// Fetch allotment by ID
export const fetchAllotmentById = createAsyncThunk(
  'allotments/fetchAllotmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transaction/allotments/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch allotment');
    }
  }
);

// Update allotment
export const updateAllotment = createAsyncThunk(
  'allotments/updateAllotment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transaction/allotments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update allotment');
    }
  }
);

// Delete allotment
export const deleteAllotment = createAsyncThunk(
  'allotments/deleteAllotment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transaction/allotments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete allotment');
    }
  }
);

// Generate allotment letter
export const generateLetter = createAsyncThunk(
  'allotments/generateLetter',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transaction/allotments/${id}/letter`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to generate letter');
    }
  }
);

const allotmentsSlice = createSlice({
  name: 'allotments',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      project_id: null,
      customer_id: null,
      status: null,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        project_id: null,
        customer_id: null,
        status: null,
      };
    },
    clearCurrentAllotment: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch allotments
      .addCase(fetchAllotments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllotments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllotments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create allotment
      .addCase(createAllotment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAllotment.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createAllotment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch allotment by ID
      .addCase(fetchAllotmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllotmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchAllotmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update allotment
      .addCase(updateAllotment.fulfilled, (state, action) => {
        const index = state.list.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      // Delete allotment
      .addCase(deleteAllotment.fulfilled, (state, action) => {
        state.list = state.list.filter(a => a.id !== action.payload);
      })
      // Generate letter
      .addCase(generateLetter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateLetter.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateLetter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearCurrentAllotment, 
  clearError 
} = allotmentsSlice.actions;

export default allotmentsSlice.reducer;
