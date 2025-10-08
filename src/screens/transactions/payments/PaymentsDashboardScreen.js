import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchPayments, fetchStatistics, fetchAllPaymentsForStats } from '../../../store/slices/paymentsSlice';

const PaymentsDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, statistics } = useSelector(state => state.payments);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('PaymentsDashboardScreen: Loading payments and statistics...');
    dispatch(fetchPayments());
    // Use fetchAllPaymentsForStats to get accurate total statistics
    dispatch(fetchAllPaymentsForStats());
  }, [dispatch]);

  useEffect(() => {
    console.log('PaymentsDashboardScreen: Statistics loaded:', statistics);
    console.log('PaymentsDashboardScreen: List loaded:', list);
  }, [statistics, list]);

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('Manual refresh triggered - fetching all payments for statistics...');
    await Promise.all([
      dispatch(fetchPayments()),
      dispatch(fetchAllPaymentsForStats())
    ]);
    setRefreshing(false);
  };

  const handleForceRefreshStats = async () => {
    console.log('Force refresh statistics triggered...');
    await dispatch(fetchAllPaymentsForStats());
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Use statistics from Redux store (calculated from all payments)
  const displayStats = statistics || {
    total_amount: 0,
    transaction_count: 0,
    online_amount: 0,
    cheque_amount: 0
  };

  console.log('Display stats:', displayStats);
  console.log('API statistics:', statistics);
  console.log('Payments list:', list);

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
      }
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Payment Statistics</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Payment</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {formatCurrency(displayStats.total_amount)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Transaction Count</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {displayStats.transaction_count}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>


        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => navigation.navigate('PaymentEntry')}
                style={styles.actionButton}
              >
                New Payment
              </Button>
              <Button
                mode="outlined"
                icon="format-list-bulleted"
                onPress={() => navigation.navigate('PaymentsList')}
                style={styles.actionButton}
              >
                View All
              </Button>
              <Button
                mode="outlined"
                icon="checkbook"
                onPress={() => navigation.navigate('Cheques', { screen: 'ChequesDashboard' })}
                style={styles.actionButton}
              >
                Cheque Management
              </Button>
              <Button
                mode="outlined"
                icon="credit-card"
                onPress={() => navigation.navigate('CreditPayment')}
                style={styles.actionButton}
              >
                Credit Payment
              </Button>
              <Button
                mode="outlined"
                icon="account-search"
                onPress={() => navigation.navigate('CustomerPayments')}
                style={styles.actionButton}
              >
                Customer Payments
              </Button>
            </View>
            
            {/* Debug Section */}
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>Debug Statistics</Text>
              <Button
                mode="text"
                icon="refresh"
                onPress={handleForceRefreshStats}
                style={styles.debugButton}
                textColor="#666"
              >
                Force Refresh Stats
              </Button>
              <Text style={styles.debugText}>
                Current: {displayStats.transaction_count} payments, {formatCurrency(displayStats.total_amount)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Recent Payments</Title>
            {list.slice(0, 5).map((payment) => (
              <View key={payment.id} style={styles.recentItem}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentCustomer}>{payment.customer_name || 'N/A'}</Text>
                  <Text style={styles.recentDate}>
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <Text style={[styles.recentAmount, { color: theme.colors.primary }]}>
                  {formatCurrency(payment.amount)}
                </Text>
              </View>
            ))}
            {list.length === 0 && (
              <Text style={styles.emptyText}>No recent payments</Text>
            )}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  methodsContainer: { marginTop: 16 },
  methodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  methodChip: { flex: 0 },
  methodAmount: { fontSize: 16, fontWeight: '600' },
  actionsGrid: { marginTop: 16, gap: 12 },
  actionButton: { marginBottom: 8 },
  recentItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  recentInfo: { flex: 1 },
  recentCustomer: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  recentDate: { fontSize: 14, color: '#6B7280' },
  recentAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 16 },
  debugSection: { marginTop: 16, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  debugTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  debugButton: { marginBottom: 8 },
  debugText: { fontSize: 12, color: '#6B7280' },
});

export default PaymentsDashboardScreen;
