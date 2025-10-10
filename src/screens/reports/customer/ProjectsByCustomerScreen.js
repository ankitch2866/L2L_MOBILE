import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ProjectsByCustomerScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({
    totalProjects: 0,
    totalInvestment: 0,
    activeProjects: 0,
    completedProjects: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchProjectsByCustomer();
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/master/customers');
      if (response.data?.success) {
        setCustomers(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedCustomer(response.data.data[0].customer_id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    }
  };

  const fetchProjectsByCustomer = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/api/transaction/bookings?customerId=${selectedCustomer}`);
      if (response.data?.success) {
        setProjects(response.data.data.projects || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching projects by customer:', error);
      Alert.alert('Error', 'Failed to load projects by customer');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjectsByCustomer();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleViewProject = (projectId) => {
    navigation.navigate('Projects', { 
      screen: 'ProjectDetails', 
      params: { projectId: projectId } 
    });
  };

  const handleViewCustomer = (customerId) => {
    navigation.navigate('Customers', { 
      screen: 'CustomerDetails', 
      params: { customerId: customerId } 
    });
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    return project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           project.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           project.status?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedCustomerData = customers.find(c => c.customer_id.toString() === selectedCustomer);

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
          Projects by Customer
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Customer project associations
        </Text>
      </View>

      {/* Customer Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Customer
          </Text>
          <View style={styles.customerSelector}>
            {customers.map((customer) => (
              <Chip
                key={customer.customer_id}
                selected={selectedCustomer === customer.customer_id.toString()}
                onPress={() => setSelectedCustomer(customer.customer_id.toString())}
                style={[
                  styles.customerChip,
                  selectedCustomer === customer.customer_id.toString() && styles.selectedChip
                ]}
                textStyle={styles.chipText}
              >
                {customer.name} ({customer.phone_no || 'No Phone'})
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Summary Cards - First Row */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Projects
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalProjects}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              All projects
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Investment
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {formatCurrency(summary.totalInvestment)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Total amount
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Summary Cards - Second Row */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Active
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.activeValue]}>
              {summary.activeProjects}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Active projects
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Completed
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.completedValue]}>
              {summary.completedProjects}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Completed projects
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Customer Info */}
      {selectedCustomerData && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Customer Information
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.customerInfo}>
              <Text variant="bodyLarge" style={styles.customerName}>
                {selectedCustomerData.name}
              </Text>
              <Text variant="bodyMedium" style={styles.customerDetails}>
                Phone: {selectedCustomerData.phone_no || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.customerDetails}>
                Email: {selectedCustomerData.email || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.customerDetails}>
                Address: {selectedCustomerData.address || 'N/A'}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Search */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Search Projects
          </Text>
          <TextInput
            mode="outlined"
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            placeholder="Search by project name, company, or status"
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

      {/* Projects Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Projects ({filteredProjects.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredProjects.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Company</DataTable.Title>
                  <DataTable.Title>Unit</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                
                {filteredProjects.map((project, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {project.project_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {project.company_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">
                        {project.unit_name || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.amountText}>
                        {formatCurrency(project.amount)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.statusChip,
                          project.status === 'active' && styles.activeChip,
                          project.status === 'completed' && styles.completedChip,
                          project.status === 'cancelled' && styles.cancelledChip
                        ]}
                      >
                        {project.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {formatDate(project.created_at)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <View style={styles.actionButtons}>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleViewProject(project.project_id)}
                          style={styles.actionButton}
                        >
                          Project
                        </Button>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleViewCustomer(project.customer_id)}
                          style={styles.actionButton}
                        >
                          Customer
                        </Button>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
          ) : (
            <EmptyState
              title="No Projects Found"
              description="No projects found for the selected customer"
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
  customerSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  customerChip: {
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
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
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
  activeValue: {
    color: '#059669',
  },
  completedValue: {
    color: '#3B82F6',
  },
  divider: {
    marginVertical: 12,
  },
  customerInfo: {
    gap: 4,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  customerDetails: {
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
  statusChip: {
    maxWidth: 80,
  },
  activeChip: {
    backgroundColor: '#D1FAE5',
  },
  completedChip: {
    backgroundColor: '#DBEAFE',
  },
  cancelledChip: {
    backgroundColor: '#FEE2E2',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
});

export default ProjectsByCustomerScreen;
