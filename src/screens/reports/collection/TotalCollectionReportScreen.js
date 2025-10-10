import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const TotalCollectionReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    projectBreakdown: [],
    paymentMethodBreakdown: [],
    monthlyTrend: []
  });
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');

  useEffect(() => {
    fetchTotalCollection();
  }, [dateRange]);

  const fetchTotalCollection = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(
        `/api/transaction/total-collection?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      if (response.data?.success) {
        setSummary(response.data.data.summary || {});
        setTransactions(response.data.data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching total collection:', error);
      Alert.alert('Error', 'Failed to load total collection data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTotalCollection();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleViewTransaction = (transactionId) => {
    navigation.navigate('Payments', { 
      screen: 'PaymentDetails', 
      params: { paymentId: transactionId } 
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchQuery || 
      transaction.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.project_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = selectedProject === 'all' || 
      transaction.project_id === selectedProject;
    
    return matchesSearch && matchesProject;
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
          {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
        </Text>
      </View>

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

      {/* Payment Methods Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Payment Methods Breakdown
          </Text>
          <Divider style={styles.divider} />
          
          {summary.paymentMethodBreakdown?.map((method, index) => (
            <View key={index} style={styles.breakdownItem}>
              <Text variant="bodyLarge">{method.method}</Text>
              <View style={styles.breakdownRight}>
                <Text variant="titleMedium" style={styles.breakdownAmount}>
                  {formatCurrency(method.amount)}
                </Text>
                <Text variant="bodyMedium" style={styles.breakdownCount}>
                  {method.count} transactions
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Project Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Project-wise Collection
          </Text>
          <Divider style={styles.divider} />
          
          {summary.projectBreakdown?.map((project, index) => (
            <View key={index} style={styles.breakdownItem}>
              <Text variant="bodyLarge" numberOfLines={1}>
                {project.project_name}
              </Text>
              <View style={styles.breakdownRight}>
                <Text variant="titleMedium" style={styles.breakdownAmount}>
                  {formatCurrency(project.amount)}
                </Text>
                <Text variant="bodyMedium" style={styles.breakdownCount}>
                  {project.count} transactions
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

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

      {/* Transactions Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Transactions ({filteredTransactions.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredTransactions.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Customer</DataTable.Title>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Method</DataTable.Title>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title>Action</DataTable.Title>
                </DataTable.Header>
                
                {filteredTransactions.map((transaction, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {transaction.customer_name || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {transaction.project_name || 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.amountText}>
                        {formatCurrency(transaction.amount)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        compact
                        style={styles.methodChip}
                      >
                        {transaction.payment_method}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {formatDate(transaction.payment_date)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleViewTransaction(transaction.id)}
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
              title="No Transactions Found"
              description="No transactions found for the selected date range and filters"
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
  },
  dateInput: {
    flex: 1,
    marginTop: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
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
  divider: {
    marginVertical: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownAmount: {
    fontWeight: 'bold',
    color: '#059669',
  },
  breakdownCount: {
    color: '#6B7280',
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
  amountText: {
    fontWeight: 'bold',
    color: '#059669',
  },
  methodChip: {
    maxWidth: 80,
  },
});

export default TotalCollectionReportScreen;
