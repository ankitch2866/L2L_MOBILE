import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerByProjectYearScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    totalCollection: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject && selectedYear) {
      fetchCustomersByProjectYear();
    }
  }, [selectedProject, selectedYear]);

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

  const fetchCustomersByProjectYear = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        projectId: selectedProject,
        year: selectedYear
      });

      const response = await api.get(`/api/master/customers/project/${selectedProject}`);
      if (response.data?.success) {
        setCustomers(response.data.data.customers || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching customers by project year:', error);
      Alert.alert('Error', 'Failed to load customers by project year');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomersByProjectYear();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleViewCustomer = (customerId) => {
    navigation.navigate('Customers', { 
      screen: 'CustomerDetails', 
      params: { customerId: customerId } 
    });
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    return customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customer.phone_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
          Customers by Project Year
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Customer analysis by project and year
        </Text>
      </View>

      {/* Project and Year Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Project & Year
          </Text>
          <TextInput
            mode="outlined"
            label="Year"
            value={selectedYear}
            onChangeText={setSelectedYear}
            style={styles.yearInput}
            keyboardType="numeric"
            placeholder="YYYY"
          />
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
              Total Customers
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalCustomers}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              All customers
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              New Customers
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.newValue]}>
              {summary.newCustomers}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              New in {selectedYear}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Returning
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.returningValue]}>
              {summary.returningCustomers}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Returning customers
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Collection
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {formatCurrency(summary.totalCollection)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              In {selectedYear}
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
            placeholder="Search by name, phone, or email"
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
                  <DataTable.Title>Name</DataTable.Title>
                  <DataTable.Title>Phone</DataTable.Title>
                  <DataTable.Title>Email</DataTable.Title>
                  <DataTable.Title>Unit</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Join Date</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                
                {filteredCustomers.map((customer, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {customer.name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">
                        {customer.phone_no || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {customer.email || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">
                        {customer.unit_name || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.amountText}>
                        {formatCurrency(customer.total_amount || 0)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {formatDate(customer.join_date)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleViewCustomer(customer.customer_id)}
                      >
                        View
                      </Button>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
          ) : (
            <EmptyState
              title="No Customers Found"
              description="No customers found for the selected project and year"
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
  yearInput: {
    marginTop: 8,
    marginBottom: 16,
  },
  projectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  newValue: {
    color: '#059669',
  },
  returningValue: {
    color: '#3B82F6',
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
});

export default CustomerByProjectYearScreen;
