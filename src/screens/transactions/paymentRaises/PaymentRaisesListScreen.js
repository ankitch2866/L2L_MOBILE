import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Card, Text, Chip, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchPaymentRaises, setFilters, clearFilters } from '../../../store/slices/paymentRaisesSlice';

const PaymentRaisesListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters } = useSelector(state => state.paymentRaises);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchPaymentRaises(filters));
  }, [dispatch, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPaymentRaises(filters));
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    dispatch(setFilters({ search: query, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    dispatch(clearFilters());
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'paid':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const renderItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PaymentRaiseDetails', { id: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.raiseTitle}>
              Raise #{item.id}
            </Text>
            {item.customer_name && (
              <Text style={styles.customerName}>{item.customer_name}</Text>
            )}
          </View>
          <IconButton
            icon="chevron-right"
            size={20}
            onPress={() => navigation.navigate('PaymentRaiseDetails', { id: item.id })}
          />
        </View>

        <View style={styles.cardBody}>
          {item.project_name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Project:</Text>
              <Text style={styles.value}>{item.project_name}</Text>
            </View>
          )}

          {item.amount && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={[styles.value, styles.amount]}>
                ₹{parseFloat(item.amount).toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          {item.due_date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>
                {new Date(item.due_date).toLocaleDateString('en-IN')}
              </Text>
            </View>
          )}

          {item.status && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusText}
              >
                {item.status}
              </Chip>
            </View>
          )}
        </View>

        {item.created_at && (
          <View style={styles.cardFooter}>
            <Text style={styles.dateText}>
              Created: {new Date(item.created_at).toLocaleDateString('en-IN')}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search payment raises..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        {(searchQuery || filters.project_id || filters.customer_id || filters.status) && (
          <IconButton
            icon="filter-remove"
            size={24}
            onPress={handleClearFilters}
          />
        )}
      </View>

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="cash-multiple"
            message="No payment raises found"
            action={{
              label: 'Create Raise',
              onPress: () => navigation.navigate('CreatePaymentRaise'),
            }}
          />
        }
      />

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('CreatePaymentRaise')}
        label="Create"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchbar: {
    flex: 1,
    elevation: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  raiseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default PaymentRaisesListScreen;
