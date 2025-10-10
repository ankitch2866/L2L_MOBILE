import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Text, Card, IconButton, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerDetailFromProjectScreen = ({ navigation, route }) => {
  const { customerId, projectId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch customer details
      const response = await api.get(`/api/master/customers/${customerId}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch customer details');
      }

      setCustomer(response.data.data);

      // Payment details API endpoints are not available in mobile backend
      // Removed payment-related state and functionality

    } catch (error) {
      console.error('Error fetching customer details:', error);
      setError(error.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomerDetails();
    setRefreshing(false);
  };

  const shareCustomer = async () => {
    if (!customer) return;
    
    try {
      await Share.share({
        message: `Customer: ${customer.name}\nID: ${customer.manual_application_id}\nPhone: ${customer.phone_no}\nEmail: ${customer.email}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading customer details..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="account-alert"
          title="Customer not found"
          subtitle="Unable to load customer information"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Text variant="headlineSmall" style={styles.title} numberOfLines={1}>
              {customer.name || 'Customer Details'}
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              ID: {customer.manual_application_id || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <IconButton
            icon="refresh"
            size={24}
            iconColor={theme.colors.primary}
            onPress={onRefresh}
            style={styles.iconButton}
          />
          <IconButton
            icon="share"
            size={24}
            iconColor={theme.colors.primary}
            onPress={shareCustomer}
            style={styles.iconButton}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Customer Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Customer Information
              </Text>
              <Chip mode="outlined" style={styles.statusChip}>
                Active
              </Chip>
            </View>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Name:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {customer.name || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Application ID:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {customer.manual_application_id || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Phone:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {customer.phone_no || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Email:</Text>
                <Text variant="bodyMedium" style={styles.infoValue} numberOfLines={2}>
                  {customer.email || 'N/A'}
                </Text>
              </View>

              {customer.address && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Address:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.address}
                  </Text>
                </View>
              )}

              {customer.relation_name && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>S/o/W/o/D/o:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.relation_name}
                  </Text>
                </View>
              )}

              {customer.father_name && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Father Name:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.father_name}
                  </Text>
                </View>
              )}

              {customer.grandfather_name && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Grand Father:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.grandfather_name}
                  </Text>
                </View>
              )}

              {customer.pan_no && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>PAN No:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.pan_no}
                  </Text>
                </View>
              )}

              {customer.aadhar_no && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Aadhar No:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.aadhar_no}
                  </Text>
                </View>
              )}

              {customer.gstin && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>GSTIN:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.gstin}
                  </Text>
                </View>
              )}

              {customer.mobile_no && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Mobile:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.mobile_no}
                  </Text>
                </View>
              )}

              {customer.fax_no && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Fax:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.fax_no}
                  </Text>
                </View>
              )}

              {customer.property_id && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Property ID:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.property_id}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Created Date:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {customer.created_at ? formatDate(customer.created_at) : 'N/A'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Unit Details Card */}
        {(customer.unit_name || customer.project_name) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Unit Details
              </Text>
              
              <View style={styles.infoGrid}>
                {customer.project_name && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Project:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {customer.project_name}
                    </Text>
                  </View>
                )}

                {customer.unit_name && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Unit:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {customer.unit_name}
                    </Text>
                  </View>
                )}

                {customer.unit_size && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Size:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {customer.unit_size}
                    </Text>
                  </View>
                )}

                {customer.rate && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Rate:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {formatCurrency(customer.rate)}/sq. ft.
                    </Text>
                  </View>
                )}

                {customer.plc_applicable && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>PLC Applicable:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {customer.plc_applicable}
                    </Text>
                  </View>
                )}

                {customer.bba_status && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>BBA Status:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {customer.bba_status}
                    </Text>
                  </View>
                )}

                {customer.unit_desc && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Description:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {customer.unit_desc}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Co-Applicant Details (if available) */}
        {customer.co_applicant_name && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Co-Applicant Details
              </Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Name:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.co_applicant_name}
                  </Text>
                </View>

                {customer.co_applicant_phone && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Phone:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {customer.co_applicant_phone}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    margin: 0,
    marginLeft: 4,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  statusChip: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    color: '#6B7280',
    fontWeight: '500',
    width: 120,
    marginRight: 8,
  },
  infoValue: {
    color: '#1F2937',
    flex: 1,
  },
});

export default CustomerDetailFromProjectScreen;

