import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchPLCs = createAsyncThunk(
  'plc/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/master/plcs');
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch PLCs');
    }
  }
);

export const fetchPLCById = createAsyncThunk(
  'plc/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/master/plcs/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch PLC');
    }
  }
);

export const createPLC = createAsyncThunk(
  'plc/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/master/plcs', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create PLC');
    }
  }
);

export const updatePLC = createAsyncThunk(
  'plc/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/master/plcs/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update PLC');
    }
  }
);

export const deletePLC = createAsyncThunk(
  'plc/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/master/plcs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete PLC');
    }
  }
);

const plcSlice = createSlice({
  name: 'plc',
  initialState: {
    list: [],
    current: null,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPLCs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPLCs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPLCs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPLCById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createPLC.fulfilled, (state, action) => {
        if (action.payload) {
          state.list.push(action.payload);
        }
      })
      .addCase(updatePLC.fulfilled, (state, action) => {
        const index = state.list.findIndex(p => p.plc_id === action.payload.plc_id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current?.plc_id === action.payload.plc_id) {
          state.current = action.payload;
        }
      })
      .addCase(deletePLC.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.plc_id !== action.payload);
        if (state.current?.plc_id === action.payload) {
          state.current = null;
        }
      });
  },
});

export const { setSearchQuery, clearCurrent, clearError } = plcSlice.actions;
export default plcSlice.reducer;
