import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchBookingById, updateBookingStatus } from '../../../store/slices/bookingsSlice';

const BookingStatusScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading: bookingLoading } = useSelector(state => state.bookings);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingById(bookingId));
  }, [dispatch, bookingId]);

  useEffect(() => {
    if (current) {
      setSelectedStatus(current.status || 'pending');
    }
  }, [current]);

  const statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Booking is awaiting confirmation' },
    { value: 'confirmed', label: 'Confirmed', description: 'Booking has been confirmed' },
    { value: 'cancelled', label: 'Cancelled', description: 'Booking has been cancelled' },
  ];

  const handleSubmit = async () => {
    if (selectedStatus === current?.status) {
      Alert.alert('No Change', 'Status is already set to this value');
      return;
    }

    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to change the status to "${selectedStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              await dispatch(updateBookingStatus({
                id: bookingId,
                status: selectedStatus,
              })).unwrap();
              Alert.alert('Success', 'Booking status updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (bookingLoading || !current) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Change Booking Status
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Booking: {current.booking_number || 'N/A'}
          </Text>
          <Text variant="bodySmall" style={[styles.currentStatus, { color: theme.colors.textSecondary }]}>
            Current Status: <Text style={{ fontWeight: 'bold' }}>{current.status || 'N/A'}</Text>
          </Text>

          <View style={styles.statusOptions}>
            <RadioButton.Group onValueChange={setSelectedStatus} value={selectedStatus}>
              {statusOptions.map((option) => (
                <View key={option.value} style={styles.statusOption}>
                  <RadioButton.Item
                    label={option.label}
                    value={option.value}
                    status={selectedStatus === option.value ? 'checked' : 'unchecked'}
                    style={styles.radioItem}
                  />
                  <Text variant="bodySmall" style={[styles.statusDescription, { color: theme.colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          </View>

          {selectedStatus === 'cancelled' && (
            <Card style={[styles.warningCard, { backgroundColor: '#FEF3C7' }]}>
              <Card.Content>
                <Text variant="bodyMedium" style={{ color: '#92400E' }}>
                  ⚠️ Cancelling this booking will release the property back to available status. This action will update the property status automatically.
                </Text>
              </Card.Content>
            </Card>
          )}

          {selectedStatus === 'confirmed' && (
            <Card style={[styles.infoCard, { backgroundColor: '#D1FAE5' }]}>
              <Card.Content>
                <Text variant="bodyMedium" style={{ color: '#065F46' }}>
                  ✓ Confirming this booking will lock the property for this customer. The property status will be updated to "Booked" automatically.
                </Text>
              </Card.Content>
            </Card>
          )}

          <View style={styles.buttons}>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || selectedStatus === current?.status}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              Update Status
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16 },
  title: { fontWeight: '600', marginBottom: 8 },
  subtitle: { marginBottom: 4 },
  currentStatus: { marginBottom: 24 },
  statusOptions: { marginBottom: 16 },
  statusOption: { marginBottom: 16 },
  radioItem: { paddingLeft: 0 },
  statusDescription: { marginLeft: 48, marginTop: -8 },
  warningCard: { marginBottom: 16 },
  infoCard: { marginBottom: 16 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default BookingStatusScreen;
