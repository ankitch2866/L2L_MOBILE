import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { createAllotment } from '../../../store/slices/allotmentsSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const CreateAllotmentScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const bookingId = route?.params?.bookingId;
  
  const [formData, setFormData] = useState({
    projectId: '',
    customerId: '',
    unitId: '',
    allotmentDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });
  
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [units, setUnits] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/transaction/bookings/${bookingId}`);
      if (response.data?.success || response.data) {
        const booking = response.data?.data || response.data;
        setFormData({
          projectId: booking.project_id?.toString() || '',
          customerId: booking.customer_id?.toString() || '',
          unitId: booking.unit_id?.toString() || '',
          allotmentDate: new Date().toISOString().split('T')[0],
          remarks: `Allotment from Booking #${booking.booking_id}`,
        });
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/master/projects');
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
        const response = await api.get(`/transaction/allotments/projects/${formData.projectId}/non-allotted-customers`);
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
        const response = await api.get(`/master/project/${formData.projectId}/units?status=booked`);
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
    if (!formData.allotmentDate) newErrors.allotmentDate = 'Allotment date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        project_id: parseInt(formData.projectId),
        customer_id: parseInt(formData.customerId),
        unit_id: parseInt(formData.unitId),
        allotment_date: formData.allotmentDate,
        remarks: formData.remarks,
      };

      await dispatch(createAllotment(payload)).unwrap();
      Alert.alert('Success', 'Allotment created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to create allotment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text variant="titleLarge" style={styles.title}>Create Allotment</Text>
          
          <Dropdown
            label="Project *"
            value={formData.projectId}
            onValueChange={handleProjectChange}
            items={projects.map(p => ({
              label: p.project_name,
              value: p.project_id?.toString()
            }))}
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
            items={customers.map(c => ({
              label: c.name || c.customer_name,
              value: c.customer_id?.toString()
            }))}
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
            items={units.map(u => ({
              label: `${u.unit_name} - ${u.unit_size} sq ft`,
              value: u.unit_id?.toString()
            }))}
            error={!!errors.unitId}
            disabled={!formData.projectId}
          />
          <HelperText type="error" visible={!!errors.unitId}>
            {errors.unitId}
          </HelperText>

          <TextInput
            label="Allotment Date *"
            value={formData.allotmentDate}
            onChangeText={(text) => {
              setFormData({ ...formData, allotmentDate: text });
              setErrors({ ...errors, allotmentDate: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.allotmentDate}
            placeholder="YYYY-MM-DD"
          />
          <HelperText type="error" visible={!!errors.allotmentDate}>
            {errors.allotmentDate}
          </HelperText>

          <TextInput
            label="Remarks"
            value={formData.remarks}
            onChangeText={(text) => setFormData({ ...formData, remarks: text })}
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
              Create
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  card: { padding: 16, borderRadius: 8, elevation: 2 },
  title: { marginBottom: 16, fontWeight: 'bold' },
  input: { marginBottom: 8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 8 },
  button: { flex: 1 },
});

export default CreateAllotmentScreen;
