import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const ChequeCard = ({ cheque, onPress, onEdit, theme }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'cleared': return '#D1FAE5';
      case 'bounced':
      case 'bounce': return '#FEE2E2';
      case 'submitted':
      case 'sent to bank': return '#FEF3C7';
      case 'cancelled': return '#E5E7EB';
      default: return '#DBEAFE';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'cleared': return 'check-circle';
      case 'bounced':
      case 'bounce': return 'close-circle';
      case 'submitted':
      case 'sent to bank': return 'bank-transfer';
      case 'cancelled': return 'cancel';
      default: return 'clock';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (e) {
      return 'N/A';
    }
    return dateString;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return '₹0.00';
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => onPress(cheque)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <PaperIcon source="checkbook" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              #{cheque.cheque_number || 'N/A'}
            </Text>
          </View>
          <Chip
            icon={getStatusIcon(cheque.status)}
            style={[styles.statusChip, { backgroundColor: getStatusColor(cheque.status) }]}
            textStyle={styles.statusText}
            compact
          >
            {(cheque.status || 'Pending').toUpperCase()}
          </Chip>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <PaperIcon source="bank" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
              {cheque.bank_name || 'No bank'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <PaperIcon source="account" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
              {cheque.customer_name || 'No customer'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <PaperIcon source="currency-inr" size={16} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {formatCurrency(cheque.amount)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <PaperIcon source="calendar" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              Cheque: {formatDate(cheque.cheque_date)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <PaperIcon source="calendar-check" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              Deposit: {formatDate(cheque.deposit_date)}
            </Text>
          </View>

          {cheque.clearance_date && (
            <View style={styles.detailRow}>
              <PaperIcon source="calendar-check" size={16} color="#10B981" />
              <Text variant="bodySmall" style={{ color: '#10B981' }}>
                Cleared: {formatDate(cheque.clearance_date)}
              </Text>
            </View>
          )}

          {cheque.remarks && (
            <View style={styles.remarksRow}>
              <PaperIcon source="note-text" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodySmall" style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }} numberOfLines={2}>
                {cheque.remarks}
              </Text>
            </View>
          )}
        </View>

        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(cheque)} style={styles.editBtn}>
            <PaperIcon source="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  title: { flex: 1, fontWeight: '600' },
  statusChip: { borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  details: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  remarksRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 4 },
  editBtn: { position: 'absolute', bottom: 8, right: 8, padding: 8 },
});

export default ChequeCard;
