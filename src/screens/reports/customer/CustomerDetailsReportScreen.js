import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable, HelperText, TouchableRipple } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState, Dropdown } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerDetailsReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Booked', value: 'booked' },
    { label: 'Allotted', value: 'allotted' }
  ];

  useEffect(() => {
    fetchProjects();
    fetchCustomerDetails(); // Fetch all customers on mount
  }, []);

  useEffect(() => {
    fetchCustomerDetails(); // Refetch when project changes
  }, [selectedProject]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery, statusFilter]);

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
      setError(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all customers with detailed information
      const response = await api.get('/api/master/customers');
      if (response.data?.success) {
        let customers = response.data.data || [];
        
        // If a project is selected, filter by project
        if (selectedProject) {
          customers = customers.filter(customer => 
            customer.project_id?.toString() === selectedProject
          );
        }
        
        // Enhance customer data with additional information
        const enhancedCustomers = await Promise.all(
          customers.map(async (customer) => {
            try {
              // Try to get additional customer details
              const detailResponse = await api.get(`/api/master/customers/${customer.id || customer.customer_id}`);
              if (detailResponse.data?.success) {
                return {
                  ...customer,
                  ...detailResponse.data.data,
                  // Ensure we have the original ID
                  id: customer.id || customer.customer_id,
                  customer_id: customer.customer_id || customer.id
                };
              }
            } catch (error) {
              console.log(`Could not fetch details for customer ${customer.id || customer.customer_id}`);
            }
            return customer;
          })
        );
        
        setCustomers(enhancedCustomers);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch customer details');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setError(error.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.manual_application_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.unit_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => {
        switch (statusFilter) {
          case 'active':
            return customer.is_active === 1 || customer.is_active === true || customer.status === 'active';
          case 'inactive':
            return customer.is_active === 0 || customer.is_active === false || customer.status === 'inactive';
          case 'booked':
            return customer.booking_status === 'booked' || customer.has_booking;
          case 'allotted':
            return customer.allotment_status === 'allotted' || customer.has_allotment;
          default:
            return true;
        }
      });
    }

    setFilteredCustomers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProjects(),
      fetchCustomerDetails()
    ]);
    setRefreshing(false);
  };

  const handleExportReport = async () => {
    try {
      if (filteredCustomers.length === 0) {
        Alert.alert('No Data', 'No customer data available to export');
        return;
      }

      // Create CSV content
      const headers = ['Customer ID', 'Name', 'Project', 'Unit', 'Phone', 'Email', 'Address', 'Status', 'Booking Status', 'Allotment Status'];
      const csvContent = [
        headers.join(','),
        ...filteredCustomers.map(customer => [
          `"${customer.manual_application_id || ''}"`,
          `"${customer.name || ''}"`,
          `"${customer.project_name || ''}"`,
          `"${customer.unit_name || ''}"`,
          `"${customer.phone || ''}"`,
          `"${customer.email || ''}"`,
          `"${customer.address || ''}"`,
          `"${customer.status || 'N/A'}"`,
          `"${customer.booking_status || 'N/A'}"`,
          `"${customer.allotment_status || 'N/A'}"`
        ].join(','))
      ].join('\n');

      // Share the CSV file
      await Share.share({
        message: csvContent,
        title: 'Customer Details Report',
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        filename: `customer-details-${new Date().toISOString().split('T')[0]}.csv`
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Export Error', 'Failed to export report');
    }
  };

  const handleViewCustomer = (customerId) => {
    if (!customerId) {
      Alert.alert('Error', 'Customer ID is missing');
      return;
    }
    navigation.navigate('CustomerReports', {
      screen: 'CustomerDetailFromProject',
      params: { customerId: customerId.toString() }
    });
  };

  const calculateSummary = () => {
    const total = filteredCustomers.length;
    const active = filteredCustomers.filter(c => 
      c.is_active === 1 || c.is_active === true || c.status === 'active'
    ).length;
    const booked = filteredCustomers.filter(c => c.booking_status === 'booked' || c.has_booking).length;
    const allotted = filteredCustomers.filter(c => c.allotment_status === 'allotted' || c.has_allotment).length;
    
    return { total, active, booked, allotted };
  };

  const summary = calculateSummary();

  if (loading && !refreshing) {
    return <LoadingIndicator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Customer Details Report
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Complete customer information and transaction history
          </Text>
        </View>

        {/* Search */}
        <Card style={styles.searchCard}>
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
              placeholder="Search by name, ID, project or unit..."
            />
          </Card.Content>
        </Card>

        {/* Filters */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Filters
            </Text>
            
            {/* Project Filter */}
            <View style={styles.filterGroup}>
              <Text variant="bodyMedium" style={styles.filterLabel}>Project</Text>
              <Dropdown
                items={[
                  { label: 'Select Project', value: '' },
                  ...projects.map(p => ({ label: p.project_name, value: p.project_id.toString() }))
                ]}
                value={selectedProject}
                onValueChange={setSelectedProject}
                placeholder="Select Project"
                style={styles.dropdown}
              />
            </View>

            {/* Status Filter */}
            <View style={styles.filterGroup}>
              <Text variant="bodyMedium" style={styles.filterLabel}>Status</Text>
              <Dropdown
                items={statusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="Select Status"
                style={styles.dropdown}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Error Message */}
        {error && (
          <Card style={[styles.card, styles.errorCard]}>
            <Card.Content>
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Summary Cards */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Summary
            </Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={styles.summaryValue}>
                  {summary.total}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Total Customers
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#10B981' }]}>
                  {summary.active}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Active
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#3B82F6' }]}>
                  {summary.booked}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Booked
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#8B5CF6' }]}>
                  {summary.allotted}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Allotted
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleExportReport}
            icon="download"
            style={styles.actionButton}
            labelStyle={{ color: '#FFFFFF' }}
          >
            Export Report
          </Button>
        </View>

        {/* Customer Cards */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tableHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Customer Details ({filteredCustomers.length})
              </Text>
            </View>
            <Divider style={styles.divider} />
            
            {filteredCustomers.length > 0 ? (
              <View style={styles.cardsContainer}>
                {filteredCustomers.map((customer, index) => (
                  <TouchableRipple
                    key={customer.id || customer.customer_id || index}
                    onPress={() => handleViewCustomer(customer.id || customer.customer_id)}
                    rippleColor="rgba(59, 130, 246, 0.1)"
                  >
                    <Card style={styles.customerCard}>
                      <Card.Content style={styles.customerCardContent}>
                        {/* Customer Header */}
                        <View style={styles.customerHeader}>
                          <View style={styles.customerInfo}>
                            <Text variant="titleMedium" style={styles.customerName}>
                              {customer.name || 'N/A'}
                            </Text>
                            <Text variant="bodySmall" style={styles.customerId}>
                              ID: {customer.manual_application_id || 'N/A'}
                            </Text>
                          </View>
                        <View style={styles.statusBadge}>
                          <Ionicons 
                            name={customer.is_active === 1 || customer.is_active === true || customer.status === 'active' ? 'checkmark-circle' : 'close-circle'} 
                            size={16} 
                            color={customer.is_active === 1 || customer.is_active === true || customer.status === 'active' ? '#10B981' : '#EF4444'} 
                          />
                          <Text 
                            variant="bodySmall" 
                            style={[
                              styles.statusText, 
                              { color: customer.is_active === 1 || customer.is_active === true || customer.status === 'active' ? '#10B981' : '#EF4444' }
                            ]}
                          >
                            {customer.is_active === 1 || customer.is_active === true || customer.status === 'active' ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                        </View>

                        {/* Customer Details */}
                        <View style={styles.customerDetails}>
                          <View style={styles.detailRow}>
                            <Ionicons name="business" size={16} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailText}>
                              {customer.project_name || customer.project_id || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Ionicons name="home" size={16} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailText}>
                              {customer.unit_name || customer.unit_id || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Ionicons name="call" size={16} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailText}>
                              {customer.phone || customer.mobile || customer.contact_number || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Ionicons name="mail" size={16} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailText}>
                              {customer.email || customer.email_id || 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  </TouchableRipple>
                ))}
              </View>
            ) : (
              <EmptyState
                title="No Customers Found"
                description={selectedProject ? 'No customers found for the selected project and filters' : 'Please select a project to view customer details'}
              />
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchCard: {
    margin: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  errorCard: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  summaryItem: {
    minWidth: '22%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  summaryValue: {
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 24,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tableHeader: {
    paddingBottom: 16,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E2E8F0',
    height: 1,
  },
  cardsContainer: {
    gap: 16,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  customerCardContent: {
    padding: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 16,
    marginBottom: 4,
  },
  customerId: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 11,
  },
  customerDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#64748B',
    fontSize: 13,
    flex: 1,
  },
});

export default CustomerDetailsReportScreen;