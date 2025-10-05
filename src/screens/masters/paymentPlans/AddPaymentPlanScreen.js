import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  addPaymentPlan,
  clearError,
  clearSuccess,
} from '../../../store/slices/paymentPlansSlice';

const AddPaymentPlanScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.paymentPlans);
  
  const [planName, setPlanName] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      Alert.alert('Success', 'Payment plan created successfully! You can now add installments to this plan.', [
        {
          text: 'OK',
          onPress: () => {
            dispatch(clearSuccess());
            navigation.goBack();
          },
        },
      ]);
    }
  }, [success]);

  const validateForm = () => {
    const newErrors = {};

    if (!planName.trim()) {
      newErrors.planName = 'Plan name is required';
    } else if (planName.trim().length < 3) {
      newErrors.planName = 'Plan name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const planData = {
      plan_name: planName.trim(),
    };

    await dispatch(addPaymentPlan(planData));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            Create a payment plan first, then you can add installments to it from the plan details screen.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Payment Plan Details</Text>

          {/* Plan Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Plan Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.planName && styles.inputError]}
              placeholder="e.g., Standard Payment Plan, 12-Month Plan"
              value={planName}
              onChangeText={(text) => {
                setPlanName(text);
                if (errors.planName) {
                  setErrors({ ...errors, planName: null });
                }
              }}
              editable={!loading}
            />
            {errors.planName && (
              <Text style={styles.errorText}>{errors.planName}</Text>
            )}
            <Text style={styles.helperText}>
              Enter a descriptive name for this payment plan
            </Text>
          </View>
        </View>

        {/* Example Plans */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Example Plan Names:</Text>
          <TouchableOpacity
            style={styles.exampleItem}
            onPress={() => setPlanName('Construction Linked Plan')}
          >
            <Ionicons name="bulb-outline" size={16} color="#6B7280" />
            <Text style={styles.exampleText}>Construction Linked Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exampleItem}
            onPress={() => setPlanName('Down Payment Plan')}
          >
            <Ionicons name="bulb-outline" size={16} color="#6B7280" />
            <Text style={styles.exampleText}>Down Payment Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exampleItem}
            onPress={() => setPlanName('Flexi Payment Plan')}
          >
            <Ionicons name="bulb-outline" size={16} color="#6B7280" />
            <Text style={styles.exampleText}>Flexi Payment Plan</Text>
          </TouchableOpacity>
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
              <Text style={styles.submitButtonText}>Create Payment Plan</Text>
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
    marginBottom: 16,
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
  examplesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
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

export default AddPaymentPlanScreen;
