# Phase 2: Dashboard & Navigation - Design Document

## Overview

This design document outlines the technical approach for implementing Section 4: Main Dashboard of the L2L EPR Mobile App. The implementation will create a comprehensive dashboard experience that mirrors the web application while being optimized for mobile devices.

---

## Architecture

### Component Hierarchy

```
DashboardNavigator (Bottom Tabs)
└── DashboardHomeScreen (Main Container)
    ├── Header Section
    │   ├── Greeting Component
    │   └── User Info
    ├── Statistics Section
    │   └── StatisticsCards Component
    │       ├── StatCard (Properties)
    │       ├── StatCard (Customers)
    │       ├── StatCard (Bookings)
    │       └── StatCard (Revenue)
    ├── Quick Actions Section
    │   └── QuickActionsMenu Component
    │       ├── QuickActionButton (Add Customer)
    │       ├── QuickActionButton (New Booking)
    │       ├── QuickActionButton (View Properties)
    │       └── QuickActionButton (Reports)
    ├── Recent Activities Section
    │   └── RecentActivitiesList Component
    │       └── ActivityItem (repeated)
    └── Property Grid Section
        └── PropertyGridView Component
            └── PropertyCard (repeated)
```

### State Management

```
Redux Store
├── dashboardSlice
│   ├── statistics (loading, data, error)
│   ├── activities (loading, data, error)
│   └── properties (loading, data, error)
└── authSlice (existing)
    └── user
```

---

## Components and Interfaces

### 1. DashboardHomeScreen.js

**Purpose:** Main container for the dashboard

**Props:** None (uses navigation)

**State:**
- Local: greeting (string), refreshing (boolean)
- Redux: user, statistics, activities, properties

**Methods:**
- `getTimeBasedGreeting()` - Returns greeting based on time
- `handleRefresh()` - Refreshes all dashboard data
- `fetchDashboardData()` - Loads all dashboard data

**Layout:**
```javascript
<ScrollView>
  <PullToRefresh onRefresh={handleRefresh}>
    <Header />
    <StatisticsCards />
    <QuickActionsMenu />
    <RecentActivitiesList />
    <PropertyGridView />
  </PullToRefresh>
</ScrollView>
```

---

### 2. StatisticsCards.js

**Purpose:** Display key metrics in card format

**Props:**
- `statistics` (object) - Statistics data
- `loading` (boolean) - Loading state
- `onRefresh` (function) - Refresh callback

**Data Structure:**
```javascript
statistics = {
  totalProperties: number,
  totalCustomers: number,
  totalBookings: number,
  totalRevenue: number
}
```

**Component Structure:**
```javascript
<View style={styles.container}>
  <View style={styles.row}>
    <StatCard 
      title="Properties"
      value={statistics.totalProperties}
      icon="home"
      color="#3B82F6"
    />
    <StatCard 
      title="Customers"
      value={statistics.totalCustomers}
      icon="account-group"
      color="#10B981"
    />
  </View>
  <View style={styles.row}>
    <StatCard 
      title="Bookings"
      value={statistics.totalBookings}
      icon="calendar-check"
      color="#F59E0B"
    />
    <StatCard 
      title="Revenue"
      value={formatCurrency(statistics.totalRevenue)}
      icon="currency-inr"
      color="#EF4444"
    />
  </View>
</View>
```

---

### 3. StatCard.js (Reusable Component)

**Purpose:** Individual statistic card

**Props:**
- `title` (string) - Card title
- `value` (string|number) - Statistic value
- `icon` (string) - Icon name
- `color` (string) - Accent color
- `onPress` (function, optional) - Tap handler

**Styling:**
- Card: White background, rounded corners, shadow
- Icon: Colored circle background
- Title: Gray-600, 14px
- Value: Gray-900, 24px, bold

---

### 4. QuickActionsMenu.js

**Purpose:** Display quick action buttons

**Props:**
- `navigation` (object) - Navigation prop

**Actions Configuration:**
```javascript
const quickActions = [
  {
    id: 'add-customer',
    title: 'Add Customer',
    icon: 'account-plus',
    color: '#3B82F6',
    route: 'AddCustomer'
  },
  {
    id: 'new-booking',
    title: 'New Booking',
    icon: 'calendar-plus',
    color: '#10B981',
    route: 'NewBooking'
  },
  {
    id: 'view-properties',
    title: 'Properties',
    icon: 'home-city',
    color: '#F59E0B',
    route: 'Properties'
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'chart-bar',
    color: '#EF4444',
    route: 'Reports'
  }
];
```

**Layout:**
- 2x2 grid on mobile
- Touch-friendly buttons (minimum 44x44 points)
- Icon + label layout

---

### 5. QuickActionButton.js (Reusable Component)

**Purpose:** Individual quick action button

**Props:**
- `title` (string) - Button label
- `icon` (string) - Icon name
- `color` (string) - Button color
- `onPress` (function) - Tap handler

