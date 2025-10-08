import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
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
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);

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

  // Set navigation options with back button
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

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/api/transaction/bookings/${bookingId}`);
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
      const response = await api.get('/api/master/projects');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setProjects(response.data.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!formData.projectId) {
        setCustomers([]);
        setIsCustomersLoading(false);
        return;
      }

      setIsCustomersLoading(true);
      try {
        const response = await api.get(`/api/transaction/allotments/projects/${formData.projectId}/non-allotted-customers`);
        console.log('Customer API response:', response.data);
        if (response.data?.success && Array.isArray(response.data.data?.customers)) {
          setCustomers(response.data.data.customers || []);
          console.log('Set customers:', response.data.data.customers?.length || 0);
        } else {
          setCustomers([]);
          console.log('No customers found or invalid response');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setIsCustomersLoading(false);
      }
    };
    fetchCustomers();
  }, [formData.projectId]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!formData.projectId) {
        setUnits([]);
        setIsUnitsLoading(false);
        return;
      }

      setIsUnitsLoading(true);
      try {
        const response = await api.get(`/api/master/project/${formData.projectId}/units?status=booked`);
        console.log('Units API response:', response.data);
        if (response.data?.success && Array.isArray(response.data.data)) {
          setUnits(response.data.data || []);
          console.log('Set units:', response.data.data?.length || 0);
        } else {
          setUnits([]);
          console.log('No units found or invalid response');
        }
      } catch (error) {
        console.error('Error fetching units:', error);
        setUnits([]);
      } finally {
        setIsUnitsLoading(false);
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
              label: c.name || c.customer_name || `Customer ${c.customer_id}`,
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
