import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text, Card, RadioButton, Checkbox } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { createFeedback } from '../../../store/slices/callingFeedbackSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const AddCallingFeedbackScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    calling_type: 'Follow-up',
    calling_date: new Date().toISOString().split('T')[0],
    next_calling_date: '',
    is_payment: false,
    is_loan: false,
    promise_to_pay: false,
    amount_committed_to_pay: '',
    issues_description: '',
    todays_description: '',
    remarks_note: '',
  });
  
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const callingTypes = [
    'Follow-up',
    'Payment Reminder', 
    'Issue Resolution',
    'General Inquiry',
    'Complaint',
    'Appointment',
    'Documentation',
    'Other'
  ];

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={{ marginLeft: -8 }}
            textColor="#007AFF"
          >
            Back
          </Button>
        ),
      });
    }, [navigation])
  );

  useEffect(() => {
    fetchCustomers();
    fetchProjects();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/master/customers');
      if (response.data?.success) {
        setCustomers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.calling_type) newErrors.calling_type = 'Calling type is required';
    if (!formData.calling_date) newErrors.calling_date = 'Calling date is required';
    if (!formData.todays_description && !formData.issues_description) {
      newErrors.description = 'Either today\'s description or issues description is required';
    }
    if (formData.promise_to_pay && !formData.amount_committed_to_pay) {
      newErrors.amount_committed_to_pay = 'Amount is required when promise to pay is selected';
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
      await dispatch(createFeedback(formData)).unwrap();
      Alert.alert('Success', 'Calling feedback recorded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to record calling feedback');
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

  const selectedCustomer = customers.find(c => c.customer_id.toString() === formData.customer_id);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>Add Calling Feedback</Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              Record details of customer communication including follow-ups, issues, and commitments.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Customer Information</Text>

          <Dropdown
            label="Customer *"
            value={formData.customer_id}
            onValueChange={(value) => updateFormData('customer_id', value)}
            items={customers.map(c => ({ 
              label: `${c.name} (${c.phone_no || 'No Phone'})`, 
              value: c.customer_id.toString() 
            }))}
            error={!!errors.customer_id}
          />
          <HelperText type="error" visible={!!errors.customer_id}>
            {errors.customer_id}
          </HelperText>

          {selectedCustomer && (
            <Card style={styles.customerCard}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.customerInfo}>
                  <Text style={styles.label}>Project: </Text>{selectedCustomer.project_name || 'N/A'}
                </Text>
                <Text variant="bodySmall" style={styles.customerInfo}>
                  <Text style={styles.label}>Address: </Text>{selectedCustomer.customer_address || 'N/A'}
                </Text>
              </Card.Content>
            </Card>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>Calling Details</Text>

          <Dropdown
            label="Calling Type *"
            value={formData.calling_type}
            onValueChange={(value) => updateFormData('calling_type', value)}
            items={callingTypes.map(type => ({ label: type, value: type }))}
            error={!!errors.calling_type}
          />
          <HelperText type="error" visible={!!errors.calling_type}>
            {errors.calling_type}
          </HelperText>

          <TextInput
            label="Calling Date *"
            value={formData.calling_date}
            onChangeText={(value) => updateFormData('calling_date', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.calling_date}
            left={<TextInput.Icon icon="calendar" />}
          />
          <HelperText type="error" visible={!!errors.calling_date}>
            {errors.calling_date}
          </HelperText>

          <TextInput
            label="Next Calling Date"
            value={formData.next_calling_date}
            onChangeText={(value) => updateFormData('next_calling_date', value)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="calendar-clock" />}
            placeholder="YYYY-MM-DD"
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>Call Purpose</Text>

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={formData.is_payment ? 'checked' : 'unchecked'}
              onPress={() => updateFormData('is_payment', !formData.is_payment)}
            />
            <Text style={styles.checkboxLabel}>Payment Related</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={formData.is_loan ? 'checked' : 'unchecked'}
              onPress={() => updateFormData('is_loan', !formData.is_loan)}
            />
            <Text style={styles.checkboxLabel}>Loan Related</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={formData.promise_to_pay ? 'checked' : 'unchecked'}
              onPress={() => updateFormData('promise_to_pay', !formData.promise_to_pay)}
            />
            <Text style={styles.checkboxLabel}>Promise to Pay</Text>
          </View>

          {formData.promise_to_pay && (
            <>
              <TextInput
                label="Amount Committed to Pay *"
                value={formData.amount_committed_to_pay}
                onChangeText={(value) => updateFormData('amount_committed_to_pay', value)}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                error={!!errors.amount_committed_to_pay}
                left={<TextInput.Icon icon="currency-inr" />}
              />
              <HelperText type="error" visible={!!errors.amount_committed_to_pay}>
                {errors.amount_committed_to_pay}
              </HelperText>
            </>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>

          <TextInput
            label="Today's Description"
            value={formData.todays_description}
            onChangeText={(value) => updateFormData('todays_description', value)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="What was discussed today?"
          />

          <TextInput
            label="Issues Description"
            value={formData.issues_description}
            onChangeText={(value) => updateFormData('issues_description', value)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="Any issues or concerns raised?"
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>

          <TextInput
            label="Additional Remarks"
            value={formData.remarks_note}
            onChangeText={(value) => updateFormData('remarks_note', value)}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            placeholder="Any additional notes or observations"
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
              Record Feedback
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
  sectionTitle: { marginBottom: 16, fontWeight: 'bold', marginTop: 8 },
  input: { marginBottom: 8 },
  customerCard: { marginBottom: 16, backgroundColor: '#F8FAFC' },
  customerInfo: { marginBottom: 4 },
  label: { fontWeight: 'bold', color: '#374151' },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  checkboxLabel: { 
    marginLeft: 8, 
    fontSize: 16 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 24 
  },
  button: { flex: 1 },
});

export default AddCallingFeedbackScreen;
