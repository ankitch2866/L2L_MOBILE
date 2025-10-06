import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AllotmentCard = ({ allotment, onPress, onEdit, theme }) => {
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

  const handleDelete = () => {
    Alert.alert(
      'Delete Allotment',
      'Are you sure you want to delete this allotment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (allotment.onDelete) {
              allotment.onDelete(allotment);
            }
          },
        },
      ]
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => onPress(allotment)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon name="file-document-outline" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {allotment.allotment_number || `Allotment #${allotment.id}`}
            </Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Icon name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Icon name="account" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {allotment.customer_name || 'No customer'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="office-building" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
              {allotment.project_name || 'No project'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="home" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              Unit: {allotment.unit_name || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {formatDate(allotment.allotment_date)}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => onEdit(allotment)} style={styles.editBtn}>
          <Icon name="pencil" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  title: { flex: 1, fontWeight: '600' },
  deleteBtn: { padding: 8 },
  details: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtn: { position: 'absolute', bottom: 8, right: 8, padding: 8 },
});

export default AllotmentCard;
