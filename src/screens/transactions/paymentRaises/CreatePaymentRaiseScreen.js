import React, { useState, useEffect } from 'react';
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
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    remarks: '',
    status: 'pending',
  });
  
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [paymentQueries, setPaymentQueries] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      fetchCustomers(formData.project_id);
      fetchPaymentQueries(formData.project_id);
    } else {
      setCustomers([]);
      setPaymentQueries([]);
      setFormData(prev => ({ ...prev, customer_id: '', payment_query_id: '' }));
    }
  }, [formData.project_id]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/master/projects');
      if (response.data?.success) {
        const projectsData = response.data.data || [];
        setProjects(projectsData.map(p => ({
          id: p.project_id,
          name: p.project_name,
        })));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to fetch projects');
    }
  };

  const fetchCustomers = async (projectId) => {
    try {
      const response = await api.get(`/master/customers/project/${projectId}`);
      if (response.data?.success) {
        const customersData = response.data.data || [];
        setCustomers(customersData.map(c => ({
          id: c.customer_id,
          name: c.customer_name,
        })));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to fetch customers');
      setCustomers([]);
    }
  };

  const fetchPaymentQueries = async (projectId) => {
    try {
      const response = await api.get(`/transaction/raise-payment/projects/${projectId}/queries`);
      if (response.data?.success) {
        const queriesData = response.data.data?.queries || [];
        setPaymentQueries(queriesData.map(q => ({
          id: q.id,
          name: q.description || `Query #${q.id}`,
          installment_name: q.installment_name,
          value: q.value,
          is_percentage: q.is_percentage,
        })));
      }
    } catch (error) {
      console.error('Error fetching payment queries:', error);
      setPaymentQueries([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.due_date) newErrors.due_date = 'Due date is required';

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
        amount: parseFloat(formData.amount),
        payment_query_id: formData.payment_query_id || null,
      };
      
      await dispatch(createRaise(submitData)).unwrap();
      Alert.alert('Success', 'Payment raise created successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchPaymentRaises());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
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

  const selectedQuery = paymentQueries.find(q => q.id === formData.payment_query_id);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Raise Information</Text>

            <Dropdown
              label="Project *"
              placeholder="Select project"
              value={formData.project_id}
              onValueChange={(value) => updateFormData('project_id', value)}
              items={projects}
              error={!!errors.project_id}
            />
            <HelperText type="error" visible={!!errors.project_id}>
              {errors.project_id}
            </HelperText>

            <Dropdown
              label="Customer *"
              placeholder="Select customer"
              value={formData.customer_id}
              onValueChange={(value) => updateFormData('customer_id', value)}
              items={customers}
              error={!!errors.customer_id}
              disabled={!formData.project_id}
            />
            <HelperText type="error" visible={!!errors.customer_id}>
              {errors.customer_id}
            </HelperText>

            <Dropdown
              label="Payment Query (Optional)"
              placeholder="Select payment query"
              value={formData.payment_query_id}
              onValueChange={(value) => updateFormData('payment_query_id', value)}
              items={paymentQueries}
              error={!!errors.payment_query_id}
              disabled={!formData.project_id}
            />
            <HelperText type="error" visible={!!errors.payment_query_id}>
              {errors.payment_query_id}
            </HelperText>

            {selectedQuery && (
              <Card style={styles.infoCard}>
                <Card.Content>
                  <Text style={styles.infoTitle}>Query Details</Text>
                  {selectedQuery.installment_name && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Installment:</Text>
                      <Text style={styles.infoValue}>{selectedQuery.installment_name}</Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Value:</Text>
                    <Text style={styles.infoValue}>
                      {selectedQuery.is_percentage 
                        ? `${selectedQuery.value}%` 
                        : `₹${parseFloat(selectedQuery.value).toLocaleString('en-IN')}`}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            <TextInput
              label="Amount *"
              value={formData.amount}
              onChangeText={(value) => updateFormData('amount', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.amount}
              keyboardType="numeric"
              left={<TextInput.Affix text="₹" />}
            />
            <HelperText type="error" visible={!!errors.amount}>
              {errors.amount}
            </HelperText>

            <TextInput
              label="Due Date *"
              value={formData.due_date}
              onChangeText={(value) => updateFormData('due_date', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.due_date}
              placeholder="YYYY-MM-DD"
            />
            <HelperText type="error" visible={!!errors.due_date}>
              {errors.due_date}
            </HelperText>

            <TextInput
              label="Remarks"
              value={formData.remarks}
              onChangeText={(value) => updateFormData('remarks', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.remarks}
              multiline
              numberOfLines={3}
            />
            <HelperText type="error" visible={!!errors.remarks}>
              {errors.remarks}
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
            Create Raise
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

export default CreatePaymentRaiseScreen;
