import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchInstallmentsByPlan,
  deleteInstallment,
  setPlanId,
  clearError,
} from '../../../store/slices/installmentsSlice';

const InstallmentsListScreen = ({ route, navigation }) => {
  const { planId } = route.params;
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.installments);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(setPlanId(planId));
    loadInstallments();
  }, [planId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const loadInstallments = async () => {
    await dispatch(fetchInstallmentsByPlan(planId));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInstallments();
    setRefreshing(false);
  };

  const handleDelete = (installment) => {
    Alert.alert(
      'Delete Installment',
      `Are you sure you want to delete "${installment.installment_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteInstallment(installment.installment_id));
            loadInstallments();
          },
        },
      ]
    );
  };

  const renderInstallmentCard = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InstallmentDetails', { installmentId: item.installment_id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.installmentNumber}>
            <Text style={styles.installmentNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.installment_name || 'N/A'}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditInstallment', { installmentId: item.installment_id })}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={styles.infoValue}>
              {item.is_percentage ? `${item.value}%` : `₹${parseFloat(item.value || 0).toLocaleString()}`}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>Due Days:</Text>
            <Text style={styles.infoValue}>{item.due_days || 0} days</Text>
          </View>

          {item.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{item.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateText}>No installments found</Text>
      <Text style={styles.emptyStateSubtext}>
        Add your first installment to this payment plan
      </Text>
    </View>
  );

  if (loading && list.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading installments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        renderItem={renderInstallmentCard}
        keyExtractor={(item) => item.installment_id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#EF4444']} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddInstallment', { planId })}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  installmentNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  installmentNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  descriptionContainer: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default InstallmentsListScreen;
