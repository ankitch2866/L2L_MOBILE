import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchBookingById, deleteBooking } from '../../../store/slices/bookingsSlice';
import { Icon as PaperIcon } from 'react-native-paper';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.bookings);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingById(bookingId));
  }, [dispatch, bookingId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Booking',
      'Are you sure you want to delete this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await dispatch(deleteBooking(bookingId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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
      console.error('Error parsing date:', e);
    }
    return dateString;
  };

  if (loading || !current) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <PaperIcon source="check-circle" size={32} color="#10B981" />
              <View style={styles.headerText}>
                <Text variant="headlineSmall" style={styles.bookingId}>
                  Booking #{current.booking_id || 'N/A'}
                </Text>
                <Text variant="bodyMedium" style={styles.bookingDate}>
                  {formatDate(current.booking_date)}
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditBooking', { bookingId })}
              icon="pencil"
              style={styles.editButton}
            >
              Edit
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Project Details */}
      <Card style={[styles.sectionCard, { backgroundColor: '#EFF6FF' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="office-building" size={20} color="#3B82F6" />
            <Text variant="titleMedium" style={styles.sectionTitle}>Project Details</Text>
          </View>
          
          <InfoCard icon="office-building" label="Project" value={current.project_name || 'N/A'} iconBg="#DBEAFE" iconColor="#3B82F6" />
          <InfoCard icon="calendar" label="Booking Date" value={formatDate(current.booking_date)} iconBg="#D1FAE5" iconColor="#10B981" />
          <InfoCard icon="credit-card" label="Installment Plan" value={current.payment_plan_name || 'Not specified'} iconBg="#E9D5FF" iconColor="#A855F7" />
        </Card.Content>
      </Card>

      {/* Customer Details */}
      <Card style={[styles.sectionCard, { backgroundColor: '#F0FDF4' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="account" size={20} color="#10B981" />
            <Text variant="titleMedium" style={styles.sectionTitle}>Customer Details</Text>
          </View>
          
          <InfoCard icon="account" label="Customer ID" value={current.manual_application_id || 'N/A'} iconBg="#DBEAFE" iconColor="#3B82F6" />
          <InfoCard icon="account" label="Customer Name" value={current.customer_name || 'N/A'} iconBg="#E9D5FF" iconColor="#A855F7" />
          <InfoCard icon="account" label="Father's Name" value={current.customer_father_name || 'N/A'} iconBg="#E9D5FF" iconColor="#A855F7" />
          <InfoCard icon="map-marker" label="Address" value={current.customer_address || 'N/A'} iconBg="#D1FAE5" iconColor="#10B981" multiline />
        </Card.Content>
      </Card>

      {/* Property Description */}
      <Card style={[styles.sectionCard, { backgroundColor: '#FDF4FF' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="file-document" size={20} color="#A855F7" />
            <Text variant="titleMedium" style={styles.sectionTitle}>Property Description</Text>
          </View>
          
          <InfoCard icon="home" label="Unit Name" value={current.unit_name || 'N/A'} iconBg="#C7D2FE" iconColor="#6366F1" />
          <InfoCard icon="home-variant" label="Unit Type" value={current.unit_type || 'N/A'} iconBg="#DBEAFE" iconColor="#3B82F6" />
          <InfoCard icon="file-document" label="Unit Desc" value={current.unit_desc_name || 'N/A'} iconBg="#E9D5FF" iconColor="#A855F7" />
          <InfoCard icon="currency-inr" label="Unit Price" value={current.unit_price ? `₹${current.unit_price.toLocaleString()}` : 'N/A'} iconBg="#D1FAE5" iconColor="#10B981" />
          <InfoCard icon="ruler" label="Unit Size" value={current.unit_size ? `${current.unit_size} sq ft` : 'N/A'} iconBg="#FED7AA" iconColor="#F97316" />
        </Card.Content>
      </Card>

      {/* Broker Details */}
      <Card style={[styles.sectionCard, { backgroundColor: '#FEF3C7' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="account-tie" size={20} color="#F59E0B" />
            <Text variant="titleMedium" style={styles.sectionTitle}>Broker Details</Text>
          </View>
          
          <InfoCard icon="account-tie" label="Broker" value={current.broker_name || 'Not specified'} iconBg="#FED7AA" iconColor="#F59E0B" />
        </Card.Content>
      </Card>

      {/* Remarks */}
      {current.remarks && (
        <Card style={[styles.sectionCard, { backgroundColor: '#F9FAFB' }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <PaperIcon source="note-text" size={20} color="#6B7280" />
              <Text variant="titleMedium" style={styles.sectionTitle}>Remarks</Text>
            </View>
            
            <View style={styles.remarksBox}>
              <Text variant="bodyMedium" style={styles.remarksText}>{current.remarks}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Allotments', { 
            screen: 'CreateAllotment', 
            params: { bookingId } 
          })}
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          icon="home-group"
        >
          Create Allotment
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditBooking', { bookingId })}
          style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
          icon="pencil"
        >
          Edit Booking
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
          icon="arrow-left"
        >
          Back to List
        </Button>
      </View>
    </ScrollView>
  );
};

const InfoCard = ({ icon, label, value, iconBg, iconColor, multiline }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoCardContent}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <PaperIcon source={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text variant="bodySmall" style={styles.infoLabel}>{label}</Text>
        <Text variant="bodyMedium" style={[styles.infoValue, multiline && styles.infoValueMultiline]}>
          {value}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { margin: 16, marginBottom: 8, backgroundColor: '#EFF6FF' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerText: { marginLeft: 12, flex: 1 },
  bookingId: { fontWeight: '700', color: '#111827' },
  bookingDate: { color: '#6B7280', marginTop: 4 },
  editButton: { backgroundColor: '#F59E0B' },
  sectionCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontWeight: '600', color: '#111827' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12 },
  infoCardContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  infoTextContainer: { flex: 1 },
  infoLabel: { color: '#6B7280', marginBottom: 4 },
  infoValue: { color: '#111827', fontWeight: '600' },
  infoValueMultiline: { lineHeight: 20 },
  remarksBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12 },
  remarksText: { color: '#374151', lineHeight: 22 },
  actions: { padding: 16, gap: 12, marginBottom: 32 },
  actionButton: { width: '100%' },
});

export default BookingDetailsScreen;
