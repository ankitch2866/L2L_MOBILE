import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerWisePaymentDetailsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalCustomers: 0,
    totalTransactions: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchCustomerWisePayments();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        setProjects(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedProject(response.data.data[0].project_id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    }
  };

  const fetchCustomerWisePayments = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/api/transaction/payment/dashboard?projectId=${selectedProject}`);
      if (response.data?.success) {
        setCustomers(response.data.data.customers || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching customer-wise payments:', error);
      Alert.alert('Error', 'Failed to load customer payment details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomerWisePayments();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleViewCustomerDetails = (customerId) => {
    navigation.navigate('Customers', { 
      screen: 'CustomerDetails', 
      params: { customerId: customerId } 
    });
  };

  const handleViewPaymentDetails = (customerId) => {
    navigation.navigate('Payments', { 
      screen: 'CustomerPayments', 
      params: { customerId: customerId } 
    });
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    return customer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customer.phone_no?.includes(searchQuery) ||
           customer.unit_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedProjectData = projects.find(p => p.project_id.toString() === selectedProject);

  if (loading) {
    return <LoadingIndicator />;
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
          Customer-Wise Payment Details
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Payment details by customer
        </Text>
      </View>

      {/* Project Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Project
          </Text>
          <View style={styles.projectSelector}>
            {projects.map((project) => (
              <Chip
                key={project.project_id}
                selected={selectedProject === project.project_id.toString()}
                onPress={() => setSelectedProject(project.project_id.toString())}
                style={[
                  styles.projectChip,
                  selectedProject === project.project_id.toString() && styles.selectedChip
                ]}
                textStyle={styles.chipText}
              >
                {project.project_name}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Collection
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {formatCurrency(summary.totalAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              From {summary.totalCustomers} customers
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Transactions
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalTransactions}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Payment transactions
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Project Info */}
      {selectedProjectData && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Project Information
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.projectInfo}>
              <Text variant="bodyLarge" style={styles.projectName}>
                {selectedProjectData.project_name}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                {selectedProjectData.company_name}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                {selectedProjectData.address}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Search */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Search Customers
          </Text>
          <TextInput
            mode="outlined"
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            placeholder="Search by customer name, phone, or unit"
          />
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleExportReport}
          icon="download"
          style={styles.actionButton}
        >
          Export Report
        </Button>
      </View>

      {/* Customers Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Customers ({filteredCustomers.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredCustomers.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Customer</DataTable.Title>
                  <DataTable.Title>Unit</DataTable.Title>
                  <DataTable.Title>Phone</DataTable.Title>
                  <DataTable.Title>Total Paid</DataTable.Title>
                  <DataTable.Title>Transactions</DataTable.Title>
                  <DataTable.Title>Last Payment</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                
                {filteredCustomers.map((customer, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {customer.customer_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {customer.unit_name || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">
                        {customer.phone_no || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.amountText}>
                        {formatCurrency(customer.total_paid)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">
                        {customer.transaction_count}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {customer.last_payment_date ? formatDate(customer.last_payment_date) : 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <View style={styles.actionButtons}>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleViewCustomerDetails(customer.customer_id)}
                          style={styles.actionButton}
                        >
                          Customer
                        </Button>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleViewPaymentDetails(customer.customer_id)}
                          style={styles.actionButton}
                        >
                          Payments
                        </Button>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
          ) : (
            <EmptyState
              title="No Customers Found"
              description="No customers found for the selected project and search criteria"
            />
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
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
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  projectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  projectChip: {
    backgroundColor: '#F3F4F6',
  },
  selectedChip: {
    backgroundColor: '#EF4444',
  },
  chipText: {
    color: '#374151',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  summaryTitle: {
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summarySubtext: {
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  projectInfo: {
    gap: 4,
  },
  projectName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  projectDetails: {
    color: '#6B7280',
  },
  searchInput: {
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontWeight: 'bold',
    color: '#059669',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
});

export default CustomerWisePaymentDetailsScreen;
