import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchPaymentPlans,
  deletePaymentPlan,
  checkPaymentPlanUsage,
  clearError,
  clearSuccess,
} from '../../../store/slices/paymentPlansSlice';

const PaymentPlansListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list, loading, error, success } = useSelector((state) => state.paymentPlans);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPaymentPlans();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      Alert.alert('Success', success);
      dispatch(clearSuccess());
      loadPaymentPlans();
    }
  }, [success]);

  const loadPaymentPlans = async () => {
    await dispatch(fetchPaymentPlans());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentPlans();
    setRefreshing(false);
  };

  const handleDelete = async (plan) => {
    // First check if the plan is being used
    const usageResult = await dispatch(checkPaymentPlanUsage(plan.id));
    
    if (usageResult.payload?.is_used) {
      const { usage_details } = usageResult.payload;
      Alert.alert(
        'Cannot Delete',
        `This payment plan is being used in:\n• ${usage_details.projects} project(s)\n\nPlease remove these associations before deleting.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Payment Plan',
      `Are you sure you want to delete "${plan.plan_name}"? This will also delete all associated installments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deletePaymentPlan(plan.id));
          },
        },
      ]
    );
  };

  const filteredPlans = list.filter((plan) =>
    plan.plan_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlanCard = ({ item }) => {
    const installmentCount = item.installments?.length || 0;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PaymentPlanDetails', { planId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="calendar-outline" size={24} color="#EF4444" />
            <Text style={styles.cardTitle}>{item.plan_name || 'N/A'}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('EditPaymentPlan', { planId: item.id });
              }}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="list-outline" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>Installments:</Text>
            <Text style={styles.infoValue}>{installmentCount}</Text>
          </View>

          {installmentCount > 0 && (
            <View style={styles.installmentPreview}>
              <Text style={styles.installmentPreviewTitle}>Installments:</Text>
              {item.installments.slice(0, 3).map((inst, index) => (
                <Text key={index} style={styles.installmentPreviewText}>
                  • {inst.installment_name} - {inst.is_percentage ? `${inst.value}%` : `₹${inst.value}`} (Due: {inst.due_days} days)
                </Text>
              ))}
              {installmentCount > 3 && (
                <Text style={styles.installmentPreviewMore}>
                  +{installmentCount - 3} more...
                </Text>
              )}
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
      <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateText}>No payment plans found</Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery ? 'Try adjusting your search' : 'Create your first payment plan'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search payment plans..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Plans List */}
      <FlatList
        data={filteredPlans}
        renderItem={renderPlanCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#EF4444']} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPaymentPlan')}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
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
  installmentPreview: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  installmentPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  installmentPreviewText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
  },
  installmentPreviewMore: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
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

export default PaymentPlansListScreen;
