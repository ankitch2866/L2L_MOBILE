import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Async thunks
export const fetchPaymentPlans = createAsyncThunk(
  'paymentPlans/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/master/plans`);
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment plans');
    }
  }
);

export const fetchPaymentPlanById = createAsyncThunk(
  'paymentPlans/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/master/plans/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment plan');
    }
  }
);

export const addPaymentPlan = createAsyncThunk(
  'paymentPlans/add',
  async (planData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/master/plans`, planData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add payment plan');
    }
  }
);

export const updatePaymentPlan = createAsyncThunk(
  'paymentPlans/update',
  async ({ id, planData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/master/plans/${id}`, planData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment plan');
    }
  }
);

export const deletePaymentPlan = createAsyncThunk(
  'paymentPlans/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/master/plans/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payment plan');
    }
  }
);

export const checkPaymentPlanUsage = createAsyncThunk(
  'paymentPlans/checkUsage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/master/plans/${id}/usage`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check usage');
    }
  }
);

export const addInstallmentsToPlan = createAsyncThunk(
  'paymentPlans/addInstallments',
  async ({ planId, installments }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/master/plans/${planId}/installments`,
        { installments }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add installments');
    }
  }
);

export const updateInstallment = createAsyncThunk(
  'paymentPlans/updateInstallment',
  async ({ installmentId, installmentData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/master/installments/${installmentId}`,
        installmentData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update installment');
    }
  }
);

export const deleteInstallment = createAsyncThunk(
  'paymentPlans/deleteInstallment',
  async (installmentId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/master/installments/${installmentId}`);
      return installmentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete installment');
    }
  }
);

export const fetchInstallmentsByPlanId = createAsyncThunk(
  'paymentPlans/fetchInstallments',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/master/plans/${planId}/installments`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch installments');
    }
  }
);

const paymentPlansSlice = createSlice({
  name: 'paymentPlans',
  initialState: {
    list: [],
    currentPlan: null,
    currentInstallments: [],
    usageInfo: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload;
    },
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
      state.currentInstallments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all payment plans
      .addCase(fetchPaymentPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPaymentPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch payment plan by ID
      .addCase(fetchPaymentPlanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentPlanById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
        state.currentInstallments = action.payload.installments || [];
      })
      .addCase(fetchPaymentPlanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add payment plan
      .addCase(addPaymentPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPaymentPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.success = 'Payment plan added successfully';
      })
      .addCase(addPaymentPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update payment plan
      .addCase(updatePaymentPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentPlan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.currentPlan = action.payload;
        state.success = 'Payment plan updated successfully';
      })
      .addCase(updatePaymentPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete payment plan
      .addCase(deletePaymentPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(plan => plan.id !== action.payload);
        state.success = 'Payment plan deleted successfully';
      })
      .addCase(deletePaymentPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check usage
      .addCase(checkPaymentPlanUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPaymentPlanUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.usageInfo = action.payload;
      })
      .addCase(checkPaymentPlanUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add installments
      .addCase(addInstallmentsToPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInstallmentsToPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
        state.currentInstallments = action.payload.installments || [];
        const index = state.list.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.success = 'Installments added successfully';
      })
      .addCase(addInstallmentsToPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update installment
      .addCase(updateInstallment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInstallment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.currentInstallments.findIndex(inst => inst.id === action.payload.id);
        if (index !== -1) {
          state.currentInstallments[index] = action.payload;
        }
        state.success = 'Installment updated successfully';
      })
      .addCase(updateInstallment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete installment
      .addCase(deleteInstallment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInstallment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInstallments = state.currentInstallments.filter(
          inst => inst.id !== action.payload
        );
        state.success = 'Installment deleted successfully';
      })
      .addCase(deleteInstallment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch installments by plan ID
      .addCase(fetchInstallmentsByPlanId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstallmentsByPlanId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInstallments = action.payload.installments || [];
      })
      .addCase(fetchInstallmentsByPlanId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, setCurrentPlan, clearCurrentPlan } = paymentPlansSlice.actions;
export default paymentPlansSlice.reducer;
