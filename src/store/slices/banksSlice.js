import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchBanks = createAsyncThunk(
  'banks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/master/banks');
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch banks');
    }
  }
);

export const fetchBankById = createAsyncThunk(
  'banks/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/master/banks/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bank');
    }
  }
);

export const createBank = createAsyncThunk(
  'banks/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/master/banks', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create bank');
    }
  }
);

export const updateBank = createAsyncThunk(
  'banks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/master/banks/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update bank');
    }
  }
);

export const deleteBank = createAsyncThunk(
  'banks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/master/banks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete bank');
    }
  }
);

export const searchBanks = createAsyncThunk(
  'banks/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/master/banks/search', { params: { q: query } });
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to search banks');
    }
  }
);

const banksSlice = createSlice({
  name: 'banks',
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
      .addCase(fetchBanks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBankById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createBank.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateBank.fulfilled, (state, action) => {
        const index = state.list.findIndex(b => b.bank_id === action.payload.bank_id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteBank.fulfilled, (state, action) => {
        state.list = state.list.filter(b => b.bank_id !== action.payload);
      })
      .addCase(searchBanks.fulfilled, (state, action) => {
        state.list = Array.isArray(action.payload) ? action.payload : [];
      });
  },
});

export const { setSearchQuery, clearCurrent, clearError } = banksSlice.actions;
export default banksSlice.reducer;
