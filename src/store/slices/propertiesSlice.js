import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all projects first, then fetch units for each project
export const fetchAllPropertiesData = createAsyncThunk(
  'properties/fetchAllData',
  async (_, { rejectWithValue }) => {
    try {
      // First fetch all projects
      const projectsResponse = await api.get('/master/projects');
      if (!projectsResponse.data?.success) {
        throw new Error(projectsResponse.data?.message || 'Failed to fetch projects');
      }
      
      const projects = projectsResponse.data.data || [];
      
      if (projects.length === 0) {
        return { projects: [], projectUnits: {} };
      }
      
      // Fetch units for all projects in parallel
      const unitPromises = projects.map(async (project) => {
        try {
          const response = await api.get(`/master/project/${project.project_id}/units`);
          if (response.data?.success) {
            return { projectId: project.project_id, units: response.data.data || [] };
          }
          return { projectId: project.project_id, units: [] };
        } catch (error) {
          console.error(`Error fetching units for project ${project.project_id}:`, error);
          return { projectId: project.project_id, units: [] };
        }
      });
      
      const unitResults = await Promise.all(unitPromises);
      const projectUnits = {};
      unitResults.forEach(({ projectId, units }) => {
        projectUnits[projectId] = units;
      });
      
      return { projects, projectUnits };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch properties data');
    }
  }
);

export const fetchPropertiesByProject = createAsyncThunk(
  'properties/fetchByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/master/project/${projectId}/units`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch properties');
      }
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch properties');
    }
  }
);

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (propertyData, { rejectWithValue }) => {
    try {
      const response = await api.post('/master/unit', propertyData);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create property');
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create property');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/master/unit/${id}`, data);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update property');
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/master/unit/${id}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete property');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete property');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/master/unit/${id}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch property');
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch property');
    }
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState: {
    projects: [],
    projectUnits: {},
    currentProperty: null,
    loading: false,
    error: null,
    searchQuery: '',
    selectedProject: '',
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPropertiesData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPropertiesData.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.projectUnits = action.payload.projectUnits;
      })
      .addCase(fetchAllPropertiesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPropertiesByProject.fulfilled, (state, action) => {
        // Update units for specific project
        if (state.selectedProject) {
          state.projectUnits[state.selectedProject] = action.payload;
        }
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        // Add new property to the appropriate project
        const projectId = action.payload.project_id;
        if (projectId && state.projectUnits[projectId]) {
          state.projectUnits[projectId].push(action.payload);
        }
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        // Update property in the appropriate project
        const projectId = action.payload.project_id;
        if (projectId && state.projectUnits[projectId]) {
          const index = state.projectUnits[projectId].findIndex(
            p => p.unit_id === action.payload.unit_id
          );
          if (index !== -1) {
            state.projectUnits[projectId][index] = action.payload;
          }
        }
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        // Remove property from all projects
        Object.keys(state.projectUnits).forEach(projectId => {
          state.projectUnits[projectId] = state.projectUnits[projectId].filter(
            p => p.unit_id !== action.payload
          );
        });
      })
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchQuery, setSelectedProject, clearCurrentProperty, clearError } = propertiesSlice.actions;
export default propertiesSlice.reducer;
