import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { fetchPaymentById, updatePayment, fetchPayments } from '../../../store/slices/paymentsSlice';
import { Dropdown } from '../../../components/common';
import { LoadingIndicator } from '../../../components';
import api from '../../../config/api';

const EditPaymentScreen = ({ route, navigation }) => {
  const { paymentId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: payment, loading: fetchLoading } = useSelector(state => state.payments);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    project_id: '',
    unit_id: '',
    amount: '',
    payment_method: '',
    payment_date: '',
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
    dispatch(fetchPaymentById(paymentId));
    fetchCustomers();
    fetchProjects();
    fetchBanks();
  }, [dispatch, paymentId]);

  useEffect(() => {
    if (payment) {
      setFormData({
        customer_id: payment.customer_id || '',
        project_id: payment.project_id || '',
        unit_id: payment.unit_id || '',
        amount: payment.amount?.toString() || '',
        payment_method: payment.payment_method || '',
        payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : '',
        transaction_id: payment.transaction_id || '',
        cheque_number: payment.cheque_number || '',
        bank_id: payment.bank_id || '',
        remarks: payment.remarks || '',
      });
      if (payment.project_id) {
        fetchUnits(payment.project_id);
      }
    }
  }, [payment]);

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
      await dispatch(updatePayment({ id: paymentId, data: formData })).unwrap();
      Alert.alert('Success', 'Payment updated successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchPayments());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    if (field === 'project_id' && value) {
      fetchUnits(value);
    }
  };

  if (fetchLoading || !payment) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Edit Payment</Text>

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
              Update Payment
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

export default EditPaymentScreen;
