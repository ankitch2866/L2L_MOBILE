import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ViewCallingHistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [callingHistory, setCallingHistory] = useState([]);
  const [summary, setSummary] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    missedCalls: 0,
    averageCallDuration: 0,
    totalCallDuration: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchCustomers();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedCustomer && selectedProject) {
      fetchCallingHistory();
    }
  }, [selectedCustomer, selectedProject, statusFilter, dateRange]);

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

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/api/master/customers/project/${selectedProject}/with-status`);
      if (response.data?.success) {
        setCustomers(response.data.data.customers || []);
        if (response.data.data.customers.length > 0) {
          setSelectedCustomer(response.data.data.customers[0].customer_id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    }
  };

  const fetchCallingHistory = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        customerId: selectedCustomer,
        projectId: selectedProject,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await api.get(`/api/transaction/calling-history?${params}`);
      if (response.data?.success) {
        setCallingHistory(response.data.data.history || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching calling history:', error);
      Alert.alert('Error', 'Failed to load calling history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCallingHistory();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleViewCall = (callId) => {
    navigation.navigate('CallingFeedback', { 
      screen: 'CallDetails', 
      params: { callId: callId } 
    });
  };

  const handleViewCustomer = (customerId) => {
    navigation.navigate('Customers', { 
      screen: 'CustomerDetails', 
      params: { customerId: customerId } 
    });
  };

  const filteredHistory = callingHistory.filter(call => {
    if (!searchQuery) return true;
    return call.caller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           call.call_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           call.notes?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedProjectData = projects.find(p => p.project_id.toString() === selectedProject);
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
          Calling History
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track customer calling history
        </Text>
      </View>

      {/* Project and Customer Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Project & Customer
          </Text>
          
          <Text variant="bodyMedium" style={styles.label}>Project:</Text>
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

          {selectedProject && (
            <>
              <Text variant="bodyMedium" style={[styles.label, styles.customerLabel]}>Customer:</Text>
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
            </>
          )}
        </Card.Content>
      </Card>

      {/* Date Range Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Date Range
          </Text>
          <View style={styles.dateRangeContainer}>
            <TextInput
              mode="outlined"
              label="Start Date"
              value={dateRange.startDate}
              onChangeText={(text) => setDateRange(prev => ({ ...prev, startDate: text }))}
              style={styles.dateInput}
              keyboardType="numeric"
              placeholder="YYYY-MM-DD"
            />
            <TextInput
              mode="outlined"
              label="End Date"
              value={dateRange.endDate}
              onChangeText={(text) => setDateRange(prev => ({ ...prev, endDate: text }))}
              style={styles.dateInput}
              keyboardType="numeric"
              placeholder="YYYY-MM-DD"
            />
          </View>
        </Card.Content>
      </Card>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Calls
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalCalls}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              All calls
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Successful
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.successfulValue]}>
              {summary.successfulCalls}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Successful calls
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Missed
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.missedValue]}>
              {summary.missedCalls}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Missed calls
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Avg Duration
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {Math.round(summary.averageCallDuration)}m
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Average duration
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Customer & Project Info */}
      {selectedCustomerData && selectedProjectData && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Customer & Project Information
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoSection}>
              <Text variant="bodyLarge" style={styles.customerName}>
                {selectedCustomerData.name}
              </Text>
              <Text variant="bodyMedium" style={styles.customerDetails}>
                Phone: {selectedCustomerData.phone_no || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.customerDetails}>
                Email: {selectedCustomerData.email || 'N/A'}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoSection}>
              <Text variant="bodyLarge" style={styles.projectName}>
                {selectedProjectData.project_name}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                {selectedProjectData.company_name}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Filters */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Filters
          </Text>
          <TextInput
            mode="outlined"
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            placeholder="Search by caller, call type, or notes"
          />
          <View style={styles.statusFilter}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Status:</Text>
            <View style={styles.statusChips}>
              {['all', 'successful', 'missed', 'busy', 'no-answer'].map((status) => (
                <Chip
                  key={status}
                  selected={statusFilter === status}
                  onPress={() => setStatusFilter(status)}
                  style={[
                    styles.statusChip,
                    statusFilter === status && styles.selectedStatusChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </Chip>
              ))}
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
        >
          Export Report
        </Button>
      </View>

      {/* Calling History Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Calling History ({filteredHistory.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredHistory.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Date & Time</DataTable.Title>
                  <DataTable.Title>Caller</DataTable.Title>
                  <DataTable.Title>Type</DataTable.Title>
                  <DataTable.Title>Duration</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Notes</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                
                {filteredHistory.map((call, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {formatDate(call.call_date)}
                      </Text>
                      <Text variant="bodySmall" style={styles.timeText}>
                        {call.call_time}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {call.caller_name || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.typeChip,
                          call.call_type === 'incoming' && styles.incomingChip,
                          call.call_type === 'outgoing' && styles.outgoingChip
                        ]}
                      >
                        {call.call_type}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.durationText}>
                        {call.duration ? `${call.duration}m` : 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.statusChip,
                          call.status === 'successful' && styles.successfulChip,
                          call.status === 'missed' && styles.missedChip,
                          call.status === 'busy' && styles.busyChip,
                          call.status === 'no-answer' && styles.noAnswerChip
                        ]}
                      >
                        {call.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall" numberOfLines={2}>
                        {call.notes || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <View style={styles.actionButtons}>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleViewCall(call.id)}
                          style={styles.actionButton}
                        >
                          View
                        </Button>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleViewCustomer(call.customer_id)}
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
              title="No Calling History Found"
              description="No calling history found for the selected customer and filters"
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
  label: {
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  customerLabel: {
    marginTop: 16,
  },
  projectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customerSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectChip: {
    backgroundColor: '#F3F4F6',
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
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    marginTop: 8,
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
  successfulValue: {
    color: '#059669',
  },
  missedValue: {
    color: '#DC2626',
  },
  divider: {
    marginVertical: 12,
  },
  infoSection: {
    gap: 4,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  customerDetails: {
    color: '#6B7280',
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
  statusFilter: {
    marginTop: 16,
  },
  filterLabel: {
    marginBottom: 8,
    color: '#374151',
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    backgroundColor: '#F3F4F6',
  },
  selectedStatusChip: {
    backgroundColor: '#EF4444',
  },
  typeChip: {
    maxWidth: 80,
  },
  incomingChip: {
    backgroundColor: '#DBEAFE',
  },
  outgoingChip: {
    backgroundColor: '#D1FAE5',
  },
  successfulChip: {
    backgroundColor: '#D1FAE5',
  },
  missedChip: {
    backgroundColor: '#FEE2E2',
  },
  busyChip: {
    backgroundColor: '#FEF3C7',
  },
  noAnswerChip: {
    backgroundColor: '#F3F4F6',
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
  timeText: {
    color: '#6B7280',
  },
  durationText: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
});

export default ViewCallingHistoryScreen;
