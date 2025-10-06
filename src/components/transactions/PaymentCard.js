import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentCard = ({ payment, onPress, onEdit, theme }) => {
  const getMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return '#D1FAE5';
      case 'cheque': return '#FEF3C7';
      case 'online': return '#DBEAFE';
      case 'card': return '#E0E7FF';
      case 'upi': return '#FCE7F3';
      default: return '#E5E7EB';
    }
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return 'cash';
      case 'cheque': return 'checkbook';
      case 'online': return 'bank-transfer';
      case 'card': return 'credit-card';
      case 'upi': return 'cellphone';
      default: return 'cash-multiple';
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
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => onPress(payment)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon name="cash-multiple" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              Payment #{payment.payment_id || payment.id}
            </Text>
          </View>
          <Chip
            icon={getMethodIcon(payment.payment_method)}
            style={[styles.methodChip, { backgroundColor: getMethodColor(payment.payment_method) }]}
            textStyle={styles.methodText}
            compact
          >
            {(payment.payment_method || 'N/A').toUpperCase()}
          </Chip>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Icon name="account" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
              {payment.customer_name || 'No customer'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="currency-inr" size={16} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {formatCurrency(payment.amount)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {formatDate(payment.payment_date)}
            </Text>
          </View>

          {payment.project_name && (
            <View style={styles.detailRow}>
              <Icon name="office-building" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
                {payment.project_name}
              </Text>
            </View>
          )}

          {payment.transaction_id && (
            <View style={styles.detailRow}>
              <Icon name="identifier" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
                Txn: {payment.transaction_id}
              </Text>
            </View>
          )}

          {payment.cheque_number && (
            <View style={styles.detailRow}>
              <Icon name="checkbook" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
                Cheque: {payment.cheque_number}
              </Text>
            </View>
          )}

          {payment.remarks && (
            <View style={styles.remarksRow}>
              <Icon name="note-text" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodySmall" style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }} numberOfLines={2}>
                {payment.remarks}
              </Text>
            </View>
          )}
        </View>

        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(payment)} style={styles.editBtn}>
            <Icon name="pencil" size={20} color={theme.colors.primary} />
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
  methodChip: { borderRadius: 12 },
  methodText: { fontSize: 10, fontWeight: 'bold' },
  details: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  remarksRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 4 },
  editBtn: { position: 'absolute', bottom: 8, right: 8, padding: 8 },
});

export default PaymentCard;
