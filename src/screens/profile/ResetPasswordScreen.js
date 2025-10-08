// Reset Password Screen - Matches Web Frontend API
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, HelperText } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../context';
import api from '../../config/api';

const ResetPasswordScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { showSuccess, showError, ToastComponent } = useToast();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const { currentPassword, newPassword } = formData;

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = 'New password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'New password must contain at least one number';
    }

    // Only require current password for non-SUPERADMIN users
    if (user?.role !== 'SUPERADMIN' && !currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        newPassword: formData.newPassword,
        ...(user?.role !== 'SUPERADMIN' && {
          currentPassword: formData.currentPassword,
        }),
      };

      await api.post(`/api/users/reset-password/${user.id}`, requestData);

      showSuccess('Password reset successfully!');
      
      setFormData({
        currentPassword: '',
        newPassword: '',
      });
      
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
      
    } catch (err) {
      let errorMsg = 'Failed to reset password';
      if (err.response) {
        if (err.response.status === 403) {
          errorMsg = 'Unauthorized to reset this user\'s password';
        } else if (err.response.status === 401) {
          errorMsg = 'Session expired. Please login again.';
        } else if (err.response.data?.error) {
          errorMsg = err.response.data.error;
        }
      }
      showError(errorMsg);
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const styles = getStyles(theme);

  return (
    <>
      <ToastComponent />
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Reset Password
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Update your password to keep your account secure
            </Text>

            {/* Current Password - Only for non-SUPERADMIN */}
            {user?.role !== 'SUPERADMIN' && (
              <>
                <TextInput
                  label="Current Password"
                  value={formData.currentPassword}
                  onChangeText={(value) => handleInputChange('currentPassword', value)}
                  secureTextEntry={!showPasswords.current}
                  right={
                    <TextInput.Icon
                      icon={showPasswords.current ? 'eye-off' : 'eye'}
                      onPress={() => togglePasswordVisibility('current')}
                    />
                  }
                  style={styles.input}
                  error={!!errors.currentPassword}
                />
                <HelperText type="error" visible={!!errors.currentPassword}>
                  {errors.currentPassword}
                </HelperText>
              </>
            )}

            {/* New Password */}
            <TextInput
              label="New Password"
              value={formData.newPassword}
              onChangeText={(value) => handleInputChange('newPassword', value)}
              secureTextEntry={!showPasswords.new}
              right={
                <TextInput.Icon
                  icon={showPasswords.new ? 'eye-off' : 'eye'}
                  onPress={() => togglePasswordVisibility('new')}
                />
              }
              style={styles.input}
              error={!!errors.newPassword}
            />
            <HelperText type="error" visible={!!errors.newPassword}>
              {errors.newPassword}
            </HelperText>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text variant="bodySmall" style={styles.requirementsTitle}>
                Password Requirements:
              </Text>
              <Text variant="bodySmall" style={styles.requirement}>
                • At least 8 characters long
              </Text>
              <Text variant="bodySmall" style={styles.requirement}>
                • Contains at least one uppercase letter
              </Text>
              <Text variant="bodySmall" style={styles.requirement}>
                • Contains at least one number
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
              >
                Reset Password
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 16,
    elevation: 4,
    backgroundColor: theme.colors.card,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
    backgroundColor: theme.colors.card,
  },
  requirementsContainer: {
    backgroundColor: theme.dark ? '#374151' : '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  requirementsTitle: {
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  requirement: {
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: theme.colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#EF4444',
  },
});

export default ResetPasswordScreen;
