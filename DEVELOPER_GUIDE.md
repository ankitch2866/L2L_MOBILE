# Developer Guide - Phase 2 Components

## Quick Reference for Using Phase 2 Components

### 📱 Dashboard Components

#### DashboardHomeScreen
Main dashboard screen with all features integrated.

```javascript
import { DashboardHomeScreen } from './screens/dashboard';

// Usage in navigator
<Stack.Screen name="Dashboard" component={DashboardHomeScreen} />
```

#### StatisticsCards
Display key metrics in card format.

```javascript
import StatisticsCards from './screens/dashboard/StatisticsCards';

<StatisticsCards />
// Automatically fetches and displays statistics from Redux store
```

#### QuickActionsMenu
Grid of quick action buttons.

```javascript
import QuickActionsMenu from './screens/dashboard/QuickActionsMenu';

<QuickActionsMenu navigation={navigation} />
```

#### RecentActivitiesList
Timeline of recent activities.

```javascript
import RecentActivitiesList from './screens/dashboard/RecentActivitiesList';

<RecentActivitiesList />
// Automatically fetches and displays activities from Redux store
```

#### PropertyGridView
Horizontal scrolling grid of properties.

```javascript
import PropertyGridView from './screens/dashboard/PropertyGridView';

<PropertyGridView navigation={navigation} />
```

---

### 🧭 Navigation Components

#### TopNavigationBar
App header with menu, title, and actions.

```javascript
import { TopNavigationBar } from './components';

<TopNavigationBar 
  title="My Screen"
  navigation={navigation}
  showBackButton={false}
  showMenuButton={true}
  actions={[
    { 
      icon: 'refresh', 
      onPress: () => console.log('Refresh') 
    },
    { 
      icon: 'filter', 
      onPress: () => console.log('Filter') 
    }
  ]}
/>
```

#### BreadcrumbNavigation
Breadcrumb trail for navigation.

```javascript
import { BreadcrumbNavigation } from './components';

<BreadcrumbNavigation 
  breadcrumbs={[
    { title: 'Home', route: 'Home' },
    { title: 'Projects', route: 'Projects' },
    { title: 'Details', route: 'ProjectDetails' }
  ]}
  onBreadcrumbPress={(breadcrumb, index) => {
    // Navigate to breadcrumb route
    navigation.navigate(breadcrumb.route);
  }}
/>
```

#### DrawerContent
Side menu with hierarchical navigation.

```javascript
import { DrawerContent } from './navigation';

// Usage in drawer navigator
<Drawer.Navigator
  drawerContent={(props) => <DrawerContent {...props} />}
>
  {/* Your screens */}
</Drawer.Navigator>
```

---

### 🪝 Custom Hooks

#### useBackHandler
Handle Android back button.

```javascript
import { useBackHandler } from './hooks';

// Basic usage
useBackHandler(() => {
  // Custom back button logic
  navigation.goBack();
  return true; // Prevent default behavior
});

// With exit confirmation
useBackHandler(null, true); // Shows exit dialog on home screen
```

#### useDoubleBackToExit
Double-tap to exit app.

```javascript
import { useDoubleBackToExit } from './hooks';

const handleBackPress = useDoubleBackToExit(2000); // 2 second delay
useBackHandler(handleBackPress);
```

#### usePreventBack
Prevent back navigation with confirmation.

```javascript
import { usePreventBack } from './hooks';

usePreventBack(
  hasUnsavedChanges, 
  'You have unsaved changes. Are you sure you want to go back?'
);
```

---

### 👤 Profile Components

#### ProfileViewScreen
Display user profile information.

```javascript
import { ProfileViewScreen } from './screens/profile';

<Stack.Screen name="Profile" component={ProfileViewScreen} />
```

#### ChangePasswordScreen
Password change form with validation.

```javascript
import { ChangePasswordScreen } from './screens/profile';

<Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
```

#### UserSettingsScreen
User preferences and settings.

```javascript
import { UserSettingsScreen } from './screens/profile';

<Stack.Screen name="UserSettings" component={UserSettingsScreen} />
```

---

### 🎨 Reusable Components

#### StatCard
Individual statistic card.

```javascript
import { StatCard } from './components';

<StatCard
  title="Total Properties"
  value={150}
  icon="home"
  color="#3B82F6"
  loading={false}
/>
```

#### QuickActionButton
Action button for quick access.

```javascript
import { QuickActionButton } from './components';

<QuickActionButton
  icon="plus"
  label="Add New"
  onPress={() => console.log('Add')}
  color="#10B981"
/>
```

#### ActivityItem
Individual activity in timeline.

