import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { fetchBookingById, updateBooking } from '../../../store/slices/bookingsSlice';
import { fetchCustomers } from '../../../store/slices/customersSlice';
import { fetchAllPropertiesData } from '../../../store/slices/propertiesSlice';
import { Dropdown } from '../../../components/common';
import { LoadingIndicator } from '../../../components';
import api from '../../../config/api';

const EditBookingScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading: bookingLoading } = useSelector(state => state.bookings);
  const { projects, projectUnits } = useSelector(state => state.properties);
  
  const [formData, setFormData] = useState({
    project_id: '',
    customer_id: '',
    unit_id: '',
    unit_desc: '',
    broker_id: '',
    payment_plan_id: '',
    unit_price: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [brokers, setBrokers] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    dispatch(fetchBookingById(bookingId));
    dispatch(fetchCustomers());
    dispatch(fetchAllPropertiesData());
    fetchBrokers();
    fetchPaymentPlans();
  }, [dispatch, bookingId]);

  useEffect(() => {
    if (current) {
      setFormData({
        project_id: current.project_id || '',
        customer_id: current.customer_id || '',
        unit_id: current.unit_id || '',
        unit_desc: current.unit_desc || '',
        broker_id: current.broker_id || '',
        payment_plan_id: current.payment_plan_id || '',
        unit_price: current.unit_price?.toString() || '',
        remarks: current.remarks || '',
      });
    }
  }, [current]);

  const fetchBrokers = async () => {
    try {
      const response = await api.get('/master/brokers');
      if (response.data?.success) {
        setBrokers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
    }
  };

  const fetchPaymentPlans = async () => {
    try {
      const response = await api.get('/master/plans');
      if (response.data?.success) {
        setPaymentPlans(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error);
    }
  };

  useEffect(() => {
    const fetchCustomersByProject = async () => {
      if (!formData.project_id) {
        setAvailableCustomers([]);
        return;
      }
      try {
        const response = await api.get(`/transaction/customers/project/${formData.project_id}/with-status`);
        if (response.data?.success) {
          setAvailableCustomers(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setAvailableCustomers([]);
      }
    };
    fetchCustomersByProject();
  }, [formData.project_id]);

  useEffect(() => {
    if (formData.project_id && formData.unit_desc) {
      const projectUnitsData = projectUnits[formData.project_id] || [];
      const filtered = projectUnitsData.filter(u => u.unit_desc === formData.unit_desc);
      setFilteredUnits(filtered);
    } else if (formData.project_id) {
      setFilteredUnits(projectUnits[formData.project_id] || []);
    } else {
      setFilteredUnits([]);
    }
  }, [formData.project_id, formData.unit_desc, projectUnits]);

  const projectOptions = (projects || []).map(p => ({
    label: p.project_name || 'N/A',
    value: p.project_id,
  }));

  const customerOptions = (availableCustomers || []).map(c => ({
    label: `${c.name || c.customer_name || 'N/A'} - ${c.mobile_number || c.phone_no || ''}`,
    value: c.customer_id || c.id,
  }));

  const unitDescOptions = formData.project_id 
    ? [...new Set((projectUnits[formData.project_id] || []).map(u => u.unit_desc))].map(desc => ({
        label: desc || 'N/A',
        value: desc,
      }))
    : [];

  const unitOptions = filteredUnits.map(u => ({
    label: `${u.unit_no || 'N/A'} - ${u.unit_desc || ''} (₹${u.unit_price?.toLocaleString() || 'N/A'})`,
    value: u.unit_id,
  }));

  const brokerOptions = (brokers || []).map(b => ({
    label: b.broker_name || b.name || 'N/A',
    value: b.broker_id,
  }));

  const paymentPlanOptions = (paymentPlans || []).map(p => ({
    label: p.plan_name || 'N/A',
    value: p.plan_id,
  }));

  const validate = () => {
    const newErrors = {};
    
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.unit_id) newErrors.unit_id = 'Unit is required';
    if (!formData.payment_plan_id) newErrors.payment_plan_id = 'Payment plan is required';
    
    if (!formData.unit_price) {
      newErrors.unit_price = 'Unit price is required';
    } else if (isNaN(formData.unit_price) || parseFloat(formData.unit_price) <= 0) {
      newErrors.unit_price = 'Invalid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        customer_id: formData.customer_id,
        broker_id: formData.broker_id || null,
        booking_date: new Date().toISOString().split('T')[0],
        payment_plan_id: formData.payment_plan_id,
        unit_id: formData.unit_id,
        unit_price: parseFloat(formData.unit_price),
        remarks: formData.remarks || ''
      };
      
      await dispatch(updateBooking({
        id: bookingId,
        data: payload,
      })).unwrap();
      
      Alert.alert('Success', 'Booking updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update booking');
      setErrors({ form: error });
    } finally {
      setLoading(false);
    }
  };

  if (bookingLoading || !current) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Edit Booking</Text>

          <Dropdown
            label="Project *"
            value={formData.project_id}
            onValueChange={(value) => {
              setFormData({ 
                ...formData, 
                project_id: value,
                customer_id: '',
                unit_desc: '',
                unit_id: '',
                broker_id: '',
              });
              setErrors({ ...errors, project_id: '' });
            }}
            items={projectOptions}
            error={!!errors.project_id}
          />
          <HelperText type="error" visible={!!errors.project_id}>
            {errors.project_id}
          </HelperText>

          <Dropdown
            label="Customer *"
            value={formData.customer_id}
            onValueChange={(value) => {
              setFormData({ ...formData, customer_id: value });
              setErrors({ ...errors, customer_id: '' });
            }}
            items={customerOptions}
            error={!!errors.customer_id}
            disabled={!formData.project_id}
          />
          <HelperText type="error" visible={!!errors.customer_id}>
            {errors.customer_id}
          </HelperText>

          <Dropdown
            label="Unit Description"
            value={formData.unit_desc}
            onValueChange={(value) => {
              setFormData({ ...formData, unit_desc: value, unit_id: '' });
            }}
            items={unitDescOptions}
            disabled={!formData.project_id}
          />

          <Dropdown
            label="Unit *"
            value={formData.unit_id}
            onValueChange={(value) => {
              const selectedUnit = filteredUnits.find(u => u.unit_id === value);
              setFormData({ 
                ...formData, 
                unit_id: value,
                unit_price: selectedUnit?.unit_price?.toString() || ''
              });
              setErrors({ ...errors, unit_id: '' });
            }}
            items={unitOptions}
            error={!!errors.unit_id}
            disabled={!formData.project_id}
          />
          <HelperText type="error" visible={!!errors.unit_id}>
            {errors.unit_id}
          </HelperText>

          <Dropdown
            label="Broker"
            value={formData.broker_id}
            onValueChange={(value) => setFormData({ ...formData, broker_id: value })}
            items={brokerOptions}
          />

          <Dropdown
            label="Payment Plan *"
            value={formData.payment_plan_id}
            onValueChange={(value) => {
              setFormData({ ...formData, payment_plan_id: value });
              setErrors({ ...errors, payment_plan_id: '' });
            }}
            items={paymentPlanOptions}
            error={!!errors.payment_plan_id}
          />
          <HelperText type="error" visible={!!errors.payment_plan_id}>
            {errors.payment_plan_id}
          </HelperText>

          <TextInput
            label="Unit Price *"
            value={formData.unit_price}
            onChangeText={(text) => {
              setFormData({ ...formData, unit_price: text });
              setErrors({ ...errors, unit_price: '' });
            }}
            error={!!errors.unit_price}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.unit_price}>
            {errors.unit_price}
          </HelperText>

          <TextInput
            label="Remarks"
            value={formData.remarks}
            onChangeText={(text) => setFormData({ ...formData, remarks: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          {errors.form && (
            <HelperText type="error" visible={true}>
              {errors.form}
            </HelperText>
          )}

          <View style={styles.buttons}>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              Update
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  form: { padding: 16 },
  sectionTitle: { marginBottom: 16, fontWeight: '600' },
  input: { marginBottom: 8 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default EditBookingScreen;
