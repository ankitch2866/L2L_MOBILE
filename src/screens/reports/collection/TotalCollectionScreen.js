import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const TotalCollectionScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [collections, setCollections] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    onlineAmount: 0,
    chequeAmount: 0,
    cashAmount: 0,
    averageTransaction: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchTotalCollections();
    }
  }, [dateRange, selectedProject]);

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

  const fetchTotalCollections = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(selectedProject && { projectId: selectedProject })
      });

      const response = await api.get(`/api/transaction/payment/dashboard?${params}`);
      if (response.data?.success) {
        setCollections(response.data.data.collections || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching total collections:', error);
      Alert.alert('Error', 'Failed to load total collections');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTotalCollections();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleViewPayment = (paymentId) => {
    navigation.navigate('Payments', { 
      screen: 'PaymentDetails', 
      params: { paymentId: paymentId } 
    });
  };

  const filteredCollections = collections.filter(collection => {
    if (!searchQuery) return true;
    return collection.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           collection.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           collection.payment_method?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
          Total Collection Report
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Complete collection summary
        </Text>
      </View>

      {/* Date Range and Project Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Date Range & Project
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

      {/* Summary Cards - First Row */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Collection
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {formatCurrency(summary.totalAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              {summary.totalTransactions} transactions
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Average Transaction
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.averageTransaction)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Per transaction
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Summary Cards - Second Row */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Online
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.onlineAmount)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Cheque
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.chequeAmount)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Search */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Search Collections
          </Text>
          <TextInput
            mode="outlined"
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            placeholder="Search by customer, project, or payment method"
          />
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

      {/* Collections Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Collections ({filteredCollections.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredCollections.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title>Customer</DataTable.Title>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Method</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Action</DataTable.Title>
                </DataTable.Header>
                
                {filteredCollections.map((collection, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {formatDate(collection.payment_date)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {collection.customer_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {collection.project_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.amountText}>
                        {formatCurrency(collection.amount)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        compact
                        style={styles.methodChip}
                      >
                        {collection.payment_method}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.statusChip,
                          collection.status === 'completed' && styles.completedChip,
                          collection.status === 'pending' && styles.pendingChip
                        ]}
                      >
                        {collection.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleViewPayment(collection.payment_id)}
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
              title="No Collections Found"
              description="No collections found for the selected date range and project"
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
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginTop: 8,
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
  searchInput: {
    marginTop: 8,
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
  divider: {
    marginVertical: 12,
  },
  amountText: {
    fontWeight: 'bold',
    color: '#059669',
  },
  methodChip: {
    maxWidth: 80,
  },
  statusChip: {
    maxWidth: 80,
  },
  completedChip: {
    backgroundColor: '#D1FAE5',
  },
  pendingChip: {
    backgroundColor: '#FEF3C7',
  },
});

export default TotalCollectionScreen;
