import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchStocks = createAsyncThunk(
  'stocks/fetchAll',
  async ({ search, project_id } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (project_id) params.project = project_id;
      
      const response = await api.get('/api/master/stock/stocklist', { params });
      return response.data?.data || response.data || { stocks: [], projects: [], units: [], brokers: [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stocks');
    }
  }
);

export const fetchStockById = createAsyncThunk(
  'stocks/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/master/stocks/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stock');
    }
  }
);

export const createStock = createAsyncThunk(
  'stocks/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/master/stocks', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create stock');
    }
  }
);

export const updateStock = createAsyncThunk(
  'stocks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/master/stocks/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update stock');
    }
  }
);

export const deleteStock = createAsyncThunk(
  'stocks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/master/stocks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete stock');
    }
  }
);

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    filters: {
      project_id: null,
      status: null,
      search: '',
    },
    projects: [],
    units: [],
    brokers: [],
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        project_id: null,
        status: null,
        search: '',
      };
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
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload.stocks) ? action.payload.stocks : [];
        state.projects = Array.isArray(action.payload.projects) ? action.payload.projects : [];
        state.units = Array.isArray(action.payload.units) ? action.payload.units : [];
        state.brokers = Array.isArray(action.payload.brokers) ? action.payload.brokers : [];
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStockById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchStockById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createStock.fulfilled, (state, action) => {
        if (action.payload) {
          state.list.unshift(action.payload);
        }
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const index = state.list.findIndex(s => s.stock_id === action.payload.stock_id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current?.stock_id === action.payload.stock_id) {
          state.current = action.payload;
        }
      })
      .addCase(deleteStock.fulfilled, (state, action) => {
        state.list = state.list.filter(s => s.stock_id !== action.payload);
        if (state.current?.stock_id === action.payload) {
          state.current = null;
        }
      });
  },
});

export const { setFilters, clearFilters, clearCurrent, clearError } = stocksSlice.actions;
export default stocksSlice.reducer;
