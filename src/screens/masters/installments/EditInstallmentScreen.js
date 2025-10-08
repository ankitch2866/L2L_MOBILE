import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchInstallmentById,
  updateInstallment,
  clearError,
  clearCurrent,
} from '../../../store/slices/installmentsSlice';

const EditInstallmentScreen = ({ route, navigation }) => {
  const { installmentId } = route.params;
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((state) => state.installments);
  
  console.log('EditInstallmentScreen - Route params:', route.params);
  console.log('EditInstallmentScreen - InstallmentId:', installmentId);
  
  const [installmentName, setInstallmentName] = useState('');
  const [value, setValue] = useState('');
  const [isPercentage, setIsPercentage] = useState(true);
  const [dueDays, setDueDays] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadInstallmentDetails();
    
    return () => {
      dispatch(clearCurrent());
    };
  }, [installmentId]);

  useEffect(() => {
    console.log('Current installment data changed:', current);
    if (current && !isLoaded) {
      console.log('Setting form data from current installment:', current);
      setInstallmentName(current.installment_name || '');
      setValue(current.value?.toString() || '');
      setIsPercentage(current.is_percentage || false);
      setDueDays(current.due_days?.toString() || '');
      setDescription(current.description || '');
      setIsLoaded(true);
    }
  }, [current]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const loadInstallmentDetails = async () => {
    console.log('Loading installment details for ID:', installmentId);
    
    if (!installmentId) {
      console.error('InstallmentId is undefined! Cannot load installment details.');
      Alert.alert('Error', 'Installment ID is missing. Please go back and try again.');
      return;
    }
    
    const result = await dispatch(fetchInstallmentById(installmentId));
    console.log('Fetch installment result:', result);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!installmentName.trim()) {
      newErrors.installmentName = 'Installment name is required';
    }

    if (!value.trim()) {
      newErrors.value = 'Value is required';
    } else if (isNaN(parseFloat(value))) {
      newErrors.value = 'Value must be a number';
    } else if (parseFloat(value) <= 0) {
      newErrors.value = 'Value must be greater than 0';
    } else if (isPercentage && parseFloat(value) > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (!dueDays.trim()) {
      newErrors.dueDays = 'Due days is required';
    } else if (isNaN(parseInt(dueDays))) {
      newErrors.dueDays = 'Due days must be a number';
    } else if (parseInt(dueDays) < 0) {
      newErrors.dueDays = 'Due days cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const installmentData = {
      installment_name: installmentName.trim(),
      value: parseFloat(value),
      is_percentage: isPercentage,
      due_days: parseInt(dueDays),
      description: description.trim() || null,
    };

    console.log('Updating installment with ID:', installmentId, 'Data:', installmentData);
    const result = await dispatch(updateInstallment({ id: installmentId, data: installmentData }));
    console.log('Update installment result:', result);
    
    if (result.type === 'installments/update/fulfilled') {
      Alert.alert('Success', 'Installment updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else if (result.type === 'installments/update/rejected') {
      console.error('Update installment failed:', result.payload);
    }
  };

  if (loading && !isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading installment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            Update the installment details. Changes will be reflected in the payment plan.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Installment Details</Text>

          {/* Installment Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Installment Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.installmentName && styles.inputError]}
              placeholder="e.g., Booking Amount, First Installment"
              value={installmentName}
              onChangeText={(text) => {
                setInstallmentName(text);
                if (errors.installmentName) {
                  setErrors({ ...errors, installmentName: null });
                }
              }}
              editable={!loading}
            />
            {errors.installmentName && (
              <Text style={styles.errorText}>{errors.installmentName}</Text>
            )}
          </View>

          {/* Percentage Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Ionicons name="calculator-outline" size={20} color="#6B7280" />
                <Text style={styles.label}>Use Percentage</Text>
              </View>
              <Switch
                value={isPercentage}
                onValueChange={setIsPercentage}
                trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                thumbColor="#FFFFFF"
                disabled={loading}
              />
            </View>
            <Text style={styles.helperText}>
              {isPercentage ? 'Value will be calculated as percentage of total amount' : 'Value will be a fixed amount'}
            </Text>
          </View>

          {/* Value */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isPercentage ? 'Percentage' : 'Amount'} <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.inputPrefix}>{isPercentage ? '%' : '₹'}</Text>
              <TextInput
                style={[styles.inputWithPrefixField, errors.value && styles.inputError]}
                placeholder={isPercentage ? "e.g., 10" : "e.g., 50000"}
                value={value}
                onChangeText={(text) => {
                  setValue(text);
                  if (errors.value) {
                    setErrors({ ...errors, value: null });
                  }
                }}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
            {errors.value && (
              <Text style={styles.errorText}>{errors.value}</Text>
            )}
          </View>

          {/* Due Days */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Due Days <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.dueDays && styles.inputError]}
              placeholder="e.g., 30"
              value={dueDays}
              onChangeText={(text) => {
                setDueDays(text);
                if (errors.dueDays) {
                  setErrors({ ...errors, dueDays: null });
                }
              }}
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.dueDays && (
              <Text style={styles.errorText}>{errors.dueDays}</Text>
            )}
            <Text style={styles.helperText}>
              Number of days from booking date when this installment is due
            </Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional notes or details..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Update Installment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 12,
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    paddingLeft: 12,
    paddingRight: 8,
  },
  inputWithPrefixField: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 0,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditInstallmentScreen;
