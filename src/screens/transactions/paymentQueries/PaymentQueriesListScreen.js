import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Card, Text, Chip, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchPaymentQueries, setFilters, clearFilters } from '../../../store/slices/paymentQueriesSlice';

const PaymentQueriesListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters } = useSelector(state => state.paymentQueries);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchPaymentQueries(filters));
  }, [dispatch, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPaymentQueries(filters));
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

  const renderItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PaymentQueryDetails', { id: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.queryDescription}>
              {item.description || `Query #${item.id}`}
            </Text>
            {item.project_name && (
              <Text style={styles.projectName}>{item.project_name}</Text>
            )}
          </View>
          <IconButton
            icon="chevron-right"
            size={20}
            onPress={() => navigation.navigate('PaymentQueryDetails', { id: item.id })}
          />
        </View>

        <View style={styles.cardBody}>
          {item.installment_name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Installment:</Text>
              <Text style={styles.value}>{item.installment_name}</Text>
            </View>
          )}
          
          {item.due_days !== null && item.due_days !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Due Days:</Text>
              <Text style={styles.value}>{item.due_days} days</Text>
            </View>
          )}

          {item.value && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Value:</Text>
              <Text style={styles.value}>
                {item.is_percentage ? `${item.value}%` : `₹${parseFloat(item.value).toLocaleString('en-IN')}`}
              </Text>
            </View>
          )}

          {item.date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>
                {new Date(item.date).toLocaleDateString('en-IN')}
              </Text>
            </View>
          )}
        </View>

        {item.created_by_name && (
          <View style={styles.cardFooter}>
            <Chip icon="account" size={20} style={styles.chip}>
              {item.created_by_name}
            </Chip>
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
          placeholder="Search payment queries..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        {(searchQuery || filters.project_id || filters.installment_id) && (
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
            icon="file-document-outline"
            message="No payment queries found"
            action={{
              label: 'Generate Query',
              onPress: () => navigation.navigate('GeneratePaymentQuery'),
            }}
          />
        }
      />

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('GeneratePaymentQuery')}
        label="Generate"
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
  queryDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: '#666',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default PaymentQueriesListScreen;
