import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text, Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { createRaise, fetchPaymentRaises } from '../../../store/slices/paymentRaisesSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const CreatePaymentRaiseScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    project_id: '',
    customer_id: '',
    payment_query_id: '',
    installment_id: '',
    payment_date: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
  });
  
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [paymentQueries, setPaymentQueries] = useState([]);
  const [usedPaymentQueries, setUsedPaymentQueries] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingPaymentQueries, setLoadingPaymentQueries] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch customers when project changes
  useEffect(() => {
    if (formData.project_id) {
      fetchCustomers(formData.project_id);
    } else {
      setCustomers([]);
      setFormData(prev => ({ ...prev, customer_id: '', payment_query_id: '', installment_id: '' }));
    }
  }, [formData.project_id]);

  // Fetch payment queries when project changes
  useEffect(() => {
    if (formData.project_id) {
      fetchUsedPaymentQueries(formData.project_id);
    } else {
      setPaymentQueries([]);
      setUsedPaymentQueries([]);
      setSelectedInstallment(null);
    }
  }, [formData.project_id]);

  // Fetch payment queries when customer is selected
  useEffect(() => {
    if (formData.customer_id && formData.project_id) {
      fetchPaymentQueries(formData.project_id, formData.customer_id);
    } else {
      setPaymentQueries([]);
      setSelectedInstallment(null);
      setFormData(prev => ({ ...prev, payment_query_id: '', installment_id: '', payment_date: '' }));
    }
  }, [formData.customer_id]);

  // Update installment when payment query changes
  useEffect(() => {
    if (formData.payment_query_id) {
      const selectedQuery = paymentQueries.find(q => q.value === formData.payment_query_id);
      if (selectedQuery) {
        setSelectedInstallment(selectedQuery);
        setFormData(prev => ({ 
          ...prev, 
          installment_id: selectedQuery.installment_id || selectedQuery.id,
          payment_date: calculatePaymentDate(selectedQuery.due_days)
        }));
      }
    } else {
      setSelectedInstallment(null);
      setFormData(prev => ({ ...prev, installment_id: '', payment_date: '' }));
    }
  }, [formData.payment_query_id, paymentQueries]);

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects for Payment Raises...');
      const response = await api.get('/api/master/projects');
      console.log('Projects API response:', response.data);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        const projectsData = response.data.data || [];
        console.log('Projects data:', projectsData.length, 'projects found');
        setProjects(projectsData.map(p => ({
          value: p.project_id,
          label: p.project_name,
        })));
      } else {
        console.log('No projects found or invalid response structure');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      Alert.alert('Error', 'Failed to fetch projects: ' + (error.message || 'Unknown error'));
    }
  };

  const fetchCustomers = async (projectId) => {
    try {
      const response = await api.get(`/api/master/customers/project/${projectId}`);
      if (response.data?.success) {
        const customersData = response.data.data || [];
        setCustomers(customersData.map(c => ({
          value: c.customer_id,
          label: c.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to fetch customers');
      setCustomers([]);
    }
  };

  const fetchUsedPaymentQueries = async (projectId, retryCount = 0) => {
    try {
      console.log('Fetching used payment queries for project:', projectId, 'retry:', retryCount);
      const response = await api.get(`/api/transaction/raise-payment/projects/${projectId}/used-queries`);
      console.log('Used payment queries response:', response.data);
      if (response.data?.success) {
        setUsedPaymentQueries(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching used payment queries:', error);
      console.error('Error details:', error.response?.data);
      
      // Retry once if it's a 500 error and we haven't retried yet
      if (error.response?.status === 500 && retryCount === 0) {
        console.log('Retrying used payment queries fetch...');
        setTimeout(() => {
          fetchUsedPaymentQueries(projectId, 1);
        }, 1000);
        return;
      }
      
      setUsedPaymentQueries([]);
    }
  };

  const fetchPaymentQueries = async (projectId, customerId) => {
    try {
      setLoadingPaymentQueries(true);
      const response = await api.get(`/api/transaction/raise-payment/projects/${projectId}/queries?customer_id=${customerId}`);
      if (response.data?.success) {
        const queriesData = response.data.data?.queries || [];
        const mappedQueries = queriesData.map(q => ({
          value: q.id,
          label: q.description 
            ? `${q.description} (${q.due_days || '0'} days)`
            : q.query_name
            ? `${q.query_name} (${q.due_days || '0'} days)`
            : `Query #${q.id} (${q.due_days || '0'} days)`,
          installment_id: q.installment_id,
          installment_name: q.installment_name,
          amount: q.value,
          due_days: q.due_days,
          is_percentage: q.is_percentage,
          payment_query_id: q.payment_query_id,
          raise_query_id: q.raise_query_id,
        }));
        setPaymentQueries(mappedQueries);
        
        // Check if customer has existing payment plan (filtered)
        const hasExistingPlan = queriesData.some(q => q.is_existing_plan);
        setIsFiltered(hasExistingPlan);
      }
    } catch (error) {
      console.error('Error fetching payment queries:', error);
      setPaymentQueries([]);
    } finally {
      setLoadingPaymentQueries(false);
    }
  };

  const calculatePaymentDate = (dueDays) => {
    if (!dueDays) return '';
    const today = new Date();
    const paymentDate = new Date(today.getTime() + (dueDays * 24 * 60 * 60 * 1000));
    return paymentDate.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.payment_query_id) newErrors.payment_query_id = 'Payment Query is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    // Check if selected payment query is already used
    const isUsedQuery = usedPaymentQueries.some(used => used.payment_query_id == formData.payment_query_id);
    if (isUsedQuery) {
      Alert.alert('Error', 'This payment query has already been used. Please select a different one.');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        date: formData.date,
        project_id: parseInt(formData.project_id),
        customer_id: parseInt(formData.customer_id),
        payment_query_id: parseInt(formData.payment_query_id),
        installment_id: parseInt(formData.installment_id),
        payment_date: formData.payment_date || '2025-09-26',
        state: 'PENDING'
      };
      
      console.log('Submitting payment raise data:', submitData);
      
      await dispatch(createRaise(submitData)).unwrap();
      Alert.alert('Success', 'Payment raise created successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchPaymentRaises());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      console.error('Payment raise creation error:', error);
      Alert.alert('Error', error || 'Failed to create payment raise');
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

  const handleClear = () => {
    setFormData({
      project_id: '',
      customer_id: '',
      payment_query_id: '',
      installment_id: '',
      payment_date: '',
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    });
    setSelectedInstallment(null);
    setCustomers([]);
    setPaymentQueries([]);
    setUsedPaymentQueries([]);
    setErrors({});
    setIsFiltered(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment Raise Information</Text>
            <Text style={styles.sectionSubtitle}>Fields marked with * are required</Text>

            {/* Project Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Project Details</Text>
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
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
                </View>

                <View style={styles.halfWidth}>
                  <Dropdown
                    label="Customer *"
                    placeholder="Select Customer"
                    value={formData.customer_id}
                    onValueChange={(value) => updateFormData('customer_id', value)}
                    items={customers}
                    error={!!errors.customer_id}
                    disabled={!formData.project_id}
                  />
                  <HelperText type="error" visible={!!errors.customer_id}>
                    {errors.customer_id}
                  </HelperText>
                </View>
              </View>
            </View>

            {/* Payment Query Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Query</Text>
                {isFiltered && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>Filtered by Customer's Payment Plan</Text>
                  </View>
                )}
                {!isFiltered && formData.customer_id && (
                  <View style={styles.firstTimeBadge}>
                    <Text style={styles.firstTimeBadgeText}>First Time - All Payment Plans Available</Text>
                  </View>
                )}
              </View>
              
              <Dropdown
                label="Payment Query *"
                placeholder={loadingPaymentQueries ? 'Loading payment queries...' : paymentQueries.length === 0 ? 'No payment queries available' : 'Select Payment Query'}
                value={formData.payment_query_id}
                onValueChange={(value) => updateFormData('payment_query_id', value)}
                items={paymentQueries.map(query => {
                  const isUsed = usedPaymentQueries.some(used => used.payment_query_id == query.value);
                  return {
                    ...query,
                    label: isUsed ? `${query.label} (Already Used)` : query.label,
                    disabled: isUsed
                  };
                })}
                error={!!errors.payment_query_id}
                disabled={!formData.project_id || loadingPaymentQueries || paymentQueries.length === 0}
              />
              <HelperText type="error" visible={!!errors.payment_query_id}>
                {errors.payment_query_id}
              </HelperText>

              {loadingPaymentQueries && (
                <Text style={styles.loadingText}>Loading payment queries...</Text>
              )}

              {/* No payment queries available message */}
              {!loadingPaymentQueries && paymentQueries.length === 0 && formData.customer_id && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    <Text style={styles.warningTitle}>No Payment Queries Available</Text>
                    {'\n'}There are no payment queries created for this project yet. Please create payment queries first before raising payments.
                  </Text>
                </View>
              )}

              {/* Information message about payment query filtering */}
              {formData.customer_id && !loadingPaymentQueries && paymentQueries.length > 0 && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    {isFiltered ? (
                      <>
                        <Text style={styles.infoTitle}>Customer has an existing payment plan</Text>
                        {'\n'}Only payment queries matching the customer's payment plan are shown.
                      </>
                    ) : (
                      <>
                        <Text style={styles.infoTitle}>First payment for this customer</Text>
                        {'\n'}All payment queries are available. After selection, the customer's payment plan will be set based on the selected installment.
                      </>
                    )}
                  </Text>
                </View>
              )}
            </View>

            {/* Installment Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Installment Details</Text>
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Installment (Auto-filled)</Text>
                  <View style={styles.readOnlyInput}>
                    <Text style={styles.readOnlyText}>
                      {selectedInstallment 
                        ? `${selectedInstallment.installment_name || selectedInstallment.name || 'Unknown Installment'} (₹${selectedInstallment.amount || selectedInstallment.value || 100000})`
                        : 'Select payment query first'
                      }
                    </Text>
                  </View>
                  
                  {selectedInstallment && (
                    <View style={styles.installmentInfo}>
                      <Text style={styles.installmentInfoText}>
                        <Text style={styles.installmentInfoTitle}>Selected:</Text> {selectedInstallment.installment_name || selectedInstallment.name || 'Unknown Installment'}
                        {'\n'}<Text style={styles.installmentInfoTitle}>Amount:</Text> ₹{selectedInstallment.amount || selectedInstallment.value || 'N/A'}
                        {'\n'}<Text style={styles.installmentInfoTitle}>Due Days:</Text> {selectedInstallment.due_days || 'N/A'} days
                        {selectedInstallment.is_percentage && '\n'}<Text style={styles.installmentInfoTitle}>Type:</Text> {selectedInstallment.is_percentage ? 'Percentage' : ''}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Payment Date (Auto-calculated)</Text>
                  <View style={styles.readOnlyInput}>
                    <Text style={styles.readOnlyText}>
                      {formData.payment_date 
                        ? new Date(formData.payment_date).toLocaleDateString('en-GB')
                        : 'Select installment first'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Date Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Date</Text>
              </View>
              
              <TextInput
                label="Date"
                value={formData.date}
                onChangeText={(text) => updateFormData('date', text)}
                mode="outlined"
                style={styles.input}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleClear}
            style={[styles.button, styles.clearButton]}
            textColor="#6B7280"
          >
            Clear
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={[styles.button, styles.submitButton]}
            buttonColor="#10B981"
          >
            {loading ? 'Creating...' : 'Submit'}
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
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    paddingLeft: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    minHeight: 48,
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  firstTimeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  firstTimeBadgeText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  infoTitle: {
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  warningTitle: {
    fontWeight: '600',
  },
  installmentInfo: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  installmentInfoText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  installmentInfoTitle: {
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    minWidth: 100,
  },
  clearButton: {
    borderColor: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
});

export default CreatePaymentRaiseScreen;
