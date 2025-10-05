# Complete ERP Mobile Implementation - Design Document

## Overview

This design document outlines the technical architecture for implementing the complete L2L EPR system for mobile. The implementation will mirror ALL functionality from the web frontend while optimizing for mobile devices.

**Approach:** Modular architecture with reusable components
**State Management:** Redux Toolkit with feature-based slices
**Navigation:** React Navigation with nested navigators
**API Integration:** Axios with centralized configuration
**UI Framework:** React Native Paper + Custom Components

---

## Architecture

### High-Level Architecture

```
Mobile App
├── Authentication Layer
├── Navigation Layer
│   ├── Drawer Navigator (Main Menu)
│   ├── Bottom Tab Navigator (Quick Access)
│   └── Stack Navigators (Feature Modules)
├── State Management Layer (Redux)
│   ├── Master Data Slices
│   ├── Transaction Slices
│   ├── Report Slices
│   └── Utility Slices
├── API Layer
│   ├── Master APIs
│   ├── Transaction APIs
│   ├── Report APIs
│   └── Utility APIs
└── UI Layer
    ├── Screens
    ├── Components
    └── Common Components
```

### Navigation Structure

```
App
└── AuthNavigator
    ├── LoginScreen
    └── MainNavigator (after auth)
        ├── DrawerNavigator
        │   ├── DashboardStack
        │   ├── MastersStack
        │   │   ├── ProjectsStack
        │   │   ├── PropertiesStack
        │   │   ├── CustomersStack
        │   │   ├── CoApplicantsStack
        │   │   ├── BrokersStack
        │   │   ├── PaymentPlansStack
        │   │   ├── PLCStack
        │   │   ├── ProjectSizeStack
        │   │   ├── BanksStack
        │   │   └── StockStack
        │   ├── TransactionsStack
        │   │   ├── BookingStack
        │   │   ├── AllotmentStack
        │   │   ├── PaymentStack
        │   │   ├── BBAStack
        │   │   ├── ChequeDepositStack
        │   │   ├── DispatchStack
        │   │   └── UnitTransferStack
        │   ├── ReportsStack
        │   │   ├── CollectionReportsStack
        │   │   ├── CustomerReportsStack
        │   │   ├── ProjectReportsStack
        │   │   └── OtherReportsStack
        │   └── UtilitiesStack
        │       ├── AllotmentLetterScreen
        │       ├── BirthdayDashboardScreen
        │       ├── LogReportsScreen
        │       ├── AdminStack
        │       └── SuperAdminStack
        └── BottomTabNavigator
            ├── HomeTab
            ├── MastersTab
            ├── TransactionsTab
            └── ReportsTab
```

---


## File Structure

