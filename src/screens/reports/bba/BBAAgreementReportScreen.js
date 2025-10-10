import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, HelperText } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState, Dropdown } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const BBAAgreementReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bbaRecord, setBbaRecord] = useState(null);
  const [documents, setDocuments] = useState([]);
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
    } else {
      setCustomers([]);
      setBbaRecord(null);
      setDocuments([]);
      setFormData(prev => ({ ...prev, custId: '' }));
    }
  }, [formData.projectId]);

  useEffect(() => {
    if (formData.custId) {
      fetchBBARecord();
    } else {
      setBbaRecord(null);
      setDocuments([]);
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
        setBbaRecord(null);
        setDocuments([]);
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

  const fetchBBARecord = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/bba/records/customer/${formData.custId}`);
      if (response.data?.success) {
        setBbaRecord(response.data.data);
        setDocuments(response.data.data.documents || []);
        setSuccess('BBA record loaded successfully');
        setTimeout(() => setSuccess(''), 3000);
        setError('');
      } else {
        setError(response.data.message || 'No BBA record found');
        setBbaRecord(null);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching BBA record:', error);
      setError('Failed to fetch BBA record');
      setBbaRecord(null);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (formData.projectId) {
      await fetchCustomers();
    }
    if (formData.custId) {
      await fetchBBARecord();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B';
      case 'VERIFIED':
        return '#059669';
      case 'REJECTED':
        return '#DC2626';
      case 'RECEIVED':
        return '#3B82F6';
      case 'EXECUTED':
        return '#059669';
      case 'READY_FOR_DISPATCH':
        return '#F59E0B';
      case 'DISPATCHED':
        return '#7C3AED';
      default:
        return '#6B7280';
    }
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

  console.log('Customer Options:', customerOptions);

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
          BBA Agreement
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          View BBA record details and associated documents
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
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card style={[styles.card, styles.successCard]}>
          <Card.Content>
            <Text style={styles.successText}>{success}</Text>
          </Card.Content>
        </Card>
      )}

      {/* BBA Record Summary */}
      {bbaRecord ? (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.recordHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                BBA Record Summary
              </Text>
              <View style={styles.statusContainer}>
                <Text variant="bodyMedium" style={styles.statusLabel}>Status:</Text>
                <Chip
                  mode="outlined"
                  style={[styles.statusChip, { backgroundColor: getStatusColor(bbaRecord.bba_status) }]}
                  textStyle={styles.statusChipText}
                >
                  {bbaRecord.bba_status || 'N/A'}
                </Chip>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Customer Name:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.customer_name || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Customer Type:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.customer_type ? 
                    bbaRecord.customer_type.charAt(0) + bbaRecord.customer_type.slice(1).toLowerCase() 
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Phone:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.customer_phone || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Email:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.customer_email || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Address:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.customer_address || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Address Proof Type:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.address_proof_type || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Document Received Date:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.document_received_date ? formatDate(bbaRecord.document_received_date) : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Execution Date:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.execution_date ? formatDate(bbaRecord.execution_date) : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Document Dispatch Date:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.document_dispatch_date ? formatDate(bbaRecord.document_dispatch_date) : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Created At:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.created_at ? formatDate(bbaRecord.created_at) : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Updated At:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.updated_at ? formatDate(bbaRecord.updated_at) : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Remarks:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {bbaRecord.remarks || 'N/A'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ) : (
        formData.custId && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.noDataText}>
                No BBA record found for the selected customer.
              </Text>
            </Card.Content>
          </Card>
        )
      )}

      {/* Documents Section */}
      {bbaRecord && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Documents ({documents.length})
            </Text>
            
            {documents.length > 0 ? (
              <View style={styles.documentsContainer}>
                {documents.map((doc, index) => (
                  <View key={doc.id || index} style={styles.documentItem}>
                    <View style={styles.documentInfo}>
                      <Text variant="bodyMedium" style={styles.documentName}>
                        {doc.document_name?.replace(/_/g, ' ') || 'Unknown Document'}
                      </Text>
                      <Chip
                        mode="outlined"
                        style={[styles.documentStatusChip, { backgroundColor: getStatusColor(doc.document_status) }]}
                        textStyle={styles.documentStatusText}
                      >
                        {doc.document_status}
                      </Chip>
                      <Text variant="bodySmall" style={styles.documentDate}>
                        Created: {doc.created_at ? formatDate(doc.created_at) : 'N/A'}
                      </Text>
                    </View>
                    {doc.url && (
                      <Button
                        mode="text"
                        onPress={() => {
                          // Handle document view - could open in browser or PDF viewer
                          Alert.alert('Document', 'Document viewing functionality will be implemented');
                        }}
                        style={styles.viewButton}
                      >
                        View
                      </Button>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.noDataText}>
                No documents found for this customer.
              </Text>
            )}
          </Card.Content>
        </Card>
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    color: '#374151',
  },
  statusChip: {
    backgroundColor: '#F3F4F6',
  },
  statusChipText: {
    color: '#FFFFFF',
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
  noDataText: {
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  documentsContainer: {
    gap: 12,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentInfo: {
    flex: 1,
    gap: 4,
  },
  documentName: {
    fontWeight: '500',
    color: '#1F2937',
  },
  documentStatusChip: {
    alignSelf: 'flex-start',
  },
  documentStatusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  documentDate: {
    color: '#6B7280',
  },
  viewButton: {
    marginLeft: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default BBAAgreementReportScreen;
