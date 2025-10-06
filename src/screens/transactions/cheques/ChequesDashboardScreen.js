import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchCheques, fetchStatistics } from '../../../store/slices/chequesSlice';

const ChequesDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, statistics } = useSelector(state => state.cheques);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchCheques());
    dispatch(fetchStatistics());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchCheques()),
      dispatch(fetchStatistics())
    ]);
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'cleared': return '#10B981';
      case 'bounced':
      case 'bounce': return '#EF4444';
      case 'submitted':
      case 'sent to bank': return '#F59E0B';
      case 'cancelled': return '#6B7280';
      default: return '#3B82F6';
    }
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
            <Title>Cheque Statistics</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Amount</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {formatCurrency(statistics.total_amount)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Cheques</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {statistics.total_count || 0}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Status Overview</Title>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Chip icon="clock-outline" style={[styles.statusChip, { backgroundColor: '#DBEAFE' }]}>
                  Pending
                </Chip>
                <Text style={styles.statusCount}>{statistics.pending_count || 0}</Text>
                <Text style={styles.statusAmount}>{formatCurrency(statistics.pending_amount)}</Text>
              </View>
              <View style={styles.statusItem}>
                <Chip icon="bank" style={[styles.statusChip, { backgroundColor: '#FEF3C7' }]}>
                  Submitted
                </Chip>
                <Text style={styles.statusCount}>{statistics.submitted_count || 0}</Text>
              </View>
              <View style={styles.statusItem}>
                <Chip icon="check-circle" style={[styles.statusChip, { backgroundColor: '#D1FAE5' }]}>
                  Cleared
                </Chip>
                <Text style={styles.statusCount}>{statistics.cleared_count || 0}</Text>
                <Text style={styles.statusAmount}>{formatCurrency(statistics.cleared_amount)}</Text>
              </View>
              <View style={styles.statusItem}>
                <Chip icon="close-circle" style={[styles.statusChip, { backgroundColor: '#FEE2E2' }]}>
                  Bounced
                </Chip>
                <Text style={styles.statusCount}>{statistics.bounced_count || 0}</Text>
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
                onPress={() => navigation.navigate('ChequeDeposit')}
                style={styles.actionButton}
              >
                New Cheque
              </Button>
              <Button
                mode="outlined"
                icon="format-list-bulleted"
                onPress={() => navigation.navigate('ChequesList')}
                style={styles.actionButton}
              >
                View All
              </Button>
              <Button
                mode="outlined"
                icon="credit-card"
                onPress={() => navigation.navigate('Payments', { screen: 'PaymentsDashboard' })}
                style={styles.actionButton}
              >
                Payment Management
              </Button>
              <Button
                mode="outlined"
                icon="bank-transfer"
                onPress={() => navigation.navigate('ChequeStatus')}
                style={styles.actionButton}
              >
                Update Status
              </Button>
              <Button
                mode="outlined"
                icon="comment-text"
                onPress={() => navigation.navigate('ChequeFeedback')}
                style={styles.actionButton}
              >
                Bank Feedback
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Recent Cheques</Title>
            {list.slice(0, 5).map((cheque) => (
              <View key={cheque.cheque_id} style={styles.recentItem}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentNumber}>#{cheque.cheque_number || 'N/A'}</Text>
                  <Text style={styles.recentBank}>{cheque.bank_name || 'N/A'}</Text>
                  <Text style={styles.recentDate}>
                    {cheque.cheque_date ? new Date(cheque.cheque_date).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.recentRight}>
                  <Text style={[styles.recentAmount, { color: theme.colors.primary }]}>
                    {formatCurrency(cheque.amount)}
                  </Text>
                  <Chip
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(cheque.status) }]}
                    textStyle={styles.statusBadgeText}
                  >
                    {cheque.status || 'Pending'}
                  </Chip>
                </View>
              </View>
            ))}
            {list.length === 0 && (
              <Text style={styles.emptyText}>No recent cheques</Text>
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
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 12 },
  statusItem: { alignItems: 'center', width: '45%', marginBottom: 12 },
  statusChip: { marginBottom: 8 },
  statusCount: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statusAmount: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  actionsGrid: { marginTop: 16, gap: 12 },
  actionButton: { marginBottom: 8 },
  recentItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  recentInfo: { flex: 1 },
  recentNumber: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  recentBank: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  recentDate: { fontSize: 12, color: '#9CA3AF' },
  recentRight: { alignItems: 'flex-end' },
  recentAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, height: 24 },
  statusBadgeText: { fontSize: 11, color: '#FFF', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 16 },
});

export default ChequesDashboardScreen;
