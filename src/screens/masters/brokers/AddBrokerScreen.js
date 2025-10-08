import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { Dropdown } from '../../../components';
import { createBroker } from '../../../store/slices/brokersSlice';
import { fetchProjects } from '../../../store/slices/projectsSlice';

const AddBrokerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { projects } = useSelector(state => state.projects);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobile: '',
    email: '',
    phone: '',
    fax: '',
    income_tax_ward_no: '',
    dist_no: '',
    pan_no: '',
    net_commission_rate: '',
    project_id: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    else if (formData.mobile.length !== 10) newErrors.mobile = 'Mobile must be 10 digits';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.pan_no) newErrors.pan_no = 'PAN is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_no)) {
      newErrors.pan_no = 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    if (formData.net_commission_rate && parseFloat(formData.net_commission_rate) < 0) {
      newErrors.net_commission_rate = 'Commission rate cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        project_id: parseInt(formData.project_id),
        net_commission_rate: formData.net_commission_rate ? parseFloat(formData.net_commission_rate) : null,
      };
      
      await dispatch(createBroker(submissionData)).unwrap();
      Alert.alert('Success', 'Broker added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'Failed to add broker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <Dropdown
          label="Project *"
          value={formData.project_id}
          onValueChange={(value) => handleChange('project_id', value)}
          items={projects.map(p => ({ label: p.project_name, value: p.project_id }))}
          error={!!errors.project_id}
        />
        <HelperText type="error" visible={!!errors.project_id}>
          {errors.project_id}
        </HelperText>

        <TextInput
          label="Broker Name *"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          mode="outlined"
          error={!!errors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label="Address *"
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
          mode="outlined"
          multiline
          numberOfLines={3}
          error={!!errors.address}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.address}>
          {errors.address}
        </HelperText>

        <TextInput
          label="Mobile *"
          value={formData.mobile}
          onChangeText={(text) => handleChange('mobile', text.replace(/\D/g, '').slice(0, 10))}
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={10}
          error={!!errors.mobile}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.mobile}>
          {errors.mobile}
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

        <TextInput
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text.replace(/\D/g, '').slice(0, 10))}
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={10}
          style={styles.input}
        />

        <TextInput
          label="Fax"
          value={formData.fax}
          onChangeText={(text) => handleChange('fax', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="PAN No. *"
          value={formData.pan_no}
          onChangeText={(text) => handleChange('pan_no', text.toUpperCase())}
          mode="outlined"
          maxLength={10}
          autoCapitalize="characters"
          error={!!errors.pan_no}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.pan_no}>
          {errors.pan_no}
        </HelperText>

        <TextInput
          label="Income Tax Ward No."
          value={formData.income_tax_ward_no}
          onChangeText={(text) => handleChange('income_tax_ward_no', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="District No."
          value={formData.dist_no}
          onChangeText={(text) => handleChange('dist_no', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Net Commission Rate (%)"
          value={formData.net_commission_rate}
          onChangeText={(text) => handleChange('net_commission_rate', text)}
          mode="outlined"
          keyboardType="decimal-pad"
          error={!!errors.net_commission_rate}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.net_commission_rate}>
          {errors.net_commission_rate}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Add Broker
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

export default AddBrokerScreen;
