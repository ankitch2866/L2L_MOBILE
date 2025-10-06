import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchProjectSizes = createAsyncThunk(
  'projectSizes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/master/project-sizes');
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project sizes');
    }
  }
);

export const fetchProjectSizesByProject = createAsyncThunk(
  'projectSizes/fetchByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/master/project-sizes/project/${projectId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project sizes');
    }
  }
);

export const fetchProjectSizeById = createAsyncThunk(
  'projectSizes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/master/project-sizes/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project size');
    }
  }
);

export const createProjectSize = createAsyncThunk(
  'projectSizes/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/master/project-sizes', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create project size');
    }
  }
);

export const updateProjectSize = createAsyncThunk(
  'projectSizes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/master/project-sizes/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update project size');
    }
  }
);

export const deleteProjectSize = createAsyncThunk(
  'projectSizes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/master/project-sizes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete project size');
    }
  }
);

const projectSizesSlice = createSlice({
  name: 'projectSizes',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    projectId: null,
  },
  reducers: {
    setProjectId: (state, action) => {
      state.projectId = action.payload;
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
      .addCase(fetchProjectSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProjectSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectSizesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectSizesByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProjectSizesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectSizeById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createProjectSize.fulfilled, (state, action) => {
        if (action.payload) {
          state.list.push(action.payload);
        }
      })
      .addCase(updateProjectSize.fulfilled, (state, action) => {
        const index = state.list.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(deleteProjectSize.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload);
        if (state.current?.id === action.payload) {
          state.current = null;
        }
      });
  },
});

export const { setProjectId, clearCurrent, clearError } = projectSizesSlice.actions;
export default projectSizesSlice.reducer;
