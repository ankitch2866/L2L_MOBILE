import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const TransactionDetailsReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    onlineAmount: 0,
    chequeAmount: 0,
    cashAmount: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');

  useEffect(() => {
    fetchTransactionDetails();
  }, [dateRange, selectedProject, selectedPaymentMethod]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(selectedProject !== 'all' && { projectId: selectedProject }),
        ...(selectedPaymentMethod !== 'all' && { paymentMethod: selectedPaymentMethod })
      });

      const response = await api.get(`/api/transaction/payment/dashboard?${params}`);
      if (response.data?.success) {
        setTransactions(response.data.data.transactions || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      Alert.alert('Error', 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactionDetails();
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
    if (!searchQuery) return true;
    return transaction.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           transaction.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           transaction.payment_method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           transaction.transaction_id?.toString().includes(searchQuery);
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
          Transaction Details Report
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Detailed transaction information
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

      {/* Summary Cards - First Row */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Amount
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
              Online
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.onlineAmount)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Summary Cards - Second Row */}
      <View style={styles.summaryContainer}>
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

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Cash
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.cashAmount)}
            </Text>
          </Card.Content>
        </Card>
      </View>

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
            placeholder="Search by customer, project, payment method, or transaction ID"
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
                  <DataTable.Title>ID</DataTable.Title>
                  <DataTable.Title>Customer</DataTable.Title>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Method</DataTable.Title>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Action</DataTable.Title>
                </DataTable.Header>
                
                {filteredTransactions.map((transaction, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        #{transaction.transaction_id || transaction.id}
                      </Text>
                    </DataTable.Cell>
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
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.statusChip,
                          transaction.status === 'completed' && styles.completedChip,
                          transaction.status === 'pending' && styles.pendingChip,
                          transaction.status === 'failed' && styles.failedChip
                        ]}
                      >
                        {transaction.status}
                      </Chip>
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
              description="No transactions found for the selected criteria"
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
  failedChip: {
    backgroundColor: '#FEE2E2',
  },
});

export default TransactionDetailsReportScreen;
