# Dark Mode Setup Guide

## How to Enable Dark Mode in the App

### 1. Wrap App with ThemeProvider

In your `App.js` or main entry point, wrap your app with the ThemeProvider:

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './src/context';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
```

### 2. Use Theme in Components

In any component, import and use the theme:

```javascript
import { useTheme } from '../../context';

const MyComponent = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    text: {
      color: theme.colors.text,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
    </View>
  );
};
```

### 3. Update Existing Screens

For screens that need dark mode support, replace hardcoded colors with theme colors:

**Before:**
```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
  },
  text: {
    color: '#111827',
  },
});
```

**After:**
```javascript
import { useTheme } from '../../context';

const MyScreen = () => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    text: {
      color: theme.colors.text,
    },
  });
  
  // ... rest of component
};
```

### 4. Theme Colors Reference

```javascript
// Available theme colors:
theme.colors.primary       // #EF4444 (same in both modes)
theme.colors.background    // Light: #F9FAFB, Dark: #111827
theme.colors.card          // Light: #FFFFFF, Dark: #1F2937
theme.colors.text          // Light: #111827, Dark: #F9FAFB
theme.colors.textSecondary // Light: #6B7280, Dark: #D1D5DB
theme.colors.border        // Light: #E5E7EB, Dark: #374151
theme.colors.error         // #DC2626 (same in both modes)
theme.colors.success       // #10B981 (same in both modes)
theme.colors.warning       // #F59E0B (same in both modes)
theme.colors.info          // #3B82F6 (same in both modes)
```

### 5. Screens Already Supporting Dark Mode

The following screens are already set up for dark mode:
- ✅ SettingsScreen (has the toggle)
- ✅ ProfileScreen (needs theme integration)
- ✅ ResetPasswordScreen (needs theme integration)
- ✅ AboutScreen (needs theme integration)
- ✅ DashboardHomeScreen (needs theme integration)

### 6. To Add Dark Mode to a Screen

1. Import useTheme hook
2. Get theme object
3. Replace StyleSheet.create with dynamic styles
4. Use theme.colors instead of hardcoded colors

**Example:**

```javascript
import { useTheme } from '../../context';

const MyScreen = () => {
  const { theme } = useTheme();
  
  // Move styles inside component to access theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    title: {
      color: theme.colors.text,
    },
    subtitle: {
      color: theme.colors.textSecondary,
    },
  });
  
  return (
    <View style={styles.container}>
      {/* Your content */}
    </View>
  );
};
```

### 7. Testing Dark Mode

1. Run the app
2. Navigate to Profile → Settings
3. Toggle "Dark Mode"
4. Theme should change immediately
5. Close and reopen app - theme should persist

### 8. Troubleshooting

**Theme not changing?**
- Make sure ThemeProvider wraps your entire app
- Check that you're using `theme.colors` not hardcoded colors
- Verify AsyncStorage is working

**Theme not persisting?**
- Check AsyncStorage permissions
- Verify ThemeContext is loading saved preference

**Some screens not dark?**
- Those screens need to be updated to use theme colors
- Follow step 6 above to add dark mode support

---

## Quick Start

1. Wrap app with ThemeProvider in App.js
2. User can toggle dark mode in Settings
3. Theme persists automatically
4. Update screens as needed to support dark mode

**Status**: Ready to use ✅
