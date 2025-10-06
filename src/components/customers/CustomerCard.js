import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const CustomerCard = ({ customer, onPress, onEdit, theme }) => {
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => onPress(customer)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <PaperIcon source="account" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {customer.name || customer.customer_name || 'N/A'}
            </Text>
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <PaperIcon source="phone" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {customer.phone_no || customer.mobile_number || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <PaperIcon source="email" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
              {customer.email || 'N/A'}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => onEdit(customer)} style={styles.editBtn}>
          <PaperIcon source="pencil" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8 },
  header: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontWeight: '600' },
  details: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtn: { position: 'absolute', top: 8, right: 8, padding: 8 },
});

export default CustomerCard;
