import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text, Card, Searchbar, IconButton, Chip, Divider } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerProjectYearDetailScreen = ({ navigation, route }) => {
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
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);

  // Generate years from 2020 to current year + 2
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 3 }, (_, i) => 2020 + i);
  
  const months = [
    { value: "01", name: "January" },
    { value: "02", name: "February" },
    { value: "03", name: "March" },
    { value: "04", name: "April" },
    { value: "05", name: "May" },
    { value: "06", name: "June" },
    { value: "07", name: "July" },
    { value: "08", name: "August" },
    { value: "09", name: "September" },
    { value: "10", name: "October" },
    { value: "11", name: "November" },
    { value: "12", name: "December" },
  ];

  // Financial years - generate from 2012 to current year
  const startYear = 2012;
  const financialYears = [];
  for (let year = startYear; year <= currentYear; year++) {
    const nextYear = year + 1;
    financialYears.push(`${year}-${nextYear.toString().slice(-2)}`);
  }

  useEffect(() => {
    fetchProjectDetails();
    fetchCustomers();
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [customers, yearFilter, monthFilter, searchQuery]);

  const applyFilters = () => {
    let result = [...customers];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.manual_application_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply year and month filters
    if (yearFilter || monthFilter) {
      result = result.filter(customer => {
        if (!customer.created_at) return false;
        
        const createdDate = new Date(customer.created_at);
        const createdYear = createdDate.getFullYear();
        const createdMonth = String(createdDate.getMonth() + 1).padStart(2, '0');
        
        const yearMatch = !yearFilter || createdYear === parseInt(yearFilter);
        const monthMatch = !monthFilter || createdMonth === monthFilter;
        
        return yearMatch && monthMatch;
      });
    }

    setFilteredCustomers(result);
  };

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
      
      const response = await api.get(`/api/master/customers/project/${projectId}`);
      
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

  const clearFilters = () => {
    setYearFilter('');
    setMonthFilter('');
    setSearchQuery('');
  };

  const exportToCSV = async () => {
    if (filteredCustomers.length === 0) {
      Alert.alert('No Data', 'No customers available to export');
      return;
    }

    try {
      const headers = [
        'Sr. No.',
        'Name',
        'App ID',
        'Property ID',
        'PAN',
        'Phone',
        'Email',
        'Mobile',
        'Created Date',
        'Code',
        'Amount',
        ...financialYears.map(year => `FY ${year}`)
      ];

      const csvData = filteredCustomers.map((customer, index) => {
        const createdDate = customer.created_at ? formatDate(customer.created_at) : 'N/A';
        
        // Mock financial year data - replace with actual API data when available
        const fyData = financialYears.map(year => {
          const currentYearStr = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
          const prevYearStr = `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
          
          if (year === prevYearStr) {
            return Math.floor(Math.random() * 500000) + 25000;
          } else if (year === currentYearStr) {
            return Math.floor(Math.random() * 500000) + 50000;
          }
          return 0;
        });

        return [
          index + 1,
          customer.name || 'N/A',
          customer.manual_application_id || 'N/A',
          customer.property_id || 'N/A',
          customer.pan_no || 'N/A',
          customer.phone_no || 'N/A',
          customer.email || 'N/A',
          customer.mobile_no || customer.phone_no || 'N/A',
          createdDate,
          customer.code || 'N/A',
          customer.total_amount || '250000',
          ...fyData
        ];
      });

      const csvContent = [headers, ...csvData]
        .map(row =>
          row.map(val => {
            const s = String(val ?? '');
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
              return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
          }).join(',')
        )
        .join('\n');

      await Share.share({
        title: `Project_${projectId}_Financial_Year.csv`,
        message: csvContent,
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Export Failed', 'Unable to export data');
    }
  };

  const shareProject = async () => {
    if (!project) return;
    
    try {
      await Share.share({
        message: `Project: ${project.project_name}\nCompany: ${project.company_name}\nCustomers: ${customers.length}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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
              Financial Year Report
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
            onPress={exportToCSV}
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading.project || loading.customers ? (
          <View style={styles.loadingContainer}>
            <LoadingIndicator message="Fetching data..." />
          </View>
        ) : filteredCustomers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="account-search"
              title="No customers found"
              subtitle={searchQuery || yearFilter || monthFilter ? "Try adjusting your filters" : "No customers available"}
            />
          </View>
        ) : (
          <>
          {/* Project Info Card */}
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
                  
                  {project.landmark && (
                    <View style={styles.infoRow}>
                      <Text variant="bodySmall" style={styles.infoLabel}>Landmark:</Text>
                      <Text variant="bodySmall" style={styles.infoValue} numberOfLines={2}>
                        {project.landmark}
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Filters */}
          <Card style={styles.filtersCard}>
            <Card.Content style={styles.filtersContent}>
              <View style={styles.filtersHeader}>
                <Text variant="titleSmall" style={styles.filtersTitle}>Filters</Text>
                {(yearFilter || monthFilter) && (
                  <Text variant="bodySmall" style={styles.clearFilters} onPress={clearFilters}>
                    Clear All
                  </Text>
                )}
              </View>
              
              <View style={styles.filtersRow}>
                <View style={styles.filterItem}>
                  <Text variant="bodySmall" style={styles.filterLabel}>Year</Text>
                  <Pressable onPress={() => setShowYearModal(true)}>
                    <View style={styles.filterButton}>
                      <IconButton icon="calendar" size={16} style={styles.filterButtonIcon} />
                      <Text variant="bodyMedium" style={styles.filterButtonText}>
                        {yearFilter || 'All Years'}
                      </Text>
                      <IconButton icon="chevron-down" size={16} style={styles.filterButtonIcon} />
                    </View>
                  </Pressable>
                </View>

                <View style={styles.filterItem}>
                  <Text variant="bodySmall" style={styles.filterLabel}>Month</Text>
                  <Pressable onPress={() => setShowMonthModal(true)}>
                    <View style={styles.filterButton}>
                      <IconButton icon="calendar-month" size={16} style={styles.filterButtonIcon} />
                      <Text variant="bodyMedium" style={styles.filterButtonText}>
                        {monthFilter ? months.find(m => m.value === monthFilter)?.name : 'All Months'}
                      </Text>
                      <IconButton icon="chevron-down" size={16} style={styles.filterButtonIcon} />
                    </View>
                  </Pressable>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Customers List with Financial Data */}
          <View style={styles.customersContainer}>
            <Text variant="titleMedium" style={styles.customersHeader}>
              Customer List ({filteredCustomers.length})
            </Text>
            
            {filteredCustomers.map((customer, index) => {
              const createdDate = customer.created_at ? formatDate(customer.created_at) : 'N/A';
              
              // Mock financial year data - replace with actual API data
              const currentYearStr = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
              const prevYearStr = `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
              
              return (
                <Card key={customer.customer_id || index} style={styles.customerCard}>
                  <TouchableOpacity onPress={() => navigation.navigate('CustomerDetailFromYear', { 
                    customerId: customer.customer_id,
                    projectId: projectId
                  })}>
                  <Card.Content style={styles.customerContent}>
                    {/* Customer Header */}
                    <View style={styles.customerHeader}>
                      <View style={styles.customerNameContainer}>
                        <Text variant="titleMedium" style={styles.customerName} numberOfLines={1}>
                          {customer.name || 'N/A'}
                        </Text>
                        <Text variant="bodySmall" style={styles.customerId}>
                          ID: {customer.manual_application_id || 'N/A'}
                        </Text>
                      </View>
                      <Chip mode="outlined" style={styles.serialChip}>
                        #{index + 1}
                      </Chip>
                    </View>
                    
                    {/* Customer Details */}
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
                        <Text variant="bodySmall" style={styles.detailLabel}>Property:</Text>
                        <Text variant="bodySmall" style={styles.detailValue}>
                          {customer.property_id || 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.detailLabel}>Created:</Text>
                        <Text variant="bodySmall" style={styles.detailValue}>
                          {createdDate}
                        </Text>
                      </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Financial Year Summary */}
                    <Text variant="titleSmall" style={styles.financialTitle}>
                      Financial Year Summary
                    </Text>
                    
                    <View style={styles.financialYearGrid}>
                      <View style={styles.fyCard}>
                        <Text variant="bodySmall" style={styles.fyLabel}>{prevYearStr}</Text>
                        <Text variant="titleMedium" style={styles.fyAmount}>
                          {formatCurrency(Math.floor(Math.random() * 500000) + 25000)}
                        </Text>
                      </View>
                      
                      <View style={styles.fyCard}>
                        <Text variant="bodySmall" style={styles.fyLabel}>{currentYearStr}</Text>
                        <Text variant="titleMedium" style={styles.fyAmount}>
                          {formatCurrency(Math.floor(Math.random() * 500000) + 50000)}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
          </>
        )}
      </ScrollView>

      {/* Year Filter Modal */}
      <Modal
        visible={showYearModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowYearModal(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowYearModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium" style={styles.modalTitle}>Select Year</Text>
              <Pressable onPress={() => setShowYearModal(false)} style={styles.modalCloseButton}>
                <IconButton icon="close" size={20} />
              </Pressable>
            </View>
            <Divider />
            <ScrollView style={styles.modalScrollView}>
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  setYearFilter('');
                  setShowYearModal(false);
                }}
              >
                <Text variant="bodyLarge" style={[styles.modalItemText, !yearFilter && styles.modalItemSelected]}>
                  All Years
                </Text>
              </Pressable>
              {years.map(year => (
                <Pressable
                  key={year}
                  style={styles.modalItem}
                  onPress={() => {
                    setYearFilter(year.toString());
                    setShowYearModal(false);
                  }}
                >
                  <Text variant="bodyLarge" style={[styles.modalItemText, yearFilter === year.toString() && styles.modalItemSelected]}>
                    {year}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Month Filter Modal */}
      <Modal
        visible={showMonthModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowMonthModal(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMonthModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium" style={styles.modalTitle}>Select Month</Text>
              <Pressable onPress={() => setShowMonthModal(false)} style={styles.modalCloseButton}>
                <IconButton icon="close" size={20} />
              </Pressable>
            </View>
            <Divider />
            <ScrollView style={styles.modalScrollView}>
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  setMonthFilter('');
                  setShowMonthModal(false);
                }}
              >
                <Text variant="bodyLarge" style={[styles.modalItemText, !monthFilter && styles.modalItemSelected]}>
                  All Months
                </Text>
              </Pressable>
              {months.map(month => (
                <Pressable
                  key={month.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setMonthFilter(month.value);
                    setShowMonthModal(false);
                  }}
                >
                  <Text variant="bodyLarge" style={[styles.modalItemText, monthFilter === month.value && styles.modalItemSelected]}>
                    {month.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    flex: 1,
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
  searchContainer: {
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  scrollView: {
    flex: 1,
  },
  projectInfoCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
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
    backgroundColor: '#DBEAFE',
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
  filtersCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    elevation: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  filtersContent: {
    padding: 16,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  clearFilters: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  filterButtonIcon: {
    margin: 0,
  },
  filterButtonText: {
    flex: 1,
    color: '#1F2937',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    margin: 0,
  },
  modalScrollView: {
    maxHeight: 320,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    color: '#1F2937',
  },
  modalItemSelected: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  customersContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 12,
  },
  customersHeader: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 4,
  },
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
  serialChip: {
    backgroundColor: '#F3F4F6',
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
    width: 80,
    marginRight: 8,
  },
  detailValue: {
    color: '#1F2937',
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  financialTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  financialYearGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  fyCard: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  fyLabel: {
    color: '#6B7280',
    marginBottom: 4,
  },
  fyAmount: {
    color: '#059669',
    fontWeight: 'bold',
  },
});

export default CustomerProjectYearDetailScreen;

