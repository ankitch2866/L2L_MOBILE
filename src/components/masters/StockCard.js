import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';

const StockCard = ({ stock, onPress, onEdit, onDelete, theme }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'free':
        return theme.colors.success || '#10B981';
      case 'hold':
        return theme.colors.warning || '#F59E0B';
      case 'booked':
        return theme.colors.info || '#3B82F6';
      case 'allotted':
        return theme.colors.error || '#EF4444';
      default:
        return theme.colors.outline || '#6B7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  return (
    <Card style={styles.card} onPress={() => onPress(stock)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.unitName}>
              {stock.unit_name || 'N/A'}
            </Text>
            <Text variant="bodySmall" style={styles.projectName}>
              {stock.project_name || 'N/A'}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => onEdit(stock)}
              style={styles.actionButton}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => onDelete(stock)}
              style={styles.actionButton}
              iconColor={theme.colors.error}
            />
          </View>
        </View>

        <View style={styles.statusRow}>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(stock.unit_status) }]}
            textStyle={styles.statusText}
          >
            {stock.unit_status?.toUpperCase() || 'N/A'}
          </Chip>
          {stock.hold_till_date && (
            <Chip 
              icon="clock"
              style={[styles.holdChip, { backgroundColor: theme.colors.errorContainer }]}
              textStyle={{ color: theme.colors.error }}
            >
              Hold
            </Chip>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Unit Type:</Text>
          <Text variant="bodySmall" style={styles.value}>
            {stock.unit_type || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Unit Size:</Text>
          <Text variant="bodySmall" style={styles.value}>
            {stock.unit_size ? `${stock.unit_size} sq.ft` : 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>BSP:</Text>
          <Text variant="bodySmall" style={[styles.value, styles.price]}>
            {formatCurrency(stock.bsp)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Broker:</Text>
          <Text variant="bodySmall" style={styles.value}>
            {stock.broker_name || 'N/A'}
          </Text>
        </View>

        {stock.hold_till_date && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Hold Till:</Text>
            <Text variant="bodySmall" style={[styles.value, styles.holdDate]}>
              {formatDate(stock.hold_till_date)}
            </Text>
          </View>
        )}

        {stock.remarks && (
          <View style={styles.remarksContainer}>
            <Text variant="bodySmall" style={styles.label}>Remarks:</Text>
            <Text variant="bodySmall" style={styles.remarks}>
              {stock.remarks}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.stockDate}>
            Stock Date: {formatDate(stock.stock_date)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  unitName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectName: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    margin: 0,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  holdChip: {
    height: 28,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    color: '#6B7280',
    width: 90,
  },
  value: {
    flex: 1,
    fontWeight: '500',
  },
  price: {
    color: '#059669',
    fontWeight: '600',
  },
  holdDate: {
    color: '#DC2626',
    fontWeight: '600',
  },
  remarksContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  remarks: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stockDate: {
    color: '#6B7280',
    fontSize: 11,
  },
});

export default StockCard;
