import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Text, Card, IconButton, Chip, Divider } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerDetailFromYearScreen = ({ navigation, route }) => {
  const { customerId, projectId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);
  const [financialData, setFinancialData] = useState([]);

  // Generate financial years
  const currentYear = new Date().getFullYear();
  const startYear = 2012;
  const financialYears = [];
  for (let year = startYear; year <= currentYear; year++) {
    const nextYear = year + 1;
    financialYears.push(`${year}-${nextYear.toString().slice(-2)}`);
  }

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
      
      // Generate mock financial year data (replace with actual API when available)
      const mockData = financialYears.map(year => {
        const currentYearStr = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
        const prevYearStr = `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
        
        let amount = 0;
        if (year === prevYearStr) {
          amount = Math.floor(Math.random() * 500000) + 25000;
        } else if (year === currentYearStr) {
          amount = Math.floor(Math.random() * 500000) + 50000;
        }
        
        return {
          year,
          amount
        };
      }).filter(item => item.amount > 0);
      
      setFinancialData(mockData);
      
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
      const totalAmount = financialData.reduce((sum, item) => sum + item.amount, 0);
      await Share.share({
        message: `Customer: ${customer.name}\nID: ${customer.manual_application_id}\nTotal (All Years): ${formatCurrency(totalAmount)}`,
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

  const totalAllYears = financialData.reduce((sum, item) => sum + item.amount, 0);

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
              Financial Year Report
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
              <Chip mode="outlined" style={styles.idChip}>
                {customer.manual_application_id || 'N/A'}
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

              {customer.property_id && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Property ID:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.property_id}
                  </Text>
                </View>
              )}

              {customer.pan_no && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>PAN:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.pan_no}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Created:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {customer.created_at ? formatDate(customer.created_at) : 'N/A'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Total Summary Card */}
        <Card style={[styles.card, styles.summaryCard]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total (All Financial Years)
            </Text>
            <Text variant="displaySmall" style={styles.summaryAmount}>
              {formatCurrency(totalAllYears)}
            </Text>
            <Text variant="bodySmall" style={styles.summarySubtitle}>
              Across {financialData.length} financial year(s)
            </Text>
          </Card.Content>
        </Card>

        {/* Financial Year Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Financial Year Breakdown
            </Text>
            
            <View style={styles.yearsList}>
              {financialData.length > 0 ? (
                financialData.map((item, index) => (
                  <View key={index}>
                    <View style={styles.yearItem}>
                      <View style={styles.yearInfo}>
                        <Text variant="titleSmall" style={styles.yearLabel}>
                          FY {item.year}
                        </Text>
                        <Text variant="bodySmall" style={styles.yearPeriod}>
                          {item.year.split('-')[0]} - {item.year.split('-')[1]}
                        </Text>
                      </View>
                      <View style={styles.yearAmountContainer}>
                        <Text variant="titleMedium" style={styles.yearAmount}>
                          {formatCurrency(item.amount)}
                        </Text>
                        <Text variant="bodySmall" style={styles.yearPercentage}>
                          {((item.amount / totalAllYears) * 100).toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    {index < financialData.length - 1 && <Divider style={styles.yearDivider} />}
                  </View>
                ))
              ) : (
                <View style={styles.emptyYears}>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    No financial year data available
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Property Details (if available) */}
        {(customer.project_name || customer.unit_name) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Property Details
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
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Contact Information
            </Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.infoLabel}>Mobile:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {customer.mobile_no || customer.phone_no || 'N/A'}
                </Text>
              </View>

              {customer.email && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Email:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue} numberOfLines={2}>
                    {customer.email}
                  </Text>
                </View>
              )}

              {customer.address && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.infoLabel}>Address:</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {customer.address}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
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
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
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
  idChip: {
    backgroundColor: '#F3F4F6',
  },
  summaryTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryAmount: {
    color: '#3B82F6',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtitle: {
    color: '#6B7280',
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
    width: 100,
    marginRight: 8,
  },
  infoValue: {
    color: '#1F2937',
    flex: 1,
  },
  yearsList: {
    marginTop: 16,
  },
  yearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  yearInfo: {
    flex: 1,
  },
  yearLabel: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  yearPeriod: {
    color: '#6B7280',
    marginTop: 2,
  },
  yearAmountContainer: {
    alignItems: 'flex-end',
  },
  yearAmount: {
    color: '#059669',
    fontWeight: 'bold',
  },
  yearPercentage: {
    color: '#6B7280',
    marginTop: 2,
  },
  yearDivider: {
    marginVertical: 0,
  },
  emptyYears: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
  },
});

export default CustomerDetailFromYearScreen;

