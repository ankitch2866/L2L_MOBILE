import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { createPayment, fetchPayments } from '../../../store/slices/paymentsSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const PaymentEntryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    project_id: '',
    unit_id: '',
    amount: '',
    payment_method: '',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_id: '',
    cheque_number: '',
    bank_id: '',
    remarks: '',
  });
  
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [banks, setBanks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'cash', name: 'Cash' },
    { id: 'cheque', name: 'Cheque' },
    { id: 'online', name: 'Online Transfer' },
    { id: 'card', name: 'Card' },
    { id: 'upi', name: 'UPI' },
  ];

  useEffect(() => {
    fetchCustomers();
    fetchProjects();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      fetchUnits(formData.project_id);
    }
  }, [formData.project_id]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/master/customers');
      if (response.data?.success) {
        setCustomers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/master/projects');
      if (response.data?.success) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUnits = async (projectId) => {
    try {
      const response = await api.get(`/master/units/project/${projectId}`);
      if (response.data?.success) {
        setUnits(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await api.get('/master/banks');
      if (response.data?.success) {
        setBanks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.payment_method) newErrors.payment_method = 'Payment method is required';
    if (!formData.payment_date) newErrors.payment_date = 'Payment date is required';
    
    if (formData.payment_method === 'cheque' && !formData.cheque_number) {
      newErrors.cheque_number = 'Cheque number is required';
    }
    
    if (formData.payment_method === 'online' && !formData.transaction_id) {
      newErrors.transaction_id = 'Transaction ID is required';
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
      await dispatch(createPayment(formData)).unwrap();
      Alert.alert('Success', 'Payment recorded successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchPayments());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to record payment');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Payment Information</Text>

          <Dropdown
            label="Customer *"
            value={formData.customer_id}
            onValueChange={(value) => updateFormData('customer_id', value)}
            items={customers.map(c => ({ label: c.name, value: c.customer_id }))}
            error={!!errors.customer_id}
          />
          <HelperText type="error" visible={!!errors.customer_id}>
            {errors.customer_id}
          </HelperText>

          <Dropdown
            label="Project"
            value={formData.project_id}
            onValueChange={(value) => updateFormData('project_id', value)}
            items={projects.map(p => ({ label: p.project_name, value: p.project_id }))}
          />

          {formData.project_id && units.length > 0 && (
            <Dropdown
              label="Unit"
              value={formData.unit_id}
              onValueChange={(value) => updateFormData('unit_id', value)}
              items={units.map(u => ({ label: u.unit_name || `Unit ${u.unit_id}`, value: u.unit_id }))}
            />
          )}

          <TextInput
            label="Amount *"
            value={formData.amount}
            onChangeText={(value) => updateFormData('amount', value)}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            error={!!errors.amount}
            left={<TextInput.Icon icon="currency-inr" />}
          />
          <HelperText type="error" visible={!!errors.amount}>
            {errors.amount}
          </HelperText>

          <Dropdown
            label="Payment Method *"
            value={formData.payment_method}
            onValueChange={(value) => updateFormData('payment_method', value)}
            items={paymentMethods.map(pm => ({ label: pm.name, value: pm.id }))}
            error={!!errors.payment_method}
          />
          <HelperText type="error" visible={!!errors.payment_method}>
            {errors.payment_method}
          </HelperText>

          <TextInput
            label="Payment Date *"
            value={formData.payment_date}
            onChangeText={(value) => updateFormData('payment_date', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.payment_date}
            placeholder="YYYY-MM-DD"
            left={<TextInput.Icon icon="calendar" />}
          />
          <HelperText type="error" visible={!!errors.payment_date}>
            {errors.payment_date}
          </HelperText>

          {formData.payment_method === 'cheque' && (
            <>
              <TextInput
                label="Cheque Number *"
                value={formData.cheque_number}
                onChangeText={(value) => updateFormData('cheque_number', value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.cheque_number}
              />
              <HelperText type="error" visible={!!errors.cheque_number}>
                {errors.cheque_number}
              </HelperText>

              <Dropdown
                label="Bank"
                value={formData.bank_id}
                onValueChange={(value) => updateFormData('bank_id', value)}
                items={banks.map(b => ({ label: b.bank_name, value: b.bank_id }))}
              />
            </>
          )}

          {formData.payment_method === 'online' && (
            <>
              <TextInput
                label="Transaction ID *"
                value={formData.transaction_id}
                onChangeText={(value) => updateFormData('transaction_id', value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.transaction_id}
              />
              <HelperText type="error" visible={!!errors.transaction_id}>
                {errors.transaction_id}
              </HelperText>
            </>
          )}

          <TextInput
            label="Remarks"
            value={formData.remarks}
            onChangeText={(value) => updateFormData('remarks', value)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

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
              Record Payment
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  form: { padding: 16 },
  sectionTitle: { marginBottom: 16, fontWeight: 'bold' },
  input: { marginBottom: 8 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default PaymentEntryScreen;
