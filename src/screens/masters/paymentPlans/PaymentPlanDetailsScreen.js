import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchPaymentPlanById,
  deletePaymentPlan,
  checkPaymentPlanUsage,
  clearError,
  clearSuccess,
} from '../../../store/slices/paymentPlansSlice';

const PaymentPlanDetailsScreen = ({ route, navigation }) => {
  const { planId } = route.params;
  const dispatch = useDispatch();
  const { currentPlan, loading, error, success } = useSelector((state) => state.paymentPlans);

  useEffect(() => {
    loadPlanDetails();
  }, [planId]);

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
      if (success.includes('deleted')) {
        navigation.goBack();
      }
    }
  }, [success]);

  const loadPlanDetails = async () => {
    await dispatch(fetchPaymentPlanById(planId));
  };

  const handleDelete = async () => {
    // First check if the plan is being used
    const usageResult = await dispatch(checkPaymentPlanUsage(planId));
    
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
      `Are you sure you want to delete "${currentPlan?.plan_name}"? This will also delete all associated installments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deletePaymentPlan(planId));
          },
        },
      ]
    );
  };

  if (loading || !currentPlan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading payment plan...</Text>
      </View>
    );
  }

  const installments = currentPlan.installments || [];
  const totalPercentage = installments
    .filter((inst) => inst.is_percentage)
    .reduce((sum, inst) => sum + parseFloat(inst.value || 0), 0);
  const totalAmount = installments
    .filter((inst) => !inst.is_percentage)
    .reduce((sum, inst) => sum + parseFloat(inst.value || 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Plan Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={32} color="#EF4444" />
            <View style={styles.cardHeaderText}>
              <Text style={styles.planName}>{currentPlan.plan_name}</Text>
              <Text style={styles.planId}>Plan ID: #{currentPlan.id}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="list" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Total Installments:</Text>
            <Text style={styles.infoValue}>{installments.length}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {new Date(currentPlan.created_at).toLocaleDateString()}
            </Text>
          </View>

          {currentPlan.updated_at && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>
                {new Date(currentPlan.updated_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Summary Card */}
        {installments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Percentage:</Text>
              <Text style={[styles.summaryValue, totalPercentage === 100 ? styles.summaryComplete : styles.summaryIncomplete]}>
                {totalPercentage.toFixed(2)}%
              </Text>
            </View>
            {totalAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Fixed Amount:</Text>
                <Text style={styles.summaryValue}>₹{totalAmount.toLocaleString()}</Text>
              </View>
            )}
            {totalPercentage !== 100 && totalPercentage > 0 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={16} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Total percentage should equal 100% for percentage-based plans
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Installments List */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Installments</Text>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => navigation.navigate('InstallmentDashboard', { planId })}
            >
              <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {installments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No installments added yet</Text>
              <TouchableOpacity
                style={styles.addInstallmentButton}
                onPress={() => navigation.navigate('AddInstallments', { planId })}
              >
                <Ionicons name="add-circle" size={20} color="#EF4444" />
                <Text style={styles.addInstallmentButtonText}>Add Installments</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.installmentsList}>
              {installments.map((installment, index) => (
                <View key={installment.id} style={styles.installmentItem}>
                  <View style={styles.installmentNumber}>
                    <Text style={styles.installmentNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.installmentDetails}>
                    <Text style={styles.installmentName}>{installment.installment_name}</Text>
                    <View style={styles.installmentMeta}>
                      <View style={styles.installmentMetaItem}>
                        <Ionicons name="cash-outline" size={14} color="#6B7280" />
                        <Text style={styles.installmentMetaText}>
                          {installment.is_percentage
                            ? `${installment.value}%`
                            : `₹${parseFloat(installment.value).toLocaleString()}`}
                        </Text>
                      </View>
                      <View style={styles.installmentMetaItem}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.installmentMetaText}>
                          Due: {installment.due_days} days
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditPaymentPlan', { planId })}>
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  planId: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryComplete: {
    color: '#10B981',
  },
  summaryIncomplete: {
    color: '#F59E0B',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  addInstallmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  addInstallmentButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  installmentsList: {
    gap: 12,
  },
  installmentItem: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
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
  installmentDetails: {
    flex: 1,
  },
  installmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  installmentMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  installmentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  installmentMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentPlanDetailsScreen;