```
L2L_EPR_MOBILE_FRONT_V2/
├── src/
│   ├── screens/
│   │   ├── masters/
│   │   │   ├── projects/
│   │   │   │   ├── ProjectsListScreen.js
│   │   │   │   ├── AddProjectScreen.js
│   │   │   │   ├── ProjectDetailsScreen.js
│   │   │   │   ├── EditProjectScreen.js
│   │   │   │   └── index.js
│   │   │   ├── properties/
│   │   │   │   ├── PropertiesListScreen.js
│   │   │   │   ├── AddPropertyScreen.js
│   │   │   │   ├── PropertyDetailsScreen.js
│   │   │   │   ├── EditPropertyScreen.js
│   │   │   │   └── index.js
│   │   │   ├── customers/
│   │   │   │   ├── CustomersListScreen.js
│   │   │   │   ├── CustomerRegistrationScreen.js
│   │   │   │   ├── CustomerDetailsScreen.js
│   │   │   │   ├── EditCustomerScreen.js
│   │   │   │   └── index.js
│   │   │   ├── coApplicants/
│   │   │   ├── brokers/
│   │   │   ├── paymentPlans/
│   │   │   ├── plc/
│   │   │   ├── projectSize/
│   │   │   ├── banks/
│   │   │   └── stock/
│   │   ├── transactions/
│   │   │   ├── booking/
│   │   │   ├── allotment/
│   │   │   ├── payment/
│   │   │   ├── bba/
│   │   │   ├── chequeDeposit/
│   │   │   ├── dispatch/
│   │   │   ├── unitTransfer/
│   │   │   ├── paymentQuery/
│   │   │   ├── raisePayment/
│   │   │   └── customerFeedback/
│   │   ├── reports/
│   │   │   ├── collection/
│   │   │   ├── customer/
│   │   │   ├── project/
│   │   │   ├── stock/
│   │   │   ├── bba/
│   │   │   ├── dues/
│   │   │   ├── calling/
│   │   │   ├── correspondence/
│   │   │   ├── unitTransfer/
│   │   │   └── yearly/
│   │   └── utilities/
│   │       ├── AllotmentLetterScreen.js
│   │       ├── BirthdayDashboardScreen.js
│   │       ├── LogReportsScreen.js
│   │       ├── admin/
│   │       └── superAdmin/
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingIndicator.js
│   │   │   ├── ErrorMessage.js
│   │   │   ├── EmptyState.js
│   │   │   ├── SearchBar.js
│   │   │   ├── FilterButton.js
│   │   │   ├── Card.js
│   │   │   ├── FormInput.js
│   │   │   ├── DatePicker.js
│   │   │   ├── Dropdown.js
│   │   │   └── FileUploader.js
│   │   ├── masters/
│   │   │   ├── ProjectCard.js
│   │   │   ├── PropertyCard.js
│   │   │   ├── CustomerCard.js
│   │   │   └── ...
│   │   ├── transactions/
│   │   │   ├── BookingCard.js
│   │   │   ├── PaymentCard.js
│   │   │   └── ...
│   │   └── reports/
│   │       ├── ReportCard.js
│   │       ├── ChartComponent.js
│   │       └── ...
│   ├── store/
│   │   ├── index.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── projectsSlice.js
│   │       ├── propertiesSlice.js
│   │       ├── customersSlice.js
│   │       ├── coApplicantsSlice.js
│   │       ├── brokersSlice.js
│   │       ├── paymentPlansSlice.js
│   │       ├── plcSlice.js
│   │       ├── projectSizeSlice.js
│   │       ├── banksSlice.js
│   │       ├── stockSlice.js
│   │       ├── bookingSlice.js
│   │       ├── allotmentSlice.js
│   │       ├── paymentSlice.js
│   │       ├── bbaSlice.js
│   │       ├── chequeDepositSlice.js
│   │       ├── dispatchSlice.js
│   │       ├── unitTransferSlice.js
│   │       ├── reportsSlice.js
│   │       └── utilitiesSlice.js
│   ├── services/
│   │   ├── api.js
│   │   ├── masterService.js
│   │   ├── transactionService.js
│   │   ├── reportService.js
│   │   └── utilityService.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── DrawerNavigator.js
│   │   ├── BottomTabNavigator.js
│   │   ├── MastersNavigator.js
│   │   ├── TransactionsNavigator.js
│   │   ├── ReportsNavigator.js
│   │   └── UtilitiesNavigator.js
│   ├── utils/
│   │   ├── validation.js
│   │   ├── formatters.js
│   │   ├── constants.js
│   │   └── helpers.js
│   └── config/
│       ├── api.js
│       └── theme.js
└── App.js
```

---

## State Management Design

### Redux Store Structure

```javascript
{
  auth: {
    user: {},
    token: '',
    isAuthenticated: false
  },
  projects: {
    list: [],
    current: null,
    loading: false,
    error: null
  },
  properties: {
    list: [],
    current: null,
    loading: false,
    error: null
  },
  customers: {
    list: [],
    current: null,
    loading: false,
    error: null
  },
  // ... similar structure for all modules
}
```

### Slice Pattern (Example: Projects)

```javascript
// projectsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { masterService } from '../../services/masterService';

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await masterService.getProjects();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

export const addProject = createAsyncThunk(
  'projects/add',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await masterService.addProject(projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentProject: (state, action) => {
      state.current = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentProject, clearError } = projectsSlice.actions;
export default projectsSlice.reducer;
```

---

## API Integration Design

### API Service Structure

```javascript
// services/masterService.js
import api from '../config/api';

export const masterService = {
  // Projects
  getProjects: () => api.get('/api/master/projects'),
  getProjectById: (id) => api.get(`/api/master/projects/${id}`),
  addProject: (data) => api.post('/api/master/projects', data),
  updateProject: (id, data) => api.put(`/api/master/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/api/master/projects/${id}`),
  
  // Properties
  getProperties: () => api.get('/api/master/properties'),
  getPropertiesByProject: (projectId) => api.get(`/api/master/properties/project/${projectId}`),
  addProperty: (data) => api.post('/api/master/properties', data),
  updateProperty: (id, data) => api.put(`/api/master/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/api/master/properties/${id}`),
  
  // Customers
  getCustomers: () => api.get('/api/master/customers'),
  getCustomerById: (id) => api.get(`/api/master/customers/${id}`),
  addCustomer: (data) => api.post('/api/master/customers', data),
  updateCustomer: (id, data) => api.put(`/api/master/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/api/master/customers/${id}`),
  
  // ... similar methods for all master modules
};

// services/transactionService.js
export const transactionService = {
  // Bookings
  getBookings: () => api.get('/api/transaction/bookings'),
  addBooking: (data) => api.post('/api/transaction/bookings', data),
  
  // Allotments
  getAllotments: () => api.get('/api/transaction/allotments'),
  addAllotment: (data) => api.post('/api/transaction/allotments', data),
  
  // Payments
  getPayments: () => api.get('/api/transaction/payments'),
  addPayment: (data) => api.post('/api/transaction/payments', data),
  
  // ... similar methods for all transaction modules
};

// services/reportService.js
export const reportService = {
  // Collection Reports
  getDailyCollection: (date) => api.get(`/api/reports/collection/daily?date=${date}`),
  getMonthlyCollection: (month, year) => api.get(`/api/reports/collection/monthly?month=${month}&year=${year}`),
  
  // Customer Reports
  getCustomerDetails: (customerId) => api.get(`/api/reports/customer/${customerId}`),
  getStatementOfAccount: (customerId) => api.get(`/api/reports/customer/${customerId}/statement`),
  
  // ... similar methods for all report modules
};
```