**Styling:**
- Button: Rounded, colored background
- Icon: White, 32px
- Label: White, 14px, centered below icon

---

### 6. RecentActivitiesList.js

**Purpose:** Display recent activities

**Props:**
- `activities` (array) - Activities data
- `loading` (boolean) - Loading state
- `onRefresh` (function) - Refresh callback

**Data Structure:**
```javascript
activity = {
  id: string,
  type: string, // 'booking', 'payment', 'customer', etc.
  description: string,
  timestamp: string (ISO 8601),
  user: string,
  icon: string
}
```

**Component Structure:**
```javascript
<View style={styles.container}>
  <Text style={styles.sectionTitle}>Recent Activities</Text>
  {loading ? (
    <LoadingIndicator />
  ) : activities.length === 0 ? (
    <EmptyState 
      icon="history"
      title="No Recent Activities"
      message="Activities will appear here"
    />
  ) : (
    <FlatList
      data={activities}
      renderItem={({ item }) => <ActivityItem activity={item} />}
      keyExtractor={(item) => item.id}
    />
  )}
</View>
```

---

### 7. ActivityItem.js (Reusable Component)

**Purpose:** Individual activity list item

**Props:**
- `activity` (object) - Activity data

**Layout:**
```
[Icon] Description
       User • Time ago
```

**Styling:**
- Icon: Colored circle, 40x40
- Description: Gray-900, 14px
- Meta: Gray-500, 12px

---

### 8. PropertyGridView.js

**Purpose:** Display properties in grid layout

**Props:**
- `properties` (array) - Properties data
- `loading` (boolean) - Loading state
- `onRefresh` (function) - Refresh callback

**Data Structure:**
```javascript
propertyCategory = {
  title: string,
  properties: [
    {
      id: string,
      title: string,
      image: string,
      category: string
    }
  ]
}
```

**Categories:**
1. THE RISE OF LIFESTYLE
2. CITY LIVING
3. INVESTMENT OPPORTUNITIES

**Component Structure:**
```javascript
<View style={styles.container}>
  {propertyCategories.map((category) => (
    <View key={category.title}>
      <Text style={styles.categoryTitle}>{category.title}</Text>
      <FlatList
        data={category.properties}
        renderItem={({ item }) => <PropertyCard property={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  ))}
</View>
```

---

### 9. PropertyCard.js (Reusable Component)

**Purpose:** Individual property card

**Props:**
- `property` (object) - Property data
- `onPress` (function) - Tap handler

**Layout:**
- Image: Aspect ratio 16:9
- Overlay: Gradient from transparent to black
- Title: White text at bottom

**Styling:**
- Card: Rounded corners, shadow
- Image: Cover fit
- Title: White, 16px, bold

---

## Data Models

### Statistics Model
```javascript
{
  totalProperties: number,
  totalCustomers: number,
  totalBookings: number,
  totalRevenue: number,
  lastUpdated: string (ISO 8601)
}
```

### Activity Model
```javascript
{
  id: string,
  type: 'booking' | 'payment' | 'customer' | 'property',
  description: string,
  timestamp: string (ISO 8601),
  user: string,
  metadata: object (optional)
}
```

### Property Model
```javascript
{
  id: string,
  title: string,
  category: string,
  image: string (URL),
  description: string (optional),
  price: number (optional)
}
```

---

## API Integration

### Endpoints

#### Get Dashboard Statistics
```
GET /api/dashboard/stats
Response: {
  totalProperties: number,
  totalCustomers: number,
  totalBookings: number,
  totalRevenue: number
}
```

#### Get Recent Activities
```
GET /api/dashboard/activities?limit=10
Response: {
  activities: Activity[]
}
```

#### Get Properties
```
GET /api/properties
Response: {
  properties: Property[]
}
```

### Redux Actions

```javascript
// dashboardSlice.js
export const fetchStatistics = createAsyncThunk(
  'dashboard/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

export const fetchActivities = createAsyncThunk(
  'dashboard/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/activities?limit=10');
      return response.data.activities;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

export const fetchProperties = createAsyncThunk(
  'dashboard/fetchProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/properties');
      return response.data.properties;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error);
    }
  }
);
```

---

## Error Handling

### Error States

1. **Network Error**
   - Display: Toast with "Network error. Please check your connection."
   - Action: Retry button

2. **API Error**
   - Display: Toast with error message from server
   - Action: Retry button

3. **No Data**
   - Display: EmptyState component with appropriate message
   - Action: Refresh button

### Error Handling Pattern

```javascript
try {
  await dispatch(fetchStatistics()).unwrap();
  showSuccess('Data loaded successfully');
} catch (error) {
  showError(error || 'Failed to load data');
}
```

---

## Testing Strategy

### Unit Tests

1. **Component Tests**
   - StatCard renders correctly with props
   - QuickActionButton handles press events
   - ActivityItem displays formatted time
   - PropertyCard displays image and title

