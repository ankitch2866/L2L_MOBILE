import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text, RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { updateFeedback, fetchChequeById, fetchCheques } from '../../../store/slices/chequesSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const ChequeFeedbackScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { chequeId } = route.params || {};
  
  const [formData, setFormData] = useState({
    cheque_id: chequeId || '',
    status: 'cleared',
    clearance_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });
  
  const [cheques, setCheques] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chequeId) {
      fetchPendingCheques();
    }
  }, [chequeId]);

  const fetchPendingCheques = async () => {
    try {
      const response = await api.get('/api/transaction/cheque?status=submitted');
      if (response.data?.data) {
        setCheques(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cheques:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cheque_id) newErrors.cheque_id = 'Cheque is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (formData.status === 'cleared' && !formData.clearance_date) {
      newErrors.clearance_date = 'Clearance date is required';
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
      const feedback = {
        status: formData.status,
        clearance_date: formData.status === 'cleared' ? formData.clearance_date : null,
        remarks: formData.remarks,
      };
      
      await dispatch(updateFeedback({ 
        id: formData.cheque_id, 
        feedback 
      })).unwrap();
      
      Alert.alert('Success', 'Cheque feedback updated successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchCheques());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update cheque feedback');
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
          <Text variant="titleMedium" style={styles.sectionTitle}>Bank Feedback</Text>

          {!chequeId && (
            <>
              <Dropdown
                label="Select Cheque *"
                value={formData.cheque_id}
                onValueChange={(value) => updateFormData('cheque_id', value)}
                items={cheques.map(c => ({ 
                  label: `${c.cheque_no} - ${c.customer_name} - ₹${c.amount}`, 
                  value: c.cheque_id 
                }))}
                error={!!errors.cheque_id}
              />
              <HelperText type="error" visible={!!errors.cheque_id}>
                {errors.cheque_id}
              </HelperText>
            </>
          )}

          <Text style={styles.radioLabel}>Status *</Text>
          <RadioButton.Group
            onValueChange={(value) => updateFormData('status', value)}
            value={formData.status}
          >
            <View style={styles.radioItem}>
              <RadioButton value="cleared" />
              <Text style={styles.radioText}>Cleared</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="bounced" />
              <Text style={styles.radioText}>Bounced</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="cancelled" />
              <Text style={styles.radioText}>Cancelled</Text>
            </View>
          </RadioButton.Group>
          <HelperText type="error" visible={!!errors.status}>
            {errors.status}
          </HelperText>

          {formData.status === 'cleared' && (
            <>
              <TextInput
                label="Clearance Date *"
                value={formData.clearance_date}
                onChangeText={(value) => updateFormData('clearance_date', value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.clearance_date}
                placeholder="YYYY-MM-DD"
                left={<TextInput.Icon icon="calendar-check" />}
              />
              <HelperText type="error" visible={!!errors.clearance_date}>
                {errors.clearance_date}
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
              Update Feedback
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
  radioLabel: { fontSize: 16, marginTop: 8, marginBottom: 8, fontWeight: '500' },
  radioItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radioText: { fontSize: 16 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default ChequeFeedbackScreen;
