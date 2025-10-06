import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InstallmentCard = ({ installment, index, onPress, onEdit, onDelete }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(installment)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.installmentNumber}>
          <Text style={styles.installmentNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{installment.installment_name || 'N/A'}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {installment.is_percentage ? 'Percentage' : 'Fixed'}
            </Text>
          </View>
        </View>
        {(onEdit || onDelete) && (
          <View style={styles.cardActions}>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(installment)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={20} color="#3B82F6" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(installment)}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>Amount:</Text>
          <Text style={styles.infoValue}>
            {installment.is_percentage 
              ? `${installment.value}%` 
              : `₹${parseFloat(installment.value || 0).toLocaleString()}`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>Due Days:</Text>
          <Text style={styles.infoValue}>{installment.due_days || 0} days</Text>
        </View>

        {installment.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {installment.description}
            </Text>
          </View>
        )}
      </View>

      {installment.created_at && (
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            Created: {new Date(installment.created_at).toLocaleDateString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  cardBody: {
    marginBottom: 8,
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
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default InstallmentCard;
