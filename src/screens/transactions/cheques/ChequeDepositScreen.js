import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { createCheque, fetchCheques } from '../../../store/slices/chequesSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const ChequeDepositScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    bank_id: '',
    cheque_number: '',
    amount: '',
    cheque_date: new Date().toISOString().split('T')[0],
    deposit_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });
  
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchBanks();
  }, []);

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
    if (!formData.bank_id) newErrors.bank_id = 'Bank is required';
    if (!formData.cheque_number) newErrors.cheque_number = 'Cheque number is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.cheque_date) newErrors.cheque_date = 'Cheque date is required';
    if (!formData.deposit_date) newErrors.deposit_date = 'Deposit date is required';

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
      await dispatch(createCheque(formData)).unwrap();
      Alert.alert('Success', 'Cheque deposited successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchCheques());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to deposit cheque');
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
          <Text variant="titleMedium" style={styles.sectionTitle}>Cheque Information</Text>

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
            label="Bank *"
            value={formData.bank_id}
            onValueChange={(value) => updateFormData('bank_id', value)}
            items={banks.map(b => ({ label: b.bank_name, value: b.bank_id }))}
            error={!!errors.bank_id}
          />
          <HelperText type="error" visible={!!errors.bank_id}>
            {errors.bank_id}
          </HelperText>

          <TextInput
            label="Cheque Number *"
            value={formData.cheque_number}
            onChangeText={(value) => updateFormData('cheque_number', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.cheque_number}
            left={<TextInput.Icon icon="check" />}
          />
          <HelperText type="error" visible={!!errors.cheque_number}>
            {errors.cheque_number}
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

          <TextInput
            label="Cheque Date *"
            value={formData.cheque_date}
            onChangeText={(value) => updateFormData('cheque_date', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.cheque_date}
            placeholder="YYYY-MM-DD"
            left={<TextInput.Icon icon="calendar" />}
          />
          <HelperText type="error" visible={!!errors.cheque_date}>
            {errors.cheque_date}
          </HelperText>

          <TextInput
            label="Deposit Date *"
            value={formData.deposit_date}
            onChangeText={(value) => updateFormData('deposit_date', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.deposit_date}
            placeholder="YYYY-MM-DD"
            left={<TextInput.Icon icon="calendar-check" />}
          />
          <HelperText type="error" visible={!!errors.deposit_date}>
            {errors.deposit_date}
          </HelperText>

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
              Deposit Cheque
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

export default ChequeDepositScreen;
