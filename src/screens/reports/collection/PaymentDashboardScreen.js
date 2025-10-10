import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const PaymentDashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCollection: 0,
    todayCollection: 0,
    monthlyCollection: 0,
    totalTransactions: 0,
    onlinePayments: 0,
    chequePayments: 0,
    cashPayments: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch payment dashboard data
      const dashboardResponse = await api.get('/api/transaction/payment/dashboard');
      if (dashboardResponse.data?.success) {
        setStats(dashboardResponse.data.data.stats || {});
        setRecentTransactions(dashboardResponse.data.data.recentTransactions || []);
      }
    } catch (error) {
      console.error('Error fetching payment dashboard data:', error);
      Alert.alert('Error', 'Failed to load payment dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleViewAllTransactions = () => {
    navigation.navigate('Payments', { screen: 'PaymentsList' });
  };

  const handleViewCollectionReport = (type) => {
    switch (type) {
      case 'daily':
        navigation.navigate('Reports', { screen: 'DailyCollectionReport' });
        break;
      case 'monthly':
        navigation.navigate('Reports', { screen: 'MonthlyCollectionReport' });
        break;
      case 'total':
        navigation.navigate('Reports', { screen: 'TotalCollectionReport' });
        break;
      default:
        break;
    }
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
          Payment Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Collection overview and statistics
        </Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['today', 'monthly', 'total'].map((period) => (
          <Chip
            key={period}
            selected={selectedPeriod === period}
            onPress={() => setSelectedPeriod(period)}
            style={[
              styles.periodChip,
              selectedPeriod === period && styles.selectedChip
            ]}
            textStyle={styles.chipText}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Chip>
        ))}
      </View>

      {/* Statistics Cards - First Row */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statTitle}>
              Total Collection
            </Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {formatCurrency(stats.totalCollection)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statTitle}>
              Today's Collection
            </Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {formatCurrency(stats.todayCollection)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Statistics Cards - Second Row */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statTitle}>
              Monthly Collection
            </Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {formatCurrency(stats.monthlyCollection)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statTitle}>
              Total Transactions
            </Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {stats.totalTransactions}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Payment Methods Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Payment Methods
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.paymentMethods}>
            <View style={styles.paymentMethod}>
              <Text variant="bodyLarge">Online</Text>
              <Text variant="titleMedium" style={styles.paymentAmount}>
                {formatCurrency(stats.onlinePayments)}
              </Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text variant="bodyLarge">Cheque</Text>
              <Text variant="titleMedium" style={styles.paymentAmount}>
                {formatCurrency(stats.chequePayments)}
              </Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text variant="bodyLarge">Cash</Text>
              <Text variant="titleMedium" style={styles.paymentAmount}>
                {formatCurrency(stats.cashPayments)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Quick Actions
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={() => handleViewCollectionReport('daily')}
              style={styles.actionButton}
              icon="calendar-today"
            >
              Daily Collection
            </Button>
            <Button
              mode="contained"
              onPress={() => handleViewCollectionReport('monthly')}
              style={styles.actionButton}
              icon="calendar-month"
            >
              Monthly Collection
            </Button>
            <Button
              mode="contained"
              onPress={() => handleViewCollectionReport('total')}
              style={styles.actionButton}
              icon="chart-line"
            >
              Total Collection
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Transactions */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Recent Transactions
            </Text>
            <Button
              mode="text"
              onPress={handleViewAllTransactions}
              compact
            >
              View All
            </Button>
          </View>
          <Divider style={styles.divider} />
          
          {recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text variant="bodyLarge" style={styles.transactionCustomer}>
                      {transaction.customer_name || 'N/A'}
                    </Text>
                    <Text variant="bodyMedium" style={styles.transactionDate}>
                      {formatDate(transaction.payment_date)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text variant="titleMedium" style={styles.amount}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <Chip
                      mode="outlined"
                      compact
                      style={styles.paymentMethodChip}
                    >
                      {transaction.payment_method}
                    </Chip>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              title="No Recent Transactions"
              description="No transactions found for the selected period"
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodChip: {
    backgroundColor: '#F3F4F6',
  },
  selectedChip: {
    backgroundColor: '#EF4444',
  },
  chipText: {
    color: '#374151',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  statTitle: {
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontWeight: 'bold',
    color: '#059669',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionDate: {
    color: '#6B7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    color: '#059669',
  },
  paymentMethodChip: {
    marginTop: 4,
  },
});

export default PaymentDashboardScreen;
