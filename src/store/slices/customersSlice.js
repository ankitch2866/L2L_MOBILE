import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import customerService from '../../services/customerService';

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/master/customers?limit=1000');
      // Handle both direct array and nested data structure
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch customers');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/master/customers', customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/master/customers/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/master/customers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete customer');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/master/customers/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch customer');
    }
  }
);

// New async thunks for customer query module
export const fetchProjects = createAsyncThunk(
  'customers/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const projects = await customerService.getProjects();
      return projects;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

export const fetchCustomersByProject = createAsyncThunk(
  'customers/fetchCustomersByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const customers = await customerService.getCustomersByProject(projectId);
      return { projectId, customers };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerDetails = createAsyncThunk(
  'customers/fetchCustomerDetails',
  async (customerId, { rejectWithValue }) => {
    try {
      const details = await customerService.getCustomerDetails(customerId);
      return { customerId, details };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customer details');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'customers/fetchPaymentHistory',
  async (customerId, { rejectWithValue }) => {
    try {
      const payments = await customerService.getPaymentHistory(customerId);
      return { customerId, payments };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch payment history');
    }
  }
);

export const fetchCoApplicants = createAsyncThunk(
  'customers/fetchCoApplicants',
  async (customerId, { rejectWithValue }) => {
    try {
      const coApplicants = await customerService.getCoApplicants(customerId);
      return { customerId, coApplicants };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch co-applicants');
    }
  }
);

export const fetchBrokerInfo = createAsyncThunk(
  'customers/fetchBrokerInfo',
  async (brokerId, { rejectWithValue }) => {
    try {
      const broker = await customerService.getBrokerInfo(brokerId);
      return { brokerId, broker };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch broker info');
    }
  }
);

export const fetchDocuments = createAsyncThunk(
  'customers/fetchDocuments',
  async (customerId, { rejectWithValue }) => {
    try {
      const documents = await customerService.getDocuments(customerId);
      return { customerId, documents };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch documents');
    }
  }
);

export const fetchCustomerFeedback = createAsyncThunk(
  'customers/fetchCustomerFeedback',
  async (customerId, { rejectWithValue }) => {
    try {
      const feedback = await customerService.getCustomerFeedback(customerId);
      return { customerId, feedback };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customer feedback');
    }
  }
);

export const fetchDispatchData = createAsyncThunk(
  'customers/fetchDispatchData',
  async (customerId, { rejectWithValue }) => {
    try {
      const dispatches = await customerService.getDispatchData(customerId);
      return { customerId, dispatches };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dispatch data');
    }
  }
);

export const fetchTransferHistory = createAsyncThunk(
  'customers/fetchTransferHistory',
  async (customerId, { rejectWithValue }) => {
    try {
      const transfers = await customerService.getTransferHistory(customerId);
      return { customerId, transfers };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch transfer history');
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    currentCustomer: null,
    loading: false,
    error: null,
    searchQuery: '',
    // New state for customer query module
    projects: [],
    customersByProject: {},
    customerDetails: {},
    paymentHistory: {},
    coApplicants: {},
    brokers: {},
    documents: {},
    customerFeedback: {},
    dispatchData: {},
    transferHistory: {},
    loadingProjects: false,
    loadingCustomersByProject: false,
    loadingDetails: false,
    loadingPayments: false,
    loadingCoApplicants: false,
    loadingBroker: false,
    loadingDocuments: false,
    loadingFeedback: false,
    loadingDispatches: false,
    loadingTransfers: false,
    projectsError: null,
    detailsError: null,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCustomerDetails: (state, action) => {
      const customerId = action.payload;
      delete state.customerDetails[customerId];
      delete state.paymentHistory[customerId];
      delete state.coApplicants[customerId];
      delete state.documents[customerId];
    },
    clearProjectCustomers: (state, action) => {
      const projectId = action.payload;
      delete state.customersByProject[projectId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.customers[index] = action.payload;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload);
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.currentCustomer = action.payload;
      })
      // Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loadingProjects = true;
        state.projectsError = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loadingProjects = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loadingProjects = false;
        state.projectsError = action.payload;
      })
      // Customers by project
      .addCase(fetchCustomersByProject.pending, (state) => {
        state.loadingCustomersByProject = true;
      })
      .addCase(fetchCustomersByProject.fulfilled, (state, action) => {
        state.loadingCustomersByProject = false;
        state.customersByProject[action.payload.projectId] = action.payload.customers;
      })
      .addCase(fetchCustomersByProject.rejected, (state) => {
        state.loadingCustomersByProject = false;
      })
      // Customer details
      .addCase(fetchCustomerDetails.pending, (state) => {
        state.loadingDetails = true;
        state.detailsError = null;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.customerDetails[action.payload.customerId] = action.payload.details;
      })
      .addCase(fetchCustomerDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.detailsError = action.payload;
      })
      // Payment history
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loadingPayments = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loadingPayments = false;
        state.paymentHistory[action.payload.customerId] = action.payload.payments;
      })
      .addCase(fetchPaymentHistory.rejected, (state) => {
        state.loadingPayments = false;
      })
      // Co-applicants
      .addCase(fetchCoApplicants.pending, (state) => {
        state.loadingCoApplicants = true;
      })
      .addCase(fetchCoApplicants.fulfilled, (state, action) => {
        state.loadingCoApplicants = false;
        state.coApplicants[action.payload.customerId] = action.payload.coApplicants;
      })
      .addCase(fetchCoApplicants.rejected, (state) => {
        state.loadingCoApplicants = false;
      })
      // Broker info
      .addCase(fetchBrokerInfo.pending, (state) => {
        state.loadingBroker = true;
      })
      .addCase(fetchBrokerInfo.fulfilled, (state, action) => {
        state.loadingBroker = false;
        state.brokers[action.payload.brokerId] = action.payload.broker;
      })
      .addCase(fetchBrokerInfo.rejected, (state) => {
        state.loadingBroker = false;
      })
      // Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loadingDocuments = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loadingDocuments = false;
        state.documents[action.payload.customerId] = action.payload.documents;
      })
      .addCase(fetchDocuments.rejected, (state) => {
        state.loadingDocuments = false;
      })
      // Customer Feedback
      .addCase(fetchCustomerFeedback.pending, (state) => {
        state.loadingFeedback = true;
      })
      .addCase(fetchCustomerFeedback.fulfilled, (state, action) => {
        state.loadingFeedback = false;
        state.customerFeedback[action.payload.customerId] = action.payload.feedback;
      })
      .addCase(fetchCustomerFeedback.rejected, (state) => {
        state.loadingFeedback = false;
      })
      // Dispatch Data
      .addCase(fetchDispatchData.pending, (state) => {
        state.loadingDispatches = true;
      })
      .addCase(fetchDispatchData.fulfilled, (state, action) => {
        state.loadingDispatches = false;
        state.dispatchData[action.payload.customerId] = action.payload.dispatches;
      })
      .addCase(fetchDispatchData.rejected, (state) => {
        state.loadingDispatches = false;
      })
      // Transfer History
      .addCase(fetchTransferHistory.pending, (state) => {
        state.loadingTransfers = true;
      })
      .addCase(fetchTransferHistory.fulfilled, (state, action) => {
        state.loadingTransfers = false;
        state.transferHistory[action.payload.customerId] = action.payload.transfers;
      })
      .addCase(fetchTransferHistory.rejected, (state) => {
        state.loadingTransfers = false;
      });
  },
});

export const { 
  setSearchQuery, 
  clearCurrentCustomer, 
  clearError, 
  clearCustomerDetails,
  clearProjectCustomers 
} = customersSlice.actions;

export default customersSlice.reducer;
