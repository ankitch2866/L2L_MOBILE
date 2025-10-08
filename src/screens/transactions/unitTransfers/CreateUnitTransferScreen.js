import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, RadioButton, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { Dropdown } from '../../../components/common';
import { 
  createTransfer, 
  checkCustomerUnit,
  clearCustomerUnit,
  clearError 
} from '../../../store/slices/unitTransfersSlice';
import { fetchCustomers } from '../../../store/slices/customersSlice';
import { fetchProjects } from '../../../store/slices/projectsSlice';

const CreateUnitTransferScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { loading, error, customerUnit } = useSelector(state => state.unitTransfers);
  const { customers } = useSelector(state => state.customers);
  const { projects } = useSelector(state => state.projects);

  const [formData, setFormData] = useState({
    customerId: '',
    transferDate: new Date().toISOString().split('T')[0],
    projectId: '',
    amount: '',
    mode: 'ONLINE',
    remarks: '',
  });

  const [onlineDetails, setOnlineDetails] = useState({
    utr_no: '',
    amount: '',
    payment_method: 'NEFT',
    payment_date: new Date().toISOString().split('T')[0],
  });

  const [chequeDetails, setChequeDetails] = useState({
    cheque_no: '',
    amount: '',
    cheque_date: new Date().toISOString().split('T')[0],
    bank_name: '',
    drawn_on: '',
  });

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchProjects());
    return () => {
      dispatch(clearCustomerUnit());
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (formData.customerId) {
      dispatch(checkCustomerUnit(formData.customerId));
    }
  }, [formData.customerId, dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Sync amount with payment details
    if (field === 'amount') {
      if (formData.mode === 'ONLINE') {
        setOnlineDetails(prev => ({ ...prev, amount: value }));
      } else {
        setChequeDetails(prev => ({ ...prev, amount: value }));
      }
    }
  };

  const handleModeChange = (mode) => {
    setFormData(prev => ({ ...prev, mode }));
    // Sync amount when switching modes
    if (mode === 'ONLINE') {
      setOnlineDetails(prev => ({ ...prev, amount: formData.amount }));
    } else {
      setChequeDetails(prev => ({ ...prev, amount: formData.amount }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.customerId) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    if (!customerUnit?.hasBooking) {
      Alert.alert('Error', 'Selected customer does not have an allotted unit');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid transfer charge amount');
      return;
    }

    if (formData.mode === 'ONLINE') {
      if (!onlineDetails.utr_no || !onlineDetails.payment_method) {
        Alert.alert('Error', 'Please fill all online payment details');
        return;
      }
    } else {
      if (!chequeDetails.cheque_no || !chequeDetails.bank_name) {
        Alert.alert('Error', 'Please fill all cheque details');
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        customerId: parseInt(formData.customerId),
        projectId: formData.projectId ? parseInt(formData.projectId) : null,
        amount: parseFloat(formData.amount),
        online_details: formData.mode === 'ONLINE' ? {
          ...onlineDetails,
          amount: parseFloat(onlineDetails.amount),
        } : undefined,
        cheque_details: formData.mode === 'CHEQUE' ? {
          ...chequeDetails,
          amount: parseFloat(chequeDetails.amount),
        } : undefined,
      };

      await dispatch(createTransfer(payload)).unwrap();
      Alert.alert('Success', 'Unit transfer recorded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err || 'Failed to create unit transfer');
    }
  };

  const customerOptions = (customers || []).map(c => ({
    label: `${c.name} (${c.manual_application_id || c.customer_id})`,
    value: c.customer_id.toString(),
  }));

  const projectOptions = (projects || []).map(p => ({
    label: p.project_name,
    value: p.project_id.toString(),
  }));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Customer Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Customer Information</Text>
            
            <Dropdown
              label="Select Customer *"
              value={formData.customerId}
              onValueChange={(value) => handleInputChange('customerId', value)}
              items={customerOptions}
              placeholder="Choose customer"
            />

            {customerUnit && (
              <Card style={[styles.infoCard, { 
                backgroundColor: customerUnit.hasBooking ? '#D1FAE5' : '#FEE2E2' 
              }]}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {customerUnit.hasBooking 
                      ? `✓ Unit Allotted: ${customerUnit.unit_name}`
                      : '✗ No unit allotted to this customer'}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </Card.Content>
        </Card>

        {/* Transfer Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Transfer Details</Text>
            
            <TextInput
              label="Transfer Date *"
              value={formData.transferDate}
              onChangeText={(value) => handleInputChange('transferDate', value)}
              mode="outlined"
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />

            <Dropdown
              label="Project (Optional)"
              value={formData.projectId}
              onValueChange={(value) => handleInputChange('projectId', value)}
              items={projectOptions}
              placeholder="Choose project"
            />

            <TextInput
              label="Transfer Charges *"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              left={<TextInput.Icon icon="currency-inr" />}
            />

            <TextInput
              label="Remarks"
              value={formData.remarks}
              onChangeText={(value) => handleInputChange('remarks', value)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Enter any remarks"
            />
          </Card.Content>
        </Card>

        {/* Payment Mode */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Payment Mode</Text>
            
            <SegmentedButtons
              value={formData.mode}
              onValueChange={handleModeChange}
              buttons={[
                { value: 'ONLINE', label: 'Online' },
                { value: 'CHEQUE', label: 'Cheque' },
              ]}
              style={styles.segmentedButtons}
            />

            {formData.mode === 'ONLINE' ? (
              <View style={styles.paymentDetails}>
                <TextInput
                  label="UTR Number *"
                  value={onlineDetails.utr_no}
                  onChangeText={(value) => setOnlineDetails(prev => ({ ...prev, utr_no: value }))}
                  mode="outlined"
                  style={styles.input}
                />

                <Dropdown
                  label="Payment Method *"
                  value={onlineDetails.payment_method}
                  onValueChange={(value) => setOnlineDetails(prev => ({ ...prev, payment_method: value }))}
                  items={[
                    { label: 'NEFT', value: 'NEFT' },
                    { label: 'RTGS', value: 'RTGS' },
                    { label: 'IMPS', value: 'IMPS' },
                    { label: 'UPI', value: 'UPI' },
                    { label: 'Net Banking', value: 'NET_BANKING' },
                  ]}
                />

                <TextInput
                  label="Payment Date *"
                  value={onlineDetails.payment_date}
                  onChangeText={(value) => setOnlineDetails(prev => ({ ...prev, payment_date: value }))}
                  mode="outlined"
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            ) : (
              <View style={styles.paymentDetails}>
                <TextInput
                  label="Cheque Number *"
                  value={chequeDetails.cheque_no}
                  onChangeText={(value) => setChequeDetails(prev => ({ ...prev, cheque_no: value }))}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Bank Name *"
                  value={chequeDetails.bank_name}
                  onChangeText={(value) => setChequeDetails(prev => ({ ...prev, bank_name: value }))}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Cheque Date *"
                  value={chequeDetails.cheque_date}
                  onChangeText={(value) => setChequeDetails(prev => ({ ...prev, cheque_date: value }))}
                  mode="outlined"
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                />

                <TextInput
                  label="Drawn On"
                  value={chequeDetails.drawn_on}
                  onChangeText={(value) => setChequeDetails(prev => ({ ...prev, drawn_on: value }))}
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {error && (
          <Card style={[styles.card, { backgroundColor: '#FEE2E2' }]}>
            <Card.Content>
              <Text style={{ color: '#DC2626' }}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !customerUnit?.hasBooking}
          style={styles.submitButton}
        >
          Record Transfer Charge
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16, elevation: 2 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 16 },
  input: { marginBottom: 12 },
  infoCard: { marginTop: 12, elevation: 1 },
  infoText: { fontWeight: '500' },
  segmentedButtons: { marginBottom: 16 },
  paymentDetails: { marginTop: 8 },
  submitButton: { marginTop: 8 },
});

export default CreateUnitTransferScreen;
