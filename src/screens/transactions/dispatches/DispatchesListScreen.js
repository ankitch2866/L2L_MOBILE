import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Button, Text, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import DispatchCard from '../../../components/transactions/DispatchCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchDispatches, setFilters, clearFilters, deleteDispatch } from '../../../store/slices/dispatchesSlice';

const DispatchesListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters } = useSelector(state => state.dispatches);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customerTypeMenuVisible, setCustomerTypeMenuVisible] = useState(false);
  const [modeMenuVisible, setModeMenuVisible] = useState(false);
  const itemsPerPage = 10;

  const handleDeleteDispatch = async (dispatchItem) => {
    Alert.alert(
      'Delete Dispatch',
      'Are you sure you want to delete this dispatch?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteDispatch(dispatchItem.id)).unwrap();
              Alert.alert('Success', 'Dispatch deleted successfully');
              dispatch(fetchDispatches(filters));
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete dispatch');
            }
          },
        },
      ]
    );
  };

  const filteredDispatches = (list || []).filter(dispatchItem => {
    const matchesSearch = 
      (dispatchItem.id?.toString() || '').includes(searchQuery) ||
      (dispatchItem.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dispatchItem.letterType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dispatchItem.unitNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dispatchItem.consignmentNo || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomerType = !filters.customer_type || dispatchItem.customerType === filters.customer_type;
    const matchesLetterType = !filters.letter_type || dispatchItem.letterType === filters.letter_type;
    
    return matchesSearch && matchesCustomerType && matchesLetterType;
  });

  const totalPages = Math.ceil(filteredDispatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDispatches = filteredDispatches.slice(startIndex, endIndex);

  useEffect(() => {
    dispatch(fetchDispatches(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchDispatches(filters));
    setRefreshing(false);
  };

  const handleFilterCustomerType = (type) => {
    dispatch(setFilters({ customer_type: type === filters.customer_type ? null : type }));
    setCustomerTypeMenuVisible(false);
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
          placeholder="Search dispatches..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <View style={styles.filterRow}>
          <Menu
            visible={customerTypeMenuVisible}
            onDismiss={() => setCustomerTypeMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setCustomerTypeMenuVisible(true)}
                icon="account"
                style={styles.filterButton}
              >
                Customer Type
              </Button>
            }
          >
            <Menu.Item onPress={() => handleFilterCustomerType('INDIVIDUAL')} title="Individual" />
            <Menu.Item onPress={() => handleFilterCustomerType('COMPANY')} title="Company" />
            <Menu.Item onPress={() => handleFilterCustomerType('PARTNERSHIP')} title="Partnership" />
            <Menu.Item onPress={() => handleFilterCustomerType('PROPRIETORSHIP')} title="Proprietorship" />
          </Menu>
          
          {(filters.customer_type || filters.letter_type || searchQuery) && (
            <Button mode="text" onPress={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </View>

        <View style={styles.statsRow}>
          <Text variant="bodyMedium" style={styles.statsText}>
            Total Dispatches: {filteredDispatches.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={paginatedDispatches}
        renderItem={({ item }) => (
          <DispatchCard
            dispatch={item}
            onPress={(d) => navigation.navigate('DispatchDetails', { dispatchId: d.id })}
            onEdit={(d) => navigation.navigate('EditDispatch', { dispatchId: d.id })}
            onDelete={handleDeleteDispatch}
            theme={theme}
          />
        )}
        keyExtractor={(item) => `dispatch-${item.id || Math.random()}`}
        ListEmptyComponent={
          <EmptyState
            icon="truck-delivery"
            title="No Dispatches"
            message={searchQuery || filters.customer_type ? "No matching dispatches" : "Create your first dispatch"}
            actionText="Create Dispatch"
            onActionPress={() => navigation.navigate('CreateDispatch')}
          />
        }
        ListFooterComponent={
          filteredDispatches.length > 0 ? (
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
                  Showing {paginatedDispatches.length} of {filteredDispatches.length}
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
        onPress={() => navigation.navigate('CreateDispatch')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0, marginBottom: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  filterButton: { flex: 1 },
  statsRow: { marginTop: 8 },
  statsText: { color: '#6B7280', fontWeight: '600' },
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

export default DispatchesListScreen;
