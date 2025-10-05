// Theme Configuration
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#EF4444',
    secondary: '#1F2937',
    tertiary: '#6B7280',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    error: '#DC2626',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#111827',
    onSurfaceVariant: '#6B7280',
    onBackground: '#111827',
    outline: '#E5E7EB',
    outlineVariant: '#D1D5DB',
    // Custom colors
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
    notification: '#EF4444',
  },
  roundness: 8,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#EF4444',
    secondary: '#F9FAFB',
    tertiary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    error: '#DC2626',
    onPrimary: '#FFFFFF',
    onSecondary: '#111827',
    onSurface: '#F9FAFB',
    onSurfaceVariant: '#D1D5DB',
    onBackground: '#F9FAFB',
    outline: '#4B5563',
    outlineVariant: '#374151',
    // Custom colors
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    card: '#1F2937',
    notification: '#EF4444',
  },
  roundness: 8,
};

// Common styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  padding: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
};
