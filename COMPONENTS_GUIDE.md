# 📦 Common Components Quick Reference Guide

## Overview
This guide provides quick reference for all common components in the mobile app.

---

## 🔄 LoadingIndicator

**Purpose:** Display loading state with spinner

**Import:**
```javascript
import { LoadingIndicator } from '../components';
```

**Props:**
- `message` (string, optional) - Text to display below spinner
- `size` (string, optional) - 'small' or 'large' (default: 'large')
- `color` (string, optional) - Spinner color (default: '#EF4444')

**Usage:**
```javascript
// Simple
<LoadingIndicator />

// With message
<LoadingIndicator message="Loading data..." />

// Custom
<LoadingIndicator 
  message="Please wait..." 
  size="small" 
  color="#3B82F6" 
/>
```

**When to use:**
- Initial data loading
- Full-screen loading states
- Async operations

---

## 🛡️ ErrorBoundary

**Purpose:** Catch and handle React component errors

**Import:**
```javascript
import { ErrorBoundary } from '../components';
```

**Props:**
- `children` (ReactNode) - Components to wrap

**Usage:**
```javascript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches errors in child components
- Displays user-friendly error message
- Shows error details in development
- "Try Again" button to reset
- Already integrated in App.js

**When to use:**
- Wrap entire app (already done)
- Wrap critical sections
- Wrap third-party components

---

## 🔔 Toast / Alert Messages

**Purpose:** Show temporary notification messages

**Import:**
```javascript
import { useToast } from '../components';
```

**Hook API:**
```javascript
const {
  showToast,      // Generic toast
  showSuccess,    // Green success toast
  showError,      // Red error toast
  showWarning,    // Orange warning toast
  showInfo,       // Blue info toast
  hideToast,      // Manually hide
  ToastComponent, // Component to render
} = useToast();
```

**Usage:**
```javascript
const MyScreen = () => {
  const { showSuccess, showError, ToastComponent } = useToast();
  
  const handleAction = async () => {
    try {
      await someAction();
      showSuccess('Action completed!');
    } catch (error) {
      showError('Action failed');
    }
  };
  
  return (
    <>
      <ToastComponent />
      <Button onPress={handleAction}>Do Action</Button>
    </>
  );
};
```

**Toast Types:**
```javascript
// Success (green)
showSuccess('Login successful!');

// Error (red)
showError('Failed to load data');

// Warning (orange)
showWarning('Please check your input');

// Info (blue)
showInfo('New update available');

// Custom duration
showToast('Custom message', 'success', 5000);
```

**When to use:**
- Success confirmations
- Error messages
- Warnings
- Info notifications
- Non-blocking feedback

---

## 📭 EmptyState

**Purpose:** Display when no data is available

**Import:**
```javascript
import { EmptyState } from '../components';
```

**Props:**
- `icon` (string, optional) - Icon name (default: 'inbox')
- `title` (string, optional) - Main heading
- `message` (string, optional) - Description text
- `actionLabel` (string, optional) - Button text
- `onAction` (function, optional) - Button callback
- `iconSize` (number, optional) - Icon size (default: 80)
- `iconColor` (string, optional) - Icon color (default: '#9CA3AF')

**Usage:**
```javascript
// Simple
<EmptyState />

// With custom text
<EmptyState
  icon="inbox"
  title="No Items Found"
  message="You don't have any items yet."
/>

// With action button
<EmptyState
  icon="account-plus"
  title="No Customers"
  message="Start by adding your first customer."
  actionLabel="Add Customer"
  onAction={() => navigation.navigate('AddCustomer')}
/>
```

**Common Icons:**
- `inbox` - No data
- `magnify` - No search results
- `alert-circle` - Error state
- `wifi-off` - No connection
- `account-plus` - No users
- `file-document` - No documents

**When to use:**
- Empty lists
- No search results
- No data available
- First-time user experience

---

## 🔄 PullToRefresh

**Purpose:** Add pull-to-refresh functionality

**Import:**
```javascript
import { PullToRefresh } from '../components';
```

**Props:**
- `children` (ReactNode) - Content to wrap
- `onRefresh` (function) - Async function to call on refresh
- `refreshing` (boolean, optional) - External loading state

**Usage:**
```javascript
// Basic
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    // Fetch data
  } finally {
    setLoading(false);
  }
};

<PullToRefresh onRefresh={fetchData} refreshing={loading}>
  <YourContent />
</PullToRefresh>
```

**With FlatList:**
```javascript
<PullToRefresh onRefresh={fetchData}>
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={(item) => item.id}
  />
</PullToRefresh>
```

**When to use:**
- List screens
- Data that can be refreshed
- Real-time updates
- User-initiated refresh

---

## 🎨 Styling Guidelines

### Colors
All components use the app's color scheme:
- Primary: `#EF4444`
- Secondary: `#1F2937`
- Success: `#10B981`
- Error: `#DC2626`
- Warning: `#F59E0B`
- Info: `#3B82F6`

### Customization
Components accept style props where applicable:
```javascript
<EmptyState iconColor="#EF4444" />
<LoadingIndicator color="#3B82F6" />
```

---

## 📱 Complete Example Screen

```javascript
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import {
  LoadingIndicator,
  EmptyState,
  PullToRefresh,
  useToast,
} from '../components';

const MyListScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, ToastComponent } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/data');
      setData(response.data);
      showSuccess('Data loaded successfully');
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Initial loading
  if (loading && data.length === 0) {
    return <LoadingIndicator message="Loading data..." />;
  }

  // Empty state
  if (!loading && data.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="No Data Available"
        message="Pull down to refresh or add new items."
        actionLabel="Add Item"
        onAction={() => navigation.navigate('AddItem')}
      />
    );
  }

  // Data list with refresh
  return (
    <>
      <ToastComponent />
      <PullToRefresh onRefresh={fetchData} refreshing={loading}>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text>{item.name}</Text>
              </Card.Content>
            </Card>
          )}
          keyExtractor={(item) => item.id}
        />
      </PullToRefresh>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
  },
});

export default MyListScreen;
```

---

## 🔍 Best Practices

### LoadingIndicator
- ✅ Use for full-screen loading
- ✅ Show meaningful messages
- ❌ Don't use for inline loading (use ActivityIndicator)

### ErrorBoundary
- ✅ Already wraps entire app
- ✅ Add to critical sections
- ✅ Test error scenarios

### Toast
- ✅ Use for non-blocking feedback
- ✅ Keep messages short
- ✅ Use appropriate types
- ❌ Don't use for critical errors (use Alert)

### EmptyState
- ✅ Always show when no data
- ✅ Provide helpful messages
- ✅ Add actions when possible
- ✅ Use appropriate icons

### PullToRefresh
- ✅ Use on list screens
- ✅ Make refresh fast
- ✅ Show loading state
- ❌ Don't use on forms

---

## 🚀 Quick Start Checklist

- [ ] Import components from `'../components'`
- [ ] Add `<ToastComponent />` to screens using toast
- [ ] Wrap lists with `<PullToRefresh>`
- [ ] Show `<EmptyState>` when no data
- [ ] Use `<LoadingIndicator>` for initial loads
- [ ] ErrorBoundary already integrated in App.js

---

## 📚 Additional Resources

- **React Native Paper:** https://callstack.github.io/react-native-paper/
- **Vector Icons:** https://oblador.github.io/react-native-vector-icons/
- **React Navigation:** https://reactnavigation.org/

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** ✅ All components ready for use