```javascript
import { ActivityItem } from './components';

<ActivityItem
  activity={{
    id: '1',
    type: 'booking',
    description: 'New booking created',
    timestamp: '2025-01-04T10:00:00Z',
    user: 'John Doe'
  }}
/>
```

#### PropertyCard
Property card with image.

```javascript
import { PropertyCard } from './components';

<PropertyCard
  property={{
    id: '1',
    title: 'Grandeur Estates',
    category: 'THE RISE OF LIFESTYLE',
    image: 'https://example.com/image.jpg'
  }}
  onPress={() => console.log('Property pressed')}
/>
```

---

### 🔄 Redux Store Usage

#### Dashboard Slice

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchStatistics, 
  fetchActivities, 
  fetchProperties 
} from './store/slices/dashboardSlice';

// In your component
const dispatch = useDispatch();
const { statistics, activities, properties, loading, error } = 
  useSelector((state) => state.dashboard);

// Fetch data
useEffect(() => {
  dispatch(fetchStatistics());
  dispatch(fetchActivities());
  dispatch(fetchProperties());
}, []);

// Access data
console.log(statistics.totalProperties); // 150
console.log(activities); // Array of activities
console.log(properties); // Array of properties
```

---

### 🛠️ Utilities

#### Time Utilities

```javascript
import { 
  getTimeBasedGreeting, 
  formatRelativeTime, 
  formatDate 
} from './utils/timeUtils';

// Get greeting based on time
const greeting = getTimeBasedGreeting(); // "Good Morning"

// Format relative time
const relativeTime = formatRelativeTime('2025-01-04T10:00:00Z'); 
// "2 hours ago"

// Format date
const formattedDate = formatDate('2025-01-04T10:00:00Z'); 
// "Jan 4, 2025"
```

---

### 🎯 Common Patterns

#### Screen with Loading State

```javascript
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { LoadingIndicator } from './components';
import { useDispatch, useSelector } from 'react-redux';

const MyScreen = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.mySlice);

  useEffect(() => {
    dispatch(fetchData());
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View>
      {/* Your content */}
    </View>
  );
};
```

#### Screen with Toast Notifications

```javascript
import React from 'react';
import { View, Button } from 'react-native';
import { useToast } from './components';

const MyScreen = () => {
  const { showSuccess, showError, ToastComponent } = useToast();

  const handleAction = async () => {
    try {
      // Your async action
      showSuccess('Action completed successfully!');
    } catch (error) {
      showError('Action failed: ' + error.message);
    }
  };

  return (
    <>
      <ToastComponent />
      <View>
        <Button title="Do Action" onPress={handleAction} />
      </View>
    </>
  );
};
```

#### Screen with Pull-to-Refresh

```javascript
import React, { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';

const MyScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch fresh data
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#EF4444']}
          tintColor="#EF4444"
        />
      }
    >
      {/* Your content */}
    </ScrollView>
  );
};
```

---

### 🎨 Styling Guidelines

#### Colors

```javascript
const colors = {
  primary: '#EF4444',
  background: '#F9FAFB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};
```

#### Spacing

```javascript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

#### Typography

```javascript
const typography = {
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
  },
};
```

---

### 🔧 Configuration

#### API Configuration

```javascript
// src/config/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://your-api-url.com/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getToken(); // Get from AsyncStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

### 📝 Best Practices

1. **Always use hooks at the top level**
   ```javascript
   // ✅ Good
   const MyComponent = () => {
     const { user } = useSelector((state) => state.auth);
     // ...
   };

   // ❌ Bad
   const MyComponent = () => {
     if (condition) {
       const { user } = useSelector((state) => state.auth); // Don't do this
     }
   };
   ```

2. **Handle loading and error states**
   ```javascript
   // ✅ Good
   if (loading) return <LoadingIndicator />;
   if (error) return <ErrorMessage error={error} />;
   return <Content data={data} />;
   ```

3. **Use Toast for user feedback**
   ```javascript
   // ✅ Good
   try {
     await saveData();
     showSuccess('Data saved successfully!');
   } catch (error) {
     showError('Failed to save data');
   }
   ```

4. **Clean up effects**
   ```javascript
   // ✅ Good
   useEffect(() => {
     const interval = setInterval(() => {
       // Do something
     }, 1000);

     return () => clearInterval(interval); // Cleanup
   }, []);
   ```

---

### 🐛 Troubleshooting

#### Dashboard shows "Not Found" errors
This is expected. The app uses mock data until backend endpoints are created.

#### Navigation not working
Make sure you're passing the `navigation` prop to components that need it.

#### Redux state not updating
Check that you're dispatching actions correctly and that reducers are handling them.

#### Styles not applying
Make sure you're using StyleSheet.create() and applying styles correctly.

---

### 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

---

**Last Updated**: October 4, 2025
**Version**: 2.0.0
