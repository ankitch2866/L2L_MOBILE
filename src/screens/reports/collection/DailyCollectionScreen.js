import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Share } from 'react-native';
import { Text, Card, Button, TextInput, IconButton, Searchbar, FAB, Chip, Menu, Divider } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const DailyCollectionScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [collectionData, setCollectionData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('all');
  
  // UI states
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showPaymentModeMenu, setShowPaymentModeMenu] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchDailyCollection();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyCollection();
    }
  }, [selectedDate, selectedProject, selectedPaymentMode]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/transaction/daily-collection/projects');
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch projects');
      }
      
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects');
    }
  };

  const fetchDailyCollection = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        date: selectedDate,
        ...(selectedProject !== 'all' && { project_id: selectedProject }),
        ...(selectedPaymentMode !== 'all' && { payment_mode: selectedPaymentMode })
      });

      const response = await api.get(`/api/transaction/daily-collection?${params}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch collection data');
      }
      
      setCollectionData(response.data.data);
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setError(error.message || 'Failed to load collection data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyCollection();
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      if (!collectionData || !collectionData.transactions || collectionData.transactions.length === 0) {
        Alert.alert('No Data', 'No transactions available to export');
        return;
      }

      // Create CSV content
      let csvContent = '';
      
      // Add header
      csvContent += `Daily Collection Report - ${formatDate(selectedDate)}\n`;
      csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

      // Add summary
      csvContent += `SUMMARY\n`;
      csvContent += `Total Transactions,${collectionData.summary?.total_transactions || 0}\n`;
      csvContent += `Total Collection,${formatCurrency(collectionData.summary?.total_amount || 0).replace(/,/g, '')}\n`;
      csvContent += `Online Transactions,${collectionData.summary?.online_count || 0}\n`;
      csvContent += `Cheque Transactions,${collectionData.summary?.cheque_count || 0}\n\n`;

      // Add transactions data
      csvContent += `TRANSACTIONS\n`;
      csvContent += `S.No,Application ID,Customer Name,Phone,Project,Unit,Amount,Mode,Date\n`;
      
      collectionData.transactions.forEach((transaction, index) => {
        const serialNo = String(index + 1);
        const appId = String(transaction.manual_application_id || 'N/A').replace(/,/g, ';');
        const customerName = String(transaction.customer_name || 'N/A').replace(/,/g, ';');
        const phone = String(transaction.customer_phone || 'N/A').replace(/,/g, ';');
        const project = String(transaction.project_name || 'N/A').replace(/,/g, ';');
        const unit = String(`${transaction.unit_no || 'N/A'} ${transaction.unit_type ? `(${transaction.unit_type})` : ''}`).replace(/,/g, ';');
        const amount = formatCurrency(transaction.amount || 0).replace(/,/g, '');
        const mode = String(transaction.mode || 'N/A').replace(/,/g, ';');
        const date = String(transaction.formatted_date || 'N/A').replace(/,/g, ';');
        
        csvContent += `${serialNo},${appId},${customerName},${phone},${project},${unit},${amount},${mode},${date}\n`;
      });

      // Share the CSV
      await Share.share({
        message: csvContent,
        title: `Daily Collection Report - ${formatDate(selectedDate)}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    }
  };

  const handleViewDetails = (transaction) => {
    // Navigate to transaction details
    Alert.alert(
      'Transaction Details',
      `Application ID: ${transaction.manual_application_id}\n` +
      `Customer: ${transaction.customer_name}\n` +
      `Amount: ${transaction.formatted_amount}\n` +
      `Mode: ${transaction.mode}\n` +
      `Date: ${transaction.formatted_date}`,
      [{ text: 'OK' }]
    );
  };

  const filteredTransactions = collectionData?.transactions?.filter(transaction => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.customer_name?.toLowerCase().includes(searchLower) ||
      transaction.manual_application_id?.toLowerCase().includes(searchLower) ||
      transaction.project_name?.toLowerCase().includes(searchLower) ||
      transaction.unit_no?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor="#1F2937"
            style={styles.backButton}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Daily Collection
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              size={20}
              onPress={fetchDailyCollection}
              iconColor={theme.colors.primary}
            />
            <Button
              mode="contained"
              onPress={handleExport}
              style={styles.exportButton}
              labelStyle={styles.exportButtonLabel}
            >
              Export
            </Button>
          </View>
        </View>
      </View>

      {/* Filters Section */}
      <Card style={styles.filtersCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.filtersTitle}>
            Filters
          </Text>
          
          <View style={styles.filtersRow}>
            {/* Date Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>Date</Text>
              <TextInput
                mode="outlined"
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                style={styles.filterInput}
                dense
              />
            </View>

            {/* Project Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>Project</Text>
              <Menu
                visible={showProjectMenu}
                onDismiss={() => setShowProjectMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowProjectMenu(true)}
                  >
                    <Text style={styles.filterButtonText}>
                      {selectedProject === 'all' ? 'All Projects' : 
                       projects.find(p => p.project_id.toString() === selectedProject)?.project_name || 'Select Project'}
                    </Text>
                    <IconButton icon="chevron-down" size={16} />
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  title="All Projects"
                  onPress={() => {
                    setSelectedProject('all');
                    setShowProjectMenu(false);
                  }}
                />
                {projects.map((project) => (
                  <Menu.Item
                    key={project.project_id}
                    title={project.project_name}
                    onPress={() => {
                      setSelectedProject(project.project_id.toString());
                      setShowProjectMenu(false);
                    }}
                  />
                ))}
              </Menu>
            </View>

            {/* Payment Mode Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>Payment Mode</Text>
              <Menu
                visible={showPaymentModeMenu}
                onDismiss={() => setShowPaymentModeMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowPaymentModeMenu(true)}
                  >
                    <Text style={styles.filterButtonText}>
                      {selectedPaymentMode === 'all' ? 'All Modes' : 
                       selectedPaymentMode === 'online' ? 'Online' : 'Cheque'}
                    </Text>
                    <IconButton icon="chevron-down" size={16} />
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  title="All Modes"
                  onPress={() => {
                    setSelectedPaymentMode('all');
                    setShowPaymentModeMenu(false);
                  }}
                />
                <Menu.Item
                  title="Online"
                  onPress={() => {
                    setSelectedPaymentMode('online');
                    setShowPaymentModeMenu(false);
                  }}
                />
                <Menu.Item
                  title="Cheque"
                  onPress={() => {
                    setSelectedPaymentMode('cheque');
                    setShowPaymentModeMenu(false);
                  }}
                />
              </Menu>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Error Message */}
      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
        </View>
      ) : collectionData ? (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="credit-card"
                      size={24}
                      iconColor="#3B82F6"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Total Transactions
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1}>
                      {collectionData.summary?.total_transactions || 0}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="currency-inr"
                      size={24}
                      iconColor="#10B981"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Total Collection
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1}>
                      {formatCurrency(collectionData.summary?.total_amount || 0)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="wifi"
                      size={24}
                      iconColor="#8B5CF6"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Online
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1}>
                      {collectionData.summary?.online_count || 0}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="bank"
                      size={24}
                      iconColor="#F59E0B"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Cheque
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1}>
                      {collectionData.summary?.cheque_count || 0}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsContainer}>
            <Text variant="titleMedium" style={styles.transactionsTitle}>
              Transaction Details ({filteredTransactions.length})
            </Text>
            
            {filteredTransactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {filteredTransactions.map((transaction, index) => (
                  <Card key={transaction.transaction_id} style={styles.transactionCard}>
                    <Card.Content style={styles.transactionContent}>
                      {/* Transaction Header */}
                      <View style={styles.transactionHeader}>
                        <View style={styles.transactionInfo}>
                          <Text variant="titleSmall" style={styles.transactionId}>
                            #{transaction.manual_application_id}
                          </Text>
                          <Text variant="bodyMedium" style={styles.customerName}>
                            {transaction.customer_name}
                          </Text>
                        </View>
                        <Chip
                          mode="outlined"
                          compact
                          style={[
                            styles.modeChip,
                            transaction.mode === 'ONLINE' ? styles.onlineChip : styles.chequeChip
                          ]}
                          textStyle={styles.modeText}
                        >
                          {transaction.mode}
                        </Chip>
                      </View>

                      {/* Transaction Details */}
                      <View style={styles.transactionDetails}>
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Project:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            {transaction.project_name}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Unit:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            {transaction.unit_no || 'N/A'} {transaction.unit_type ? `(${transaction.unit_type})` : ''}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Phone:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            {transaction.customer_phone || 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Amount:</Text>
                          <Text variant="bodyMedium" style={styles.amountValue}>
                            {transaction.formatted_amount}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Date:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            {transaction.formatted_date}
                          </Text>
                        </View>
                      </View>

                      {/* Action Button */}
                      <View style={styles.actionContainer}>
                        <Button
                          mode="outlined"
                          onPress={() => handleViewDetails(transaction)}
                          style={styles.viewButton}
                          labelStyle={styles.viewButtonLabel}
                          icon="eye"
                        >
                          View Details
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ) : (
              <View style={styles.emptyTransactionsContainer}>
                <EmptyState
                  icon="calendar-today"
                  title="No transactions found"
                  subtitle="Try adjusting your filters or select a different date"
                />
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="calendar-today"
            title="No collection data available"
            subtitle="Collection data will appear here when available"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backButton: {
    marginLeft: -8,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    fontSize: 18,
    lineHeight: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exportButton: {
    borderRadius: 8,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  exportButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  filtersCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtersTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  filterInput: {
    height: 40,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  filterButtonText: {
    color: '#374151',
    fontSize: 14,
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    height: 48,
    marginHorizontal: 0,
  },
  searchInput: {
    fontSize: 14,
    paddingHorizontal: 8,
    textAlignVertical: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 90,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    height: 90,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryText: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryLabel: {
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
  },
  summaryValue: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 16,
  },
  transactionsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  transactionsTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  transactionContent: {
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionId: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerName: {
    color: '#374151',
    fontWeight: '500',
  },
  modeChip: {
    backgroundColor: '#F3F4F6',
  },
  onlineChip: {
    backgroundColor: '#DBEAFE',
  },
  chequeChip: {
    backgroundColor: '#F3E8FF',
  },
  modeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    color: '#374151',
    fontSize: 12,
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    color: '#059669',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  actionContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewButton: {
    borderColor: '#3B82F6',
  },
  viewButtonLabel: {
    fontSize: 12,
    color: '#3B82F6',
  },
  emptyTransactionsContainer: {
    padding: 32,
  },
});

export default DailyCollectionScreen;