import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { createBooking } from '../../../store/slices/bookingsSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const CreateBookingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    projectId: '',
    customerId: '',
    name: '',
    fatherName: '',
    address: '',
    brokerId: '',
    paymentPlanId: '',
    unitDescription: '',
    unitId: '',
    unitSize: '',
    unitPrice: '',
  });
  
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [units, setUnits] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchProjects();
    fetchBrokers();
    fetchPaymentPlans();
    fetchUnitTypes();
  }, []);

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

  const fetchBrokers = async () => {
    try {
      const response = await api.get('/api/master/brokers');
      if (response.data?.success) {
        setBrokers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
    }
  };

  const fetchPaymentPlans = async () => {
    try {
      const response = await api.get('/api/transaction/payment-query/payment-plans');
      if (response.data?.success) {
        setPaymentPlans(response.data.data?.payment_plans || []);
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error);
    }
  };

  const fetchUnitTypes = async () => {
    const unitTypesData = [
      { id: 1, unit_type: '2BHK Flat' },
      { id: 2, unit_type: '3BHK Apartment' },
      { id: 3, unit_type: '4BHK Penthouse' },
      { id: 4, unit_type: 'Villa' },
      { id: 5, unit_type: 'Row House' },
      { id: 6, unit_type: 'Duplex' },
      { id: 7, unit_type: 'Studio' },
      { id: 8, unit_type: 'Shop Complex' },
      { id: 9, unit_type: 'Office' },
      { id: 10, unit_type: 'Co-working Space' },
      { id: 11, unit_type: 'Warehouse' },
      { id: 12, unit_type: 'Farmhouse' },
      { id: 13, unit_type: 'Resort' },
      { id: 14, unit_type: 'Service Apartment' },
      { id: 15, unit_type: 'Showroom' },
      { id: 16, unit_type: 'Other' }
    ];
    setUnitTypes(unitTypesData);
  };

  // Fetch customers when project changes
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!formData.projectId) {
        console.log('No project selected, clearing customers');
        setCustomers([]);
        return;
      }
      
      try {
        console.log('Fetching customers for project:', formData.projectId);
        
        // Try the primary endpoint first
        let response;
        try {
          response = await api.get(`/api/transaction/customers/project/${formData.projectId}/with-status`);
          console.log('Primary API response:', response.data);
        } catch (primaryError) {
          console.log('Primary API failed, trying fallback...', primaryError.message);
          // Fallback to basic customers endpoint
          response = await api.get(`/api/master/customers/project/${formData.projectId}`);
          console.log('Fallback API response:', response.data);
        }
        
        console.log('Response status:', response.status);
        
        if (response.data?.success) {
          const customersData = response.data.data || [];
          console.log('Customers data received:', customersData);
          console.log('Number of customers:', customersData.length);
          
          // If using fallback API, add default booking_status
          const processedCustomers = customersData.map(customer => ({
            ...customer,
            booking_status: customer.booking_status || 'available'
          }));
          
          // Log each customer's booking status
          processedCustomers.forEach((customer, index) => {
            console.log(`Customer ${index + 1}:`, {
              id: customer.customer_id,
              name: customer.name,
              booking_status: customer.booking_status
            });
          });
          
          setCustomers(processedCustomers);
        } else {
          console.log('API response not successful:', response.data);
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        console.error('Error details:', error.response?.data);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, [formData.projectId]);

  // Fetch units when project or unit description changes
  useEffect(() => {
    const fetchUnits = async () => {
      if (!formData.projectId) {
        setUnits([]);
        return;
      }
      try {
        let url = `/api/master/project/${formData.projectId}/units`;
        if (formData.unitDescription) {
          url += `?unit_desc=${encodeURIComponent(formData.unitDescription)}`;
        }
        const response = await api.get(url);
        if (response.data?.success) {
          setUnits(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching units:', error);
        setUnits([]);
      }
    };
    fetchUnits();
  }, [formData.projectId, formData.unitDescription]);

  // Auto-select broker when customer changes
  useEffect(() => {
    const fetchCustomerBroker = async () => {
      if (!formData.customerId || brokers.length === 0) return;
      
      try {
        const response = await api.get(`/api/master/customers/edit/${formData.customerId}`);
        if (response.data?.success && response.data.data?.broker_id) {
          const brokerExists = brokers.find(b => b.broker_id === response.data.data.broker_id);
          if (brokerExists) {
            setFormData(prev => ({
              ...prev,
              brokerId: response.data.data.broker_id.toString()
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching customer broker:', error);
      }
    };
    fetchCustomerBroker();
  }, [formData.customerId, brokers]);

  const handleProjectChange = (value) => {
    setFormData({
      ...formData,
      projectId: value,
      customerId: '',
      name: '',
      fatherName: '',
      address: '',
      unitId: '',
      unitSize: '',
      unitPrice: '',
      unitDescription: '',
    });
    setErrors({ ...errors, projectId: '' });
  };

  const handleCustomerChange = (value) => {
    const selectedCustomer = customers.find(c => c.customer_id === value);
    
    if (selectedCustomer && selectedCustomer.booking_status !== 'available') {
      setErrors({ ...errors, customerId: 'This customer already has a booking or is allotted' });
      return;
    }
    
    setFormData({
      ...formData,
      customerId: value,
      name: selectedCustomer?.name || '',
      fatherName: selectedCustomer?.father_name || '',
      address: selectedCustomer?.permanent_address || '',
    });
    setErrors({ ...errors, customerId: '' });
  };

  const handleUnitDescriptionChange = (value) => {
    setFormData({
      ...formData,
      unitDescription: value,
      unitId: '',
      unitSize: '',
      unitPrice: '',
    });
    setErrors({ ...errors, unitDescription: '', unitId: '' });
  };

  const handleUnitChange = (value) => {
    const selectedUnit = units.find(u => u.unit_id === value);
    
    if (selectedUnit && selectedUnit.status !== 'free') {
      setErrors({ ...errors, unitId: "Only units with 'free' status can be selected" });
      return;
    }
    
    setFormData({
      ...formData,
      unitId: value,
      unitSize: selectedUnit?.unit_size || '',
      unitPrice: selectedUnit?.bsp || '',
    });
    setErrors({ ...errors, unitId: '' });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.brokerId) newErrors.brokerId = 'Broker is required';
    if (!formData.paymentPlanId) newErrors.paymentPlanId = 'Payment plan is required';
    if (!formData.unitId) newErrors.unitId = 'Unit is required';
    
    if (!formData.unitPrice) {
      newErrors.unitPrice = 'Unit price is required';
    } else if (isNaN(formData.unitPrice) || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Invalid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const selectedUnit = units.find(u => u.unit_id === formData.unitId);
      
      const payload = {
        customer_id: formData.customerId,
        broker_id: formData.brokerId,
        booking_date: new Date().toISOString().split('T')[0],
        payment_plan_id: formData.paymentPlanId,
        unit_id: formData.unitId,
        unit_price: parseFloat(formData.unitPrice),
        remarks: `Unit: ${formData.unitSize} sq ft, Price: ₹${formData.unitPrice}, Description: ${formData.unitDescription || 'N/A'}`
      };
      
      await dispatch(createBooking(payload)).unwrap();
      Alert.alert('Success', 'Booking created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = projects.map(p => ({
    label: p.project_name || 'N/A',
    value: p.project_id,
  }));

  // First, let's show ALL customers for debugging, regardless of status
  const allCustomerOptions = customers.map(c => ({
    label: `${c.name || 'N/A'} - ${c.phone_no || c.mobile_number || ''} (${c.booking_status || 'unknown'})`,
    value: c.customer_id,
  }));

  // Then filter for available customers only
  const customerOptions = customers
    .filter(c => {
      console.log('Filtering customer:', {
        id: c.customer_id,
        name: c.name,
        booking_status: c.booking_status,
        isAvailable: c.booking_status === 'available'
      });
      return c.booking_status === 'available';
    })
    .map(c => ({
      label: `${c.name || 'N/A'} - ${c.phone_no || c.mobile_number || ''}`,
      value: c.customer_id,
    }));
  
  console.log('Total customers:', customers.length);
  console.log('Available customers:', customerOptions.length);
  console.log('Customer options:', customerOptions);
  console.log('All customer options (with status):', allCustomerOptions);
  
  // Debug: Show all customers and their statuses
  console.log('All customers with statuses:', customers.map(c => ({
    id: c.customer_id,
    name: c.name,
    status: c.booking_status
  })));

  // Use all customers if no available customers found (for debugging)
  const finalCustomerOptions = customerOptions.length > 0 ? customerOptions : allCustomerOptions;

  const brokerOptions = brokers.map(b => ({
    label: b.broker_name || 'N/A',
    value: b.broker_id,
  }));

  const paymentPlanOptions = paymentPlans.map(p => ({
    label: p.plan_name || 'N/A',
    value: p.plan_id,
  }));

  const unitTypeOptions = unitTypes.map(ut => ({
    label: ut.unit_type,
    value: ut.unit_type,
  }));

  const unitOptions = units
    .filter(u => u.status === 'free')
    .map(u => ({
      label: `${u.unit_no || 'N/A'} - ${u.unit_desc || ''} (₹${u.bsp?.toLocaleString() || 'N/A'})`,
      value: u.unit_id,
    }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Create Booking</Text>

          <Dropdown
            label="Project *"
            value={formData.projectId}
            onValueChange={handleProjectChange}
            items={projectOptions}
            error={!!errors.projectId}
          />
          <HelperText type="error" visible={!!errors.projectId}>
            {errors.projectId}
          </HelperText>

          <Dropdown
            label="Customer *"
            value={formData.customerId}
            onValueChange={handleCustomerChange}
            items={finalCustomerOptions}
            error={!!errors.customerId}
            disabled={!formData.projectId}
          />
          <HelperText type="error" visible={!!errors.customerId}>
            {errors.customerId}
          </HelperText>
          {!formData.projectId && (
            <HelperText type="info">Please select a project first</HelperText>
          )}

          {formData.customerId && (
            <>
              <TextInput
                label="Customer Name"
                value={formData.name}
                mode="outlined"
                editable={false}
                style={styles.input}
              />
              <TextInput
                label="Father's Name"
                value={formData.fatherName}
                mode="outlined"
                editable={false}
                style={styles.input}
              />
              <TextInput
                label="Address"
                value={formData.address}
                mode="outlined"
                editable={false}
                multiline
                numberOfLines={2}
                style={styles.input}
              />
            </>
          )}

          <Dropdown
            label="Broker *"
            value={formData.brokerId}
            onValueChange={(value) => {
              setFormData({ ...formData, brokerId: value });
              setErrors({ ...errors, brokerId: '' });
            }}
            items={brokerOptions}
            error={!!errors.brokerId}
          />
          <HelperText type="error" visible={!!errors.brokerId}>
            {errors.brokerId}
          </HelperText>

          <Dropdown
            label="Payment Plan *"
            value={formData.paymentPlanId}
            onValueChange={(value) => {
              setFormData({ ...formData, paymentPlanId: value });
              setErrors({ ...errors, paymentPlanId: '' });
            }}
            items={paymentPlanOptions}
            error={!!errors.paymentPlanId}
          />
          <HelperText type="error" visible={!!errors.paymentPlanId}>
            {errors.paymentPlanId}
          </HelperText>

          <Dropdown
            label="Unit Description"
            value={formData.unitDescription}
            onValueChange={handleUnitDescriptionChange}
            items={unitTypeOptions}
            disabled={!formData.projectId}
          />

          <Dropdown
            label="Unit *"
            value={formData.unitId}
            onValueChange={handleUnitChange}
            items={unitOptions}
            error={!!errors.unitId}
            disabled={!formData.projectId}
          />
          <HelperText type="error" visible={!!errors.unitId}>
            {errors.unitId}
          </HelperText>

          {formData.unitId && (
            <>
              <TextInput
                label="Unit Size (sq ft)"
                value={formData.unitSize}
                mode="outlined"
                editable={false}
                style={styles.input}
              />
              <TextInput
                label="Unit Price *"
                value={formData.unitPrice}
                onChangeText={(text) => {
                  setFormData({ ...formData, unitPrice: text });
                  setErrors({ ...errors, unitPrice: '' });
                }}
                error={!!errors.unitPrice}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.unitPrice}>
                {errors.unitPrice}
              </HelperText>
            </>
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
              Create Booking
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

export default CreateBookingScreen;
