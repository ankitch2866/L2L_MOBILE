import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const DueInstallmentsDashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear().toString());
  const [dueData, setDueData] = useState(null);
  const [error, setError] = useState('');

  const API_BASE = '/api/transaction';

  useEffect(() => {
    if (financialYear && !isNaN(parseInt(financialYear, 10))) {
      fetchDueInstallments();
    } else {
      setError('Invalid financial year');
    }
  }, [financialYear]);

  const fetchDueInstallments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`${API_BASE}/due-installments/financial-year/${financialYear}`);
      if (response.data?.success && response.data.data) {
        setDueData(response.data.data);
      } else {
        setDueData(null);
        setError('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching due installments:', error);
      setDueData(null);
      setError(error.message || 'Failed to fetch due installments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDueInstallments();
    setRefreshing(false);
  };

  const handleExportReport = async () => {
    try {
      if (!dueData || !dueData.customer_breakdown || dueData.customer_breakdown.length === 0) {
        Alert.alert('No Data', 'No due installment data available to export');
        return;
      }

      // Create CSV content
      const headers = ['Customer ID', 'Customer Name', 'Project', 'Unit', 'Due Installments', 'Total Due Amount'];
      const csvContent = [
        headers.join(','),
        ...dueData.customer_breakdown.map(customer => [
          `"${customer.customer_id || ''}"`,
          `"${customer.customer_name || ''}"`,
          `"${customer.project_name || ''}"`,
          `"${customer.unit_name || ''}"`,
          `"${customer.due_installments || 0}"`,
          `"${customer.total_due_amount || 0}"`
        ].join(','))
      ].join('\n');

      // Share the CSV file
      await Share.share({
        message: csvContent,
        title: 'Due Installments Report',
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        filename: `due-installments-${financialYear}.csv`
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Export Error', 'Failed to export report');
    }
  };

  const renderSkeleton = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Dues FinYrs Dashboard
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Financial year due installments overview
          </Text>
        </View>

        {/* Financial Year Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Select Financial Year
            </Text>
            <View style={styles.inputContainer}>
              <Text variant="bodyMedium" style={styles.inputLabel}>
                Financial Year <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  mode="outlined"
                  value={financialYear}
                  onChangeText={setFinancialYear}
                  placeholder="Enter financial year (e.g., 2025)"
                  keyboardType="numeric"
                  style={styles.yearInput}
                  maxLength={4}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Error Message */}
        {error && (
          <Card style={[styles.card, styles.errorCard]}>
            <Card.Content>
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Due Installments Data */}
        {loading ? (
          renderSkeleton()
        ) : dueData ? (
          <>
            {/* Summary Card */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Financial Year Summary
                </Text>
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryItem}>
                    <Text variant="bodyMedium" style={styles.summaryLabel}>
                      Financial Year
                    </Text>
                    <Text variant="headlineSmall" style={styles.summaryValue}>
                      {dueData.financial_year || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text variant="bodyMedium" style={styles.summaryLabel}>
                      Total Due Installments
                    </Text>
                    <Text variant="headlineSmall" style={styles.summaryValue}>
                      {dueData.total_due_installments || 0}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text variant="bodyMedium" style={styles.summaryLabel}>
                      Total Due Amount
                    </Text>
                    <Text variant="headlineSmall" style={[styles.summaryValue, { color: '#EF4444' }]}>
                      {dueData.total_due_amount ? formatCurrency(dueData.total_due_amount) : '₹0'}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Customer Breakdown */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.tableHeader}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Customer Breakdown ({dueData.customer_breakdown?.length || 0})
                  </Text>
                </View>
                <Divider style={styles.divider} />
                
                {dueData.customer_breakdown && dueData.customer_breakdown.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <DataTable>
                      <DataTable.Header>
                        <DataTable.Title>Customer ID</DataTable.Title>
                        <DataTable.Title>Customer Name</DataTable.Title>
                        <DataTable.Title>Project</DataTable.Title>
                        <DataTable.Title>Unit</DataTable.Title>
                        <DataTable.Title>Due Installments</DataTable.Title>
                        <DataTable.Title>Total Due Amount</DataTable.Title>
                      </DataTable.Header>
                      
                      {dueData.customer_breakdown.map((customer, index) => (
                        <DataTable.Row key={customer.customer_id || index}>
                          <DataTable.Cell>
                            <Text variant="bodyMedium" numberOfLines={1}>
                              {customer.customer_id || 'N/A'}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text variant="bodyMedium" numberOfLines={1}>
                              {customer.customer_name || 'N/A'}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text variant="bodyMedium" numberOfLines={1}>
                              {customer.project_name || 'N/A'}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text variant="bodyMedium" numberOfLines={1}>
                              {customer.unit_name || 'N/A'}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text variant="bodyMedium" numberOfLines={1}>
                              {customer.due_installments || 0}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text variant="bodyMedium" numberOfLines={1}>
                              {customer.total_due_amount ? formatCurrency(customer.total_due_amount) : '₹0'}
                            </Text>
                          </DataTable.Cell>
                        </DataTable.Row>
                      ))}
                    </DataTable>
                  </ScrollView>
                ) : (
                  <EmptyState
                    title="No Customer Data"
                    description="No customer breakdown data available for this financial year"
                  />
                )}
              </Card.Content>
            </Card>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={handleExportReport}
                icon="download"
                style={styles.actionButton}
                labelStyle={{ color: '#FFFFFF' }}
              >
                Export Report
              </Button>
            </View>
          </>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <EmptyState
                title="No Data Available"
                description="No due installment data found for the selected financial year"
              />
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
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  errorCard: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  yearInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingLeft: 44,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  summaryItem: {
    minWidth: '30%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 18,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tableHeader: {
    paddingBottom: 16,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E2E8F0',
    height: 1,
  },
  skeletonContainer: {
    padding: 20,
  },
  skeletonLine: {
    height: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 12,
  },
});

export default DueInstallmentsDashboardScreen;