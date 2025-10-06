import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text, Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { createCreditPayment, fetchPayments } from '../../../store/slices/paymentsSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const CreditPaymentScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    amount: '',
    credit_type: 'adjustment',
    reason: '',
    reference_payment_id: '',
    remarks: '',
  });
  
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const creditTypes = [
    { id: 'adjustment', name: 'Balance Adjustment' },
    { id: 'refund', name: 'Refund' },
    { id: 'discount', name: 'Discount' },
    { id: 'waiver', name: 'Waiver' },
    { id: 'other', name: 'Other' },
  ];

  useEffect(() => {
    fetchCustomers();
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.credit_type) newErrors.credit_type = 'Credit type is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';

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
      await dispatch(createCreditPayment(formData)).unwrap();
      Alert.alert('Success', 'Credit payment recorded successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchPayments());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to record credit payment');
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

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>Credit Payment</Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              Record a credit adjustment, refund, or discount for a customer. This will update the customer's balance.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Credit Information</Text>

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
            label="Credit Amount *"
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
          {formData.amount && (
            <Text style={styles.amountPreview}>
              Amount: {formatCurrency(formData.amount)}
            </Text>
          )}

          <Dropdown
            label="Credit Type *"
            value={formData.credit_type}
            onValueChange={(value) => updateFormData('credit_type', value)}
            items={creditTypes.map(ct => ({ label: ct.name, value: ct.id }))}
            error={!!errors.credit_type}
          />
          <HelperText type="error" visible={!!errors.credit_type}>
            {errors.credit_type}
          </HelperText>

          <TextInput
            label="Reason *"
            value={formData.reason}
            onChangeText={(value) => updateFormData('reason', value)}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            error={!!errors.reason}
            placeholder="Explain the reason for this credit"
          />
          <HelperText type="error" visible={!!errors.reason}>
            {errors.reason}
          </HelperText>

          <TextInput
            label="Reference Payment ID"
            value={formData.reference_payment_id}
            onChangeText={(value) => updateFormData('reference_payment_id', value)}
            mode="outlined"
            style={styles.input}
            placeholder="Optional: Link to original payment"
          />

          <TextInput
            label="Additional Remarks"
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
              Record Credit
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
  infoCard: { margin: 16, backgroundColor: '#EFF6FF' },
  infoTitle: { fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#1E40AF', lineHeight: 20 },
  form: { padding: 16 },
  sectionTitle: { marginBottom: 16, fontWeight: 'bold' },
  input: { marginBottom: 8 },
  amountPreview: { fontSize: 16, fontWeight: 'bold', color: '#059669', marginBottom: 16 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default CreditPaymentScreen;
