import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Share } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable, IconButton, Searchbar } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ProjectDetailsScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { projectId } = route.params || {};
  
  const [loading, setLoading] = useState({
    project: true,
    units: true,
    customers: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('unit');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchUnits();
      fetchCustomers();
    }
  }, [projectId]);

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

  const fetchUnits = async () => {
    try {
      setLoading(prev => ({ ...prev, units: true }));
      setError('');
      
      const response = await api.get(`/api/master/project/${projectId}/units`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch units');
      }
      
      setUnits(response.data.data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setError(error.message || 'Failed to load units');
    } finally {
      setLoading(prev => ({ ...prev, units: false }));
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(prev => ({ ...prev, customers: true }));
      setError('');
      
      const response = await api.get(`/api/master/customers/by-project/${projectId}`);
      
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

  const refreshData = () => {
    setError('');
    fetchProjectDetails();
    fetchUnits();
    fetchCustomers();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleExportReport = async () => {
    try {
      if (!project) {
        Alert.alert('Error', 'No project data available to export');
        return;
      }

      // Create CSV content
      let csvContent = '';
      
      // Add project information header
      csvContent += `Project Export Report\n`;
      csvContent += `Project Name: ${String(project.project_name || 'N/A')}\n`;
      csvContent += `Company: ${String(project.company_name || 'N/A')}\n`;
      csvContent += `Address: ${String(project.address || 'N/A')}\n`;
      csvContent += `Status: ${String(project.status || 'N/A')}\n`;
      csvContent += `Export Date: ${new Date().toLocaleDateString()}\n\n`;

      // Add units section
      csvContent += `UNITS DATA\n`;
      csvContent += `Unit Name,Unit Type,Description,Size,BSP,Status\n`;
      
      units.forEach(unit => {
        const unitName = String(unit.unit_name || 'N/A').replace(/,/g, ';');
        const unitType = String(unit.unit_type || 'N/A').replace(/,/g, ';');
        const description = String(unit.unit_desc || 'N/A').replace(/,/g, ';');
        const size = String(unit.unit_size || 'N/A').replace(/,/g, ';');
        const bsp = formatCurrency(unit.bsp || 0).replace(/,/g, '');
        const status = String(unit.status || 'N/A').replace(/,/g, ';');
        
        csvContent += `${unitName},${unitType},${description},${size},${bsp},${status}\n`;
      });

      csvContent += `\n`;

      // Add customers section
      csvContent += `CUSTOMERS DATA\n`;
      csvContent += `Name,Application ID,Phone,Email,Status\n`;
      
      customers.forEach(customer => {
        const name = String(customer.name || 'N/A').replace(/,/g, ';');
        const appId = String(customer.manual_application_id || 'N/A').replace(/,/g, ';');
        const phone = String(customer.phone_no || 'N/A').replace(/,/g, ';');
        const email = String(customer.email || 'N/A').replace(/,/g, ';');
        const status = String(customer.status || 'Active').replace(/,/g, ';');
        
        csvContent += `${name},${appId},${phone},${email},${status}\n`;
      });

      // Add summary
      csvContent += `\nSUMMARY\n`;
      csvContent += `Total Units,${units.length}\n`;
      csvContent += `Total Customers,${customers.length}\n`;
      csvContent += `Booked Units,${units.filter(u => u.status === 'booked').length}\n`;
      csvContent += `Available Units,${units.filter(u => u.status === 'available').length}\n`;
      csvContent += `Sold Units,${units.filter(u => u.status === 'sold').length}\n`;

      // Share the CSV content
      await Share.share({
        message: csvContent,
        title: `${project.project_name} - Project Export`,
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Error', 'Failed to export project data. Please try again.');
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.unit_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.unit_desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.unit_size?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.manual_application_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading.project) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState
          icon="alert-circle"
          title="Error Loading Project"
          subtitle={error}
        />
        <Button
          mode="contained"
          onPress={refreshData}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="folder-open"
          title="Project Not Found"
          subtitle="The requested project could not be found"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor="#FFFFFF"
            style={styles.backButton}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Project Details
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              size={20}
              onPress={refreshData}
              iconColor={theme.colors.primary}
            />
            <Button
              mode="contained"
              onPress={handleExportReport}
              style={styles.exportButton}
              labelStyle={styles.exportButtonLabel}
            >
              Export
            </Button>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Project Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.projectName}>
              {project.project_name}
            </Text>
            <Text variant="bodyMedium" style={styles.projectCompany}>
              {project.company_name}
            </Text>
            <Text variant="bodySmall" style={styles.projectAddress}>
              📍 {project.address}
            </Text>
            
            <View style={styles.projectDetails}>
              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>Status:</Text>
                <Chip
                  mode="outlined"
                  compact
                  style={[
                    styles.statusChip,
                    project.status === 'active' && styles.activeStatus,
                    project.status === 'completed' && styles.completedStatus,
                    project.status === 'pending' && styles.pendingStatus
                  ]}
                  textStyle={styles.statusText}
                >
                  {project.status || 'Active'}
                </Chip>
              </View>
              
              {project.start_date && (
                <View style={styles.detailRow}>
                  <Text variant="bodySmall" style={styles.detailLabel}>Start Date:</Text>
                  <Text variant="bodySmall" style={styles.detailValue}>
                    {formatDate(project.start_date)}
                  </Text>
                </View>
              )}
              
              {project.end_date && (
                <View style={styles.detailRow}>
                  <Text variant="bodySmall" style={styles.detailLabel}>End Date:</Text>
                  <Text variant="bodySmall" style={styles.detailValue}>
                    {formatDate(project.end_date)}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search units and customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'unit' && styles.activeTab]}
            onPress={() => setActiveTab('unit')}
          >
            <Text style={[styles.tabText, activeTab === 'unit' && styles.activeTabText]}>
              Units ({units.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'customer' && styles.activeTab]}
            onPress={() => setActiveTab('customer')}
          >
            <Text style={[styles.tabText, activeTab === 'customer' && styles.activeTabText]}>
              Customers ({customers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Units Tab */}
        {activeTab === 'unit' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Units ({filteredUnits.length})
              </Text>
            </View>
            
            {loading.units ? (
              <View style={styles.loadingContainer}>
                <LoadingIndicator />
              </View>
            ) : filteredUnits.length === 0 ? (
              <Card style={styles.card}>
                <Card.Content>
                  <EmptyState
                    icon="home"
                    title="No units found"
                    subtitle={searchQuery ? "No units match your search criteria" : "No units available for this project"}
                  />
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.cardsContainer}>
                {filteredUnits.map((unit, index) => (
                  <Card key={index} style={styles.unitCard}>
                    <Card.Content style={styles.cardContent}>
                      {/* Unit Header */}
                      <View style={styles.cardHeader}>
                        <View style={styles.unitNameContainer}>
                          <Text variant="titleMedium" style={styles.unitName} numberOfLines={1}>
                            {unit.unit_name || 'Unit Name'}
                          </Text>
                        </View>
                        <Chip
                          mode="outlined"
                          compact
                          style={[
                            styles.statusChip,
                            unit.status === 'booked' && styles.bookedStatus,
                            unit.status === 'available' && styles.availableStatus,
                            unit.status === 'sold' && styles.soldStatus
                          ]}
                          textStyle={styles.statusText}
                        >
                          {unit.status}
                        </Chip>
                      </View>

                      {/* Unit Information */}
                      <View style={styles.unitInfo}>
                        <Text variant="bodyMedium" style={styles.unitType} numberOfLines={1}>
                          {unit.unit_type}
                        </Text>
                        
                        <View style={styles.unitDetails}>
                          <View style={styles.detailItem}>
                            <Text variant="bodySmall" style={styles.detailLabel}>
                              Size
                            </Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {unit.unit_size}
                            </Text>
                          </View>
                          
                          <View style={styles.detailItem}>
                            <Text variant="bodySmall" style={styles.detailLabel}>
                              BSP
                            </Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {formatCurrency(unit.bsp)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Customers Tab */}
        {activeTab === 'customer' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Customers ({filteredCustomers.length})
              </Text>
            </View>
            
            {loading.customers ? (
              <View style={styles.loadingContainer}>
                <LoadingIndicator />
              </View>
            ) : filteredCustomers.length === 0 ? (
              <Card style={styles.card}>
                <Card.Content>
                  <EmptyState
                    icon="account"
                    title="No customers found"
                    subtitle={searchQuery ? "No customers match your search criteria" : "No customers available for this project"}
                  />
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.cardsContainer}>
                {filteredCustomers.map((customer, index) => (
                  <Card key={index} style={styles.customerCard}>
                    <Card.Content style={styles.cardContent}>
                      {/* Customer Header */}
                      <View style={styles.cardHeader}>
                        <View style={styles.customerNameContainer}>
                          <Text variant="titleMedium" style={styles.customerName} numberOfLines={1}>
                            {customer.name}
                          </Text>
                        </View>
                        <Chip
                          mode="outlined"
                          compact
                          style={[
                            styles.statusChip,
                            customer.status === 'active' && styles.activeStatus,
                            customer.status === 'inactive' && styles.inactiveStatus
                          ]}
                          textStyle={styles.statusText}
                        >
                          {customer.status || 'Active'}
                        </Chip>
                      </View>

                      {/* Customer Information */}
                      <View style={styles.customerInfo}>
                        <Text variant="bodyMedium" style={styles.customerId} numberOfLines={1}>
                          ID: {customer.manual_application_id || 'N/A'}
                        </Text>
                        
                        <View style={styles.customerDetails}>
                          <View style={styles.detailItem}>
                            <Text variant="bodySmall" style={styles.detailLabel}>
                              Phone
                            </Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {customer.phone_no || 'N/A'}
                            </Text>
                          </View>
                          
                          <View style={styles.detailItem}>
                            <Text variant="bodySmall" style={styles.detailLabel}>
                              Email
                            </Text>
                            <Text variant="bodySmall" style={styles.detailValue} numberOfLines={1}>
                              {customer.email || 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 12,
  },
  projectName: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontSize: 20,
  },
  projectCompany: {
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  projectAddress: {
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 16,
  },
  projectDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  statusChip: {
    backgroundColor: '#F3F4F6',
  },
  activeStatus: {
    backgroundColor: '#D1FAE5',
  },
  completedStatus: {
    backgroundColor: '#DBEAFE',
  },
  pendingStatus: {
    backgroundColor: '#FEF3C7',
  },
  bookedStatus: {
    backgroundColor: '#D1FAE5',
  },
  availableStatus: {
    backgroundColor: '#DBEAFE',
  },
  soldStatus: {
    backgroundColor: '#FECACA',
  },
  inactiveStatus: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    height: 48,
    marginHorizontal: 0,
  },
  searchInput: {
    fontSize: 14,
    paddingHorizontal: 8,
    textAlignVertical: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#EF4444',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  retryButton: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  bottomSpacing: {
    height: 32,
  },
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardsContainer: {
    padding: 16,
    gap: 8,
  },
  unitCard: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 8,
    marginBottom: 0,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 8,
    marginBottom: 0,
  },
  cardContent: {
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 6,
  },
  customerNameContainer: {
    flex: 0.75,
    marginRight: 8,
  },
  unitNameContainer: {
    flex: 0.75,
    marginRight: 8,
  },
  unitInfo: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 0,
  },
  customerInfo: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 0,
  },
  unitName: {
    fontWeight: 'bold',
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 20,
  },
  unitType: {
    fontWeight: 'normal',
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
    fontSize: 13,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 20,
  },
  customerId: {
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 13,
  },
  unitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  customerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default ProjectDetailsScreen;
