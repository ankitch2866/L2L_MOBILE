import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Button, Chip, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Icon as PaperIcon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
// import { fetchCreditPayments, fetchCreditPaymentStats } from '../../../store/slices/paymentsSlice';

const CreditPaymentDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { creditPayments, loading, creditStats } = useSelector(state => state.payments);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // DISABLED: Credit payment functions don't exist in backend
    // dispatch(fetchCreditPayments());
    // dispatch(fetchCreditPaymentStats());
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 10, padding: 8 }}
          >
            <PaperIcon source="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      });
    }, [navigation])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // DISABLED: Credit payment functions don't exist in backend
    // await Promise.all([
    //   dispatch(fetchCreditPayments()),
    //   dispatch(fetchCreditPaymentStats())
    // ]);
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>{creditStats?.total || 0}</Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>Total</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#10B981' }]}>{creditStats?.completed || 0}</Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>Completed</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#F59E0B' }]}>{creditStats?.pending || 0}</Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>Pending</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Credit Payments List */}
        <View style={styles.listContainer}>
          {creditPayments && creditPayments.length > 0 ? (
            creditPayments.map((payment) => (
              <Card key={payment.credit_id} style={[styles.paymentCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.paymentHeader}>
                    <View style={styles.customerInfo}>
                      <Text variant="titleMedium" style={[styles.customerName, { color: theme.colors.onSurface }]}>
                        {payment.customer_name || 'Unknown Customer'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.projectName, { color: theme.colors.onSurfaceVariant }]}>
                        {payment.project_name || 'No Project'}
                      </Text>
                    </View>
                    <Chip style={[styles.typeChip, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Text style={{ color: theme.colors.onPrimaryContainer }}>{payment.credit_type || 'Unknown'}</Text>
                    </Chip>
                  </View>

                  <View style={styles.amountRow}>
                    <Text variant="headlineSmall" style={[styles.amount, { color: '#10B981' }]}>
                      {formatCurrency(payment.credit_amount)}
                    </Text>
                    <Chip style={[styles.statusChip, { backgroundColor: payment.status === 'completed' ? '#D1FAE5' : '#FEF3C7' }]}>
                      <Text style={{ color: payment.status === 'completed' ? '#065F46' : '#92400E' }}>{payment.status || 'Unknown'}</Text>
                    </Chip>
                  </View>

                  {payment.reason && (
                    <Text variant="bodyMedium" style={[styles.reason, { color: theme.colors.onSurface }]}>
                      {payment.reason}
                    </Text>
                  )}

                  {payment.reference_payment_id && (
                    <View style={styles.referenceContainer}>
                      <Text variant="bodySmall" style={[styles.referenceLabel, { color: theme.colors.onSurfaceVariant }]}>Reference Payment:</Text>
                      <Text variant="bodySmall" style={[styles.referenceValue, { color: theme.colors.primary }]}>
                        #{payment.reference_payment_id}
                      </Text>
                    </View>
                  )}

                  <View style={styles.metaInfo}>
                    <Text variant="bodySmall" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(payment.created_at)}
                    </Text>
                    <Text variant="bodySmall" style={[styles.createdByText, { color: theme.colors.onSurfaceVariant }]}>
                      By: {payment.created_by || 'Unknown'}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('CreditPaymentDetails', { creditId: payment.credit_id })}
                      style={styles.actionButton}
                      compact
                    >
                      View
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('CreditPayment', { creditId: payment.credit_id })}
                      style={styles.actionButton}
                      compact
                    >
                      Edit
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.emptyContent}>
                <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>No Credit Payments</Text>
                <Text variant="bodyMedium" style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
                  No credit payments found. Start by adding a new credit payment.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('CreditPayment')}
                  style={styles.emptyButton}
                  buttonColor={theme.colors.primary}
                >
                  Add Credit Payment
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreditPayment')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    elevation: 2,
    minHeight: 100,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  paymentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: 'bold',
  },
  projectName: {
    marginTop: 2,
  },
  typeChip: {
    borderRadius: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontWeight: 'bold',
  },
  statusChip: {
    borderRadius: 12,
  },
  reason: {
    marginBottom: 8,
    lineHeight: 20,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  referenceLabel: {
    marginRight: 8,
  },
  referenceValue: {
    fontWeight: '500',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  dateText: {
    // Color will be set dynamically
  },
  createdByText: {
    // Color will be set dynamically
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default CreditPaymentDashboardScreen;