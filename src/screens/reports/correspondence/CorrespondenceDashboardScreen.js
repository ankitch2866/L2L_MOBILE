import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CorrespondenceDashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dispatches, setDispatches] = useState([]);
  const [filteredDispatches, setFilteredDispatches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerAllotments, setCustomerAllotments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerType, setSelectedCustomerType] = useState('all');
  const [selectedLetterType, setSelectedLetterType] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [customerTypeModalVisible, setCustomerTypeModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterDispatches();
  }, [searchQuery, selectedCustomerType, selectedLetterType, selectedProject, dispatches, customers, customerAllotments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [dispatchesRes, customersRes, allotmentsRes] = await Promise.all([
        api.get('/api/transaction/dispatches'),
        api.get('/api/master/customers'),
        api.get('/api/transaction/customer-allotments')
      ]);

      if (dispatchesRes.data?.success && customersRes.data?.success && allotmentsRes.data?.success) {
        setDispatches(dispatchesRes.data.data || []);
        setFilteredDispatches(dispatchesRes.data.data || []);
        setCustomers(customersRes.data.data || []);
        setCustomerAllotments(allotmentsRes.data.data || []);
      } else {
        Alert.alert('Error', 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to load correspondence data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filterDispatches = () => {
    if (dispatches.length === 0) return;

    let filtered = [...dispatches];

    if (selectedCustomerType !== 'all') {
      filtered = filtered.filter((dispatch) => dispatch.customerType === selectedCustomerType);
    }

    if (selectedLetterType !== 'all') {
      filtered = filtered.filter((dispatch) => dispatch.letterType === selectedLetterType);
    }

    if (selectedProject !== 'all') {
      filtered = filtered.filter((dispatch) => {
        const project = getProjectDetails(dispatch.customer_id);
        return project?.project_name === selectedProject;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((dispatch) => {
        const customer = getCustomerDetails(dispatch.customer_id);
        const project = getProjectDetails(dispatch.customer_id);

        return (
          dispatch.unitNo?.toLowerCase().includes(query) ||
          customer?.name?.toLowerCase().includes(query) ||
          project?.project_name?.toLowerCase().includes(query) ||
          dispatch.consignmentNo?.toLowerCase().includes(query) ||
          dispatch.courierCompany?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredDispatches(filtered);
  };

  const getCustomerDetails = (customerId) => {
    return customers.find((c) => c.customer_id === customerId) || {};
  };

  const getProjectDetails = (customerId) => {
    return customerAllotments.find((a) => a.customer_id === customerId) || {};
  };

  const getUniqueProjects = () => {
    const projects = customerAllotments.map((allotment) => allotment.project_name);
    return [...new Set(projects)].filter(Boolean);
  };

  const getUniqueLetterTypes = () => {
    const letterTypes = dispatches.map((dispatch) => dispatch.letterType);
    return [...new Set(letterTypes)].filter(Boolean);
  };

  const translateCustomerType = (type) => {
    const types = {
      AN_INDIVIDUAL: 'Individual',
      A_COMPANY: 'Company',
      A_PARTNERSHIP_FIRM: 'Partnership Firm',
      A_PROPRIETORSHIP_FIRM: 'Proprietorship Firm',
      INDIVIDUAL: 'Individual',
      COMPANY: 'Company',
      PARTNERSHIP: 'Partnership Firm',
      PROPRIETORSHIP: 'Proprietorship Firm',
    };
    return types[type] || type;
  };

  const translateLetterMode = (mode) => {
    const modes = {
      BY_COURIER: 'By Courier',
      BY_HAND: 'By Hand',
      BY_POSTAL: 'By Postal',
      OTHER: 'Other',
    };
    return modes[mode] || mode;
  };

  const handleView = (dispatchId) => {
    navigation.navigate('CorrespondenceReports', {
      screen: 'CorrespondenceDetails',
      params: { dispatchId: dispatchId }
    });
  };

  const handleAddDispatch = () => {
    navigation.navigate('Dispatches', {
      screen: 'CreateDispatch'
    });
  };

  const handleExportReport = async () => {
    try {
      if (filteredDispatches.length === 0) {
        Alert.alert('No Data', 'No dispatch data available to export');
        return;
      }

      setExporting(true);

      // Prepare headers for export
      const headers = [
        'Sr. No.',
        'Letter Type',
        'Customer Name',
        'Customer ID',
        'Project Name',
        'Customer Type',
        'Unit No',
        'Dispatch Date',
        'Mode',
        'Courier Company',
        'Consignment No'
      ];

      // Prepare data for export
      const exportData = filteredDispatches.map((dispatch, index) => {
        const customer = getCustomerDetails(dispatch.customer_id);
        const project = getProjectDetails(dispatch.customer_id);
        
        return [
          String(index + 1),
          String(dispatch.letterType || 'N/A'),
          String(customer?.name || 'N/A'),
          String(dispatch.customer_id || 'N/A'),
          String(project?.project_name || 'N/A'),
          String(translateCustomerType(dispatch.customerType) || 'N/A'),
          String(dispatch.unitNo || 'N/A'),
          String(dispatch.dispatchDate ? formatDate(dispatch.dispatchDate) : 'N/A'),
          String(translateLetterMode(dispatch.modeOfLetterSending) || 'N/A'),
          String(dispatch.courierCompany || 'N/A'),
          String(dispatch.consignmentNo || 'N/A')
        ];
      });

      // Generate filename with current date and filters
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `Customer_Correspondence_${currentDate}`;
      
      if (selectedProject !== 'all') {
        filename += `_${selectedProject.replace(/\s+/g, '_')}`;
      }
      if (selectedCustomerType !== 'all') {
        filename += `_${selectedCustomerType.replace(/\s+/g, '_')}`;
      }
      if (selectedLetterType !== 'all') {
        filename += `_${selectedLetterType.replace(/\s+/g, '_')}`;
      }

      const csvContent = [headers, ...exportData].map(row => 
        row.map(val => {
          const s = String(val ?? '');
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        }).join(',')
      ).join('\n');

      await Share.share({
        title: `${filename}.csv`,
        message: csvContent,
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        filename: `${filename}.csv`
      });

      Alert.alert('Success', 'Excel export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading dispatch records..." />;
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
          Customer Correspondence
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Dispatch records
        </Text>
      </View>

      {/* Search */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Search Dispatches
          </Text>
          <TextInput
            mode="outlined"
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            placeholder="Search by unit, customer, project or consignment..."
          />
        </Card.Content>
      </Card>

      {/* Filters */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Filters
          </Text>
          
          {/* Customer Type Filter */}
          <View style={styles.filterGroup}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Customer Type</Text>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => setCustomerTypeModalVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedCustomerType === 'all' ? 'All Customer Types' : 
                 selectedCustomerType === 'INDIVIDUAL' ? 'Individual' :
                 selectedCustomerType === 'COMPANY' ? 'Company' :
                 selectedCustomerType === 'PARTNERSHIP' ? 'Partnership Firm' :
                 selectedCustomerType === 'PROPRIETORSHIP' ? 'Proprietorship Firm' : 'All Customer Types'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </Pressable>
          </View>

          {/* Letter Type Filter */}
          <View style={styles.filterGroup}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Letter Type</Text>
            <View style={styles.letterTypeSelector}>
              <Chip
                selected={selectedLetterType === 'all'}
                onPress={() => setSelectedLetterType('all')}
                style={[
                  styles.filterChip,
                  selectedLetterType === 'all' && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCustomerType === 'all' ? styles.selectedChipText : styles.chipText
                ]}
              >
                All Letter Types
              </Chip>
              {getUniqueLetterTypes().map((type, index) => (
                <Chip
                  key={index}
                  selected={selectedLetterType === type}
                  onPress={() => setSelectedLetterType(type)}
                  style={[
                    styles.filterChip,
                    selectedLetterType === type && styles.selectedChip
                  ]}
                  textStyle={[
                  styles.chipText,
                  selectedCustomerType === 'all' ? styles.selectedChipText : styles.chipText
                ]}
                >
                  {type}
                </Chip>
              ))}
            </View>
          </View>

          {/* Project Filter */}
          <View style={styles.filterGroup}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Project</Text>
            <View style={styles.projectSelector}>
              <Chip
                selected={selectedProject === 'all'}
                onPress={() => setSelectedProject('all')}
                style={[
                  styles.filterChip,
                  selectedProject === 'all' && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCustomerType === 'all' ? styles.selectedChipText : styles.chipText
                ]}
              >
                All Projects
              </Chip>
              {getUniqueProjects().map((project, index) => (
                <Chip
                  key={index}
                  selected={selectedProject === project}
                  onPress={() => setSelectedProject(project)}
                  style={[
                    styles.filterChip,
                    selectedProject === project && styles.selectedChip
                  ]}
                  textStyle={[
                  styles.chipText,
                  selectedCustomerType === 'all' ? styles.selectedChipText : styles.chipText
                ]}
                >
                  {project}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Summary
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text variant="headlineMedium" style={styles.summaryValue}>
                {filteredDispatches.length}
              </Text>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Total Dispatches
              </Text>
            </View>
            {selectedProject !== 'all' && (
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryValue}>
                  {selectedProject}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Selected Project
                </Text>
              </View>
            )}
            {selectedCustomerType !== 'all' && (
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryValue}>
                  {translateCustomerType(selectedCustomerType)}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Customer Type
                </Text>
              </View>
            )}
            {selectedLetterType !== 'all' && (
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryValue}>
                  {selectedLetterType}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Letter Type
                </Text>
              </View>
            )}
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
          disabled={exporting || filteredDispatches.length === 0}
        >
          {exporting ? 'Exporting...' : 'Export Excel'}
        </Button>
      </View>

      {/* Dispatch Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Dispatch Records ({filteredDispatches.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredDispatches.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Letter Type</DataTable.Title>
                  <DataTable.Title>Customer</DataTable.Title>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Customer Type</DataTable.Title>
                  <DataTable.Title>Unit No</DataTable.Title>
                  <DataTable.Title>Dispatch Date</DataTable.Title>
                  <DataTable.Title>Mode</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                
                {filteredDispatches.map((dispatch, index) => {
                  const customer = getCustomerDetails(dispatch.customer_id);
                  const project = getProjectDetails(dispatch.customer_id);

                  return (
                    <DataTable.Row key={dispatch.id || index}>
                      <DataTable.Cell>
                        <Text variant="bodySmall" numberOfLines={1}>
                          {dispatch.letterType || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {customer?.name || 'N/A'}
                        </Text>
                        <Text variant="bodySmall" style={styles.customerId}>
                          ID: {dispatch.customer_id}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodySmall" numberOfLines={1}>
                          {project?.project_name || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodySmall">
                          {translateCustomerType(dispatch.customerType) || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodySmall">
                          {dispatch.unitNo || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodySmall">
                          {dispatch.dispatchDate ? formatDate(dispatch.dispatchDate) : 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodySmall" numberOfLines={2}>
                          {translateLetterMode(dispatch.modeOfLetterSending)}
                          {dispatch.modeOfLetterSending === 'BY_COURIER' && dispatch.courierCompany && ` (${dispatch.courierCompany})`}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleView(dispatch.id)}
                          style={styles.viewButton}
                        >
                          View
                        </Button>
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })}
              </DataTable>
            </ScrollView>
          ) : (
            <EmptyState
              title="No Dispatch Records Found"
              description={searchQuery || selectedCustomerType !== 'all' || selectedLetterType !== 'all' || selectedProject !== 'all'
                ? 'No matching dispatches found'
                : 'No dispatches available'}
            />
          )}
        </Card.Content>
      </Card>

      {/* Customer Type Modal */}
      <Modal
        visible={customerTypeModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setCustomerTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={styles.modalTitle}>Select Customer Type</Text>
              <Pressable onPress={() => setCustomerTypeModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <Pressable
                style={[
                  styles.modalItem,
                  selectedCustomerType === 'all' && styles.selectedModalItem
                ]}
                onPress={() => {
                  setSelectedCustomerType('all');
                  setCustomerTypeModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedCustomerType === 'all' && styles.selectedModalItemText
                ]}>
                  All Customer Types
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalItem,
                  selectedCustomerType === 'INDIVIDUAL' && styles.selectedModalItem
                ]}
                onPress={() => {
                  setSelectedCustomerType('INDIVIDUAL');
                  setCustomerTypeModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedCustomerType === 'INDIVIDUAL' && styles.selectedModalItemText
                ]}>
                  Individual
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalItem,
                  selectedCustomerType === 'COMPANY' && styles.selectedModalItem
                ]}
                onPress={() => {
                  setSelectedCustomerType('COMPANY');
                  setCustomerTypeModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedCustomerType === 'COMPANY' && styles.selectedModalItemText
                ]}>
                  Company
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalItem,
                  selectedCustomerType === 'PARTNERSHIP' && styles.selectedModalItem
                ]}
                onPress={() => {
                  setSelectedCustomerType('PARTNERSHIP');
                  setCustomerTypeModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedCustomerType === 'PARTNERSHIP' && styles.selectedModalItemText
                ]}>
                  Partnership Firm
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalItem,
                  selectedCustomerType === 'PROPRIETORSHIP' && styles.selectedModalItem
                ]}
                onPress={() => {
                  setSelectedCustomerType('PROPRIETORSHIP');
                  setCustomerTypeModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedCustomerType === 'PROPRIETORSHIP' && styles.selectedModalItemText
                ]}>
                  Proprietorship Firm
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>

    {/* Add Button - Outside ScrollView for true floating */}
    <TouchableOpacity
      style={styles.fab}
      onPress={handleAddDispatch}
    >
      <Ionicons name="add" size={24} color="#FFFFFF" />
    </TouchableOpacity>
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
    paddingBottom: 40,
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
  sectionTitle: {
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  searchInput: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  filterGroup: {
    marginTop: 20,
    gap: 12,
  },
  filterLabel: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
  customerTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  letterTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  projectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    color: '#475569',
    fontWeight: '500',
    fontSize: 13,
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E2E8F0',
    height: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    paddingVertical: 8,
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: 120,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryValue: {
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 4,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  customerId: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  viewButton: {
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // Dropdown Button Styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    marginTop: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 18,
  },
  closeButton: {
    fontSize: 20,
    color: '#64748B',
    padding: 4,
    fontWeight: '600',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedModalItem: {
    backgroundColor: '#EFF6FF',
  },
  modalItemText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  selectedModalItemText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  // FAB Styles
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 60,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CorrespondenceDashboardScreen;