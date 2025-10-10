import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context';
import CustomerCard from '../../components/customers/CustomerCard';
import { LoadingIndicator, EmptyState } from '../../components';
import { fetchCustomers, setSearchQuery } from '../../store/slices/customersSlice';

const CustomersListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { customers, loading, searchQuery } = useSelector(state => state.customers);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCustomers = (customers || []).filter(c =>
    (c.name || c.customer_name || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone_no || c.mobile_number || '')?.includes(searchQuery) ||
    (c.email || '')?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCustomers());
    setRefreshing(false);
  };

  if (loading && customers.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search customers..."
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={paginatedCustomers}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={(c) => navigation.navigate('CustomerDetails', { customerId: c.customer_id })}
            onEdit={(c) => navigation.navigate('EditCustomer', { customerId: c.customer_id })}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.customer_id?.toString()}
        ListEmptyComponent={
          <EmptyState
            icon="account"
            title="No Customers"
            message={searchQuery ? "No matching customers" : "Add your first customer"}
            actionText="Add Customer"
            onActionPress={() => navigation.navigate('AddCustomer')}
          />
        }
        ListFooterComponent={
          filteredCustomers.length > 0 ? (
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
                  Showing {paginatedCustomers.length} of {filteredCustomers.length}
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
        onPress={() => navigation.navigate('AddCustomer')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 16, 
    paddingBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchbar: { 
    elevation: 0,
    borderRadius: 12,
  },
  fab: { 
    position: 'absolute', 
    margin: 16, 
    right: 0, 
    bottom: 0,
    borderRadius: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 80,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paginationButton: {
    minWidth: 100,
    borderRadius: 8,
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  totalText: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 12,
  },
});

export default CustomersListScreen;
