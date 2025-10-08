import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchCoApplicants = createAsyncThunk(
  'coApplicants/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/master/co-applicants');
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch co-applicants');
    }
  }
);

export const fetchCoApplicantsByCustomer = createAsyncThunk(
  'coApplicants/fetchByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/master/co-applicants/search', {
        params: { customer_id: customerId, page: 1, limit: 20 }
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch co-applicants');
    }
  }
);

export const fetchCoApplicantById = createAsyncThunk(
  'coApplicants/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/master/co-applicants/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch co-applicant');
    }
  }
);

export const createCoApplicant = createAsyncThunk(
  'coApplicants/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/master/co-applicants', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create co-applicant');
    }
  }
);

export const updateCoApplicant = createAsyncThunk(
  'coApplicants/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/master/co-applicants/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update co-applicant');
    }
  }
);

export const deleteCoApplicant = createAsyncThunk(
  'coApplicants/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/master/co-applicants/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete co-applicant');
    }
  }
);

const coApplicantsSlice = createSlice({
  name: 'coApplicants',
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
      .addCase(fetchCoApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCoApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCoApplicantsByCustomer.fulfilled, (state, action) => {
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCoApplicantById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createCoApplicant.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateCoApplicant.fulfilled, (state, action) => {
        const index = state.list.findIndex(c => c.co_applicant_id === action.payload.co_applicant_id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteCoApplicant.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c.co_applicant_id !== action.payload);
      });
  },
});

export const { setSearchQuery, clearCurrent, clearError } = coApplicantsSlice.actions;
export default coApplicantsSlice.reducer;
