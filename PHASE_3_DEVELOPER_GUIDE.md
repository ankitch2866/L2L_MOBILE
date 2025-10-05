# Phase 3: Developer Quick Reference Guide

## 🚀 Quick Start

### Running the Application
```bash
cd L2L_EPR_MOBILE_FRONT_V2
npm install
npm start
```

---

## 📂 File Structure

```
src/
├── store/
│   ├── slices/
│   │   ├── projectsSlice.js      # Projects state management
│   │   ├── propertiesSlice.js    # Properties state management
│   │   └── customersSlice.js     # Customers state management
│   └── index.js                   # Redux store configuration
│
├── screens/
│   ├── projects/
│   │   ├── ProjectsListScreen.js
│   │   ├── AddProjectScreen.js
│   │   ├── EditProjectScreen.js
│   │   └── ProjectDetailsScreen.js
│   ├── properties/
│   │   ├── PropertiesListScreen.js
│   │   ├── AddPropertyScreen.js
│   │   ├── EditPropertyScreen.js
│   │   └── PropertyDetailsScreen.js
│   └── customers/
│       ├── CustomersListScreen.js
│       ├── AddCustomerScreen.js
│       ├── EditCustomerScreen.js
│       └── CustomerDetailsScreen.js
│
├── components/
│   ├── projects/
│   │   └── ProjectCard.js
│   ├── properties/
│   │   └── PropertyCard.js
│   └── customers/
│       └── CustomerCard.js
│
└── navigation/
    └── DashboardNavigator.js      # Updated with new tabs
```

---

## 🔧 How to Use Redux Slices

### Projects Example
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject } from '../store/slices/projectsSlice';

// In your component
const dispatch = useDispatch();
const { projects, loading, error } = useSelector(state => state.projects);

// Fetch projects
useEffect(() => {
  dispatch(fetchProjects());
}, []);

// Create project
const handleCreate = async (data) => {
  await dispatch(createProject(data)).unwrap();
};
```

### Properties Example
```javascript
import { fetchProperties, fetchPropertiesByProject } from '../store/slices/propertiesSlice';

// Fetch all properties
dispatch(fetchProperties());

// Fetch properties by project
dispatch(fetchPropertiesByProject(projectId));
```

### Customers Example
```javascript
import { fetchCustomers, updateCustomer } from '../store/slices/customersSlice';

// Fetch customers
dispatch(fetchCustomers());

// Update customer
dispatch(updateCustomer({ id: customerId, data: formData }));
```

---

## 🎨 Using Components

### ProjectCard
```javascript
import ProjectCard from '../components/projects/ProjectCard';

<ProjectCard
  project={projectData}
  onPress={(project) => navigation.navigate('ProjectDetails', { projectId: project.project_id })}
  onEdit={(project) => navigation.navigate('EditProject', { projectId: project.project_id })}
  onDelete={(project) => handleDelete(project)}
  theme={theme}
/>
```

### PropertyCard
```javascript
import PropertyCard from '../components/properties/PropertyCard';

<PropertyCard
  property={propertyData}
  onPress={(property) => navigation.navigate('PropertyDetails', { propertyId: property.unit_id })}
  onEdit={(property) => navigation.navigate('EditProperty', { propertyId: property.unit_id })}
  theme={theme}
/>
```

### CustomerCard
```javascript
import CustomerCard from '../components/customers/CustomerCard';

<CustomerCard
  customer={customerData}
  onPress={(customer) => navigation.navigate('CustomerDetails', { customerId: customer.customer_id })}
  onEdit={(customer) => navigation.navigate('EditCustomer', { customerId: customer.customer_id })}
  theme={theme}
/>
```

---

## 🔀 Navigation

### Navigate to Screens
```javascript
// From Dashboard to Projects
navigation.navigate('Projects', { screen: 'ProjectsList' });

// From Projects List to Add Project
navigation.navigate('AddProject');

// From Projects List to Project Details
navigation.navigate('ProjectDetails', { projectId: 123 });

// From Projects List to Edit Project
navigation.navigate('EditProject', { projectId: 123 });

// Go back
navigation.goBack();
```

### Tab Navigation
```javascript
// Switch to Projects tab
navigation.navigate('Projects');

// Switch to Properties tab
navigation.navigate('Properties');

