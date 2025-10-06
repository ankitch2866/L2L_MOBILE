import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context';
import { LoadingIndicator } from '../../components';
import { Icon as PaperIcon } from 'react-native-paper';
import { fetchCustomerById, deleteCustomer, clearCurrentCustomer } from '../../store/slices/customersSlice';

const CustomerDetailsScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { currentCustomer, loading } = useSelector(state => state.customers);

  useEffect(() => {
    dispatch(fetchCustomerById(customerId));
    return () => dispatch(clearCurrentCustomer());
  }, [dispatch, customerId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      `Delete "${currentCustomer?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteCustomer(customerId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading) return <LoadingIndicator />;
  if (!currentCustomer) return null;

  const DetailRow = ({ icon, label, value, iconColor }) => (
    <View style={styles.row}>
      <PaperIcon source={icon} size={20} color={iconColor || theme.colors.primary} />
      <View style={styles.rowContent}>
        <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>{label}</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.text, fontWeight: '500' }}>
          {value || 'N/A'}
        </Text>
      </View>
    </View>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Card */}
      <Card style={[styles.headerCard, { backgroundColor: '#E3F2FD' }]}>
        <Card.Content>
          <View style={styles.headerRow}>
            <PaperIcon source="account-circle" size={48} color="#1976D2" />
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.customerName}>
                {currentCustomer.name}
              </Text>
              <Chip icon="identifier" style={styles.chip}>
                {currentCustomer.manual_application_id}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Section 1: Customer Information - Light Blue */}
      <Card style={[styles.sectionCard, { backgroundColor: '#E3F2FD' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="account" size={24} color="#1976D2" />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: '#1976D2' }]}>
              Customer Information
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            Basic details and identification
          </Text>
          <Divider style={styles.divider} />
          <DetailRow icon="identifier" label="Customer ID" value={currentCustomer.manual_application_id} iconColor="#1976D2" />
          <DetailRow icon="account" label="Name" value={currentCustomer.name} iconColor="#1976D2" />
          <DetailRow icon="office-building" label="Project Name" value={currentCustomer.project_name} iconColor="#1976D2" />
          <DetailRow icon="receipt" label="Booking Receipt" value={currentCustomer.booking_receipt} iconColor="#1976D2" />
        </Card.Content>
      </Card>

      {/* Section 2: Personal Information - Light Green */}
      <Card style={[styles.sectionCard, { backgroundColor: '#E8F5E8' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="account-details" size={24} color="#2E7D32" />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: '#2E7D32' }]}>
              Personal Information
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            Family details and personal identification
          </Text>
          <Divider style={styles.divider} />
          <DetailRow icon="account-supervisor" label="Father's Name" value={currentCustomer.father_name} iconColor="#2E7D32" />
          <DetailRow icon="account-multiple" label="Grandfather's Name" value={currentCustomer.grandfather_name} iconColor="#2E7D32" />
          <DetailRow icon="calendar" label="Date of Birth" value={formatDate(currentCustomer.allottee_dob)} iconColor="#2E7D32" />
          <DetailRow icon="account-tie" label="Broker" value={currentCustomer.broker_name || 'No broker assigned'} iconColor="#2E7D32" />
        </Card.Content>
      </Card>

      {/* Section 3: Contact Information - Light Orange */}
      <Card style={[styles.sectionCard, { backgroundColor: '#FFF3E0' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="email" size={24} color="#F57C00" />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: '#F57C00' }]}>
              Contact Information
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            Communication details and contact methods
          </Text>
          <Divider style={styles.divider} />
          <DetailRow icon="email" label="Email Address" value={currentCustomer.email} iconColor="#F57C00" />
          <DetailRow icon="phone" label="Phone Number" value={currentCustomer.phone_no} iconColor="#F57C00" />
          <DetailRow icon="home" label="Permanent Address" value={currentCustomer.permanent_address} iconColor="#F57C00" />
          <DetailRow icon="mailbox" label="Mailing Address" value={currentCustomer.mailing_address || 'Same as permanent'} iconColor="#F57C00" />
        </Card.Content>
      </Card>

      {/* Section 4: Location Information - Light Purple */}
      <Card style={[styles.sectionCard, { backgroundColor: '#F3E5F5' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="map-marker" size={24} color="#7B1FA2" />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: '#7B1FA2' }]}>
              Location Information
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            Address details and geographical information
          </Text>
          <Divider style={styles.divider} />
          <DetailRow icon="city" label="City" value={currentCustomer.city} iconColor="#7B1FA2" />
          <DetailRow icon="map" label="State" value={currentCustomer.state} iconColor="#7B1FA2" />
          <DetailRow icon="mailbox" label="Pincode" value={currentCustomer.pincode} iconColor="#7B1FA2" />
          <DetailRow icon="earth" label="Country" value={currentCustomer.country} iconColor="#7B1FA2" />
        </Card.Content>
      </Card>

      {/* Section 5: Additional Details - Light Pink */}
      <Card style={[styles.sectionCard, { backgroundColor: '#FCE4EC' }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <PaperIcon source="information" size={24} color="#C2185B" />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: '#C2185B' }]}>
              Additional Details
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            Tax information and legal documents
          </Text>
          <Divider style={styles.divider} />
          <DetailRow icon="card-account-details" label="PAN Number" value={currentCustomer.pan_no} iconColor="#C2185B" />
          <DetailRow icon="card-account-details" label="Aadhar Number" value={currentCustomer.aadhar_no} iconColor="#C2185B" />
          <DetailRow icon="file-document" label="GSTIN" value={currentCustomer.gstin} iconColor="#C2185B" />
          <DetailRow icon="account-heart" label="Nominee Name" value={currentCustomer.nominee_name} iconColor="#C2185B" />
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditCustomer', { customerId })}
              style={[styles.button, { backgroundColor: '#FF9800' }]}
              icon="pencil"
            >
              Edit Customer
            </Button>
            <Button
              mode="outlined"
              onPress={handleDelete}
              textColor="#EF4444"
              style={styles.button}
              icon="delete"
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { margin: 16, marginBottom: 8, elevation: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerText: { flex: 1 },
  customerName: { fontWeight: 'bold', marginBottom: 8 },
  chip: { alignSelf: 'flex-start' },
  sectionCard: { margin: 16, marginTop: 8, marginBottom: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontWeight: 'bold', fontSize: 18 },
  sectionSubtitle: { color: '#6c757d', fontStyle: 'italic', marginBottom: 12 },
  divider: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  rowContent: { flex: 1 },
  actionsCard: { margin: 16, marginTop: 8, elevation: 2 },
  actions: { flexDirection: 'row', gap: 12 },
  button: { flex: 1 },
  bottomSpacing: { height: 24 },
});

export default CustomerDetailsScreen;
