import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all calling feedbacks
export const fetchFeedbacks = createAsyncThunk(
  'callingFeedback/fetchFeedbacks',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.calling_type) params.append('calling_type', filters.calling_type);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/transaction/feedbacks?${params.toString()}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch calling feedbacks');
    }
  }
);

// Fetch calling feedback by ID
export const fetchFeedbackById = createAsyncThunk(
  'callingFeedback/fetchFeedbackById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/feedbacks/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch calling feedback');
    }
  }
);

// Create new calling feedback
export const createFeedback = createAsyncThunk(
  'callingFeedback/createFeedback',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/transaction/feedbacks', feedbackData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create calling feedback');
    }
  }
);

// Update calling feedback
export const updateFeedback = createAsyncThunk(
  'callingFeedback/updateFeedback',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/feedbacks/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update calling feedback');
    }
  }
);

// Delete calling feedback
export const deleteFeedback = createAsyncThunk(
  'callingFeedback/deleteFeedback',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/transaction/feedbacks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete calling feedback');
    }
  }
);

// Fetch calling feedback statistics
// DISABLED: endpoint doesn't exist in backend
// export const fetchFeedbackStats = createAsyncThunk(
//   'callingFeedback/fetchFeedbackStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get('/api/transaction/feedbacks/statistics');
//       return response.data?.data || response.data || {};
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch calling feedback statistics');
//     }
//   }
// );

// Fetch feedbacks by customer
export const fetchFeedbacksByCustomer = createAsyncThunk(
  'callingFeedback/fetchFeedbacksByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/transaction/feedbacks/customer/${customerId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch customer feedbacks');
    }
  }
);

// DISABLED: endpoint doesn't exist in backend
// export const fetchFeedbacksByProject = createAsyncThunk(
//   'callingFeedback/fetchFeedbacksByProject',
//   async (projectId, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/api/transaction/feedbacks/project/${projectId}`);
//       return response.data?.data || response.data || [];
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch project feedbacks');
//     }
//   }
// );

const initialState = {
  feedbacks: [],
  currentFeedback: null,
  stats: {},
  loading: false,
  error: null,
  lastFetch: null,
};

const callingFeedbackSlice = createSlice({
  name: 'callingFeedback',
  initialState,
  reducers: {
    clearCurrentFeedback: (state) => {
      state.currentFeedback = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFeedbacks: (state) => {
      state.feedbacks = [];
      state.currentFeedback = null;
      state.stats = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all feedbacks
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch feedback by ID
      .addCase(fetchFeedbackById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFeedback = action.payload;
      })
      .addCase(fetchFeedbackById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create feedback
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks.unshift(action.payload);
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update feedback
      .addCase(updateFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.feedbacks.findIndex(f => f.feedback_id === action.payload.feedback_id);
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
        state.currentFeedback = action.payload;
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete feedback
      .addCase(deleteFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = state.feedbacks.filter(f => f.feedback_id !== action.payload);
        if (state.currentFeedback?.feedback_id === action.payload) {
          state.currentFeedback = null;
        }
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // DISABLED: Fetch statistics - function commented out
      // .addCase(fetchFeedbackStats.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchFeedbackStats.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.stats = action.payload;
      // })
      // .addCase(fetchFeedbackStats.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      
      // Fetch feedbacks by customer
      .addCase(fetchFeedbacksByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacksByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedbacksByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // DISABLED: Fetch feedbacks by project - function commented out
      // .addCase(fetchFeedbacksByProject.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchFeedbacksByProject.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.feedbacks = action.payload;
      // })
      // .addCase(fetchFeedbacksByProject.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // });
  },
});

export const { clearCurrentFeedback, clearError, clearFeedbacks } = callingFeedbackSlice.actions;
export default callingFeedbackSlice.reducer;