// Switch to Customers tab
navigation.navigate('Customers');
```

---

## 📝 Form Validation Examples

### Projects Form
```javascript
const validate = () => {
  const newErrors = {};
  if (!formData.project_name.trim()) newErrors.project_name = 'Project name is required';
  if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
  if (!formData.address.trim()) newErrors.address = 'Address is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Properties Form
```javascript
const validate = () => {
  const newErrors = {};
  if (!formData.project_id) newErrors.project_id = 'Project is required';
  if (!formData.unit_number.trim()) newErrors.unit_number = 'Unit number is required';
  if (!formData.area_sqft || isNaN(formData.area_sqft)) newErrors.area_sqft = 'Valid area is required';
  if (!formData.price || isNaN(formData.price)) newErrors.price = 'Valid price is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Customers Form
```javascript
const validate = () => {
  const newErrors = {};
  if (!formData.customer_name.trim()) newErrors.customer_name = 'Name is required';
  if (!formData.mobile_number.trim()) newErrors.mobile_number = 'Mobile number is required';
  else if (!/^\d{10}$/.test(formData.mobile_number)) newErrors.mobile_number = 'Invalid mobile number';
  if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

## 🎯 Common Patterns

### Loading State
```javascript
if (loading && data.length === 0) {
  return <LoadingIndicator />;
}
```

### Empty State
```javascript
<EmptyState
  icon="office-building"
  title="No Projects"
  message="Add your first project"
  actionText="Add Project"
  onActionPress={() => navigation.navigate('AddProject')}
/>
```

### Pull to Refresh
```javascript
const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {
  setRefreshing(true);
  await dispatch(fetchData());
  setRefreshing(false);
};

<FlatList
  refreshControl={
    <RefreshControl 
      refreshing={refreshing} 
      onRefresh={handleRefresh} 
      colors={[theme.colors.primary]} 
    />
  }
/>
```

### Delete Confirmation
```javascript
const handleDelete = (item) => {
  Alert.alert(
    'Delete Item',
    `Delete "${item.name}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteItem(item.id));
        },
      },
    ]
  );
};
```

---

## 🔍 Search Implementation
```javascript
const [searchQuery, setSearchQuery] = useState('');

const filteredData = data.filter(item =>
  item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.description?.toLowerCase().includes(searchQuery.toLowerCase())
);

<Searchbar
  placeholder="Search..."
  onChangeText={setSearchQuery}
  value={searchQuery}
/>
```

---

## 🎨 Theme Usage
```javascript
import { useTheme } from '../context';

const { theme } = useTheme();

<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.text }}>Hello</Text>
</View>
```

---

## 🐛 Debugging Tips

### Check Redux State
```javascript
const state = useSelector(state => state);
console.log('Redux State:', state);
```

### Check API Calls
```javascript
try {
  const result = await dispatch(fetchData()).unwrap();
  console.log('API Success:', result);
} catch (error) {
  console.error('API Error:', error);
}
```

### Check Navigation
```javascript
console.log('Current Route:', navigation.getState());
```

---

## 📦 Dependencies Used

- `@reduxjs/toolkit` - State management
- `react-redux` - Redux bindings
- `@react-navigation/native` - Navigation
- `@react-navigation/bottom-tabs` - Tab navigation
- `@react-navigation/native-stack` - Stack navigation
- `react-native-paper` - UI components
- `react-native-vector-icons` - Icons
- `@react-native-picker/picker` - Dropdown picker

---

## 🔗 API Endpoints Reference

### Projects
- GET `/api/master/projects` - List all
- POST `/api/master/projects` - Create
- GET `/api/master/projects/:id` - Get one
- PUT `/api/master/projects/:id` - Update
- DELETE `/api/master/projects/:id` - Delete

### Properties
- GET `/api/master/properties` - List all
- GET `/api/master/properties/project/:projectId` - By project
- POST `/api/master/properties` - Create
- GET `/api/master/properties/:id` - Get one
- PUT `/api/master/properties/:id` - Update
- DELETE `/api/master/properties/:id` - Delete

### Customers
- GET `/api/master/customers` - List all
- POST `/api/master/customers` - Create
- GET `/api/master/customers/:id` - Get one
- PUT `/api/master/customers/:id` - Update
- DELETE `/api/master/customers/:id` - Delete

---

## ✅ Testing Checklist

### For Each Module:
- [ ] List screen loads data
- [ ] Search functionality works
- [ ] Pull to refresh works
- [ ] Add screen creates new record
- [ ] Form validation works
- [ ] Edit screen loads and updates data
- [ ] Details screen displays all information
- [ ] Delete confirmation works
- [ ] Navigation between screens works
- [ ] Empty states display correctly
- [ ] Loading states display correctly
- [ ] Error handling works

---

## 🚨 Common Issues & Solutions

### Issue: Data not loading
**Solution**: Check if API endpoint is correct and backend is running

### Issue: Navigation not working
**Solution**: Verify screen names match in navigator and navigation calls

### Issue: Form not submitting
**Solution**: Check validation logic and ensure all required fields are filled

### Issue: Redux state not updating
**Solution**: Ensure you're using `.unwrap()` with async thunks

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the completion summary
3. Check Redux DevTools for state issues
4. Review React Native Debugger for component issues

---

*Last Updated: January 2025*
