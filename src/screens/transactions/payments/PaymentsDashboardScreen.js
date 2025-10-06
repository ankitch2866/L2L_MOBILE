import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchPayments, fetchStatistics } from '../../../store/slices/paymentsSlice';

const PaymentsDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, statistics } = useSelector(state => state.payments);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchStatistics());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchPayments()),
      dispatch(fetchStatistics())
    ]);
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
                <Text style={styles.statLabel}>Total Amount</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {formatCurrency(statistics.total_amount)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Payments</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {statistics.total_count || 0}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {statistics.by_method && Object.keys(statistics.by_method).length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>By Payment Method</Title>
              <View style={styles.methodsContainer}>
                {Object.entries(statistics.by_method).map(([method, amount]) => (
                  <View key={method} style={styles.methodRow}>
                    <Chip icon="cash" style={styles.methodChip}>
                      {method.toUpperCase()}
                    </Chip>
                    <Text style={styles.methodAmount}>{formatCurrency(amount)}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

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
});

export default PaymentsDashboardScreen;
