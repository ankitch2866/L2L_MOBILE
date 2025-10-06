import { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

export const useToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // 'success', 'error', 'info', 'warning'

  const showToast = useCallback((msg, toastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
  }, []);

  const showSuccess = useCallback((msg) => {
    showToast(msg, 'success');
  }, [showToast]);

  const showError = useCallback((msg) => {
    showToast(msg, 'error');
  }, [showToast]);

  const showInfo = useCallback((msg) => {
    showToast(msg, 'info');
  }, [showToast]);

  const showWarning = useCallback((msg) => {
    showToast(msg, 'warning');
  }, [showToast]);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10B981'; // green
      case 'error':
        return '#EF4444'; // red
      case 'warning':
        return '#F59E0B'; // amber
      case 'info':
      default:
        return '#3B82F6'; // blue
    }
  };

  const ToastComponent = () => (
    <View style={styles.container}>
      <Snackbar
        visible={visible}
        onDismiss={hideToast}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
        action={{
          label: 'Close',
          onPress: hideToast,
          textColor: '#FFFFFF',
        }}
      >
        {message}
      </Snackbar>
    </View>
  );

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideToast,
    ToastComponent,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  snackbar: {
    marginBottom: 16,
  },
});
