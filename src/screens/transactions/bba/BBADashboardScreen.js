import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Button, Text, Chip, Menu, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchBBAs, setFilters, clearFilters, autoVerify, autoStatusUpdate } from '../../../store/slices/bbaSlice';
// DISABLED: fetchStatistics endpoint doesn't exist in backend
// import { fetchStatistics } from '../../../store/slices/bbaSlice';

const BBADashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters } = useSelector(state => state.bba);
  // DISABLED: statistics not available - endpoint doesn't exist in backend
  // const { statistics } = useSelector(state => state.bba);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const itemsPerPage = 10;

  const filteredBBAs = (list || []).filter(bba => {
    const matchesSearch = 
      (bba.bba_id?.toString() || '').includes(searchQuery) ||
      (bba.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bba.project_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bba.unit_no || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filters.status || bba.status === filters.status;
    const matchesProject = !filters.project_id || bba.project_id === filters.project_id;
    const matchesCustomer = !filters.customer_id || bba.customer_id === filters.customer_id;
    
    return matchesSearch && matchesStatus && matchesProject && matchesCustomer;
  });

  const totalPages = Math.ceil(filteredBBAs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBBAs = filteredBBAs.slice(startIndex, endIndex);

  useEffect(() => {
    dispatch(fetchBBAs(filters));
    // DISABLED: fetchStatistics endpoint doesn't exist in backend
    // dispatch(fetchStatistics());
  }, [dispatch, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchBBAs(filters));
    // DISABLED: fetchStatistics endpoint doesn't exist in backend
    // await dispatch(fetchStatistics());
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

  const handleAutoVerify = async () => {
    setActionMenuVisible(false);
    try {
      await dispatch(autoVerify()).unwrap();
      Alert.alert('Success', 'Auto-verification completed successfully');
      dispatch(fetchBBAs(filters));
      dispatch(fetchStatistics());
    } catch (error) {
      Alert.alert('Error', error || 'Failed to auto-verify BBAs');
    }
  };

  const handleAutoStatusUpdate = async () => {
    setActionMenuVisible(false);
    try {
      await dispatch(autoStatusUpdate()).unwrap();
      Alert.alert('Success', 'Auto-status update completed successfully');
      dispatch(fetchBBAs(filters));
      dispatch(fetchStatistics());
    } catch (error) {
      Alert.alert('Error', error || 'Failed to auto-update BBA statuses');
    }
  };

  const renderBBACard = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('BBAStatus', { bbaId: item.bba_id || item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            BBA #{item.bba_id || item.id}
          </Text>
          <Chip
            mode="flat"
            style={[
              styles.statusChip,
              {
                backgroundColor:
                  item.status === 'completed'
                    ? '#D1FAE5'
                    : item.status === 'pending'
                    ? '#FEF3C7'
                    : '#E0E7FF',
              },
            ]}
          >
            {item.status || 'N/A'}
          </Chip>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>Customer:</Text>
          <Text variant="bodyMedium" style={styles.value}>{item.customer_name || 'N/A'}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>Project:</Text>
          <Text variant="bodyMedium" style={styles.value}>{item.project_name || 'N/A'}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>Unit:</Text>
          <Text variant="bodyMedium" style={styles.value}>{item.unit_no || 'N/A'}</Text>
        </View>

        {item.is_verified && (
          <Chip icon="check-decagram" mode="flat" style={styles.verifiedChip}>
            Verified
          </Chip>
        )}

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditBBA', { bbaId: item.bba_id || item.id })}
            style={styles.actionButton}
          >
            Edit
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('VerifyBBA', { bbaId: item.bba_id || item.id })}
            style={styles.actionButton}
          >
            Verify
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search BBAs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        {/* DISABLED: Statistics not available - endpoint doesn't exist in backend */}
        {/* <View style={styles.statsRow}>
          <Chip icon="file-document" style={styles.statChip}>
            Total: {statistics.total}
          </Chip>
          <Chip icon="clock" style={[styles.statChip, { backgroundColor: '#FEF3C7' }]}>
            Pending: {statistics.pending}
          </Chip>
          <Chip icon="check-decagram" style={[styles.statChip, { backgroundColor: '#D1FAE5' }]}>
            Verified: {statistics.verified}
          </Chip>
          <Chip icon="check-circle" style={[styles.statChip, { backgroundColor: '#E0E7FF' }]}>
            Completed: {statistics.completed}
          </Chip>
        </View> */}

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
            <Menu.Item onPress={() => handleFilterStatus('in_progress')} title="In Progress" />
            <Menu.Item onPress={() => handleFilterStatus('completed')} title="Completed" />
          </Menu>

          <Menu
            visible={actionMenuVisible}
            onDismiss={() => setActionMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setActionMenuVisible(true)}
                icon="cog"
              >
                Actions
              </Button>
            }
          >
            <Menu.Item onPress={handleAutoVerify} title="Auto-Verify" />
            <Menu.Item onPress={handleAutoStatusUpdate} title="Auto-Status Update" />
          </Menu>
          
          {(filters.status || searchQuery) && (
            <Button mode="text" onPress={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </View>
      </View>

      <FlatList
        data={paginatedBBAs}
        renderItem={renderBBACard}
        keyExtractor={(item) => `bba-${item.bba_id || item.id || Math.random()}`}
        ListEmptyComponent={
          <EmptyState
            icon="file-document"
            title="No BBAs"
            message={searchQuery || filters.status ? "No matching BBAs" : "Add your first BBA record"}
            actionText="Add BBA"
            onActionPress={() => navigation.navigate('AddBBA')}
          />
        }
        ListFooterComponent={
          filteredBBAs.length > 0 ? (
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
                  Showing {paginatedBBAs.length} of {filteredBBAs.length}
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
        onPress={() => navigation.navigate('AddBBA')}
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
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  card: { margin: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontWeight: 'bold', flex: 1 },
  statusChip: { marginLeft: 8 },
  cardRow: { flexDirection: 'row', marginBottom: 8 },
  label: { fontWeight: '600', width: 100 },
  value: { flex: 1 },
  verifiedChip: { backgroundColor: '#D1FAE5', marginTop: 8 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1 },
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

export default BBADashboardScreen;
