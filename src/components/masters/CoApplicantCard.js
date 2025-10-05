import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';

const CoApplicantCard = ({ coApplicant, onPress, onEdit, theme }) => {
  // Safely extract all values with fallbacks
  const name = coApplicant?.name || 'N/A';
  const id = coApplicant?.co_applicant_id ? String(coApplicant.co_applicant_id) : 'N/A';
  const guardianName = coApplicant?.guardian_name || 'N/A';
  const mobile = coApplicant?.mobile || 'N/A';
  const email = coApplicant?.email || 'N/A';
  const isCoApplicant = coApplicant?.is_co_applicant === 1 || coApplicant?.is_co_applicant === true;

  return (
    <Card style={styles.card} onPress={() => onPress(coApplicant)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.name}>
              {name}
            </Text>
            <Text variant="bodySmall" style={styles.id}>
              {id !== 'N/A' ? `CA-${id}` : 'N/A'}
            </Text>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(coApplicant)}
            style={styles.editButton}
          />
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>
            Guardian:
          </Text>
          <Text variant="bodySmall" style={styles.value}>
            {guardianName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>
            Mobile:
          </Text>
          <Text variant="bodySmall" style={styles.value}>
            {mobile}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>
            Email:
          </Text>
          <Text variant="bodySmall" style={styles.value} numberOfLines={1}>
            {email}
          </Text>
        </View>

        {isCoApplicant && (
          <View style={[styles.badge, { backgroundColor: theme?.colors?.primary || '#EF4444' }]}>
            <Text variant="labelSmall" style={styles.badgeText}>
              Co-Applicant
            </Text>
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
  editButton: {
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
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CoApplicantCard;
