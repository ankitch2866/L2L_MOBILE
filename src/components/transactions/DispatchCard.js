import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';

const DispatchCard = ({ dispatch, onPress, onEdit, onDelete, theme }) => {
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
    } catch (error) {
      return 'Invalid Date';
    }
    return 'Invalid Date';
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'BY_COURIER':
        return '#3B82F6';
      case 'BY_HAND':
        return '#10B981';
      case 'BY_POST':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'INDIVIDUAL':
        return '#8B5CF6';
      case 'COMPANY':
        return '#EC4899';
      case 'PARTNERSHIP':
        return '#14B8A6';
      case 'PROPRIETORSHIP':
        return '#F97316';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(dispatch)} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="titleMedium" style={styles.dispatchId}>
                Dispatch #{dispatch.id}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(dispatch.dispatchDate)}
              </Text>
            </View>
            <View style={styles.actions}>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={(e) => {
                    e.stopPropagation();
                    onEdit(dispatch);
                  }}
                />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor="#EF4444"
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(dispatch);
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Customer:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {dispatch.customer_name || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Letter Type:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {dispatch.letterType || 'N/A'}
            </Text>
          </View>

          {dispatch.unitNo && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Unit:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {dispatch.unitNo}
              </Text>
            </View>
          )}

          {dispatch.project_name && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Project:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {dispatch.project_name}
              </Text>
            </View>
          )}

          {dispatch.location && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Location:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {dispatch.location}
              </Text>
            </View>
          )}

          <View style={styles.chipContainer}>
            <Chip
              icon="account"
              style={[styles.chip, { backgroundColor: getCustomerTypeColor(dispatch.customerType) }]}
              textStyle={styles.chipText}
            >
              {dispatch.customerType || 'N/A'}
            </Chip>
            
            {dispatch.modeOfLetterSending && (
              <Chip
                icon="truck-delivery"
                style={[styles.chip, { backgroundColor: getModeColor(dispatch.modeOfLetterSending) }]}
                textStyle={styles.chipText}
              >
                {dispatch.modeOfLetterSending.replace('BY_', '')}
              </Chip>
            )}
          </View>

          {dispatch.modeOfLetterSending === 'BY_COURIER' && (
            <View style={styles.courierInfo}>
              {dispatch.courierCompany && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.label}>Courier:</Text>
                  <Text variant="bodySmall" style={styles.value}>
                    {dispatch.courierCompany}
                  </Text>
                </View>
              )}
              {dispatch.consignmentNo && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.label}>Consignment:</Text>
                  <Text variant="bodySmall" style={styles.value}>
                    {dispatch.consignmentNo}
                  </Text>
                </View>
              )}
            </View>
          )}

          {dispatch.remarks && (
            <View style={styles.remarksContainer}>
              <Text variant="bodySmall" style={styles.remarksLabel}>Remarks:</Text>
              <Text variant="bodySmall" style={styles.remarks}>
                {dispatch.remarks}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
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
  dispatchId: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  date: {
    color: '#6B7280',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: -8,
    marginRight: -8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    color: '#6B7280',
    width: 100,
  },
  value: {
    flex: 1,
    color: '#1F2937',
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  courierInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  remarksContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  remarksLabel: {
    color: '#6B7280',
    marginBottom: 4,
  },
  remarks: {
    color: '#1F2937',
    fontStyle: 'italic',
  },
});

export default DispatchCard;
