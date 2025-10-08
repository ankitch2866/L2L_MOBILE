import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all unit transfers
export const fetchTransfers = createAsyncThunk(
  'unitTransfers/fetchTransfers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/transaction/transfer-charges');
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch unit transfers');
    }
  }
);

// Create new unit transfer (record transfer charge)
export const createTransfer = createAsyncThunk(
  'unitTransfers/createTransfer',
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/transaction/unit-transfer/record', transferData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create unit transfer');
    }
  }
);

// Fetch transfer by transaction ID
export const fetchTransferById = createAsyncThunk(
  'unitTransfers/fetchTransferById',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/transfer-charges/transaction/${transactionId}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch transfer details');
    }
  }
);

// Check if customer has unit allotment
export const checkCustomerUnit = createAsyncThunk(
  'unitTransfers/checkCustomerUnit',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/unit-transfer/customer/${customerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to check customer unit');
    }
  }
);

// Check if customer has transfer charge
export const checkTransferCharge = createAsyncThunk(
  'unitTransfers/checkTransferCharge',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/is-pay-transfer-charge/${customerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to check transfer charge');
    }
  }
);

// Mark transfer charge as used
export const markTransferChargeUsed = createAsyncThunk(
  'unitTransfers/markTransferChargeUsed',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/transaction/unit-transfer/mark-used/${customerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to mark transfer charge as used');
    }
  }
);

// Get unit owners
export const fetchUnitOwners = createAsyncThunk(
  'unitTransfers/fetchUnitOwners',
  async (unitId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/owners/unit/${unitId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch unit owners');
    }
  }
);

// Update transfer (if needed for editing)
export const updateTransfer = createAsyncThunk(
  'unitTransfers/updateTransfer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/unit-transfer/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update transfer');
    }
  }
);

const unitTransfersSlice = createSlice({
  name: 'unitTransfers',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    customerUnit: null,
    transferChargeStatus: null,
    unitOwners: [],
  },
  reducers: {
    clearCurrentTransfer: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCustomerUnit: (state) => {
      state.customerUnit = null;
    },
    clearTransferChargeStatus: (state) => {
      state.transferChargeStatus = null;
    },
    clearUnitOwners: (state) => {
      state.unitOwners = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transfers
      .addCase(fetchTransfers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create transfer
      .addCase(createTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.list.push(action.payload.data);
        }
      })
      .addCase(createTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch transfer by ID
      .addCase(fetchTransferById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransferById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchTransferById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check customer unit
      .addCase(checkCustomerUnit.fulfilled, (state, action) => {
        state.customerUnit = action.payload;
      })
      .addCase(checkCustomerUnit.rejected, (state, action) => {
        state.error = action.payload;
        state.customerUnit = null;
      })
      // Check transfer charge
      .addCase(checkTransferCharge.fulfilled, (state, action) => {
        state.transferChargeStatus = action.payload;
      })
      .addCase(checkTransferCharge.rejected, (state, action) => {
        state.error = action.payload;
        state.transferChargeStatus = null;
      })
      // Mark transfer charge as used
      .addCase(markTransferChargeUsed.fulfilled, (state) => {
        if (state.transferChargeStatus) {
          state.transferChargeStatus.hasTransferCharge = false;
        }
      })
      // Fetch unit owners
      .addCase(fetchUnitOwners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnitOwners.fulfilled, (state, action) => {
        state.loading = false;
        state.unitOwners = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUnitOwners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update transfer
      .addCase(updateTransfer.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      });
  },
});

export const { 
  clearCurrentTransfer, 
  clearError,
  clearCustomerUnit,
  clearTransferChargeStatus,
  clearUnitOwners,
} = unitTransfersSlice.actions;

export default unitTransfersSlice.reducer;
