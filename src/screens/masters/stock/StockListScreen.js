import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Button, Dialog, Portal, Text, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import StockCard from '../../../components/masters/StockCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchStocks, deleteStock, setFilters, clearFilters } from '../../../store/slices/stocksSlice';

const StockListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, filters, projects } = useSelector(state => state.stocks);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectMenuVisible, setProjectMenuVisible] = useState(false);

  const filteredStocks = (list || []).filter(stock => {
    const matchesSearch = 
      stock.unit_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      stock.project_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      stock.broker_name?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesProject = !filters.project_id || stock.project_id === filters.project_id;
    const matchesStatus = !filters.status || stock.unit_status === filters.status;
    
    return matchesSearch && matchesProject && matchesStatus;
  });

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = () => {
    dispatch(fetchStocks({ 
      search: filters.search,
      project_id: filters.project_id 
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchStocks({ 
      search: filters.search,
      project_id: filters.project_id 
    }));
    setRefreshing(false);
  };

  const handleDeletePress = (stock) => {
    setSelectedStock(stock);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedStock) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteStock(selectedStock.stock_id)).unwrap();
      Alert.alert('Success', 'Stock deleted successfully and unit status updated to free');
      setDeleteDialogVisible(false);
      setSelectedStock(null);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to delete stock');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setSelectedStock(null);
  };

  const handleProjectFilter = (projectId) => {
    dispatch(setFilters({ project_id: projectId }));
    setProjectMenuVisible(false);
    loadStocks();
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    loadStocks();
  };

  const getSelectedProjectName = () => {
    if (!filters.project_id) return 'All Projects';
    const project = projects.find(p => p.project_id === filters.project_id);
    return project?.project_name || 'All Projects';
  };

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search stocks..."
          onChangeText={(text) => dispatch(setFilters({ search: text }))}
          value={filters.search}
          style={styles.searchbar}
        />
        
        <View style={styles.filterRow}>
          <Menu
            visible={projectMenuVisible}
            onDismiss={() => setProjectMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setProjectMenuVisible(true)}
                icon="filter"
                style={styles.filterButton}
              >
                {getSelectedProjectName()}
              </Button>
            }
          >
            <Menu.Item 
              onPress={() => handleProjectFilter(null)} 
              title="All Projects" 
            />
            {projects.map(project => (
              <Menu.Item
                key={project.project_id}
                onPress={() => handleProjectFilter(project.project_id)}
                title={project.project_name}
              />
            ))}
          </Menu>

          {(filters.project_id || filters.search) && (
            <Button 
              mode="text" 
              onPress={handleClearFilters}
              style={styles.clearButton}
            >
              Clear
            </Button>
          )}
        </View>
      </View>

      <FlatList
        data={filteredStocks}
        renderItem={({ item }) => (
          <StockCard
            stock={item}
            onPress={(s) => navigation.navigate('StockDetails', { id: s.stock_id })}
            onEdit={(s) => navigation.navigate('EditStock', { id: s.stock_id })}
            onDelete={(s) => handleDeletePress(s)}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.stock_id?.toString()}
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            title="No Stock"
            message={filters.search || filters.project_id ? "No matching stock items" : "Add your first stock item"}
            actionText="Add Stock"
            onActionPress={() => navigation.navigate('AddStock')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddStock')}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={cancelDelete}>
          <Dialog.Title>Delete Stock</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete stock for unit "{selectedStock?.unit_name}"? 
              The unit status will be updated to "free". This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelDelete}>Cancel</Button>
            <Button 
              onPress={confirmDelete} 
              loading={isDeleting}
              disabled={isDeleting}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0, marginBottom: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterButton: { flex: 1 },
  clearButton: { marginLeft: 8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default StockListScreen;