2. **Redux Tests**
   - fetchStatistics action succeeds
   - fetchActivities action handles errors
   - Dashboard state updates correctly

### Integration Tests

1. **Dashboard Flow**
   - Dashboard loads all data on mount
   - Pull-to-refresh updates all sections
   - Quick actions navigate correctly
   - Property cards navigate to details

### User Acceptance Tests

1. **Visual Tests**
   - Dashboard displays correctly on different screen sizes
   - Statistics cards are readable
   - Images load properly
   - Colors match design system

2. **Interaction Tests**
   - All buttons are tappable
   - Pull-to-refresh works smoothly
   - Navigation is intuitive
   - Loading states are clear

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Load property images on demand
   - Use placeholder images while loading

2. **Caching**
   - Cache statistics for 5 minutes
   - Cache activities for 2 minutes
   - Cache properties for 10 minutes

3. **List Optimization**
   - Use FlatList for activities (virtualization)
   - Use FlatList for properties (virtualization)
   - Implement getItemLayout for better performance

4. **Memoization**
   - Use React.memo for StatCard
   - Use React.memo for PropertyCard
   - Use useMemo for expensive calculations

### Code Example

```javascript
// Memoized StatCard
export default React.memo(StatCard, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});

// Cached API call
const fetchStatistics = async () => {
  const cached = await AsyncStorage.getItem('dashboard_stats');
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  
  const response = await api.get('/dashboard/stats');
  await AsyncStorage.setItem('dashboard_stats', JSON.stringify({
    data: response.data,
    timestamp: Date.now()
  }));
  return response.data;
};
```

---

## Accessibility

### Requirements

1. **Screen Reader Support**
   - All buttons have accessible labels
   - Statistics have descriptive labels
   - Images have alt text

2. **Touch Targets**
   - Minimum 44x44 points for all interactive elements
   - Adequate spacing between buttons

3. **Color Contrast**
   - Text meets WCAG AA standards
   - Icons are distinguishable

### Implementation

```javascript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Add new customer"
  accessibilityRole="button"
  accessibilityHint="Opens the add customer form"
>
  <QuickActionButton title="Add Customer" />
</TouchableOpacity>
```

---

## Design System Integration

### Colors
- Primary: `#EF4444`
- Secondary: `#1F2937`
- Success: `#10B981`
- Warning: `#F59E0B`
- Info: `#3B82F6`
- Background: `#F9FAFB`
- Card: `#FFFFFF`

### Typography
- Heading: 24px, bold
- Subheading: 18px, semibold
- Body: 14px, regular
- Caption: 12px, regular

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Shadows
```javascript
shadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
}
```

---

## File Structure

```
src/
├── screens/
│   └── dashboard/
│       ├── DashboardHomeScreen.js       # Main dashboard
│       ├── StatisticsCards.js           # Statistics section
│       ├── QuickActionsMenu.js          # Quick actions
│       ├── RecentActivitiesList.js      # Activities list
│       └── PropertyGridView.js          # Property grid
├── components/
│   ├── StatCard.js                      # Stat card component
│   ├── QuickActionButton.js            # Action button
│   ├── ActivityItem.js                  # Activity item
│   └── PropertyCard.js                  # Property card
├── store/
│   └── slices/
│       └── dashboardSlice.js            # Dashboard state
└── utils/
    ├── formatters.js                    # Format utilities
    └── timeUtils.js                     # Time utilities
```

---

## Dependencies

### Existing
- React Navigation (navigation)
- Redux Toolkit (state management)
- Axios (API calls)
- React Native Paper (UI components)
- AsyncStorage (caching)
- Vector Icons (icons)

### New (None required)
All features can be implemented with existing dependencies.

---

## Migration from Web

### Web → Mobile Mapping

| Web Component | Mobile Component | Changes |
|---------------|------------------|---------|
| Dashboard.jsx | DashboardHomeScreen.js | ScrollView instead of div |
| PropertyGrid.jsx | PropertyGridView.js | FlatList instead of grid |
| Navbar.jsx | QuickActionsMenu.js | Simplified for mobile |
| Statistics (inline) | StatisticsCards.js | Dedicated component |
| Activities (none) | RecentActivitiesList.js | New feature |

### Key Differences

1. **Layout**
   - Web: CSS Grid/Flexbox
   - Mobile: React Native Flexbox + FlatList

2. **Images**
   - Web: `<img>` tags
   - Mobile: `<Image>` component with caching

3. **Navigation**
   - Web: React Router
   - Mobile: React Navigation

4. **Styling**
   - Web: CSS/Tailwind
   - Mobile: StyleSheet

---

## Next Steps

1. ✅ Requirements approved
2. ✅ Design document created
3. ⏭️ Create task list
4. ⏭️ Implement components
5. ⏭️ Test and refine

---

**Design Version:** 1.0  
**Date:** January 2025  
**Status:** ✅ Ready for Implementation
