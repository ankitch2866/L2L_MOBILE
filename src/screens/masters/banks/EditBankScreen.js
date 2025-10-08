import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchBankById, updateBank } from '../../../store/slices/banksSlice';

const EditBankScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading: bankLoading } = useSelector(state => state.banks);
  
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBankById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current) {
      setFormData({
        bank_name: current.bank_name || '',
        branch_name: current.branch_name || '',
        ifsc_code: current.ifsc_code || '',
        address: current.address || '',
        contact_person: current.contact_person || '',
        contact_number: current.contact_number || '',
        email: current.email || ''
      });
    }
  }, [current]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.bank_name) newErrors.bank_name = 'Bank name is required';
    if (!formData.branch_name) newErrors.branch_name = 'Branch name is required';
    if (!formData.ifsc_code) newErrors.ifsc_code = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
      newErrors.ifsc_code = 'Invalid IFSC code format (e.g., SBIN0001234)';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.contact_number && formData.contact_number.length !== 10) {
      newErrors.contact_number = 'Contact number must be 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await dispatch(updateBank({ id, data: formData })).unwrap();
      Alert.alert('Success', 'Bank updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update bank');
    } finally {
      setLoading(false);
    }
  };

  if (bankLoading || !formData) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <TextInput
          label="Bank Name *"
          value={formData.bank_name}
          onChangeText={(text) => handleChange('bank_name', text)}
          mode="outlined"
          error={!!errors.bank_name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.bank_name}>
          {errors.bank_name}
        </HelperText>

        <TextInput
          label="Branch Name *"
          value={formData.branch_name}
          onChangeText={(text) => handleChange('branch_name', text)}
          mode="outlined"
          error={!!errors.branch_name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.branch_name}>
          {errors.branch_name}
        </HelperText>

        <TextInput
          label="IFSC Code *"
          value={formData.ifsc_code}
          onChangeText={(text) => handleChange('ifsc_code', text.toUpperCase())}
          mode="outlined"
          maxLength={11}
          autoCapitalize="characters"
          error={!!errors.ifsc_code}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.ifsc_code}>
          {errors.ifsc_code}
        </HelperText>

        <TextInput
          label="Address"
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <TextInput
          label="Contact Person"
          value={formData.contact_person}
          onChangeText={(text) => handleChange('contact_person', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Contact Number"
          value={formData.contact_number}
          onChangeText={(text) => handleChange('contact_number', text.replace(/\D/g, '').slice(0, 10))}
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={10}
          error={!!errors.contact_number}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.contact_number}>
          {errors.contact_number}
        </HelperText>

        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!errors.email}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Update Bank
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
  input: { marginBottom: 8 },
  button: { marginTop: 24, marginBottom: 32 },
});

export default EditBankScreen;
