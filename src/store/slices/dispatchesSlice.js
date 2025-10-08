import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all dispatches
export const fetchDispatches = createAsyncThunk(
  'dispatches/fetchDispatches',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.customer_type) params.append('customer_type', filters.customer_type);
      if (filters.letter_type) params.append('letter_type', filters.letter_type);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/transaction/dispatches?${params.toString()}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch dispatches');
    }
  }
);

// Create new dispatch
export const createDispatch = createAsyncThunk(
  'dispatches/createDispatch',
  async (dispatchData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/transaction/dispatches', dispatchData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create dispatch');
    }
  }
);

// Fetch dispatch by ID
export const fetchDispatchById = createAsyncThunk(
  'dispatches/fetchDispatchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/dispatches/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch dispatch');
    }
  }
);

// Update dispatch
export const updateDispatch = createAsyncThunk(
  'dispatches/updateDispatch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/dispatches/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update dispatch');
    }
  }
);

// Delete dispatch
export const deleteDispatch = createAsyncThunk(
  'dispatches/deleteDispatch',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/transaction/dispatches/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete dispatch');
    }
  }
);

// Add items to dispatch (for future use if needed)
export const addDispatchItems = createAsyncThunk(
  'dispatches/addDispatchItems',
  async ({ id, items }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/transaction/dispatches/${id}/items`, { items });
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to add dispatch items');
    }
  }
);

// Fetch dispatches by project
export const fetchDispatchesByProject = createAsyncThunk(
  'dispatches/fetchDispatchesByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/projects/${projectId}/dispatches`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch project dispatches');
    }
  }
);

// Fetch dispatches by customer
export const fetchDispatchesByCustomer = createAsyncThunk(
  'dispatches/fetchDispatchesByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/customer-dispatches?customer_id=${customerId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch customer dispatches');
    }
  }
);

const dispatchesSlice = createSlice({
  name: 'dispatches',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      customer_type: null,
      letter_type: null,
      project_id: null,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        customer_type: null,
        letter_type: null,
        project_id: null,
      };
    },
    clearCurrentDispatch: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dispatches
      .addCase(fetchDispatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatches.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDispatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create dispatch
      .addCase(createDispatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDispatch.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createDispatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch dispatch by ID
      .addCase(fetchDispatchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatchById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchDispatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update dispatch
      .addCase(updateDispatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDispatch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(d => d.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateDispatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete dispatch
      .addCase(deleteDispatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDispatch.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(d => d.id !== action.payload);
      })
      .addCase(deleteDispatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add dispatch items
      .addCase(addDispatchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDispatchItems.fulfilled, (state, action) => {
        state.loading = false;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(addDispatchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch dispatches by project
      .addCase(fetchDispatchesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatchesByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDispatchesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch dispatches by customer
      .addCase(fetchDispatchesByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatchesByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDispatchesByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearCurrentDispatch, 
  clearError 
} = dispatchesSlice.actions;

export default dispatchesSlice.reducer;
