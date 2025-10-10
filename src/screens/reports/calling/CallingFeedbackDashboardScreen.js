import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CallingFeedbackDashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/transaction/feedbacks');
      console.log('Feedbacks API Response:', response.data);
      if (response.data?.success) {
        const feedbacksData = response.data.data || [];
        console.log('Feedbacks Data:', feedbacksData);
        setFeedbacks(feedbacksData);
        
        // Extract unique projects and customers
        const uniqueProjects = [...new Set(feedbacksData.map(f => f.project_name))].filter(p => p);
        const uniqueCustomers = [...new Set(feedbacksData.map(f => f.customer_name))].filter(c => c);
        setProjects(uniqueProjects);
        setCustomers(uniqueCustomers);
      } else {
        Alert.alert('Error', 'Failed to fetch feedback data');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      Alert.alert('Error', 'Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeedbacks();
    setRefreshing(false);
  };

  const handleProjectFilterChange = (project) => {
    setSelectedProject(project);
    setSelectedCustomer('all');
  };

  const handleCustomerFilterChange = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleTypeFilterChange = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSelectedProject('all');
    setSelectedCustomer('all');
    setSelectedTypes([]);
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const projectMatch = selectedProject === 'all' || feedback.project_name === selectedProject;
    const customerMatch = selectedCustomer === 'all' || feedback.customer_name === selectedCustomer;
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(feedback.calling_type);
    const searchMatch =
      searchQuery === '' ||
      (feedback.customer_name && feedback.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (feedback.manual_application_id && feedback.manual_application_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (feedback.project_name && feedback.project_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (feedback.calling_type && feedback.calling_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (feedback.amount_committed_to_pay && feedback.amount_committed_to_pay.toString().includes(searchQuery));
    
    const callingDate = feedback.calling_date ? new Date(feedback.calling_date) : null;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const dateMatch =
      (!start && !end) ||
      (start && !end && callingDate >= start) ||
      (!start && end && callingDate <= end) ||
      (start && end && callingDate >= start && callingDate <= end);

    return projectMatch && customerMatch && typeMatch && searchMatch && dateMatch;
  });

  const handleView = (id) => {
    navigation.navigate('CallingFeedback', {
      screen: 'ViewCallingFeedback',
      params: { feedbackId: id }
    });
  };

  const handleExportReport = async () => {
    try {
      if (filteredFeedbacks.length === 0) {
        Alert.alert('No Data', 'No feedback data available to export');
        return;
      }

      setExporting(true);

      // Prepare headers for export
      const headers = [
        'Sr. No.',
        'Project Name',
        'Customer ID',
        'Customer Name',
        'Calling Date',
        'Calling Type',
        'Promise to Pay',
        'Amount Committed (₹)',
        'Remarks'
      ];

      // Prepare data for export
      const exportData = filteredFeedbacks.map((feedback, index) => [
        String(index + 1),
        String(feedback.project_name || 'N/A'),
        String(feedback.manual_application_id || 'N/A'),
        String(feedback.customer_name || 'N/A'),
        String(feedback.calling_date ? formatDate(feedback.calling_date) : 'N/A'),
        String(feedback.calling_type || 'N/A'),
        String(feedback.promise_to_pay ? formatDate(feedback.promise_to_pay) : 'N/A'),
        String(feedback.amount_committed_to_pay || 0),
        String(feedback.remarks || 'N/A')
      ]);

      // Generate filename with current date and filters
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `Calling_Feedback_${currentDate}`;
      
      if (selectedProject !== 'all') {
        filename += `_${selectedProject.replace(/\s+/g, '_')}`;
      }
      if (selectedCustomer !== 'all') {
        filename += `_${selectedCustomer.replace(/\s+/g, '_')}`;
      }
      if (selectedTypes.length > 0) {
        filename += `_${selectedTypes.join('_').replace(/\s+/g, '_')}`;
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

  const allTypes = [...new Set(feedbacks.map(f => f.calling_type))].filter(Boolean);
  const filteredCustomers = selectedProject === 'all'
    ? customers
    : customers.filter(customer =>
        feedbacks.some(f => f.project_name === selectedProject && f.customer_name === customer)
      );

  if (loading) {
    return <LoadingIndicator message="Loading feedback data..." />;
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
          Customer Calling Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track customer calling details and payment commitments
        </Text>
      </View>

      {/* Search */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Search Feedback
          </Text>
          <TextInput
            mode="outlined"
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            placeholder="Search by customer, project, type, amount..."
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
            <Text variant="bodyMedium" style={styles.filterLabel}>Filter by Project</Text>
            <View style={styles.projectSelector}>
              <Chip
                selected={selectedProject === 'all'}
                onPress={() => handleProjectFilterChange('all')}
                style={[
                  styles.projectChip,
                  selectedProject === 'all' && styles.selectedChip
                ]}
                textStyle={styles.chipText}
              >
                All Projects
              </Chip>
              {projects.map((project, index) => (
                <Chip
                  key={index}
                  selected={selectedProject === project}
                  onPress={() => handleProjectFilterChange(project)}
                  style={[
                    styles.projectChip,
                    selectedProject === project && styles.selectedChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {project}
                </Chip>
              ))}
            </View>
          </View>

          {/* Customer Filter */}
          <View style={styles.filterGroup}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Filter by Customer</Text>
            <View style={styles.customerSelector}>
              <Chip
                selected={selectedCustomer === 'all'}
                onPress={() => handleCustomerFilterChange('all')}
                style={[
                  styles.customerChip,
                  selectedCustomer === 'all' && styles.selectedChip
                ]}
                textStyle={styles.chipText}
              >
                All Customers
              </Chip>
              {filteredCustomers.map((customer, index) => (
                <Chip
                  key={index}
                  selected={selectedCustomer === customer}
                  onPress={() => handleCustomerFilterChange(customer)}
                  style={[
                    styles.customerChip,
                    selectedCustomer === customer && styles.selectedChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {customer}
                </Chip>
              ))}
            </View>
          </View>

          {/* Type Filter */}
          <View style={styles.filterGroup}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Filter by Type</Text>
            <View style={styles.typeSelector}>
              {allTypes.map((type, index) => (
                <Chip
                  key={index}
                  selected={selectedTypes.includes(type)}
                  onPress={() => handleTypeFilterChange(type)}
                  style={[
                    styles.typeChip,
                    selectedTypes.includes(type) && styles.selectedChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {type}
                </Chip>
              ))}
            </View>
          </View>

          {/* Date Range Filter */}
          <View style={styles.filterGroup}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Filter by Date Range</Text>
            <View style={styles.dateRangeContainer}>
              <TextInput
                mode="outlined"
                label="Start Date"
                value={startDate}
                onChangeText={setStartDate}
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
              />
              <TextInput
                mode="outlined"
                label="End Date"
                value={endDate}
                onChangeText={setEndDate}
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          {/* Clear Filters */}
          {(selectedProject !== 'all' || selectedCustomer !== 'all' || selectedTypes.length > 0 || searchQuery || startDate || endDate) && (
            <View style={styles.clearFiltersContainer}>
              <Button
                mode="outlined"
                onPress={handleClearFilters}
                icon="close"
                style={styles.clearFiltersButton}
              >
                Clear All Filters
              </Button>
            </View>
          )}
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
                {filteredFeedbacks.length}
              </Text>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Total Records
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
            {selectedCustomer !== 'all' && (
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryValue}>
                  {selectedCustomer}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Selected Customer
                </Text>
              </View>
            )}
            {selectedTypes.length > 0 && (
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryValue}>
                  {selectedTypes.join(', ')}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Calling Types
                </Text>
              </View>
            )}
            {(startDate || endDate) && (
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryValue}>
                  {startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Date Range
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
          disabled={exporting || filteredFeedbacks.length === 0}
        >
          {exporting ? 'Exporting...' : 'Export Excel'}
        </Button>
      </View>

      {/* Feedback Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Calling Details ({filteredFeedbacks.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredFeedbacks.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Customer ID</DataTable.Title>
                  <DataTable.Title>Customer Name</DataTable.Title>
                  <DataTable.Title>Calling Date</DataTable.Title>
                  <DataTable.Title>Type</DataTable.Title>
                  <DataTable.Title>Promise to Pay</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Remarks</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                
                {filteredFeedbacks.map((feedback, index) => (
                  <DataTable.Row key={feedback.feedback_id || index}>
                    <DataTable.Cell>
                      <Text variant="bodySmall" numberOfLines={1}>
                        {feedback.project_name || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall" numberOfLines={1}>
                        {feedback.manual_application_id || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {feedback.customer_name || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {feedback.calling_date ? formatDate(feedback.calling_date) : 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {feedback.calling_type || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {feedback.promise_to_pay ? formatDate(feedback.promise_to_pay) : 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.amountText}>
                        {formatCurrency(feedback.amount_committed_to_pay)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall" numberOfLines={2}>
                        {feedback.remarks || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleView(feedback.feedback_id)}
                        style={styles.viewButton}
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
              title="No Feedback Records Found"
              description="No feedback records found matching your criteria"
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
    paddingBottom: 60,
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
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchInput: {
    marginTop: 8,
  },
  filterGroup: {
    marginTop: 16,
    gap: 8,
  },
  filterLabel: {
    color: '#374151',
    fontWeight: '500',
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
  customerSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customerChip: {
    backgroundColor: '#F3F4F6',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    backgroundColor: '#F3F4F6',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  clearFiltersContainer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  clearFiltersButton: {
    borderColor: '#EF4444',
  },
  divider: {
    marginVertical: 12,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: 100,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#6B7280',
    textAlign: 'center',
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
  viewButton: {
    marginLeft: 4,
  },
});

export default CallingFeedbackDashboardScreen;