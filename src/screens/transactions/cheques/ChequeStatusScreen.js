import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Searchbar, FAB, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchCheques, setFilters } from '../../../store/slices/chequesSlice';

const ChequeStatusScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters, pagination } = useSelector(state => state.cheques);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const paginationParams = {
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    };
    dispatch(fetchCheques(paginationParams));
  }, [dispatch, filters, currentPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const paginationParams = {
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    };
    await dispatch(fetchCheques(paginationParams));
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    dispatch(setFilters({ search: query }));
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
    dispatch(setFilters({ status: status === 'all' ? null : status }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';
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

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Cleared', value: 'cleared' },
    { label: 'Bounced', value: 'bounced' },
  ];

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search cheques..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {statusFilters.map((filter) => (
          <Chip
            key={filter.value}
            selected={selectedStatus === filter.value}
            onPress={() => handleStatusFilter(filter.value)}
            style={styles.filterChip}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {list.length === 0 ? (
          <EmptyState message="No cheques found" icon="check-circle" />
        ) : (
          list.map((cheque) => (
            <TouchableOpacity
              key={cheque.cheque_id}
              onPress={() => navigation.navigate('ChequeDetails', { chequeId: cheque.cheque_id })}
            >
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.chequeNumber}>#{cheque.cheque_no}</Text>
                      <Text style={styles.bankName}>{cheque.bank_name || 'N/A'}</Text>
                    </View>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(cheque.cheque_status) }]}
                      textStyle={styles.statusText}
                    >
                      {cheque.cheque_status || 'Pending'}
                    </Chip>
                  </View>
                  
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Customer:</Text>
                      <Text style={styles.value}>{cheque.customer_name || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Amount:</Text>
                      <Text style={[styles.value, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                        {formatCurrency(cheque.amount)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Cheque Date:</Text>
                      <Text style={styles.value}>{formatDate(cheque.cheque_date)}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </Text>
          </View>
          <View style={styles.paginationButtons}>
            <Button
              mode="outlined"
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              style={styles.paginationButton}
            >
              Previous
            </Button>
            <Text style={styles.pageNumber}>{currentPage}</Text>
            <Button
              mode="outlined"
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              style={styles.paginationButton}
            >
              Next
            </Button>
          </View>
        </View>
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ChequeDeposit')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchBar: { elevation: 2 },
  filterContainer: { paddingHorizontal: 16, paddingBottom: 8, maxHeight: 50 },
  filterChip: { marginRight: 8 },
  listContainer: { flex: 1, padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardHeaderLeft: { flex: 1 },
  chequeNumber: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  bankName: { fontSize: 14, color: '#6B7280' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, minHeight: 24 },
  statusText: { fontSize: 11, color: '#FFF', fontWeight: '600', textAlign: 'center' },
  cardBody: { gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  paginationContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  paginationButton: {
    minWidth: 80,
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    paddingHorizontal: 12,
  },
});

export default ChequeStatusScreen;
