import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Button, Chip, FAB, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { Dropdown } from '../../../components/common';
import api from '../../../config/api';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const AllotmentLetterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [allotmentData, setAllotmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 10, padding: 8, marginTop: -12 }}
          >
            <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
        ),
      });
    }, [navigation])
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchCustomers(selectedProjectId);
      setSelectedCustomerId('');
      setAllotmentData(null);
    } else {
      setCustomers([]);
      setSelectedCustomerId('');
      setAllotmentData(null);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        setProjects(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async (projectId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/master/customers/project/${projectId}`);
      
      if (response.data?.success) {
        setCustomers(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'Failed to load customers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllotment = async () => {
    if (!selectedCustomerId || !selectedProjectId) {
      setError('Please select both a project and a customer.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get(
        `/api/generate-allotment?customerId=${selectedCustomerId}&projectId=${selectedProjectId}`
      );
      
      if (response.data?.success) {
        const data = {
          name: response.data.data?.name || 'N/A',
          address: response.data.data?.address || 'N/A',
          father_name: response.data.data?.father_name || 'N/A',
          phone_no: response.data.data?.phone_no || 'N/A',
          allotment_date: response.data.data?.allotment_date || new Date().toISOString(),
          project_name: response.data.data?.project_name || 'N/A',
          unit_name: response.data.data?.unit_name || 'N/A',
          total_price: Number(response.data.data?.total_price || 0),
          base_price: Number(response.data.data?.base_price || 0),
          charges: Number(response.data.data?.charges || 0),
          is_full_paid: Boolean(response.data.data?.is_full_paid || false)
        };
        setAllotmentData(data);
      } else {
        throw new Error(response.data?.message || 'No allotment data found');
      }
    } catch (error) {
      // Handle both local backend (404 status) and Railway backend (200 status with success: false)
      const isAllotmentNotFound = error.response?.status === 404 || 
                                 error.message.includes('No allotment data found') || 
                                 error.message.includes('No allotment found');
      
      if (isAllotmentNotFound) {
        // Don't log as error for missing allotment - this is expected behavior
        Alert.alert(
          'No Allotment Found', 
          'No allotment data found for the selected customer and project.\n\nTo generate an allotment letter, the customer must first have an allotment created. Please create an allotment for this customer before generating the letter.',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Create Allotment', 
              style: 'default',
              onPress: () => navigation.navigate('Allotments', { screen: 'CreateAllotment' })
            }
          ]
        );
      } else {
        // Only log actual errors, not missing allotment cases
        console.error('Error fetching allotment letter data:', error);
        setError(error.message || 'Failed to load allotment letter data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareAllotment = async () => {
    if (!allotmentData) return;

    const allotmentText = `
ALLOTMENT LETTER

Customer Details:
Name: ${allotmentData.name}
Father's Name: ${allotmentData.father_name}
Address: ${allotmentData.address}
Contact: ${allotmentData.phone_no}

Property Details:
Project: ${allotmentData.project_name}
Unit: ${allotmentData.unit_name}
Allotment Date: ${formatDate(allotmentData.allotment_date)}

Financial Details:
Base Price: ${formatCurrency(allotmentData.base_price)}
Additional Charges: ${formatCurrency(allotmentData.charges)}
Total Price: ${formatCurrency(allotmentData.total_price)}
Payment Status: ${allotmentData.is_full_paid ? 'Fully Paid' : 'Partially Paid'}

Generated by Land 2 Lavish Properties
    `.trim();

    try {
      await Share.share({
        message: allotmentText,
        title: 'Allotment Letter',
      });
    } catch (error) {
      console.error('Error sharing allotment letter:', error);
      Alert.alert('Error', 'Failed to share allotment letter');
    }
  };

  const projectOptions = projects.map(project => ({
    label: project.project_name,
    value: project.project_id,
  }));

  const customerOptions = customers.map(customer => ({
    label: `${customer.name} (${customer.phone_no})`,
    value: customer.customer_id,
  }));

  if (loading && projects.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.title, { color: theme.colors.onSurface }]}>
              Allotment Letter Generator
            </Title>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Generate and share allotment letters for customers
            </Text>
          </Card.Content>
        </Card>

        {/* Selection Form */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Select Details
            </Title>

            <Dropdown
              label="Select Project *"
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              items={projectOptions}
              error={!selectedProjectId && error}
              style={styles.dropdown}
            />

            {selectedProjectId && (
              <Dropdown
                label="Select Customer *"
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
                items={customerOptions}
                error={!selectedCustomerId && error}
                style={styles.dropdown}
              />
            )}

            <Button
              mode="contained"
              onPress={handleGetAllotment}
              loading={loading}
              disabled={!selectedProjectId || !selectedCustomerId || loading}
              style={styles.generateButton}
              icon="file-document"
            >
              Generate Allotment Letter
            </Button>

            {error && (
              <Text variant="bodySmall" style={[styles.errorText, { color: '#EF4444' }]}>
                {error}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Allotment Data Display */}
        {allotmentData && (
          <Card style={[styles.allotmentCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Allotment Letter
              </Title>

              {/* Customer Details */}
              <View style={styles.section}>
                <Text variant="titleSmall" style={[styles.subsectionTitle, { color: theme.colors.primary }]}>
                  Customer Details
                </Text>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Name:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {allotmentData.name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Father's Name:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {allotmentData.father_name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Address:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {allotmentData.address}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Contact:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {allotmentData.phone_no}
                  </Text>
                </View>
              </View>

              {/* Property Details */}
              <View style={styles.section}>
                <Text variant="titleSmall" style={[styles.subsectionTitle, { color: theme.colors.primary }]}>
                  Property Details
                </Text>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Project:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {allotmentData.project_name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Unit:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {allotmentData.unit_name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Allotment Date:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {formatDate(allotmentData.allotment_date)}
                  </Text>
                </View>
              </View>

              {/* Financial Details */}
              <View style={styles.section}>
                <Text variant="titleSmall" style={[styles.subsectionTitle, { color: theme.colors.primary }]}>
                  Financial Details
                </Text>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Base Price:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {formatCurrency(allotmentData.base_price)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Additional Charges:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {formatCurrency(allotmentData.charges)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Total Price:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.detailValue, { color: '#10B981', fontWeight: 'bold' }]}>
                    {formatCurrency(allotmentData.total_price)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Payment Status:
                  </Text>
                  <Chip 
                    style={[
                      styles.statusChip, 
                      { backgroundColor: allotmentData.is_full_paid ? '#D1FAE5' : '#FEF3C7' }
                    ]}
                  >
                    <Text style={{ color: allotmentData.is_full_paid ? '#065F46' : '#92400E' }}>
                      {allotmentData.is_full_paid ? 'Fully Paid' : 'Partially Paid'}
                    </Text>
                  </Chip>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleShareAllotment}
                style={styles.shareButton}
                icon="share"
              >
                Share Allotment Letter
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  dropdown: {
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
  },
  allotmentCard: {
    elevation: 2,
  },
  section: {
    marginBottom: 20,
  },
  subsectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
  },
  statusChip: {
    borderRadius: 12,
  },
  shareButton: {
    marginTop: 16,
  },
});

export default AllotmentLetterScreen;
