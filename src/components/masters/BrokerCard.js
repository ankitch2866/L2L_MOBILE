import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';

const BrokerCard = ({ broker, onPress, onEdit, onDelete, theme }) => {
  return (
    <Card style={styles.card} onPress={() => onPress(broker)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.name}>
              {broker.name || 'N/A'}
            </Text>
            <Text variant="bodySmall" style={styles.id}>
              Broker ID: {broker.broker_id}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => onEdit(broker)}
              style={styles.actionButton}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => onDelete(broker)}
              style={styles.actionButton}
              iconColor={theme.colors.error}
            />
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Mobile:</Text>
          <Text variant="bodySmall" style={styles.value}>
            {broker.mobile || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Email:</Text>
          <Text variant="bodySmall" style={styles.value} numberOfLines={1}>
            {broker.email || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>PAN:</Text>
          <Text variant="bodySmall" style={styles.value}>
            {broker.pan_no || 'N/A'}
          </Text>
        </View>

        {broker.net_commission_rate && (
          <View style={styles.commissionContainer}>
            <Chip 
              icon="percent" 
              style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
              textStyle={{ color: theme.colors.primary }}
            >
              Commission: {broker.net_commission_rate}%
            </Chip>
          </View>
        )}
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
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  id: {
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    margin: 0,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    color: '#6B7280',
    width: 80,
  },
  value: {
    flex: 1,
    fontWeight: '500',
  },
  commissionContainer: {
    marginTop: 8,
  },
  chip: {
    alignSelf: 'flex-start',
  },
});

export default BrokerCard;
