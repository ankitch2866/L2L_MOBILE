import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Text, Card, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchTransfers } from '../../../store/slices/unitTransfersSlice';

const UnitTransfersListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading } = useSelector(state => state.unitTransfers);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchTransfers());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTransfers());
    setRefreshing(false);
  };

  const filteredTransfers = (list || []).filter(transfer => {
    const matchesSearch = 
      (transfer.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transfer.unit_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transfer.project_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transfer.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const renderTransferCard = ({ item }) => (
    <Card 
      style={styles.card}
      onPress={() => navigation.navigate('UnitTransferDetails', { transactionId: item.transactionId })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            {item.unit_name || 'N/A'}
          </Text>
          <Chip 
            mode="flat" 
            style={[styles.statusChip, { backgroundColor: item.is_verified ? '#D1FAE5' : '#FEF3C7' }]}
            textStyle={{ fontSize: 12 }}
          >
            {item.is_verified ? 'Verified' : 'Pending'}
          </Chip>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Project:</Text>
          <Text variant="bodyMedium">{item.project_name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Customer:</Text>
          <Text variant="bodyMedium">{item.customer_name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>New Owner:</Text>
          <Text variant="bodyMedium">{item.owner_name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Transfer Charges:</Text>
          <Text variant="bodyMedium" style={styles.amount}>
            ₹{parseFloat(item.transferCharges || 0).toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Transfer Date:</Text>
          <Text variant="bodyMedium">
            {item.transferDate ? new Date(item.transferDate).toLocaleDateString('en-IN') : 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Payment Mode:</Text>
          <Text variant="bodyMedium">{item.payment_mode || 'N/A'}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search transfers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.statsRow}>
          <Chip icon="swap-horizontal" style={styles.statChip}>
            Total: {list.length}
          </Chip>
        </View>
      </View>

      <FlatList
        data={filteredTransfers}
        renderItem={renderTransferCard}
        keyExtractor={(item) => `transfer-${item.id || item.transactionId || Math.random()}`}
        ListEmptyComponent={
          <EmptyState
            icon="swap-horizontal"
            title="No Unit Transfers"
            message={searchQuery ? "No matching transfers" : "Create your first unit transfer"}
            actionText="Create Transfer"
            onActionPress={() => navigation.navigate('CreateUnitTransfer')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateUnitTransfer')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0, marginBottom: 12 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statChip: { flex: 0 },
  listContent: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 12, elevation: 2 },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontWeight: 'bold', flex: 1 },
  statusChip: { marginLeft: 8 },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: { color: '#6B7280', flex: 1 },
  amount: { fontWeight: 'bold', color: '#059669' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default UnitTransfersListScreen;
