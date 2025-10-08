import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text, Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { generateQuery, fetchPaymentQueries } from '../../../store/slices/paymentQueriesSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const GeneratePaymentQueryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    project_id: '',
    payment_plan_id: '',
    installment_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [projects, setProjects] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [usedInstallments, setUsedInstallments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);
  const [isLoadingUsedInstallments, setIsLoadingUsedInstallments] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchPaymentPlans();
  }, []);

  // Fetch installments when project changes
  useEffect(() => {
    if (formData.project_id) {
      fetchUsedInstallments(formData.project_id);
    } else {
      setUsedInstallments([]);
      setInstallments([]);
      setFormData(prev => ({ ...prev, payment_plan_id: '', installment_id: '' }));
    }
  }, [formData.project_id]);

  // Fetch installments when payment plan changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.payment_plan_id) {
        fetchInstallmentsByPaymentPlan(formData.payment_plan_id);
        // Also refresh used installments when payment plan changes
        if (formData.project_id) {
          fetchUsedInstallments(formData.project_id);
        }
      } else {
        setInstallments([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.payment_plan_id]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        const projectsData = response.data.data || [];
        setProjects(projectsData.map(p => ({
          value: p.project_id,
          label: p.project_name,
        })));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to fetch projects');
    }
  };

  const fetchPaymentPlans = async () => {
    try {
      const response = await api.get('/api/transaction/payment-query/payment-plans');
      if (response.data?.success) {
        const plansData = response.data.data?.payment_plans || [];
        setPaymentPlans(plansData.map(p => ({
          value: p.id,
          label: p.plan_name,
        })));
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      Alert.alert('Error', 'Failed to fetch payment plans');
    }
  };

  const fetchInstallmentsByPaymentPlan = async (paymentPlanId) => {
    try {
      setIsLoadingInstallments(true);
      const response = await api.get(`/api/transaction/payment-query/payment-plans/${paymentPlanId}/installments`);
      if (response.data?.success) {
        const installmentsData = response.data.data?.installments || [];
        setInstallments(installmentsData.map(i => ({
          value: i.id,
          label: i.installment_name || i.name,
          due_days: i.due_days,
          amount: i.value,
          is_percentage: i.is_percentage,
        })));
      }
    } catch (error) {
      console.error('Error fetching installments:', error);
      Alert.alert('Error', 'Failed to fetch installments');
      setInstallments([]);
    } finally {
      setIsLoadingInstallments(false);
    }
  };

  const fetchUsedInstallments = async (projectId) => {
    try {
      setIsLoadingUsedInstallments(true);
      const response = await api.get(`/api/transaction/payment-query/projects/${projectId}/used-installments`);
      if (response.data?.success) {
        const usedData = response.data.data?.used_installments || [];
        setUsedInstallments(usedData.map(i => i.installment_id || i.id));
      }
    } catch (error) {
      console.error('Error fetching used installments:', error);
      // Don't show error for this as it's not critical
      setUsedInstallments([]);
    } finally {
      setIsLoadingUsedInstallments(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.payment_plan_id) newErrors.payment_plan_id = 'Payment plan is required';
    if (!formData.installment_id) newErrors.installment_id = 'Installment is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';

    // Check if the selected installment is already used in this project
    if (formData.installment_id && usedInstallments.includes(parseInt(formData.installment_id))) {
      newErrors.installment_id = 'This installment has already been used for this project. Please select a different installment.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        project_id: formData.project_id || null,
        payment_plan_id: formData.payment_plan_id || null,
      };
      
      await dispatch(generateQuery(submitData)).unwrap();
      Alert.alert('Success', 'Payment query generated successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchPaymentQueries());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to generate payment query');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const selectedInstallment = installments.find(i => i.value === formData.installment_id);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Payment Query Information Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment Query Information</Text>

            <Dropdown
              label="Project *"
              placeholder="Select Project"
              value={formData.project_id}
              onValueChange={(value) => updateFormData('project_id', value)}
              items={projects}
              error={!!errors.project_id}
            />
            <HelperText type="error" visible={!!errors.project_id}>
              {errors.project_id}
            </HelperText>

            <TextInput
              label="Date"
              value={formData.date}
              onChangeText={(value) => updateFormData('date', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.date}
              placeholder="YYYY-MM-DD"
            />
            <HelperText type="error" visible={!!errors.date}>
              {errors.date}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Installment Details Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Installment Details</Text>

            <Dropdown
              label="Installment Plan *"
              placeholder="Select Payment Plan"
              value={formData.payment_plan_id}
              onValueChange={(value) => updateFormData('payment_plan_id', value)}
              items={paymentPlans}
              error={!!errors.payment_plan_id}
            />
            <HelperText type="error" visible={!!errors.payment_plan_id}>
              {errors.payment_plan_id}
            </HelperText>

            <Dropdown
              label="Installment *"
              placeholder={isLoadingInstallments ? "Loading installments..." : "Select Installment"}
              value={formData.installment_id}
              onValueChange={(value) => updateFormData('installment_id', value)}
              items={installments.map(installment => {
                const isUsed = usedInstallments.includes(installment.value);
                return {
                  ...installment,
                  label: `${installment.label} (${installment.is_percentage ? `${installment.amount}%` : `₹${installment.amount}`})${isUsed ? ' (Already Used)' : ''}`,
                  disabled: isUsed
                };
              })}
              error={!!errors.installment_id}
              disabled={!formData.payment_plan_id || isLoadingInstallments}
            />
            <HelperText type="error" visible={!!errors.installment_id}>
              {errors.installment_id}
            </HelperText>

            {selectedInstallment && (
              <Card style={styles.infoCard}>
                <Card.Content>
                  <Text style={styles.infoTitle}>Installment Details</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Due Days:</Text>
                    <Text style={styles.infoValue}>{selectedInstallment.due_days} days</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Value:</Text>
                    <Text style={styles.infoValue}>
                      {selectedInstallment.is_percentage 
                        ? `${selectedInstallment.amount}%` 
                        : `₹${parseFloat(selectedInstallment.amount).toLocaleString('en-IN')}`}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          </Card.Content>
        </Card>

        {/* Additional Information Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.description}
              multiline
              numberOfLines={3}
              placeholder="Enter description"
            />
            <HelperText type="error" visible={!!errors.description}>
              {errors.description}
            </HelperText>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Generate Query
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});

export default GeneratePaymentQueryScreen;
