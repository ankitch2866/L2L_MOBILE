import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Share, Animated } from 'react-native';
import { Text, Card, Button, TextInput, IconButton, Searchbar, FAB, Chip, Menu, Divider } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const UnitWiseCollectionScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [unitData, setUnitData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBroker, setSelectedBroker] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // UI states
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showBrokerMenu, setShowBrokerMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const filtersOpacity = useRef(new Animated.Value(1)).current;
  const filtersTranslateY = useRef(new Animated.Value(0)).current;
  const dataMarginTop = useRef(new Animated.Value(235)).current;

  useEffect(() => {
    fetchProjects();
    // Initialize data margin based on initial filter state
    dataMarginTop.setValue(showFilters ? 235 : 75);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchBrokers();
      fetchUnitWiseCollection();
    } else {
      setUnitData([]);
      setBrokers([]);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      fetchUnitWiseCollection();
    }
  }, [selectedBroker, fromDate, toDate]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/master/projects');
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch projects');
      }
      
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects');
    }
  };

  const fetchBrokers = async () => {
    try {
      const response = await api.get(`/api/master/brokers/project/${selectedProject}`);
      
      if (!response.data?.success) {
        setBrokers([]);
        return;
      }
      
      setBrokers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
      setBrokers([]);
    }
  };

  const fetchUnitWiseCollection = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!selectedProject) {
        setUnitData([]);
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        project_id: selectedProject,
        ...(selectedBroker && { broker_id: selectedBroker }),
        ...(fromDate && { from_date: fromDate }),
        ...(toDate && { to_date: toDate })
      });

      const response = await api.get(`/api/transaction/unit-wise-collection?${params}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch unit collection data');
      }
      
      const data = response.data.data || [];
      console.log('Unit Wise Collection Data:', {
        totalCustomers: data.length,
        totalUnits: data.filter(c => c.unit_name).length,
        totalBrokers: new Set(data.map(c => c.broker_id).filter(Boolean)).size,
        totalCollection: data.reduce((sum, c) => sum + (c.total_amount || 0), 0)
      });
      
      setUnitData(data);
    } catch (error) {
      console.error('Error fetching unit collection data:', error);
      setError(error.message || 'Failed to load unit collection data');
      setUnitData([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUnitWiseCollection();
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      if (!unitData || unitData.length === 0) {
        Alert.alert('No Data', 'No unit collection data available to export');
        return;
      }

      // Create CSV content
      let csvContent = '';
      
      // Add header
      csvContent += `Unit Wise Collection Report\n`;
      csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

      // Add summary
      csvContent += `SUMMARY\n`;
      csvContent += `Total Customers,${unitData.length}\n`;
      csvContent += `Total Collection,${formatCurrency(unitData.reduce((sum, customer) => sum + (customer.total_amount || 0), 0)).replace(/,/g, '')}\n\n`;

      // Add unit data
      csvContent += `UNIT COLLECTION DATA\n`;
      csvContent += `Customer Name,Phone,Address,Unit No,Unit Type,Area,Total Amount,Base Amount,Charges\n`;
      
      unitData.forEach((customer) => {
        const customerName = String(customer.customer_name || 'N/A').replace(/,/g, ';');
        const phone = String(customer.contact_number || 'N/A').replace(/,/g, ';');
        const address = String(customer.customer_address || 'N/A').replace(/,/g, ';');
        const unitNo = String(customer.unit_name || 'N/A').replace(/,/g, ';');
        const unitType = String(customer.unit_type || 'N/A').replace(/,/g, ';');
        const area = String(customer.area_sqft || 'N/A').replace(/,/g, ';');
        const totalAmount = formatCurrency(customer.total_amount || 0).replace(/,/g, '');
        const baseAmount = formatCurrency(customer.base_amount || 0).replace(/,/g, '');
        const charges = formatCurrency(customer.total_charges || 0).replace(/,/g, '');
        
        csvContent += `${customerName},${phone},${address},${unitNo},${unitType},${area},${totalAmount},${baseAmount},${charges}\n`;
      });

      // Share the CSV
      await Share.share({
        message: csvContent,
        title: `Unit Wise Collection Report`,
      });

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    }
  };

  const handleViewCustomer = (customer) => {
    // Navigate to customer details
    Alert.alert(
      'Customer Details',
      `Name: ${customer.customer_name}\n` +
      `Phone: ${customer.contact_number}\n` +
      `Unit: ${customer.unit_name}\n` +
      `Total Amount: ${formatCurrency(customer.total_amount || 0)}`,
      [{ text: 'OK' }]
    );
  };

  const filteredUnitData = unitData.filter(customer => {
    // Apply broker filter
    if (selectedBroker && customer.broker_id !== parseInt(selectedBroker)) {
      return false;
    }
    
    // Apply search filter
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.customer_name?.toLowerCase().includes(searchLower) ||
      customer.contact_number?.toLowerCase().includes(searchLower) ||
      customer.unit_name?.toLowerCase().includes(searchLower) ||
      customer.unit_type?.toLowerCase().includes(searchLower)
    );
  });

  const clearFilters = () => {
    setSelectedProject('');
    setSelectedBroker('');
    setFromDate('');
    setToDate('');
    setUnitData([]);
    setBrokers([]);
    setError('');
  };

  const toggleFilters = () => {
    const newShowFilters = !showFilters;
    setShowFilters(newShowFilters);
    
    // Data area responds immediately
    dataMarginTop.setValue(newShowFilters ? 235 : 75);
    
    // Filter card animates smoothly
    Animated.parallel([
      Animated.timing(filtersOpacity, {
        toValue: newShowFilters ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(filtersTranslateY, {
        toValue: newShowFilters ? 0 : -20,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(currentScrollY);
    
    // More responsive threshold and immediate data positioning
    if (currentScrollY > 50) {
      if (showFilters) {
        setShowFilters(false);
        // Data area responds immediately
        dataMarginTop.setValue(75);
        
        // Filter card animates smoothly
        Animated.parallel([
          Animated.timing(filtersOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(filtersTranslateY, {
            toValue: -20,
            duration: 150,
            useNativeDriver: true,
          })
        ]).start();
      }
    } else if (currentScrollY < 20) {
      if (!showFilters) {
        setShowFilters(true);
        // Data area responds immediately
        dataMarginTop.setValue(235);
        
        // Filter card animates smoothly
        Animated.parallel([
          Animated.timing(filtersOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(filtersTranslateY, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          })
        ]).start();
      }
    }
  };

  if (loading && projects.length === 0) {
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
            Unit Wise Collection
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              size={20}
              onPress={fetchUnitWiseCollection}
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

      {/* Search Bar - Shows when filters are hidden */}
      {!showFilters && (
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search customers, units..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
          />
        </View>
      )}

      {/* Filters Section */}
      <Animated.View style={[styles.filtersContainer, { 
        opacity: filtersOpacity,
        transform: [{ translateY: filtersTranslateY }]
      }]}>
        <Card style={styles.filtersCard}>
        <Card.Content>
          <View style={styles.filtersHeader}>
            <Text variant="titleMedium" style={styles.filtersTitle}>
              Filters
            </Text>
            <Button
              mode="text"
              onPress={clearFilters}
              style={styles.clearButton}
              labelStyle={styles.clearButtonLabel}
            >
              Clear All
            </Button>
          </View>
          
          <View style={styles.filtersRow}>
            {/* Project Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>Project *</Text>
              <Menu
                visible={showProjectMenu}
                onDismiss={() => setShowProjectMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowProjectMenu(true)}
                  >
                    <Text style={styles.filterButtonText}>
                      {selectedProject ? 
                       projects.find(p => p.project_id.toString() === selectedProject)?.project_name || 'Select Project' :
                       'Select Project'}
                    </Text>
                    <IconButton icon="chevron-down" size={16} />
                  </TouchableOpacity>
                }
              >
                {projects.map((project) => (
                  <Menu.Item
                    key={project.project_id}
                    title={project.project_name}
                    onPress={() => {
                      setSelectedProject(project.project_id.toString());
                      setSelectedBroker('');
                      setShowProjectMenu(false);
                    }}
                  />
                ))}
              </Menu>
            </View>

            {/* Broker Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>Broker</Text>
              <Menu
                visible={showBrokerMenu}
                onDismiss={() => setShowBrokerMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={[styles.filterButton, !selectedProject && styles.disabledButton]}
                    onPress={() => selectedProject && setShowBrokerMenu(true)}
                    disabled={!selectedProject}
                  >
                    <Text style={[styles.filterButtonText, !selectedProject && styles.disabledText]}>
                      {selectedBroker ? 
                       brokers.find(b => b.broker_id.toString() === selectedBroker)?.broker_name || 'Select Broker' :
                       'All Brokers'}
                    </Text>
                    <IconButton icon="chevron-down" size={16} />
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  title="All Brokers"
                  onPress={() => {
                    setSelectedBroker('');
                    setShowBrokerMenu(false);
                  }}
                />
                {brokers.map((broker) => (
                  <Menu.Item
                    key={broker.broker_id}
                    title={broker.broker_name}
                    onPress={() => {
                      setSelectedBroker(broker.broker_id.toString());
                      setShowBrokerMenu(false);
                    }}
                  />
                ))}
              </Menu>
            </View>
          </View>

          <View style={styles.filtersRow}>
            {/* From Date Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>From Date</Text>
              <TextInput
                mode="outlined"
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
                style={styles.filterInput}
                dense
              />
            </View>

            {/* To Date Filter */}
            <View style={styles.filterItem}>
              <Text variant="bodySmall" style={styles.filterLabel}>To Date</Text>
              <TextInput
                mode="outlined"
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
                style={styles.filterInput}
                dense
              />
            </View>
          </View>
        </Card.Content>
        </Card>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search customers..."
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
      {loading && selectedProject ? (
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading unit collection data...
          </Text>
        </View>
      ) : unitData.length > 0 ? (
        <Animated.ScrollView 
          style={[styles.scrollView, { marginTop: dataMarginTop }]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
                      icon="account-group"
                      size={24}
                      iconColor="#3B82F6"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Total Customers
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">
                      {unitData.length}
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
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">
                      {(() => {
                        const total = unitData.reduce((sum, customer) => sum + (customer.total_amount || 0), 0);
                        if (total >= 10000000) {
                          return `₹${(total / 10000000).toFixed(1)}Cr`;
                        } else if (total >= 100000) {
                          return `₹${(total / 100000).toFixed(1)}L`;
                        } else if (total >= 1000) {
                          return `₹${(total / 1000).toFixed(1)}K`;
                        }
                        return formatCurrency(total);
                      })()}
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
                      icon="home"
                      size={24}
                      iconColor="#8B5CF6"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Total Units
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">
                      {unitData.filter(c => c.unit_name).length}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryIcon}>
                    <IconButton
                      icon="account-tie"
                      size={24}
                      iconColor="#F59E0B"
                    />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Brokers
                    </Text>
                    <Text variant="titleMedium" style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">
                      {new Set(unitData.map(c => c.broker_id).filter(Boolean)).size}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </View>

          {/* Unit Collection List */}
          <View style={styles.unitsContainer}>
            <Text variant="titleMedium" style={styles.unitsTitle}>
              Customer Collection Details ({filteredUnitData.length})
            </Text>
            
            {filteredUnitData.length > 0 ? (
              <View style={styles.unitsList}>
                {filteredUnitData.map((customer, index) => (
                  <Card key={customer.customer_id || index} style={styles.unitCard}>
                    <Card.Content style={styles.unitContent}>
                      {/* Customer Header */}
                      <View style={styles.customerHeader}>
                        <View style={styles.customerInfo}>
                          <Text variant="titleSmall" style={styles.customerName}>
                            {customer.customer_name || 'N/A'}
                          </Text>
                          <Text variant="bodySmall" style={styles.customerPhone}>
                            {customer.contact_number || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.customerNumber}>
                          <Text variant="bodySmall" style={styles.customerNumberText}>
                            #{index + 1}
                          </Text>
                        </View>
                      </View>

                      {/* Unit Details */}
                      <View style={styles.unitDetails}>
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Address:</Text>
                          <Text variant="bodySmall" style={styles.detailValue} numberOfLines={2}>
                            {customer.customer_address || 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Unit No:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            {customer.unit_name || 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Unit Type:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            {customer.unit_type || 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text variant="bodySmall" style={styles.detailLabel}>Area:</Text>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            {customer.area_sqft || 'N/A'} sq ft
                          </Text>
                        </View>
                      </View>

                      {/* Financial Summary */}
                      <View style={styles.financialSummary}>
                        <View style={styles.amountRow}>
                          <Text variant="bodySmall" style={styles.amountLabel}>Total Amount:</Text>
                          <Text variant="titleMedium" style={styles.totalAmount}>
                            {formatCurrency(customer.total_amount || 0)}
                          </Text>
                        </View>
                        
                        <View style={styles.breakdownRow}>
                          <Text variant="bodySmall" style={styles.breakdownText}>
                            Base: {formatCurrency(customer.base_amount || 0)}
                          </Text>
                          <Text variant="bodySmall" style={styles.breakdownText}>
                            Charges: {formatCurrency(customer.total_charges || 0)}
                          </Text>
                        </View>
                      </View>

                      {/* Action Button */}
                      <View style={styles.actionContainer}>
                        <Button
                          mode="outlined"
                          onPress={() => handleViewCustomer(customer)}
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
              <View style={styles.emptyUnitsContainer}>
                <EmptyState
                  icon="home-search"
                  title="No customers found"
                  subtitle="Try adjusting your filters or search criteria"
                />
              </View>
            )}
          </View>
        </Animated.ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="home-search"
            title={selectedProject ? "No unit collection data available" : "Select a project to view data"}
            subtitle={selectedProject ? "No data found for the selected project and filters" : "Please select a project from the filters above to view unit collection details"}
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
  filtersContainer: {
    position: 'absolute',
    top: 72, // Position below header
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
  },
  filtersCard: {
    margin: 16,
    marginBottom: 8, // Increased bottom margin for better spacing
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  clearButton: {
    minWidth: 0,
  },
  clearButtonLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
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
  disabledButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    color: '#374151',
    fontSize: 14,
    flex: 1,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  searchContainer: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    zIndex: 999,
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
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
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    textAlign: 'center',
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
    paddingTop: 8, // Reduced top padding
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
    height: 110,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    height: 110,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryText: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    flexShrink: 1,
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
    fontSize: 11,
    lineHeight: 13,
    flexShrink: 1,
    minWidth: 0,
  },
  unitsContainer: {
    padding: 16,
    paddingTop: 4, // Reduced top padding
  },
  unitsTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  unitsList: {
    gap: 12,
  },
  unitCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  unitContent: {
    padding: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerPhone: {
    color: '#6B7280',
    fontSize: 12,
  },
  customerNumber: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  customerNumberText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
  },
  unitDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  financialSummary: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amountLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  totalAmount: {
    color: '#059669',
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownText: {
    color: '#6B7280',
    fontSize: 10,
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
  emptyUnitsContainer: {
    padding: 32,
  },
});

export default UnitWiseCollectionScreen;