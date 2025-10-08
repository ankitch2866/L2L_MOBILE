import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Button, Text, Chip, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchPayments, setFilters, clearFilters, deletePayment, updateLocalStatistics, fetchAllPaymentsForStats } from '../../../store/slices/paymentsSlice';

const PaymentsListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters, statistics, totalCount } = useSelector(state => state.payments);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const itemsPerPage = 10;

  const paymentMethods = ['cash', 'cheque', 'online', 'card', 'upi'];

  // Server-side pagination with client-side fallback
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  
  // If totalCount equals list length, backend might not support pagination
  // In that case, do client-side pagination
  const isClientSidePagination = totalCount === list.length && list.length > itemsPerPage;
  
  let paginatedPayments = list || [];
  if (isClientSidePagination) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedPayments = list.slice(startIndex, endIndex);
    console.log('Using client-side pagination:', { startIndex, endIndex, totalCount, listLength: list.length });
  }
  
  // Ensure currentPage is within bounds
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  useEffect(() => {
    // Only send pagination params if not doing client-side pagination
    const paginationParams = {
      ...filters,
      search: searchQuery
    };
    
    // Add pagination params only if backend supports it
    if (!isClientSidePagination) {
      paginationParams.page = safeCurrentPage;
      paginationParams.limit = itemsPerPage;
    }
    
    console.log('Fetching payments with pagination:', paginationParams);
    console.log('Total count:', totalCount, 'Total pages:', totalPages, 'Current page:', currentPage, 'Safe page:', safeCurrentPage);
    console.log('Client-side pagination:', isClientSidePagination);
    dispatch(fetchPayments(paginationParams));
  }, [dispatch, filters, safeCurrentPage, searchQuery, isClientSidePagination]);

  // Reset page if it's out of bounds
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      console.log('Page out of bounds, resetting to page 1');
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (list.length > 0) {
      dispatch(updateLocalStatistics());
    }
  }, [list, dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  // Fetch all payments for statistics on component mount
  useEffect(() => {
    dispatch(fetchAllPaymentsForStats());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const paginationParams = {
      ...filters,
      search: searchQuery
    };
    
    // Add pagination params only if backend supports it
    if (!isClientSidePagination) {
      paginationParams.page = safeCurrentPage;
      paginationParams.limit = itemsPerPage;
    }
    
    console.log('Refreshing with pagination:', paginationParams);
    await Promise.all([
      dispatch(fetchPayments(paginationParams)),
      dispatch(fetchAllPaymentsForStats())
    ]);
    setRefreshing(false);
  };

  const handleFilterMethod = (method) => {
    dispatch(setFilters({ payment_method: method === filters.payment_method ? null : method }));
    setFilterMenuVisible(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
  };

  const handlePageChange = (newPage) => {
    const safeNewPage = Math.max(1, Math.min(newPage, totalPages));
    console.log('Changing page from', currentPage, 'to', safeNewPage, 'of', totalPages);
    setCurrentPage(safeNewPage);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderPaymentCard = ({ item }) => (
    <View
      style={[styles.card, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.paymentId}>Payment #{item.payment_id || item.id}</Text>
        {item.payment_method && (
          <Chip icon="cash" mode="outlined" compact>
            {item.payment_method.toUpperCase()}
          </Chip>
        )}
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.customer_name || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={[styles.amount, { color: theme.colors.primary }]}>
            {formatCurrency(item.amount)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {item.payment_date ? new Date(item.payment_date).toLocaleDateString() : 'Not specified'}
          </Text>
        </View>
        {item.project_name && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Project:</Text>
            <Text style={styles.value}>{item.project_name}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <Button
          mode="text"
          onPress={() => navigation.navigate('PaymentDetails', { paymentId: item.payment_id || item.id })}
          compact
        >
          View Details
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.navigate('EditPayment', { paymentId: item.payment_id || item.id })}
          compact
        >
          Edit
        </Button>
      </View>
    </View>
  );

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search payments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.statsRow}>
          <Chip icon="cash-multiple" style={styles.statChip}>
            Total: {formatCurrency(statistics.total_amount || 0)}
          </Chip>
          <Chip icon="file-document" style={styles.statChip}>
            Count: {statistics.transaction_count || 0}
          </Chip>
        </View>

        <View style={styles.filterRow}>
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setFilterMenuVisible(true)}
                icon="filter"
              >
                Filter by Method
              </Button>
            }
          >
            {paymentMethods.map(method => (
              <Menu.Item
                key={method}
                onPress={() => handleFilterMethod(method)}
                title={method.toUpperCase()}
              />
            ))}
          </Menu>
          
          {(filters.payment_method || searchQuery) && (
            <Button mode="text" onPress={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </View>
      </View>

      <FlatList
        data={paginatedPayments}
        renderItem={renderPaymentCard}
        keyExtractor={(item) => `payment-${item.payment_id || item.id || Math.random()}`}
        ListEmptyComponent={
          <EmptyState
            icon="cash-remove"
            title="No Payments"
            message={searchQuery || filters.payment_method ? "No matching payments" : "Record your first payment"}
            actionText="Record Payment"
            onActionPress={() => navigation.navigate('PaymentEntry')}
          />
        }
        ListFooterComponent={
          paginatedPayments.length > 0 ? (
            <View style={styles.paginationContainer}>
              <Button
                mode="outlined"
                onPress={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1 || totalPages === 1}
                style={styles.paginationButton}
              >
                Previous
              </Button>
              <View style={styles.pageInfo}>
                <Text variant="bodyMedium" style={styles.pageText}>
                  Page {safeCurrentPage} of {totalPages}
                </Text>
                <Text variant="bodySmall" style={styles.totalText}>
                  Showing {paginatedPayments.length} of {totalCount} total payments
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages || totalPages === 1}
                style={styles.paginationButton}
              >
                Next
              </Button>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('PaymentEntry')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0, marginBottom: 12 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  statChip: { flex: 0 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: { margin: 8, marginHorizontal: 16, padding: 16, borderRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paymentId: { fontSize: 16, fontWeight: 'bold' },
  cardBody: { gap: 8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 14, fontWeight: '500' },
  amount: { fontSize: 18, fontWeight: 'bold' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 80,
  },
  paginationButton: { minWidth: 100 },
  pageInfo: { alignItems: 'center' },
  pageText: { fontWeight: 'bold' },
  totalText: { color: '#6B7280', marginTop: 4 },
});

export default PaymentsListScreen;
