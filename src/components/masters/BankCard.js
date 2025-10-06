import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';

const BankCard = ({ bank, onPress, onEdit, onDelete, theme }) => {
  return (
    <Card style={styles.card} onPress={() => onPress(bank)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.name}>
              {bank.bank_name || 'N/A'}
            </Text>
            <Text variant="bodySmall" style={styles.id}>
              Bank ID: {bank.bank_id}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => onEdit(bank)}
              style={styles.actionButton}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => onDelete(bank)}
              style={styles.actionButton}
              iconColor={theme.colors.error}
            />
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Branch:</Text>
          <Text variant="bodySmall" style={styles.value}>
            {bank.branch_name || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>IFSC Code:</Text>
          <Text variant="bodySmall" style={styles.value}>
            {bank.ifsc_code || 'N/A'}
          </Text>
        </View>

        {bank.contact_person && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>Contact:</Text>
            <Text variant="bodySmall" style={styles.value}>
              {bank.contact_person}
            </Text>
          </View>
        )}

        {bank.contact_number && (
          <View style={styles.contactContainer}>
            <Chip 
              icon="phone" 
              style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
              textStyle={{ color: theme.colors.primary }}
            >
              {bank.contact_number}
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
    width: 90,
  },
  value: {
    flex: 1,
    fontWeight: '500',
  },
  contactContainer: {
    marginTop: 8,
  },
  chip: {
    alignSelf: 'flex-start',
  },
});

export default BankCard;
