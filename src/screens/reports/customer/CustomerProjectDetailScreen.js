import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, TouchableOpacity, Alert, Share, ScrollView } from 'react-native';
import { Text, Card, Button, Searchbar, IconButton, FAB, Chip, Menu, Divider } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerProjectDetailScreen = ({ navigation, route }) => {
  const { projectId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState({
    project: true,
    customers: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
    fetchCustomers();
  }, [projectId]);

  useEffect(() => {
    if (customers.length > 0) {
      const filtered = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.manual_application_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setCurrentPage(1);
    }
  }, [searchQuery, customers]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(prev => ({ ...prev, project: true }));
      setError('');
      
      const response = await api.get(`/api/master/projects/${projectId}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch project details');
      }
      
      setProject(response.data.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError(error.message || 'Failed to load project details');
    } finally {
      setLoading(prev => ({ ...prev, project: false }));
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(prev => ({ ...prev, customers: true }));
      setError('');
      
      const response = await api.get(`/api/master/customers/production/${projectId}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch customers');
      }
      
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'Failed to load customers');
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProjectDetails(), fetchCustomers()]);
    setRefreshing(false);
  };

  const handleCustomerClick = (customer) => {
    Alert.alert(
      'Customer Details',
      `Name: ${customer.name}\n` +
      `Application ID: ${customer.manual_application_id}\n` +
      `Phone: ${customer.phone_no}\n` +
      `Email: ${customer.email}\n` +
      `Address: ${customer.permanent_address}\n` +
      `Booking Date: ${customer.booking_date_formatted}\n` +
      `Total Paid: ${formatCurrency(customer.total_paid_amount || 0)}`,
      [{ text: 'OK' }]
    );
  };

  const exportToExcel = async () => {
    if (customers.length === 0) return;

    const headers = [
      'Sr. No.',
      'Customer ID',
      'Form No.',
      'Name',
      'W/O/S/O/D/O',
      'Address',
      'Rate',
      'No. of days from booking',
      'Plan',
      'Booking Date',
      'Property ID',
      'PLC',
      'Property Size',
      'PAN No.',
      'Phone No.',
      'Email ID',
      'Mobile no.',
      'Booking Amount (Paid)',
      'Broker'
    ];

    const excelData = customers.map((customer, index) => [
      index + 1,
      customer.manual_application_id || '',
      customer.booking_receipt || '',
      customer.name || '',
      customer.father_name || '',
      `${customer.permanent_address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
      customer.rate || '',
      customer.days_from_booking || 0,
      customer.plan || '',
      customer.booking_date_formatted || '',
      customer.property_id || '',
      customer.plc_amount || '',
      customer.property_size || '',
      customer.pan_no || '',
      customer.phone_no || '',
      customer.email || '',
      customer.phone_no || '',
      customer.total_paid_amount || 0,
      customer.broker_name || ''
    ]);

    const toCsv = (arr) => arr.map(row => row.map(val => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',')).join('\n');

    const csv = [headers, ...excelData];
    const csvContent = toCsv(csv);
    try {
      const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
      await Share.share({
        title: `Project_${projectId}_Customers.csv`,
        message: csvContent, // fallback for apps that ignore url
        url: dataUri,
        subject: `Project ${projectId} Customers`
      });
    } catch (e) {
      Alert.alert('Export Failed', 'Unable to share CSV.');
    }
  };

  const shareProject = async () => {
    try {
      const message = `Project: ${project?.project_name}\n` +
        `Company: ${project?.company_name}\n` +
        `Location: ${project?.address}\n` +
        `Total Customers: ${customers.length}`;
      
      await Share.share({
        message: message,
        title: 'Project Details'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Calculate pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading.project || loading.customers) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Text variant="headlineSmall" style={styles.title} numberOfLines={1}>
              {project?.project_name || 'Project Details'}
            </Text>
            <Text variant="bodySmall" style={styles.subtitle} numberOfLines={1}>
              {project?.company_name || 'Loading...'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <IconButton
            icon="refresh"
            size={24}
            iconColor={theme.colors.primary}
            onPress={onRefresh}
            style={styles.refreshButton}
          />
          <IconButton
            icon="share"
            size={24}
            iconColor={theme.colors.primary}
            onPress={shareProject}
            style={styles.shareButton}
          />
          <IconButton
            icon="file-export"
            size={24}
            iconColor={theme.colors.primary}
            onPress={exportToExcel}
            style={styles.exportButton}
          />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>        
        <Searchbar
          placeholder="Search customers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Error Message */}
      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Content */}
      {filteredCustomers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="account-search"
            title={searchQuery ? "No customers found" : "No customers available"}
            subtitle={searchQuery ? "Try adjusting your search criteria" : "No customers found for this project"}
          />
        </View>
      ) : (
        <>
        <ScrollView
          style={styles.scrollView}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            const layoutH = e.nativeEvent.layoutMeasurement.height;
            const contentH = e.nativeEvent.contentSize.height;
            // footer visible only near end
            setShowFooter(y + layoutH >= contentH - 24);
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Project Info Card - First item in the list */}
          {project && (
            <Card style={styles.projectInfoCard}>
              <Card.Content style={styles.projectInfoContent}>
                <View style={styles.projectInfoHeader}>
                  <Text variant="titleMedium" style={styles.projectInfoTitle}>
                    Project Information
                  </Text>
                  <Chip mode="outlined" style={styles.customerCountChip}>
                    {customers.length} Customers
                  </Chip>
                </View>
                
                <View style={styles.projectInfoDetails}>
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Company:</Text>
                    <Text variant="bodySmall" style={styles.infoValue} numberOfLines={2}>
                      {project.company_name || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Location:</Text>
                    <Text variant="bodySmall" style={styles.infoValue} numberOfLines={3}>
                      {project.address || 'N/A'}
                    </Text>
                  </View>
                  
                  {project.created_at && (
                    <View style={styles.infoRow}>
                      <Text variant="bodySmall" style={styles.infoLabel}>Created:</Text>
                      <Text variant="bodySmall" style={styles.infoValue}>
                        {formatDate(project.created_at)}
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Customers List */}
          <View style={styles.customersContainer}>
            {currentCustomers.map((customer, index) => (
              <Card key={customer.customer_id || index} style={styles.customerCard}>
                <TouchableOpacity onPress={() => navigation.navigate('CustomerDetailFromProject', { 
                  customerId: customer.customer_id,
                  projectId: projectId
                })}>
                  <Card.Content style={styles.customerContent}>
                    <View style={styles.customerHeader}>
                      <View style={styles.customerNameContainer}>
                        <Text variant="titleMedium" style={styles.customerName} numberOfLines={1}>
                          {customer.name || 'N/A'}
                        </Text>
                        <Text variant="bodySmall" style={styles.customerId}>
                          ID: {customer.manual_application_id || 'N/A'}
                        </Text>
                      </View>
                      <IconButton
                        icon="chevron-right"
                        size={20}
                        iconColor={theme.colors.primary}
                        style={styles.arrowIcon}
                      />
                    </View>
                    
                    <View style={styles.customerDetails}>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.detailLabel}>Phone:</Text>
                        <Text variant="bodySmall" style={styles.detailValue} numberOfLines={1}>
                          {customer.phone_no || 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.detailLabel}>Email:</Text>
                        <Text variant="bodySmall" style={styles.detailValue} numberOfLines={1}>
                          {customer.email || 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.detailLabel}>Booking Date:</Text>
                        <Text variant="bodySmall" style={styles.detailValue}>
                          {customer.booking_date_formatted || 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.detailLabel}>Total Paid:</Text>
                        <Text variant="bodySmall" style={[styles.detailValue, styles.amountText]}>
                          {formatCurrency(customer.total_paid_amount || 0)}
                        </Text>
                      </View>
                      
                      {customer.broker_name && (
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Broker:</Text>
                          <Text variant="bodySmall" style={styles.detailValue} numberOfLines={1}>
                            {customer.broker_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card.Content>
                </TouchableOpacity>
              </Card>
            ))}
          </View>

        </ScrollView>
        {totalPages > 1 && showFooter && (
          <View style={styles.paginationContainer}>
            <Button
              mode="outlined"
              onPress={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || totalPages === 1}
              style={styles.paginationButton}
              labelStyle={styles.paginationButtonLabel}
            >
              Previous
            </Button>
            <View style={styles.paginationCenter}>
              <Text variant="bodyMedium" style={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 1}
              style={styles.paginationButton}
              labelStyle={styles.paginationButtonLabel}
            >
              Next
            </Button>
          </View>
        )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    margin: 0,
    marginRight: 4,
  },
  shareButton: {
    margin: 0,
    marginRight: 4,
  },
  exportButton: {
    margin: 0,
  },
  projectInfoCard: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#EFF6FF', // Light blue background to distinguish from customer cards
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6', // Blue accent border
  },
  projectInfoContent: {
    padding: 16,
  },
  projectInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  projectInfoTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  customerCountChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  projectInfoDetails: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    color: '#6B7280',
    fontWeight: '500',
    width: 80,
    marginRight: 8,
  },
  infoValue: {
    color: '#1F2937',
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    fontSize: 14,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollView: { flex: 1, marginTop: 120 },
  customersContainer: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16, gap: 8 },
  customerCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  customerContent: {
    padding: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  customerId: {
    color: '#6B7280',
    marginTop: 2,
  },
  arrowIcon: {
    margin: 0,
  },
  customerDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#6B7280',
    fontWeight: '500',
    width: 90,
    marginRight: 8,
  },
  detailValue: {
    color: '#1F2937',
    flex: 1,
  },
  amountText: {
    fontWeight: 'bold',
    color: '#059669',
  },
  paginationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationCenter: { flex: 1, alignItems: 'center' },
  paginationText: {
    color: '#6B7280',
    fontSize: 12,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationButton: {
    borderRadius: 8,
    minWidth: 100,
  },
  paginationButtonLabel: {
    fontSize: 12,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    borderRadius: 6,
  },
  activePageButton: {
    backgroundColor: '#3B82F6',
  },
  pageButtonLabel: {
    fontSize: 12,
  },
  activePageButtonLabel: {
    color: '#FFFFFF',
  },
});

export default CustomerProjectDetailScreen;
