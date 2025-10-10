import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, HelperText, Button } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState, Dropdown } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const BBAStatusReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bbaRecords, setBbaRecords] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    projectId: '',
    custId: '',
  });
  const [errors, setErrors] = useState({
    projectId: '',
    custId: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.projectId) {
      fetchCustomers();
    }
  }, [formData.projectId]);

  useEffect(() => {
    if (formData.custId) {
      fetchBBARecords();
    }
  }, [formData.custId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/bba/customers-with-records/${formData.projectId}`);
      console.log('Customers API Response:', response.data);
      if (response.data?.success) {
        const customersData = response.data.data || [];
        console.log('Customers Data:', customersData);
        setCustomers(customersData);
        setFormData(prev => ({ ...prev, custId: '' }));
        setBbaRecords([]);
      } else {
        setCustomers([]);
        setError('No customers found with BBA records for this project');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBBARecords = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/bba/records/customer/${formData.custId}`);
      console.log('BBA Records API Response:', response.data);
      if (response.data?.success) {
        setBbaRecords([response.data.data] || []);
        setError('');
        setSuccess('BBA record loaded successfully');
      } else {
        setBbaRecords([]);
        setError('No BBA record found for this customer');
      }
    } catch (error) {
      console.error('Error fetching BBA records:', error);
      setError('Failed to load BBA record');
      setBbaRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (formData.custId) {
      await fetchBBARecords();
    } else if (formData.projectId) {
      await fetchCustomers();
    } else {
      await fetchProjects();
    }
    setRefreshing(false);
  };

  const handleProjectChange = (value) => {
    setFormData({ ...formData, projectId: value, custId: '' });
    setErrors({ ...errors, projectId: '', custId: '' });
    setError('');
  };

  const handleCustomerChange = (value) => {
    setFormData({ ...formData, custId: value });
    setErrors({ ...errors, custId: '' });
    setError('');
  };

  const handleStatusUpdate = async (recordId, newStatus) => {
    try {
      Alert.alert(
        'Update Status',
        `Are you sure you want to update the status to ${newStatus}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Update',
            onPress: async () => {
              try {
                const updatePayload = { bba_status: newStatus };
                if (newStatus === 'DISPATCHED') {
                  updatePayload.document_dispatch_date = new Date().toISOString();
                }

                const response = await api.put(`/api/bba/records/${recordId}`, updatePayload);
                
                if (response.data.success) {
                  setBbaRecords(prev => 
                    prev.map(record => 
                      record.id === recordId 
                        ? { ...record, bba_status: newStatus, document_dispatch_date: updatePayload.document_dispatch_date || record.document_dispatch_date }
                        : record
                    )
                  );
                  setSuccess(`BBA status updated to ${newStatus}`);
                  setTimeout(() => setSuccess(''), 3000);
                } else {
                  setError(response.data.message || 'Failed to update BBA status');
                }
              } catch (error) {
                console.error('Error updating BBA status:', error);
                setError('Failed to update BBA status');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in status update:', error);
      setError('Failed to update BBA status');
    }
  };

  const handleViewBBA = (bbaId) => {
    navigation.navigate('BBA', { 
      screen: 'BBADetails', 
      params: { bbaId: bbaId } 
    });
  };

  const handleViewCustomer = (customerId) => {
    navigation.navigate('Customers', { 
      screen: 'CustomerDetails', 
      params: { customerId: customerId } 
    });
  };

  const selectedProject = projects.find(p => p.project_id.toString() === formData.projectId);
  const selectedCustomer = customers.find(c => c.customer_id.toString() === formData.custId);

  // Prepare dropdown options
  const projectOptions = [
    { label: 'Select Project', value: '' },
    ...projects.map(p => ({
      label: p.project_name || 'N/A',
      value: p.project_id.toString(),
    }))
  ];

  const customerOptions = customers.map(c => {
    console.log('Customer mapping:', c);
    return {
      label: `${c.manual_application_id || 'N/A'} - ${c.name || 'N/A'}`,
      value: c.customer_id.toString(),
    };
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'RECEIVED':
        return '#F59E0B';
      case 'VERIFIED':
        return '#059669';
      case 'DISPATCHED':
        return '#3B82F6';
      case 'PENDING':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  if (loading && !formData.projectId) {
    return <LoadingIndicator message="Loading projects..." />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          BBA Status Update
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Update BBA record status and track verification
        </Text>
      </View>

      {/* Selection Form */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Project & Customer
          </Text>
          
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
            value={formData.custId}
            onValueChange={handleCustomerChange}
            items={customerOptions}
            error={!!errors.custId}
            disabled={!formData.projectId || loading}
          />
          <HelperText type="error" visible={!!errors.custId}>
            {errors.custId}
          </HelperText>
          {!formData.projectId && (
            <HelperText type="info">Please select a project first</HelperText>
          )}
          {formData.projectId && loading && (
            <HelperText type="info">Loading customers...</HelperText>
          )}
          {formData.projectId && !loading && customers.length === 0 && (
            <HelperText type="info" style={styles.boldText}>No customers found with BBA records for this project</HelperText>
          )}
        </Card.Content>
      </Card>

      {/* Error Message */}
      {error && (
        <Card style={[styles.card, styles.errorCard]}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.errorText}>
              {error}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card style={[styles.card, styles.successCard]}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.successText}>
              {success}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* BBA Record Display */}
      {bbaRecords.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              BBA Record Details
            </Text>
            
            {bbaRecords.map((record, index) => (
              <View key={index} style={styles.recordContainer}>
                <View style={styles.recordHeader}>
                  <Text variant="titleLarge" style={styles.customerName}>
                    {record.customer_name || 'N/A'}
                  </Text>
                  <View style={styles.statusContainer}>
                    <Text variant="bodyMedium" style={styles.statusLabel}>
                      Status:
                    </Text>
                    <Text 
                      variant="bodyMedium" 
                      style={[
                        styles.statusValue,
                        { color: getStatusColor(record.bba_status) }
                      ]}
                    >
                      {record.bba_status || 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Agreement Number:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.agreement_number || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Customer Type:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.customer_type || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Phone:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.customer_phone || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Email:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.customer_email || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Address:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.customer_address || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Document Received:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.document_received_date ? formatDate(record.document_received_date) : 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Execution Date:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.execution_date ? formatDate(record.execution_date) : 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Dispatch Date:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.document_dispatch_date ? formatDate(record.document_dispatch_date) : 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>Remarks:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {record.remarks || 'N/A'}
                    </Text>
                  </View>
                </View>

                {/* Status Update Buttons */}
                <View style={styles.statusButtons}>
                  {record.bba_status !== 'RECEIVED' && (
                    <Button
                      mode="contained"
                      onPress={() => handleStatusUpdate(record.id, 'RECEIVED')}
                      style={[styles.statusButton, styles.receivedButton]}
                    >
                      Mark as Received
                    </Button>
                  )}
                  
                  {record.bba_status !== 'VERIFIED' && (
                    <Button
                      mode="contained"
                      onPress={() => handleStatusUpdate(record.id, 'VERIFIED')}
                      style={[styles.statusButton, styles.verifiedButton]}
                    >
                      Mark as Verified
                    </Button>
                  )}
                  
                  {record.bba_status !== 'DISPATCHED' && (
                    <Button
                      mode="contained"
                      onPress={() => handleStatusUpdate(record.id, 'DISPATCHED')}
                      style={[styles.statusButton, styles.dispatchedButton]}
                    >
                      Mark as Dispatched
                    </Button>
                  )}
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Empty State */}
      {formData.custId && !loading && bbaRecords.length === 0 && (
        <EmptyState
          title="No BBA Record Found"
          description="No BBA record found for the selected customer"
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
  },
  successText: {
    color: '#059669',
    textAlign: 'center',
  },
  recordContainer: {
    gap: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    color: '#374151',
  },
  statusValue: {
    fontWeight: 'bold',
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    color: '#6B7280',
    fontWeight: '500',
    width: 140,
    marginRight: 8,
  },
  infoValue: {
    color: '#1F2937',
    flex: 1,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  statusButton: {
    flex: 1,
    minWidth: 120,
  },
  receivedButton: {
    backgroundColor: '#F59E0B',
  },
  verifiedButton: {
    backgroundColor: '#059669',
  },
  dispatchedButton: {
    backgroundColor: '#3B82F6',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default BBAStatusReportScreen;
