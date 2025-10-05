import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/store';
import { lightTheme } from './src/config/theme';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={lightTheme}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
