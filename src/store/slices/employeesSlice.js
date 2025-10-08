import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Async thunks for employee management
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users/get-users');
      return response.data?.users || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/users/create-user', employeeData);
      return response.data?.user || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/update-user/${id}`, data);
      return response.data?.user || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/users/delete-user/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to delete employee');
    }
  }
);

export const toggleEmployeeStatus = createAsyncThunk(
  'employees/toggleEmployeeStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/users/toggle-user/${id}`);
      return response.data?.user || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to toggle employee status');
    }
  }
);

export const resetEmployeePassword = createAsyncThunk(
  'employees/resetEmployeePassword',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/users/reset-password/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to reset password');
    }
  }
);

export const fetchEmployeeStats = createAsyncThunk(
  'employees/fetchEmployeeStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users/employee-stats');
      return response.data?.stats || response.data || {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch employee statistics');
    }
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState: {
    employees: [],
    filteredEmployees: [],
    currentEmployee: null,
    stats: {
      totalEmployees: 0,
      activeEmployees: 0,
      recentEmployees: 0,
    },
    loading: false,
    actionLoading: false,
    error: null,
    success: null,
    searchTerm: '',
    sortOrder: 'asc',
    page: 0,
    rowsPerPage: 10,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    filterEmployees: (state) => {
      const { employees, searchTerm, sortOrder } = state;
      let filtered = employees.filter((employee) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          employee.userId?.toLowerCase().includes(searchLower) ||
          employee.name?.toLowerCase().includes(searchLower) ||
          employee.email?.toLowerCase().includes(searchLower)
        );
      });

      // Sort the filtered employees
      filtered = [...filtered].sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        if (sortOrder === 'asc') {
          return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        } else {
          return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
        }
      });

      state.filteredEmployees = filtered;
      state.page = 0; // Reset to first page on filter change
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
        state.filteredEmployees = action.payload;
        
        // Calculate stats
        const employees = action.payload;
        state.stats = {
          totalEmployees: employees.length,
          activeEmployees: employees.filter((emp) => emp.status).length,
          recentEmployees: employees.filter((emp) => {
            const date = new Date(emp.createdAt);
            const now = new Date();
            return now - date <= 30 * 24 * 60 * 60 * 1000; // Last 30 days
          }).length,
        };
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.employees.unshift(action.payload);
        state.success = 'Employee created successfully';
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        state.success = 'Employee updated successfully';
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        state.success = 'Employee deleted successfully';
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Toggle employee status
      .addCase(toggleEmployeeStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(toggleEmployeeStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        state.success = `Employee ${action.payload.status ? 'activated' : 'deactivated'} successfully`;
      })
      .addCase(toggleEmployeeStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Reset password
      .addCase(resetEmployeePassword.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(resetEmployeePassword.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = 'Password reset successfully';
      })
      .addCase(resetEmployeePassword.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Fetch employee stats
      .addCase(fetchEmployeeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchEmployeeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchTerm,
  setSortOrder,
  setPage,
  setRowsPerPage,
  clearError,
  clearSuccess,
  filterEmployees,
} = employeesSlice.actions;

export default employeesSlice.reducer;