---

## Component Design Patterns

### Screen Component Pattern

```javascript
// Example: ProjectsListScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, deleteProject } from '../../store/slices/projectsSlice';
import { SearchBar, LoadingIndicator, EmptyState, ErrorMessage } from '../../components/common';
import ProjectCard from '../../components/masters/ProjectCard';
import { FAB } from 'react-native-paper';

const ProjectsListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(state => state.projects);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    await dispatch(fetchProjects());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleDelete = async (id) => {
    await dispatch(deleteProject(id));
    loadProjects();
  };

  const filteredProjects = list.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} onRetry={loadProjects} />;

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search projects..."
      />
      <FlatList
        data={filteredProjects}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => navigation.navigate('ProjectDetails', { id: item.id })}
            onEdit={() => navigation.navigate('EditProject', { id: item.id })}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={<EmptyState message="No projects found" />}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddProject')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#EF4444'
  }
});

export default ProjectsListScreen;
```

### Form Component Pattern

```javascript
// Example: AddProjectScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { addProject } from '../../store/slices/projectsSlice';
import { FormInput, DatePicker, FileUploader } from '../../components/common';
import { Button } from 'react-native-paper';
import { showSuccess, showError } from '../../utils/toast';
import { validateProject } from '../../utils/validation';

const AddProjectScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    landmark: '',
    reraNumber: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateProject(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await dispatch(addProject(formData)).unwrap();
      showSuccess('Project added successfully!');
      navigation.goBack();
    } catch (error) {
      showError(error || 'Failed to add project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <FormInput
        label="Project Name"
        value={formData.name}
        onChangeText={(value) => handleChange('name', value)}
        error={errors.name}
        required
      />
      <FormInput
        label="Location"
        value={formData.location}
        onChangeText={(value) => handleChange('location', value)}
        error={errors.location}
        required
      />
      <FormInput
        label="Landmark"
        value={formData.landmark}
        onChangeText={(value) => handleChange('landmark', value)}
        error={errors.landmark}
      />
      <FormInput
        label="RERA Number"
        value={formData.reraNumber}
        onChangeText={(value) => handleChange('reraNumber', value)}
        error={errors.reraNumber}
      />
      <FileUploader
        label="Project Image"
        value={formData.image}
        onChange={(value) => handleChange('image', value)}
        error={errors.image}
      />
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Add Project
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB'
  },
  button: {
    marginTop: 24,
    backgroundColor: '#EF4444'
  }
});

export default AddProjectScreen;
```

---

## Common Components Library

### Reusable Components

1. **LoadingIndicator** - Centered loading spinner
2. **ErrorMessage** - Error display with retry button
3. **EmptyState** - Empty list placeholder
4. **SearchBar** - Search input with icon
5. **FilterButton** - Filter dropdown button
6. **Card** - Base card component
7. **FormInput** - Text input with label and error
8. **DatePicker** - Date selection component
9. **Dropdown** - Select dropdown component
10. **FileUploader** - File/image upload component
11. **ConfirmDialog** - Confirmation modal
12. **Toast** - Success/error toast notifications

---

## Design System

### Colors
```javascript
export const colors = {
  primary: '#EF4444',
  secondary: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  error: '#EF4444',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB'
};
```

### Typography
```javascript
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' }
};
```

### Spacing
```javascript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};
```

---

## Performance Optimization

### Strategies

1. **List Virtualization** - Use FlatList for all lists
2. **Image Optimization** - Lazy load and cache images
3. **Memoization** - Use React.memo for expensive components
4. **Debouncing** - Debounce search and filter operations
5. **Code Splitting** - Lazy load screens
6. **State Normalization** - Normalize Redux state
7. **Selective Re-rendering** - Use useSelector wisely

---

## Error Handling Strategy

### Error Types and Handling

1. **Network Errors** - Show retry button
2. **Validation Errors** - Show field-specific errors
3. **API Errors** - Show error message from server
4. **Authentication Errors** - Redirect to login
5. **Permission Errors** - Show unauthorized message

---

## Testing Strategy

### Unit Tests
- Redux slices and actions
- Utility functions
- Validation functions

### Integration Tests
- API service calls
- Navigation flows
- Form submissions

### E2E Tests
- Critical user flows
- CRUD operations
- Report generation

---

**Design Version:** 1.0  
**Date:** January 2025  
**Status:** Ready for Implementation
