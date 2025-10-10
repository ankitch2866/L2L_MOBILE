import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const DailyCollectionReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    onlineAmount: 0,
    chequeAmount: 0,
    cashAmount: 0,
    onlineCount: 0,
    chequeCount: 0,
    cashCount: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');

  useEffect(() => {
    fetchDailyCollection();
  }, [selectedDate]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedProject]);

  const fetchDailyCollection = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/api/transaction/daily-collection?date=${selectedDate}`);
      if (response.data?.success) {
        setSummary(response.data.data.summary || {});
        setTransactions(response.data.data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching daily collection:', error);
      Alert.alert('Error', 'Failed to load daily collection data');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedProject !== 'all') {
      filtered = filtered.filter(transaction => transaction.project_id === selectedProject);
    }

    setFilteredTransactions(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyCollection();
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
          Daily Collection Report
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {formatDate(selectedDate)}
        </Text>
      </View>

      {/* Date Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Date
          </Text>
          <TextInput
            mode="outlined"
            label="Date"
            value={selectedDate}
            onChangeText={setSelectedDate}
            style={styles.dateInput}
            keyboardType="numeric"
            placeholder="YYYY-MM-DD"
          />
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
              Online Payments
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.onlineAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              {summary.onlineCount} transactions
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Cheque Payments
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.chequeAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              {summary.chequeCount} transactions
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Cash Payments
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.cashAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              {summary.cashCount} transactions
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
                  <DataTable.Title>Time</DataTable.Title>
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
                        {new Date(transaction.payment_date).toLocaleTimeString()}
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
              description="No transactions found for the selected date and filters"
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
  dateInput: {
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
});

export default DailyCollectionReportScreen;
