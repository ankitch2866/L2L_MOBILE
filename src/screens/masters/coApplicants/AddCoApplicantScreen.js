import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Switch, HelperText, Checkbox } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { Dropdown } from '../../../components';
import { createCoApplicant } from '../../../store/slices/coApplicantsSlice';
import { fetchProjects } from '../../../store/slices/projectsSlice';
import { fetchCustomers } from '../../../store/slices/customersSlice';

const AddCoApplicantScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { projects } = useSelector(state => state.projects);
  const { customers } = useSelector(state => state.customers);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    project_id: '',
    is_co_applicant: false,
    name: '',
    guardian_relation: '',
    guardian_name: '',
    address: '',
    mobile: '',
    email: '',
    phone: '',
    fax: '',
    occupation: '',
    income_tax_ward_no: '',
    dist_no: '',
    pan_no: '',
    dob: '',
    date_of_agreement: '',
    nationality: 'Resident India',
    custom_nationality: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (formData.project_id) {
      const filtered = customers.filter(c => c.project_id === parseInt(formData.project_id));
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [formData.project_id, customers]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.guardian_name) newErrors.guardian_name = 'Guardian name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    else if (formData.mobile.length !== 10) newErrors.mobile = 'Mobile must be 10 digits';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.pan_no && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_no)) {
      newErrors.pan_no = 'Invalid PAN format';
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
        customer_id: parseInt(formData.customer_id),
        project_id: parseInt(formData.project_id),
        dob: formData.dob || null,
        date_of_agreement: formData.date_of_agreement || null,
        nationality: formData.nationality === 'Non-Resident India' && formData.custom_nationality
          ? formData.custom_nationality
          : formData.nationality,
      };
      
      await dispatch(createCoApplicant(submissionData)).unwrap();
      Alert.alert('Success', 'Co-Applicant added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'Failed to add co-applicant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={formData.is_co_applicant ? 'checked' : 'unchecked'}
            onPress={() => handleChange('is_co_applicant', !formData.is_co_applicant)}
          />
          <Button onPress={() => handleChange('is_co_applicant', !formData.is_co_applicant)}>
            Is Co-Applicant?
          </Button>
        </View>

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

        <Dropdown
          label="Customer *"
          value={formData.customer_id}
          onValueChange={(value) => handleChange('customer_id', value)}
          items={filteredCustomers.map(c => ({ 
            label: `${c.name || c.customer_name || 'N/A'} (${c.manual_application_id || 'N/A'})`, 
            value: c.customer_id 
          }))}
          error={!!errors.customer_id}
          disabled={!formData.project_id}
        />
        <HelperText type="error" visible={!!errors.customer_id}>
          {errors.customer_id}
        </HelperText>

        <TextInput
          label="Full Name *"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          mode="outlined"
          error={!!errors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <Dropdown
          label="Guardian Relation"
          value={formData.guardian_relation}
          onValueChange={(value) => handleChange('guardian_relation', value)}
          items={[
            { label: 'Son of', value: 'S/O' },
            { label: 'Wife of', value: 'W/O' },
            { label: 'Daughter of', value: 'D/O' },
            { label: 'Other', value: 'O' },
          ]}
        />

        <TextInput
          label="Guardian Name *"
          value={formData.guardian_name}
          onChangeText={(text) => handleChange('guardian_name', text)}
          mode="outlined"
          error={!!errors.guardian_name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.guardian_name}>
          {errors.guardian_name}
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
          label="Email *"
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
          label="Occupation"
          value={formData.occupation}
          onChangeText={(text) => handleChange('occupation', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="PAN No."
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

        <Dropdown
          label="Nationality *"
          value={formData.nationality}
          onValueChange={(value) => handleChange('nationality', value)}
          items={[
            { label: 'Resident Indian', value: 'Resident India' },
            { label: 'Non-Resident Indian', value: 'Non-Resident India' },
          ]}
        />

        {formData.nationality === 'Non-Resident India' && (
          <TextInput
            label="Specify Nationality"
            value={formData.custom_nationality}
            onChangeText={(text) => handleChange('custom_nationality', text)}
            mode="outlined"
            style={styles.input}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Add Co-Applicant
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
  input: { marginBottom: 8 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  button: { marginTop: 24, marginBottom: 32 },
});

export default AddCoApplicantScreen;
