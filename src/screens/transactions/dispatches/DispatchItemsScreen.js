import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, Button, FAB, IconButton, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchDispatchById, addDispatchItems } from '../../../store/slices/dispatchesSlice';

const DispatchItemsScreen = ({ route, navigation }) => {
  const { dispatchId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: dispatchData, loading } = useSelector(state => state.dispatches);
  
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', quantity: '1' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchDispatchById(dispatchId));
  }, [dispatch, dispatchId]);

  useEffect(() => {
    if (dispatchData?.items) {
      setItems(dispatchData.items);
    }
  }, [dispatchData]);

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    const item = {
      id: Date.now(),
      name: newItem.name,
      description: newItem.description,
      quantity: parseInt(newItem.quantity) || 1,
    };

    setItems([...items, item]);
    setNewItem({ name: '', description: '', quantity: '1' });
    setShowAddForm(false);
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSaveItems = async () => {
    try {
      await dispatch(addDispatchItems({ id: dispatchId, items })).unwrap();
      Alert.alert('Success', 'Dispatch items saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to save dispatch items');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text variant="titleMedium" style={styles.itemName}>{item.name}</Text>
            {item.description && (
              <Text variant="bodySmall" style={styles.itemDescription}>
                {item.description}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.itemQuantity}>
              Quantity: {item.quantity}
            </Text>
          </View>
          <IconButton
            icon="delete"
            size={20}
            iconColor="#EF4444"
            onPress={() => handleRemoveItem(item.id)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !dispatchData) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text variant="titleLarge" style={styles.title}>
          Dispatch Items
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Dispatch #{dispatchId}
        </Text>
      </View>

      {showAddForm && (
        <Card style={styles.addForm}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.formTitle}>Add New Item</Text>
            
            <TextInput
              label="Item Name *"
              value={newItem.name}
              onChangeText={(value) => setNewItem({ ...newItem, name: value })}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={newItem.description}
              onChangeText={(value) => setNewItem({ ...newItem, description: value })}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={2}
            />

            <TextInput
              label="Quantity"
              value={newItem.quantity}
              onChangeText={(value) => setNewItem({ ...newItem, quantity: value })}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />

            <View style={styles.formButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowAddForm(false);
                  setNewItem({ name: '', description: '', quantity: '1' });
                }}
                style={styles.formButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddItem}
                style={styles.formButton}
              >
                Add Item
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => `item-${item.id}`}
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            title="No Items"
            message="Add items to this dispatch"
            actionText="Add Item"
            onActionPress={() => setShowAddForm(true)}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSaveItems}
            loading={loading}
            disabled={loading}
            icon="content-save"
          >
            Save Items
          </Button>
        </View>
      )}

      {!showAddForm && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddForm(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontWeight: 'bold' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  addForm: {
    margin: 16,
    elevation: 4,
  },
  formTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: { marginBottom: 12 },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  formButton: { flex: 1 },
  listContent: { padding: 16 },
  itemCard: {
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itemDescription: {
    color: '#6B7280',
    marginTop: 4,
  },
  itemQuantity: {
    color: '#3B82F6',
    marginTop: 4,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DispatchItemsScreen;
