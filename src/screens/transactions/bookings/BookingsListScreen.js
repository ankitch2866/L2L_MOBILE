import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Button, Text, Chip, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import BookingCard from '../../../components/transactions/BookingCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchBookings, setFilters, clearFilters, deleteBooking } from '../../../store/slices/bookingsSlice';

const BookingsListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters, statistics } = useSelector(state => state.bookings);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const itemsPerPage = 10;

  const handleDeleteBooking = async (booking) => {
    try {
      await dispatch(deleteBooking(booking.booking_id)).unwrap();
      Alert.alert('Success', 'Booking deleted successfully');
      dispatch(fetchBookings(filters));
    } catch (error) {
      Alert.alert('Error', error || 'Failed to delete booking');
    }
  };

  const filteredBookings = (list || []).filter(booking => {
    const matchesSearch = 
      (booking.booking_id?.toString() || '').includes(searchQuery) ||
      (booking.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.unit_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.project_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filters.status || booking.status === filters.status;
    const matchesProject = !filters.project_id || booking.project_id === filters.project_id;
    const matchesCustomer = !filters.customer_id || booking.customer_id === filters.customer_id;
    
    return matchesSearch && matchesStatus && matchesProject && matchesCustomer;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  useEffect(() => {
    dispatch(fetchBookings(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchBookings(filters));
    setRefreshing(false);
  };

  const handleFilterStatus = (status) => {
    dispatch(setFilters({ status: status === filters.status ? null : status }));
    setFilterMenuVisible(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
  };

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search bookings..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.statsRow}>
          <Chip icon="file-document" style={styles.statChip}>
            Total: {statistics.total}
          </Chip>
          <Chip icon="clock-outline" style={[styles.statChip, { backgroundColor: '#FEF3C7' }]}>
            Pending: {statistics.pending}
          </Chip>
          <Chip icon="check-circle" style={[styles.statChip, { backgroundColor: '#D1FAE5' }]}>
            Confirmed: {statistics.confirmed}
          </Chip>
          <Chip icon="close-circle" style={[styles.statChip, { backgroundColor: '#FEE2E2' }]}>
            Cancelled: {statistics.cancelled}
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
                Filter by Status
              </Button>
            }
          >
            <Menu.Item onPress={() => handleFilterStatus('pending')} title="Pending" />
            <Menu.Item onPress={() => handleFilterStatus('confirmed')} title="Confirmed" />
            <Menu.Item onPress={() => handleFilterStatus('cancelled')} title="Cancelled" />
          </Menu>
          
          {(filters.status || searchQuery) && (
            <Button mode="text" onPress={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </View>
      </View>

      <FlatList
        data={paginatedBookings}
        renderItem={({ item }) => (
          <BookingCard
            booking={{
              ...item,
              onDelete: handleDeleteBooking
            }}
            onPress={(b) => navigation.navigate('BookingDetails', { bookingId: b.booking_id })}
            onEdit={(b) => navigation.navigate('EditBooking', { bookingId: b.booking_id })}
            theme={theme}
          />
        )}
        keyExtractor={(item) => `booking-${item.booking_id || item.id || Math.random()}`}
        ListEmptyComponent={
          <EmptyState
            icon="file-document"
            title="No Bookings"
            message={searchQuery || filters.status ? "No matching bookings" : "Create your first booking"}
            actionText="Create Booking"
            onActionPress={() => navigation.navigate('CreateBooking')}
          />
        }
        ListFooterComponent={
          filteredBookings.length > 0 ? (
            <View style={styles.paginationContainer}>
              <Button
                mode="outlined"
                onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 1}
                style={styles.paginationButton}
              >
                Previous
              </Button>
              <View style={styles.pageInfo}>
                <Text variant="bodyMedium" style={styles.pageText}>
                  Page {currentPage} of {totalPages}
                </Text>
                <Text variant="bodySmall" style={styles.totalText}>
                  Showing {paginatedBookings.length} of {filteredBookings.length}
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 1}
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
        onPress={() => navigation.navigate('CreateBooking')}
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

export default BookingsListScreen;
