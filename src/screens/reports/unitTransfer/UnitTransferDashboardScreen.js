import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState, Dropdown } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const UnitTransferDashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchAllTransferCharges();
  }, []);

  useEffect(() => {
    filterTransfers();
  }, [transfers, selectedProject, startDate, endDate, searchQuery]);

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

  const fetchAllTransferCharges = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/transaction/transfer-charges');
      if (response.data?.success) {
        setTransfers(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch transfer charges');
      }
    } catch (error) {
      console.error('Error fetching transfer charges:', error);
      setError(error.message || 'Failed to load transfer charges');
    } finally {
      setLoading(false);
    }
  };

  const filterTransfers = () => {
    let filtered = [...transfers];

    // Filter by project
    if (selectedProject) {
      const projectName = projects.find(p => p.project_id.toString() === selectedProject)?.project_name;
      if (projectName) {
        filtered = filtered.filter(transfer => transfer.project_name === projectName);
      }
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(transfer => {
        const transferDate = new Date(transfer.transferDate);
        const start = new Date(startDate);
        return transferDate >= start;
      });
    }

    if (endDate) {
      filtered = filtered.filter(transfer => {
        const transferDate = new Date(transfer.transferDate);
        const end = new Date(endDate);
        return transferDate <= end;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(transfer =>
        transfer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.customer_id?.toString().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransfers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProjects(),
      fetchAllTransferCharges()
    ]);
    setRefreshing(false);
  };

  const handleExportReport = async () => {
    try {
      if (filteredTransfers.length === 0) {
        Alert.alert('No Data', 'No transfer data available to export');
        return;
      }

      // Create CSV content
      const headers = ['Customer ID', 'Customer Name', 'Project', 'Unit', 'Transfer Date', 'Amount', 'Payment Mode', 'Status', 'Remarks'];
      const csvContent = [
        headers.join(','),
        ...filteredTransfers.map(transfer => [
          `"${transfer.customer_id || ''}"`,
          `"${transfer.customer_name || ''}"`,
          `"${transfer.project_name || ''}"`,
          `"${transfer.unit_name || ''}"`,
          `"${transfer.transferDate ? formatDate(transfer.transferDate) : ''}"`,
          `"${transfer.amount ? formatCurrency(transfer.amount) : ''}"`,
          `"${transfer.mode || ''}"`,
          `"${transfer.status || ''}"`,
          `"${transfer.remarks || ''}"`
        ].join(','))
      ].join('\n');

      // Share the CSV file
      await Share.share({
        message: csvContent,
        title: 'Unit Transfer Report',
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        filename: `unit-transfer-${new Date().toISOString().split('T')[0]}.csv`
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Export Error', 'Failed to export report');
    }
  };

  const handleViewTransfer = (transferId) => {
    // Navigate to transfer details if needed
    Alert.alert('View Transfer', `Transfer ID: ${transferId}`);
  };

  const clearFilters = () => {
    setSelectedProject('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const calculateSummary = () => {
    const total = filteredTransfers.length;
    const totalAmount = filteredTransfers.reduce((sum, transfer) => sum + (parseFloat(transfer.amount) || 0), 0);
    const pending = filteredTransfers.filter(t => t.status === 'pending').length;
    const completed = filteredTransfers.filter(t => t.status === 'completed').length;
    
    return { total, totalAmount, pending, completed };
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
            Unit Transfer Dashboard
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            View and manage transfer charges information
          </Text>
        </View>

        {/* Search */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Search Transfers
            </Text>
            <TextInput
              mode="outlined"
              label="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              left={<TextInput.Icon icon="magnify" />}
              placeholder="Search by customer, project, unit or ID..."
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

            {/* Date Range Filters */}
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text variant="bodyMedium" style={styles.filterLabel}>Start Date</Text>
                <TextInput
                  mode="outlined"
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  style={styles.dateField}
                />
              </View>
              <View style={styles.dateInput}>
                <Text variant="bodyMedium" style={styles.filterLabel}>End Date</Text>
                <TextInput
                  mode="outlined"
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  style={styles.dateField}
                />
              </View>
            </View>

            {/* Clear Filters */}
            <View style={styles.clearFiltersContainer}>
              <Button
                mode="outlined"
                onPress={clearFilters}
                icon="refresh"
                style={styles.clearButton}
                labelStyle={{ color: '#6B7280' }}
              >
                Clear Filters
              </Button>
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
                  Total Transfers
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#10B981' }]}>
                  {formatCurrency(summary.totalAmount)}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Total Amount
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#F59E0B' }]}>
                  {summary.pending}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Pending
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#3B82F6' }]}>
                  {summary.completed}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Completed
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

        {/* Transfer Data Table */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tableHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Transfer Charges ({filteredTransfers.length})
              </Text>
            </View>
            <Divider style={styles.divider} />
            
            {filteredTransfers.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Customer ID</DataTable.Title>
                    <DataTable.Title>Customer Name</DataTable.Title>
                    <DataTable.Title>Project</DataTable.Title>
                    <DataTable.Title>Unit</DataTable.Title>
                    <DataTable.Title>Transfer Date</DataTable.Title>
                    <DataTable.Title>Amount</DataTable.Title>
                    <DataTable.Title>Payment Mode</DataTable.Title>
                    <DataTable.Title>Status</DataTable.Title>
                    <DataTable.Title>Actions</DataTable.Title>
                  </DataTable.Header>
                  
                  {filteredTransfers.map((transfer, index) => (
                    <DataTable.Row key={transfer.id || index}>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {transfer.customer_id || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {transfer.customer_name || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {transfer.project_name || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {transfer.unit_name || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {transfer.transferDate ? formatDate(transfer.transferDate) : 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {transfer.amount ? formatCurrency(transfer.amount) : 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {transfer.mode || 'N/A'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <View style={styles.statusContainer}>
                          <Ionicons 
                            name={transfer.status === 'completed' ? 'checkmark-circle' : 'time-circle'} 
                            size={16} 
                            color={transfer.status === 'completed' ? '#10B981' : '#F59E0B'} 
                          />
                          <Text 
                            variant="bodyMedium" 
                            numberOfLines={1}
                            style={[
                              styles.statusText, 
                              { color: transfer.status === 'completed' ? '#10B981' : '#F59E0B' }
                            ]}
                          >
                            {transfer.status || 'N/A'}
                          </Text>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleViewTransfer(transfer.id)}
                          style={styles.viewButton}
                          labelStyle={{ color: '#3B82F6', fontSize: 12 }}
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
                title="No Transfer Data Found"
                description="No transfer charges found for the selected filters"
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
  dateRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
  },
  dateField: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  clearFiltersContainer: {
    alignItems: 'center',
  },
  clearButton: {
    borderRadius: 12,
    borderColor: '#D1D5DB',
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
    fontSize: 20,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  viewButton: {
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

export default UnitTransferDashboardScreen;