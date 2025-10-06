import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { Dropdown, LoadingIndicator } from '../../../components/common';
import { fetchDispatchById, updateDispatch, clearCurrentDispatch } from '../../../store/slices/dispatchesSlice';
import { fetchCustomers } from '../../../store/slices/customersSlice';
import { fetchProperties } from '../../../store/slices/propertiesSlice';

const EditDispatchScreen = ({ route, navigation }) => {
  const { dispatchId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: dispatchData, loading } = useSelector(state => state.dispatches);
  const { list: customers } = useSelector(state => state.customers);
  const { list: properties } = useSelector(state => state.properties);

  const [formData, setFormData] = useState({
    letterType: '',
    customer_id: '',
    customerType: 'INDIVIDUAL',
    dispatchDate: '',
    location: '',
    unitNo: '',
    modeOfLetterSending: 'BY_HAND',
    consignmentNo: '',
    courierCompany: '',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchDispatchById(dispatchId));
    dispatch(fetchCustomers());
    dispatch(fetchProperties());
    
    return () => {
      dispatch(clearCurrentDispatch());
    };
  }, [dispatch, dispatchId]);

  useEffect(() => {
    if (dispatchData) {
      setFormData({
        letterType: dispatchData.letterType || '',
        customer_id: dispatchData.customer_id?.toString() || '',
        customerType: dispatchData.customerType || 'INDIVIDUAL',
        dispatchDate: dispatchData.dispatchDate ? dispatchData.dispatchDate.split('T')[0] : '',
        location: dispatchData.location || '',
        unitNo: dispatchData.unitNo || '',
        modeOfLetterSending: dispatchData.modeOfLetterSending || 'BY_HAND',
        consignmentNo: dispatchData.consignmentNo || '',
        courierCompany: dispatchData.courierCompany || '',
        remarks: dispatchData.remarks || '',
      });
      setIsLoading(false);
    }
  }, [dispatchData]);

  const customerTypeOptions = [
    { label: 'Individual', value: 'INDIVIDUAL' },
    { label: 'Company', value: 'COMPANY' },
    { label: 'Partnership', value: 'PARTNERSHIP' },
    { label: 'Proprietorship', value: 'PROPRIETORSHIP' },
  ];

  const modeOptions = [
    { label: 'By Hand', value: 'BY_HAND' },
    { label: 'By Courier', value: 'BY_COURIER' },
    { label: 'By Post', value: 'BY_POST' },
  ];

  const customerOptions = customers.map(c => ({
    label: `${c.name} (${c.customer_id})`,
    value: c.customer_id.toString(),
  }));

  const unitOptions = properties.map(p => ({
    label: p.unit_name || p.name,
    value: p.unit_name || p.name,
  }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData.letterType.trim()) {
      newErrors.letterType = 'Letter type is required';
    }

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    if (!formData.dispatchDate) {
      newErrors.dispatchDate = 'Dispatch date is required';
    }

    if (formData.modeOfLetterSending === 'BY_COURIER') {
      if (!formData.consignmentNo.trim()) {
        newErrors.consignmentNo = 'Consignment number is required for courier';
      }
      if (!formData.courierCompany.trim()) {
        newErrors.courierCompany = 'Courier company is required for courier';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await dispatch(updateDispatch({ id: dispatchId, data: formData })).unwrap();
      Alert.alert('Success', 'Dispatch updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update dispatch');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (isLoading || loading) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <Text variant="titleLarge" style={styles.title}>Edit Dispatch</Text>

        <TextInput
          label="Letter Type *"
          value={formData.letterType}
          onChangeText={(value) => updateFormData('letterType', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.letterType}
        />
        {errors.letterType && <Text style={styles.errorText}>{errors.letterType}</Text>}

        <Dropdown
          label="Customer *"
          value={formData.customer_id}
          onValueChange={(value) => updateFormData('customer_id', value)}
          items={customerOptions}
          placeholder="Select Customer"
          error={!!errors.customer_id}
        />
        {errors.customer_id && <Text style={styles.errorText}>{errors.customer_id}</Text>}

        <Dropdown
          label="Customer Type *"
          value={formData.customerType}
          onValueChange={(value) => updateFormData('customerType', value)}
          items={customerTypeOptions}
          placeholder="Select Customer Type"
        />

        <TextInput
          label="Dispatch Date *"
          value={formData.dispatchDate}
          onChangeText={(value) => updateFormData('dispatchDate', value)}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
          error={!!errors.dispatchDate}
        />
        {errors.dispatchDate && <Text style={styles.errorText}>{errors.dispatchDate}</Text>}

        <Dropdown
          label="Unit"
          value={formData.unitNo}
          onValueChange={(value) => updateFormData('unitNo', value)}
          items={unitOptions}
          placeholder="Select Unit (Optional)"
        />

        <TextInput
          label="Location"
          value={formData.location}
          onChangeText={(value) => updateFormData('location', value)}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={2}
        />

        <Dropdown
          label="Mode of Sending *"
          value={formData.modeOfLetterSending}
          onValueChange={(value) => updateFormData('modeOfLetterSending', value)}
          items={modeOptions}
          placeholder="Select Mode"
        />

        {formData.modeOfLetterSending === 'BY_COURIER' && (
          <>
            <TextInput
              label="Consignment Number *"
              value={formData.consignmentNo}
              onChangeText={(value) => updateFormData('consignmentNo', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.consignmentNo}
            />
            {errors.consignmentNo && <Text style={styles.errorText}>{errors.consignmentNo}</Text>}

            <TextInput
              label="Courier Company *"
              value={formData.courierCompany}
              onChangeText={(value) => updateFormData('courierCompany', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.courierCompany}
            />
            {errors.courierCompany && <Text style={styles.errorText}>{errors.courierCompany}</Text>}
          </>
        )}

        <TextInput
          label="Remarks"
          value={formData.remarks}
          onChangeText={(value) => updateFormData('remarks', value)}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Update Dispatch
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
  title: { marginBottom: 24, fontWeight: 'bold' },
  input: { marginBottom: 16 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: -12, marginBottom: 12 },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: { flex: 1 },
});

export default EditDispatchScreen;
