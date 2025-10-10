import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, IconButton } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const CustomerCard = ({ customer, onPress, onEdit, theme }) => {
  return (
    <Card 
      style={[styles.card, { backgroundColor: theme.colors.card }]} 
      onPress={() => onPress(customer)}
      elevation={2}
    >
      <Card.Content style={styles.cardContent}>
        {/* Header with Avatar and Actions */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <PaperIcon source="account" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                {customer.name || customer.customer_name || 'N/A'}
              </Text>
              {customer.manual_application_id && (
                <Text variant="bodySmall" style={[styles.customerId, { color: theme.colors.textSecondary }]}>
                  ID: {customer.manual_application_id}
                </Text>
              )}
            </View>
          </View>
          
          <IconButton
            icon="pencil"
            size={20}
            iconColor={theme.colors.primary}
            style={styles.editButton}
            onPress={() => onEdit(customer)}
          />
        </View>
        
        {/* Contact Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
              <PaperIcon source="phone" size={16} color={theme.colors.primary} />
            </View>
            <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.text }]}>
              {(customer.phone_no && customer.phone_no.trim()) || (customer.mobile_number && customer.mobile_number.trim()) || 'No phone'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
              <PaperIcon source="email" size={16} color={theme.colors.primary} />
            </View>
            <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.text }]} numberOfLines={1}>
              {customer.email && customer.email.trim() ? customer.email : 'No email'}
            </Text>
          </View>
          
          {customer.project_name && (
            <View style={styles.detailRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <PaperIcon source="office-building" size={16} color={theme.colors.primary} />
              </View>
              <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.text }]} numberOfLines={1}>
                {customer.project_name}
              </Text>
            </View>
          )}
        </View>

        {/* Footer with Status */}
        <View style={styles.footer}>
          <Chip 
            mode="flat" 
            style={[styles.statusChip, { backgroundColor: theme.colors.primaryContainer }]}
            textStyle={{ fontSize: 12, color: theme.colors.primary }}
          >
            Active
          </Chip>
          <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
            Tap to view details
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { 
    marginHorizontal: 16, 
    marginVertical: 8,
    borderRadius: 16,
  },
  cardContent: {
    paddingVertical: 16,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: { 
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  customerId: {
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    margin: 0,
  },
  details: { 
    gap: 12, 
    marginBottom: 16,
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusChip: {
    height: 28,
  },
});

export default CustomerCard;
