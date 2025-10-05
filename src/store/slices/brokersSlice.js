import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchBrokers = createAsyncThunk(
  'brokers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/master/brokers');
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch brokers');
    }
  }
);

export const fetchBrokerById = createAsyncThunk(
  'brokers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/master/brokers/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch broker');
    }
  }
);

export const createBroker = createAsyncThunk(
  'brokers/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/master/brokers', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create broker');
    }
  }
);

export const updateBroker = createAsyncThunk(
  'brokers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/master/brokers/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update broker');
    }
  }
);

export const deleteBroker = createAsyncThunk(
  'brokers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/master/brokers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete broker');
    }
  }
);

export const checkBrokerUsage = createAsyncThunk(
  'brokers/checkUsage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/master/brokers/${id}/usage`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to check broker usage');
    }
  }
);

const brokersSlice = createSlice({
  name: 'brokers',
  initialState: {
    list: [],
    current: null,
    usage: null,
    loading: false,
    error: null,
    searchQuery: '',
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCurrent: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUsage: (state) => {
      state.usage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrokers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrokers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBrokers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBrokerById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createBroker.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateBroker.fulfilled, (state, action) => {
        const index = state.list.findIndex(b => b.broker_id === action.payload.broker_id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteBroker.fulfilled, (state, action) => {
        state.list = state.list.filter(b => b.broker_id !== action.payload);
      })
      .addCase(checkBrokerUsage.fulfilled, (state, action) => {
        state.usage = action.payload;
      });
  },
});

export const { setSearchQuery, clearCurrent, clearError, clearUsage } = brokersSlice.actions;
export default brokersSlice.reducer;
