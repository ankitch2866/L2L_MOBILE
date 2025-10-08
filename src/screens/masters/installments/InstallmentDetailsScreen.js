import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  fetchInstallmentById,
  deleteInstallment,
  clearError,
  clearCurrent,
} from '../../../store/slices/installmentsSlice';

const InstallmentDetailsScreen = ({ route, navigation }) => {
  const { installmentId } = route.params;
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((state) => state.installments);
  
  console.log('InstallmentDetailsScreen - Route params:', route.params);
  console.log('InstallmentDetailsScreen - InstallmentId:', installmentId);

  useEffect(() => {
    loadInstallmentDetails();
    
    return () => {
      dispatch(clearCurrent());
    };
  }, [installmentId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const loadInstallmentDetails = async () => {
    await dispatch(fetchInstallmentById(installmentId));
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Installment',
      `Are you sure you want to delete "${current?.installment_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await dispatch(deleteInstallment(installmentId));
            if (result.type === 'installments/delete/fulfilled') {
              Alert.alert('Success', 'Installment deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            }
          },
        },
      ]
    );
  };

  if (loading || !current) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading installment details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Installment Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={32} color="#EF4444" />
            <View style={styles.cardHeaderText}>
              <Text style={styles.installmentName}>{current.installment_name}</Text>
              <Text style={styles.installmentId}>ID: #{current.installment_id}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Value:</Text>
            <Text style={styles.infoValue}>
              {current.is_percentage 
                ? `${current.value}%` 
                : `₹${parseFloat(current.value || 0).toLocaleString()}`}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calculator" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>
              {current.is_percentage ? 'Percentage' : 'Fixed Amount'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Due Days:</Text>
            <Text style={styles.infoValue}>{current.due_days || 0} days</Text>
          </View>

          {current.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{current.description}</Text>
              </View>
            </>
          )}
        </View>

        {/* Metadata Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Metadata</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {new Date(current.created_at).toLocaleDateString()}
            </Text>
          </View>

          {current.updated_at && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>
                {new Date(current.updated_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Example Calculation Card */}
        {current.is_percentage && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Example Calculation</Text>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                For a property worth ₹1,00,00,000:
              </Text>
              <Text style={styles.exampleAmount}>
                {current.value}% = ₹{((1000000 * current.value) / 100).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('EditInstallment', { installmentId })}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
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
  installmentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  installmentId: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
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
  descriptionSection: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  exampleBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  exampleText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  exampleAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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

export default InstallmentDetailsScreen;
