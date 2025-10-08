import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { fetchBBAById, updateBBA } from '../../../store/slices/bbaSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const EditBBAScreen = ({ route, navigation }) => {
  const { bbaId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading: fetchLoading } = useSelector(state => state.bba);
  
  const [formData, setFormData] = useState({
    customerId: '',
    projectId: '',
    unitId: '',
    bbaDate: '',
    status: 'pending',
    remarks: '',
  });
  
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [units, setUnits] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bbaId) {
      dispatch(fetchBBAById(bbaId));
    }
  }, [dispatch, bbaId]);

  useEffect(() => {
    if (current) {
      setFormData({
        customerId: current.customer_id?.toString() || '',
        projectId: current.project_id?.toString() || '',
        unitId: current.unit_id?.toString() || '',
        bbaDate: current.bba_date || '',
        status: current.status || 'pending',
        remarks: current.remarks || '',
      });
    }
  }, [current]);

  useEffect(() => {
    fetchProjects();
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

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!formData.projectId) {
        setCustomers([]);
        return;
      }
      try {
        const response = await api.get(`/api/master/customers/project/${formData.projectId}`);
        if (response.data?.success) {
          setCustomers(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, [formData.projectId]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!formData.projectId) {
        setUnits([]);
        return;
      }
      try {
        const response = await api.get(`/api/master/project/${formData.projectId}/units`);
        if (response.data?.success) {
          setUnits(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching units:', error);
        setUnits([]);
      }
    };
    fetchUnits();
  }, [formData.projectId]);

  const handleProjectChange = (value) => {
    setFormData({
      ...formData,
      projectId: value,
      customerId: '',
      unitId: '',
    });
    setErrors({ ...errors, projectId: '' });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.unitId) newErrors.unitId = 'Unit is required';
    if (!formData.bbaDate) newErrors.bbaDate = 'BBA date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        customer_id: formData.customerId,
        project_id: formData.projectId,
        unit_id: formData.unitId,
        bba_date: formData.bbaDate,
        status: formData.status,
        remarks: formData.remarks,
      };
      
      await dispatch(updateBBA({ id: bbaId, data: payload })).unwrap();
      Alert.alert('Success', 'BBA record updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update BBA record');
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = projects.map(p => ({
    label: p.project_name || 'N/A',
    value: p.project_id,
  }));

  const customerOptions = customers.map(c => ({
    label: `${c.name || 'N/A'} - ${c.mobile_number || ''}`,
    value: c.customer_id,
  }));

  const unitOptions = units.map(u => ({
    label: `${u.unit_no || 'N/A'} - ${u.unit_desc || ''}`,
    value: u.unit_id,
  }));

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ];

  if (fetchLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Edit BBA Record</Text>

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
            onValueChange={(value) => {
              setFormData({ ...formData, customerId: value });
              setErrors({ ...errors, customerId: '' });
            }}
            items={customerOptions}
            error={!!errors.customerId}
            disabled={!formData.projectId}
          />
          <HelperText type="error" visible={!!errors.customerId}>
            {errors.customerId}
          </HelperText>

          <Dropdown
            label="Unit *"
            value={formData.unitId}
            onValueChange={(value) => {
              setFormData({ ...formData, unitId: value });
              setErrors({ ...errors, unitId: '' });
            }}
            items={unitOptions}
            error={!!errors.unitId}
            disabled={!formData.projectId}
          />
          <HelperText type="error" visible={!!errors.unitId}>
            {errors.unitId}
          </HelperText>

          <TextInput
            label="BBA Date *"
            value={formData.bbaDate}
            onChangeText={(text) => {
              setFormData({ ...formData, bbaDate: text });
              setErrors({ ...errors, bbaDate: '' });
            }}
            error={!!errors.bbaDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.bbaDate}>
            {errors.bbaDate}
          </HelperText>

          <Dropdown
            label="Status *"
            value={formData.status}
            onValueChange={(value) => {
              setFormData({ ...formData, status: value });
              setErrors({ ...errors, status: '' });
            }}
            items={statusOptions}
            error={!!errors.status}
          />
          <HelperText type="error" visible={!!errors.status}>
            {errors.status}
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
              Update BBA
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  form: { padding: 16 },
  sectionTitle: { marginBottom: 16, fontWeight: '600' },
  input: { marginBottom: 8 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default EditBBAScreen;
