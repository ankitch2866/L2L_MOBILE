import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text, Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../../context';
import { generateQuery, fetchPaymentQueries } from '../../../store/slices/paymentQueriesSlice';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';

const GeneratePaymentQueryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    project_id: '',
    installment_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [projects, setProjects] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      fetchInstallments(formData.project_id);
    } else {
      setInstallments([]);
      setFormData(prev => ({ ...prev, installment_id: '' }));
    }
  }, [formData.project_id]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/transaction/payment-query/projects');
      if (response.data?.success) {
        const projectsData = response.data.data?.projects || [];
        setProjects(projectsData.map(p => ({
          id: p.project_id,
          name: p.project_name,
        })));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to fetch projects');
    }
  };

  const fetchInstallments = async (projectId) => {
    try {
      const response = await api.get(`/transaction/payment-query/installments/project/${projectId}`);
      if (response.data?.success) {
        const installmentsData = response.data.data?.installments || [];
        setInstallments(installmentsData.map(i => ({
          id: i.id,
          name: i.installment_name || i.name,
          due_days: i.due_days,
          value: i.value,
          is_percentage: i.is_percentage,
        })));
      }
    } catch (error) {
      console.error('Error fetching installments:', error);
      Alert.alert('Error', 'Failed to fetch installments');
      setInstallments([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.installment_id) newErrors.installment_id = 'Installment is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';

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
      const submitData = {
        ...formData,
        project_id: formData.project_id || null,
      };
      
      await dispatch(generateQuery(submitData)).unwrap();
      Alert.alert('Success', 'Payment query generated successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchPaymentQueries());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to generate payment query');
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

  const selectedInstallment = installments.find(i => i.id === formData.installment_id);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Query Information</Text>

            <Dropdown
              label="Project (Optional)"
              placeholder="Select project"
              value={formData.project_id}
              onValueChange={(value) => updateFormData('project_id', value)}
              items={projects}
              error={!!errors.project_id}
            />
            <HelperText type="error" visible={!!errors.project_id}>
              {errors.project_id}
            </HelperText>

            <Dropdown
              label="Installment *"
              placeholder="Select installment"
              value={formData.installment_id}
              onValueChange={(value) => updateFormData('installment_id', value)}
              items={installments}
              error={!!errors.installment_id}
              disabled={!formData.project_id && installments.length === 0}
            />
            <HelperText type="error" visible={!!errors.installment_id}>
              {errors.installment_id}
            </HelperText>

            {selectedInstallment && (
              <Card style={styles.infoCard}>
                <Card.Content>
                  <Text style={styles.infoTitle}>Installment Details</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Due Days:</Text>
                    <Text style={styles.infoValue}>{selectedInstallment.due_days} days</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Value:</Text>
                    <Text style={styles.infoValue}>
                      {selectedInstallment.is_percentage 
                        ? `${selectedInstallment.value}%` 
                        : `₹${parseFloat(selectedInstallment.value).toLocaleString('en-IN')}`}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.description}
              multiline
              numberOfLines={3}
            />
            <HelperText type="error" visible={!!errors.description}>
              {errors.description}
            </HelperText>

            <TextInput
              label="Date *"
              value={formData.date}
              onChangeText={(value) => updateFormData('date', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.date}
              placeholder="YYYY-MM-DD"
            />
            <HelperText type="error" visible={!!errors.date}>
              {errors.date}
            </HelperText>
          </Card.Content>
        </Card>

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
            Generate Query
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});

export default GeneratePaymentQueryScreen;
