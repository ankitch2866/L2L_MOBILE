import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ReminderLetterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [reminderLetters, setReminderLetters] = useState([]);
  const [summary, setSummary] = useState({
    totalLetters: 0,
    sentLetters: 0,
    pendingLetters: 0,
    overdueLetters: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchReminderLetters();
    }
  }, [selectedProject, statusFilter]);

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

  const fetchReminderLetters = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        projectId: selectedProject,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await api.get(`/api/transaction/payment/dashboard?${params}`);
      if (response.data?.success) {
        setReminderLetters(response.data.data.letters || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching reminder letters:', error);
      Alert.alert('Error', 'Failed to load reminder letters');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReminderLetters();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleGenerateReminder = (customerId) => {
    Alert.alert('Generate Reminder', 'Generate reminder letter functionality will be implemented');
  };

  const handleViewCustomer = (customerId) => {
    navigation.navigate('Customers', { 
      screen: 'CustomerDetails', 
      params: { customerId: customerId } 
    });
  };

  const filteredLetters = reminderLetters.filter(letter => {
    if (!searchQuery) return true;
    return letter.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           letter.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           letter.letter_number?.toLowerCase().includes(searchQuery.toLowerCase());
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
          Reminder Letter Report
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track reminder letters sent to customers
        </Text>
      </View>

      {/* Project Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Project
          </Text>
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
              Total Letters
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalLetters}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              All letters
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Sent
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.sentValue]}>
              {summary.sentLetters}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Sent letters
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Pending
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.pendingValue]}>
              {summary.pendingLetters}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Pending letters
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Overdue
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.overdueValue]}>
              {summary.overdueLetters}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Overdue letters
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
            placeholder="Search by customer, project, or letter number"
          />
          <View style={styles.statusFilter}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Status:</Text>
            <View style={styles.statusChips}>
              {['all', 'sent', 'pending', 'overdue', 'draft'].map((status) => (
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
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
        <Button
          mode="outlined"
          onPress={() => Alert.alert('Generate All', 'Generate all reminder letters functionality will be implemented')}
          icon="plus"
          style={styles.actionButton}
        >
          Generate All
        </Button>
      </View>

      {/* Reminder Letters Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Reminder Letters ({filteredLetters.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredLetters.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Letter #</DataTable.Title>
                  <DataTable.Title>Customer</DataTable.Title>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Due Date</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                
                {filteredLetters.map((letter, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {letter.letter_number || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {letter.customer_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {letter.project_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.amountText}>
                        {formatCurrency(letter.amount)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.statusChip,
                          letter.status === 'sent' && styles.sentChip,
                          letter.status === 'pending' && styles.pendingChip,
                          letter.status === 'overdue' && styles.overdueChip,
                          letter.status === 'draft' && styles.draftChip
                        ]}
                      >
                        {letter.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {formatDate(letter.due_date)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <View style={styles.actionButtons}>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleGenerateReminder(letter.customer_id)}
                          style={styles.actionButton}
                        >
                          Generate
                        </Button>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleViewCustomer(letter.customer_id)}
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
              title="No Reminder Letters Found"
              description="No reminder letters found for the selected project and filters"
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
  projectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  sentValue: {
    color: '#059669',
  },
  pendingValue: {
    color: '#F59E0B',
  },
  overdueValue: {
    color: '#DC2626',
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
  sentChip: {
    backgroundColor: '#D1FAE5',
  },
  pendingChip: {
    backgroundColor: '#FEF3C7',
  },
  overdueChip: {
    backgroundColor: '#FEE2E2',
  },
  draftChip: {
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
  amountText: {
    fontWeight: 'bold',
    color: '#DC2626',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
});

export default ReminderLetterScreen;
