import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/store';
import { lightTheme, darkTheme } from './src/config/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components';
import { ThemeProvider, useTheme } from './src/context';

// Wrapper component to access theme context
const ThemedApp = () => {
  const { isDarkMode } = useTheme();
  const paperTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <AppNavigator />
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}
