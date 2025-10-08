import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchInstallmentsByPlan = createAsyncThunk(
  'installments/fetchByPlan',
  async (planId, { rejectWithValue }) => {
    try {
      // Fetch the plan which includes installments
      const response = await api.get(`/api/master/plans/${planId}`);
      const planData = response.data?.data || response.data;
      // Return the installments array from the plan
      return planData?.installments || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch installments');
    }
  }
);

export const fetchInstallmentById = createAsyncThunk(
  'installments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/master/installments/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch installment');
    }
  }
);

export const createInstallment = createAsyncThunk(
  'installments/create',
  async ({ planId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/master/plans/${planId}/installments`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create installment');
    }
  }
);

export const updateInstallment = createAsyncThunk(
  'installments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/master/installments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update installment');
    }
  }
);

export const deleteInstallment = createAsyncThunk(
  'installments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/master/installments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete installment');
    }
  }
);

const installmentsSlice = createSlice({
  name: 'installments',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    planId: null,
  },
  reducers: {
    setPlanId: (state, action) => {
      state.planId = action.payload;
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
      .addCase(fetchInstallmentsByPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstallmentsByPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInstallmentsByPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInstallmentById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createInstallment.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateInstallment.fulfilled, (state, action) => {
        const index = state.list.findIndex(i => i.installment_id === action.payload.installment_id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteInstallment.fulfilled, (state, action) => {
        state.list = state.list.filter(i => i.installment_id !== action.payload);
      });
  },
});

export const { setPlanId, clearCurrent, clearError } = installmentsSlice.actions;
export default installmentsSlice.reducer;
