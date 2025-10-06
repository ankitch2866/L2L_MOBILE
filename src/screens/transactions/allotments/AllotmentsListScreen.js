import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import AllotmentCard from '../../../components/transactions/AllotmentCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchAllotments, setFilters, clearFilters, deleteAllotment } from '../../../store/slices/allotmentsSlice';

const AllotmentsListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters } = useSelector(state => state.allotments);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDeleteAllotment = async (allotment) => {
    try {
      await dispatch(deleteAllotment(allotment.id)).unwrap();
      Alert.alert('Success', 'Allotment deleted successfully');
      dispatch(fetchAllotments(filters));
    } catch (error) {
      Alert.alert('Error', error || 'Failed to delete allotment');
    }
  };

  const filteredAllotments = (list || []).filter(allotment => {
    const matchesSearch = 
      (allotment.allotment_number?.toString() || '').includes(searchQuery) ||
      (allotment.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (allotment.unit_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (allotment.project_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = !filters.project_id || allotment.project_id === filters.project_id;
    const matchesCustomer = !filters.customer_id || allotment.customer_id === filters.customer_id;
    const matchesStatus = !filters.status || allotment.status === filters.status;
    
    return matchesSearch && matchesProject && matchesCustomer && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAllotments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAllotments = filteredAllotments.slice(startIndex, endIndex);

  useEffect(() => {
    dispatch(fetchAllotments(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllotments(filters));
    setRefreshing(false);
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
          placeholder="Search allotments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        {(searchQuery || filters.project_id || filters.customer_id || filters.status) && (
          <Button mode="text" onPress={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </View>

      <FlatList
        data={paginatedAllotments}
        renderItem={({ item }) => (
          <AllotmentCard
            allotment={{
              ...item,
              onDelete: handleDeleteAllotment
            }}
            onPress={(a) => navigation.navigate('AllotmentDetails', { allotmentId: a.id })}
            onEdit={(a) => navigation.navigate('EditAllotment', { allotmentId: a.id })}
            theme={theme}
          />
        )}
        keyExtractor={(item) => `allotment-${item.id || Math.random()}`}
        ListEmptyComponent={
          <EmptyState
            icon="file-document"
            title="No Allotments"
            message={searchQuery || filters.project_id ? "No matching allotments" : "Create your first allotment"}
            actionText="Create Allotment"
            onActionPress={() => navigation.navigate('CreateAllotment')}
          />
        }
        ListFooterComponent={
          filteredAllotments.length > 0 ? (
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
                  Showing {paginatedAllotments.length} of {filteredAllotments.length}
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
        onPress={() => navigation.navigate('CreateAllotment')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0, marginBottom: 12 },
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

export default AllotmentsListScreen;
