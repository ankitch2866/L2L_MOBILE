import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Button, Dialog, Portal, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import BankCard from '../../../components/masters/BankCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchBanks, deleteBank, setSearchQuery } from '../../../store/slices/banksSlice';

const BanksListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, searchQuery } = useSelector(state => state.banks);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredBanks = (list || []).filter(bank => {
    const matchesSearch = 
      bank.bank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.branch_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.ifsc_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  useEffect(() => {
    dispatch(fetchBanks());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchBanks());
    setRefreshing(false);
  };

  const handleDeletePress = (bank) => {
    setSelectedBank(bank);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedBank) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteBank(selectedBank.bank_id)).unwrap();
      Alert.alert('Success', 'Bank deleted successfully');
      setDeleteDialogVisible(false);
      setSelectedBank(null);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to delete bank');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setSelectedBank(null);
  };

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search banks..."
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredBanks}
        renderItem={({ item }) => (
          <BankCard
            bank={item}
            onPress={(b) => navigation.navigate('BankDetails', { id: b.bank_id })}
            onEdit={(b) => navigation.navigate('EditBank', { id: b.bank_id })}
            onDelete={(b) => handleDeletePress(b)}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.bank_id?.toString()}
        ListEmptyComponent={
          <EmptyState
            icon="bank"
            title="No Banks"
            message={searchQuery ? "No matching banks" : "Add your first bank"}
            actionText="Add Bank"
            onActionPress={() => navigation.navigate('AddBank')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddBank')}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={cancelDelete}>
          <Dialog.Title>Delete Bank</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete bank "{selectedBank?.bank_name}"? This action cannot be undone.
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
  searchbar: { elevation: 0 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default BanksListScreen;
