import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Share } from 'react-native';
import { Text, Card, Button, TextInput, IconButton, FAB, Chip, Menu, Divider } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerWiseCollectionScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Filter states
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  // UI states
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showCustomerMenu, setShowCustomerMenu] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchCustomers();
    } else {
      setCustomers([]);
      setSelectedCustomer('');
      setCustomerData(null);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedCustomer) {
      fetchCustomerPaymentDetails();
    } else {
      setCustomerData(null);
    }
  }, [selectedProject, selectedCustomer]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/master/projects');
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch projects');
      }
      
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/api/master/customers/project/${selectedProject}`);
      
      if (!response.data?.success) {
        setCustomers([]);
        return;
      }
      
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const fetchCustomerPaymentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!selectedCustomer) {
        setCustomerData(null);
        setLoading(false);
        return;
      }
      
      const response = await api.get(`/api/transaction/customer/payment-details/${selectedCustomer}`);
      
      if (!response.data?.success) {
        if (response.data?.message === 'No payment track found for this customer') {
          setCustomerData(null);
          setError('No payment records found for this customer.');
          return;
        }
        throw new Error(response.data?.message || 'Failed to fetch payment details');
      }
      
      // Handle the response data structure properly
      const data = response.data.data;
      console.log('Customer payment details response:', response.data);
      console.log('Customer payment data:', data);
      
      if (data && data.data) {
        // API returns { success: true, data: { data: actualData } }
        setCustomerData(data.data);
      } else if (data) {
        // API returns { success: true, data: actualData }
        setCustomerData(data);
      } else {
        setCustomerData(null);
        setError('No payment data available for this customer.');
      }
    } catch (error) {
      console.error('Error fetching customer payment details:', error);
      setError(error.message || 'Failed to load payment details');
      setCustomerData(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedProject && selectedCustomer) {
      await fetchCustomerPaymentDetails();
    }
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      if (!customerData) {
        Alert.alert('No Data', 'No payment data available to export');
        return;
      }

      // Create CSV content
      let csvContent = '';
      
      // Add header
      csvContent += `Customer Payment Details Report\n`;
      csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

      // Add customer info
      csvContent += `CUSTOMER INFORMATION\n`;
      csvContent += `Customer Name,${customerData.customer_name || 'N/A'}\n`;
      csvContent += `Application ID,${customerData.manual_application_id || 'N/A'}\n`;
      csvContent += `Phone,${customerData.phone_no || 'N/A'}\n`;
      csvContent += `Email,${customerData.email || 'N/A'}\n`;
      csvContent += `Address,${customerData.permanent_address || 'N/A'}\n\n`;

      // Add payment summary
      csvContent += `PAYMENT SUMMARY\n`;
      csvContent += `Total Amount,${formatCurrency(customerData.total_amount || 0).replace(/,/g, '')}\n`;
      csvContent += `Base Amount,${formatCurrency(customerData.base_amount || 0).replace(/,/g, '')}\n`;
      csvContent += `Total Charges,${formatCurrency(customerData.total_charges || 0).replace(/,/g, '')}\n`;
      csvContent += `Paid Amount,${formatCurrency(customerData.paid_amount || 0).replace(/,/g, '')}\n`;
      csvContent += `Outstanding Balance,${formatCurrency(customerData.outstanding_balance || 0).replace(/,/g, '')}\n\n`;

      // Add payment history
      if (customerData.payment_history && customerData.payment_history.length > 0) {
        csvContent += `PAYMENT HISTORY\n`;
        csvContent += `Date,Amount,Mode,Receipt No,Status\n`;
        
        customerData.payment_history.forEach((payment) => {
          const date = String(payment.payment_date || 'N/A').replace(/,/g, ';');
          const amount = formatCurrency(payment.amount || 0).replace(/,/g, '');
          const mode = String(payment.payment_mode || 'N/A').replace(/,/g, ';');
          const receiptNo = String(payment.receipt_no || 'N/A').replace(/,/g, ';');
          const status = String(payment.is_verified ? 'Verified' : 'Pending').replace(/,/g, ';');
          
          csvContent += `${date},${amount},${mode},${receiptNo},${status}\n`;
        });
      }

      // Share the CSV
      await Share.share({
        message: csvContent,
        title: `Customer Payment Details Report`,
      });

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    }
  };

  const clearFilters = () => {
    setSelectedProject('');
    setSelectedCustomer('');
    setCustomerData(null);
    setCustomers([]);
    setError('');
  };


  if (loading && projects.length === 0) {
    return <LoadingIndicator />;
  }

  // Show empty state if no project or customer selected
  if (!selectedProject || !selectedCustomer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor="#1F2937"
              style={styles.backButton}
            />
            <Text variant="headlineSmall" style={styles.title}>
              Customer Wise Collection
            </Text>
            <View style={styles.headerActions}>
              <IconButton
                icon="refresh"
                size={20}
                onPress={fetchCustomerPaymentDetails}
                iconColor={theme.colors.primary}
              />
              <Button
                mode="contained"
                onPress={handleExport}
                style={styles.exportButton}
                labelStyle={styles.exportButtonLabel}
              >
                Export
              </Button>
            </View>
          </View>
        </View>

        {/* Filters Section */}
        <View style={styles.filtersContainer}>
          <Card style={styles.filtersCard}>
          <Card.Content>
            <View style={styles.filtersHeader}>
              <Text variant="titleMedium" style={styles.filtersTitle}>
                Filters
              </Text>
              <Button
                mode="text"
                onPress={clearFilters}
                style={styles.clearButton}
                labelStyle={styles.clearButtonLabel}
              >
                Clear All
              </Button>
            </View>
            
            <View style={styles.filtersRow}>
              {/* Project Filter */}
              <View style={styles.filterItem}>
                <Text variant="bodySmall" style={styles.filterLabel}>Project *</Text>
                <Menu
                  visible={showProjectMenu}
                  onDismiss={() => setShowProjectMenu(false)}
                  anchor={
                    <TouchableOpacity
                      style={styles.filterButton}
                      onPress={() => setShowProjectMenu(true)}
                    >
                      <Text style={styles.filterButtonText}>
                        {selectedProject ? 
                         projects.find(p => p.project_id.toString() === selectedProject)?.project_name || 'Select Project' :
                         'Select Project'}
                      </Text>
                      <IconButton icon="chevron-down" size={16} />
                    </TouchableOpacity>
                  }
                >
                  {projects.map((project) => (
                    <Menu.Item
                      key={project.project_id}
                      title={project.project_name}
                      onPress={() => {
                        setSelectedProject(project.project_id.toString());
                        setSelectedCustomer('');
                        setShowProjectMenu(false);
                      }}
                    />
                  ))}
                </Menu>
              </View>

              {/* Customer Filter */}
              <View style={styles.filterItem}>
                <Text variant="bodySmall" style={styles.filterLabel}>Customer *</Text>
                <Menu
                  visible={showCustomerMenu}
                  onDismiss={() => setShowCustomerMenu(false)}
                  anchor={
                    <TouchableOpacity
                      style={[styles.filterButton, !selectedProject && styles.disabledButton]}
                      onPress={() => selectedProject && setShowCustomerMenu(true)}
                      disabled={!selectedProject}
                    >
                      <Text style={[styles.filterButtonText, !selectedProject && styles.disabledText]}>
                        {selectedCustomer ? 
                         customers.find(c => c.customer_id.toString() === selectedCustomer)?.name || 'Select Customer' :
                         'Select Customer'}
                      </Text>
                      <IconButton icon="chevron-down" size={16} />
                    </TouchableOpacity>
                  }
                >
                  {customers.map((customer) => (
                    <Menu.Item
                      key={customer.customer_id}
                      title={customer.name}
                      onPress={() => {
                        setSelectedCustomer(customer.customer_id.toString());
                        setShowCustomerMenu(false);
                      }}
                    />
                  ))}
                </Menu>
              </View>
            </View>
          </Card.Content>
          </Card>
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="account-search"
            title="Select project and customer to view data"
            subtitle="Please select a project and customer from the filters above to view payment details"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor="#1F2937"
            style={styles.backButton}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Customer Wise Collection
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              size={20}
              onPress={fetchCustomerPaymentDetails}
              iconColor={theme.colors.primary}
            />
            <Button
              mode="contained"
              onPress={handleExport}
              style={styles.exportButton}
              labelStyle={styles.exportButtonLabel}
            >
              Export
            </Button>
          </View>
        </View>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        <Card style={styles.filtersCard}>
        <Card.Content>
          <View style={styles.filtersHeader}>
            <Text variant="titleMedium" style={styles.filtersTitle}>
              Filters
            </Text>
            <Button
              mode="text"
              onPress={clearFilters}
              style={styles.clearButton}
              labelStyle={styles.clearButtonLabel}
            >
              Clear All
            </Button>
          </View>
          
          <View style={styles.filtersRow}>
            {/* Project Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>Project *</Text>
              <Menu
                visible={showProjectMenu}
                onDismiss={() => setShowProjectMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowProjectMenu(true)}
                  >
                    <Text style={styles.filterButtonText}>
                      {selectedProject ? 
                       projects.find(p => p.project_id.toString() === selectedProject)?.project_name || 'Select Project' :
                       'Select Project'}
                    </Text>
                    <IconButton icon="chevron-down" size={16} />
                  </TouchableOpacity>
                }
              >
                {projects.map((project) => (
                  <Menu.Item
                    key={project.project_id}
                    title={project.project_name}
                    onPress={() => {
                      setSelectedProject(project.project_id.toString());
                      setSelectedCustomer('');
                      setShowProjectMenu(false);
                    }}
                  />
                ))}
              </Menu>
            </View>

            {/* Customer Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>Customer *</Text>
              <Menu
                visible={showCustomerMenu}
                onDismiss={() => setShowCustomerMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={[styles.filterButton, !selectedProject && styles.disabledButton]}
                    onPress={() => selectedProject && setShowCustomerMenu(true)}
                    disabled={!selectedProject}
                  >
                    <Text style={[styles.filterButtonText, !selectedProject && styles.disabledText]}>
                      {selectedCustomer ? 
                       customers.find(c => c.customer_id.toString() === selectedCustomer)?.name || 'Select Customer' :
                       'Select Customer'}
                    </Text>
                    <IconButton icon="chevron-down" size={16} />
                  </TouchableOpacity>
                }
              >
                {customers.map((customer) => (
                  <Menu.Item
                    key={customer.customer_id}
                    title={customer.name}
                    onPress={() => {
                      setSelectedCustomer(customer.customer_id.toString());
                      setShowCustomerMenu(false);
                    }}
                  />
                ))}
              </Menu>
            </View>
          </View>
        </Card.Content>
        </Card>
      </View>

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
            </Card.Content>
          </Card>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading customer payment details...
          </Text>
        </View>
      ) : customerData ? (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Customer Information Card */}
          <View style={styles.customerInfoContainer}>
            <Card style={styles.customerInfoCard}>
              <Card.Content>
                <View style={styles.customerHeader}>
                  <View style={styles.customerIcon}>
                    <IconButton
                      icon="account"
                      size={32}
                      iconColor="#FFFFFF"
                    />
                  </View>
                  <View style={styles.customerDetails}>
                    <Text variant="titleLarge" style={styles.customerName}>
                      {customerData.customer_name || 'N/A'}
                    </Text>
                    <Text variant="bodyMedium" style={styles.customerId}>
                      Application ID: {customerData.manual_application_id || 'N/A'}
                    </Text>
                    {(customerData.phone_no || customerData.phone || customerData.email) && (
                      <Text variant="bodySmall" style={styles.customerContact}>
                        {customerData.phone_no || customerData.phone || ''} {customerData.phone_no || customerData.phone ? '•' : ''} {customerData.email || ''}
                      </Text>
                    )}
                    {(customerData.project_name || customerData.unit_name) && (
                      <Text variant="bodySmall" style={styles.projectInfo}>
                        Project: {customerData.project_name || 'N/A'} • Unit: {customerData.unit_name || 'N/A'}
                      </Text>
                    )}
                  </View>
                </View>
                
                {(customerData.permanent_address || customerData.address) && (
                  <View style={styles.customerAddress}>
                    <Text variant="bodySmall" style={styles.addressText}>
                      {customerData.permanent_address || customerData.address}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>

          {/* Payment Summary Cards */}
          <View style={styles.summaryContainer}>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Payment Summary
            </Text>
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="currency-inr"
                      size={24}
                      iconColor="#10B981"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Total Amount
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1}>
                      {formatCurrency(customerData.verified_amount || customerData.total_amount || 0)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="check-circle"
                      size={24}
                      iconColor="#3B82F6"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Paid Amount
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1}>
                      {formatCurrency(customerData.paid_amount || 0)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="alert-circle"
                      size={24}
                      iconColor="#F59E0B"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Outstanding
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1}>
                      {formatCurrency(customerData.pending_amount || customerData.outstanding_balance || 0)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="receipt"
                      size={24}
                      iconColor="#8B5CF6"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Total Charges
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1}>
                      {formatCurrency(customerData.total_charges || 0)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </View>

          {/* Payment History */}
          {customerData.transaction_details && (customerData.transaction_details.cash_payments?.length > 0 || customerData.transaction_details.cheque_payments?.length > 0) && (
            <View style={styles.paymentHistoryContainer}>
              <Text variant="titleMedium" style={styles.paymentHistoryTitle}>
                Payment History ({(customerData.transaction_details.cash_payments?.length || 0) + (customerData.transaction_details.cheque_payments?.length || 0)})
              </Text>
              
              <View style={styles.paymentHistoryList}>
                {/* Cash Payments */}
                {customerData.transaction_details.cash_payments?.map((payment, index) => (
                  <Card key={`cash-${payment.transaction_id || index}`} style={styles.paymentCard}>
                    <Card.Content style={styles.paymentContent}>
                      <View style={styles.paymentHeader}>
                        <View style={styles.paymentInfo}>
                          <Text variant="titleSmall" style={styles.paymentAmount}>
                            {formatCurrency(payment.amount || 0)}
                          </Text>
                          <Text variant="bodySmall" style={styles.paymentDate}>
                            {payment.payment_date ? formatDate(payment.payment_date) : 'Date: N/A'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.paymentDetails}>
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Mode:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            Cash
                          </Text>
                        </View>
                        
                        {payment.receipt_no && (
                          <View style={styles.detailRow}>
                            <Text variant="bodySmall" style={styles.detailLabel}>Receipt:</Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {payment.receipt_no}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Card.Content>
                  </Card>
                ))}

                {/* Cheque Payments */}
                {customerData.transaction_details.cheque_payments?.map((payment, index) => (
                  <Card key={`cheque-${payment.transaction_id || index}`} style={styles.paymentCard}>
                    <Card.Content style={styles.paymentContent}>
                      <View style={styles.paymentHeader}>
                        <View style={styles.paymentInfo}>
                          <Text variant="titleSmall" style={styles.paymentAmount}>
                            {formatCurrency(payment.amount || 0)}
                          </Text>
                          <Text variant="bodySmall" style={styles.paymentDate}>
                            {payment.payment_date ? formatDate(payment.payment_date) : 'Date: N/A'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.paymentDetails}>
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Mode:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            Cheque
                          </Text>
                        </View>
                        
                        {payment.receipt_no && (
                          <View style={styles.detailRow}>
                            <Text variant="bodySmall" style={styles.detailLabel}>Receipt:</Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {payment.receipt_no}
                            </Text>
                          </View>
                        )}
                        
                        {payment.cheque_no && (
                          <View style={styles.detailRow}>
                            <Text variant="bodySmall" style={styles.detailLabel}>Cheque No:</Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {payment.cheque_no}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="account-search"
            title={selectedProject && selectedCustomer ? "No payment data available" : "Select project and customer to view data"}
            subtitle={selectedProject && selectedCustomer ? "No payment records found for this customer" : "Please select a project and customer from the filters above to view payment details"}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backButton: {
    marginLeft: -8,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    fontSize: 18,
    lineHeight: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exportButton: {
    borderRadius: 8,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  exportButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  clearButton: {
    minWidth: 0,
  },
  clearButtonLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    color: '#374151',
    fontSize: 14,
    flex: 1,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  errorContainer: {
    padding: 16,
    marginTop: 200,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 200,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 200,
  },
  scrollView: {
    flex: 1,
  },
  customerInfoContainer: {
    padding: 16,
    paddingTop: 8,
  },
  customerInfoCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerId: {
    color: '#6B7280',
    marginBottom: 2,
  },
  customerContact: {
    color: '#9CA3AF',
  },
  projectInfo: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  customerAddress: {
    marginTop: 8,
  },
  addressText: {
    color: '#6B7280',
    lineHeight: 20,
  },
  summaryContainer: {
    padding: 16,
    paddingTop: 4,
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 100,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    height: 100,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryText: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryLabel: {
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 12,
  },
  summaryValue: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 14,
    numberOfLines: 1,
  },
  paymentHistoryContainer: {
    padding: 16,
    paddingTop: 4,
  },
  paymentHistoryTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentHistoryList: {
    gap: 12,
  },
  paymentCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentContent: {
    padding: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
    fontSize: 16,
  },
  paymentDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  paymentDetails: {
    gap: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailLabel: {
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
    fontSize: 11,
  },
  detailValue: {
    color: '#1F2937',
    flex: 2,
    textAlign: 'right',
    fontSize: 11,
  },
});

export default CustomerWiseCollectionScreen;
