import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Menu, Button, Dialog, Portal, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import BrokerCard from '../../../components/masters/BrokerCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchBrokers, deleteBroker, checkBrokerUsage, setSearchQuery } from '../../../store/slices/brokersSlice';
import { fetchProjects } from '../../../store/slices/projectsSlice';

const BrokersListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, searchQuery, usage } = useSelector(state => state.brokers);
  const { projects } = useSelector(state => state.projects);
  const [refreshing, setRefreshing] = useState(false);
  const [projectMenuVisible, setProjectMenuVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredBrokers = (list || []).filter(broker => {
    const matchesSearch = 
      broker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broker.mobile?.includes(searchQuery) ||
      broker.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = !selectedProject || broker.project_id === selectedProject;
    
    return matchesSearch && matchesProject;
  });

  useEffect(() => {
    dispatch(fetchBrokers());
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchBrokers());
    setRefreshing(false);
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
    setProjectMenuVisible(false);
  };

  const handleDeletePress = async (broker) => {
    setSelectedBroker(broker);
    // Check if broker is in use
    await dispatch(checkBrokerUsage(broker.broker_id));
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedBroker) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteBroker(selectedBroker.broker_id)).unwrap();
      Alert.alert('Success', 'Broker deleted successfully');
      setDeleteDialogVisible(false);
      setSelectedBroker(null);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to delete broker');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setSelectedBroker(null);
  };

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search brokers..."
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          value={searchQuery}
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
                style={styles.filterButton}
              >
                {selectedProject 
                  ? projects.find(p => p.project_id === selectedProject)?.project_name 
                  : 'All Projects'}
              </Button>
            }
          >
            <Menu.Item onPress={() => handleProjectSelect(null)} title="All Projects" />
            {projects.map(project => (
              <Menu.Item
                key={project.project_id}
                onPress={() => handleProjectSelect(project.project_id)}
                title={project.project_name}
              />
            ))}
          </Menu>
        </View>
      </View>

      <FlatList
        data={filteredBrokers}
        renderItem={({ item }) => (
          <BrokerCard
            broker={item}
            onPress={(b) => navigation.navigate('BrokerDetails', { id: b.broker_id })}
            onEdit={(b) => navigation.navigate('EditBroker', { id: b.broker_id })}
            onDelete={(b) => handleDeletePress(b)}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.broker_id?.toString()}
        ListEmptyComponent={
          <EmptyState
            icon="account-tie"
            title="No Brokers"
            message={searchQuery ? "No matching brokers" : "Add your first broker"}
            actionText="Add Broker"
            onActionPress={() => navigation.navigate('AddBroker')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddBroker')}
      />

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={cancelDelete}>
          <Dialog.Title>Delete Broker</Dialog.Title>
          <Dialog.Content>
            {usage?.is_used ? (
              <>
                <Text variant="bodyMedium" style={styles.warningText}>
                  This broker is currently in use and cannot be deleted:
                </Text>
                <View style={styles.usageDetails}>
                  {usage.usage_details?.bookings > 0 && (
                    <Text variant="bodySmall">• {usage.usage_details.bookings} Booking(s)</Text>
                  )}
                  {usage.usage_details?.allotments > 0 && (
                    <Text variant="bodySmall">• {usage.usage_details.allotments} Allotment(s)</Text>
                  )}
                  {usage.usage_details?.customers > 0 && (
                    <Text variant="bodySmall">• {usage.usage_details.customers} Customer(s)</Text>
                  )}
                </View>
              </>
            ) : (
              <Text variant="bodyMedium">
                Are you sure you want to delete broker "{selectedBroker?.name}"? This action cannot be undone.
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelDelete}>Cancel</Button>
            {!usage?.is_used && (
              <Button 
                onPress={confirmDelete} 
                loading={isDeleting}
                disabled={isDeleting}
                textColor={theme.colors.error}
              >
                Delete
              </Button>
            )}
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
  filterRow: { flexDirection: 'row', gap: 8 },
  filterButton: { flex: 1 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  warningText: { color: '#EF4444', marginBottom: 12 },
  usageDetails: { marginLeft: 16, marginTop: 8 },
});

export default BrokersListScreen;
