import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const BookingCard = ({ booking, onPress, onEdit, theme }) => {
  // Debug: Log booking data to see what fields are available
  // console.log('Booking data:', JSON.stringify(booking, null, 2));
  // console.log('Available fields:', Object.keys(booking || {}));
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FEF3C7';
      case 'confirmed': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      default: return '#E5E7EB';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'clock';
      case 'confirmed': return 'check-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
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

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    const numPrice = Number(price);
    if (isNaN(numPrice)) return 'N/A';
    return `₹${numPrice.toLocaleString('en-IN')}`;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Booking',
      'Are you sure you want to delete this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (booking.onDelete) {
              booking.onDelete(booking);
            }
          },
        },
      ]
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => onPress(booking)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <PaperIcon source="file-document" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {booking.manual_application_id || `Booking #${booking.booking_id}`}
            </Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <PaperIcon source="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <PaperIcon source="account" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {booking.customer_name || 'No customer'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <PaperIcon source="office-building" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
              {booking.project_name || 'No project'}
            </Text>
          </View>
          {booking.unit_size && (
            <View style={styles.detailRow}>
              <PaperIcon source="ruler" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
                Size: {booking.unit_size} sq ft
              </Text>
            </View>
          )}
          {booking.bsp && (
            <View style={styles.detailRow}>
              <PaperIcon source="currency-inr" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodySmall" style={{ color: theme.colors.text, fontWeight: '600' }}>
                Price: {formatPrice(booking.bsp)}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <PaperIcon source="calendar" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {formatDate(booking.booking_date)}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => onEdit(booking)} style={styles.editBtn}>
          <PaperIcon source="pencil" size={20} color={theme.colors.primary} />
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

export default BookingCard;
