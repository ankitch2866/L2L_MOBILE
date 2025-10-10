import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState, Dropdown } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const StockDashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [filteredStockData, setFilteredStockData] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedUnitDesc, setSelectedUnitDesc] = useState('');
  const [selectedUnitStatus, setSelectedUnitStatus] = useState('');
  const [unitDescriptions, setUnitDescriptions] = useState([]);
  const [descLoading, setDescLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Define unit statuses
  const unitStatuses = [
    { label: 'All Status', value: '' },
    { label: 'Free', value: 'free' },
    { label: 'Hold', value: 'hold' },
    { label: 'Allotted', value: 'allotted' },
    { label: 'Booked', value: 'booked' }
  ];

  useEffect(() => {
    fetchProjects();
    fetchUnitDescriptions();
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [selectedProjectId, selectedUnitDesc, selectedUnitStatus]);

  useEffect(() => {
    filterStockData();
  }, [stockData, searchQuery, selectedProjectId, selectedUnitDesc, selectedUnitStatus]);

  useEffect(() => {
    setSelectedUnitDesc('');
    setSelectedUnitStatus('');
    fetchUnitDescriptions();
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        setProjects(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitDescriptions = async () => {
    if (!selectedProjectId) {
      setUnitDescriptions([]);
      return;
    }

    try {
      setDescLoading(true);
      const response = await api.get(`/api/report/units?project_id=${selectedProjectId}&limit=1000`);
      if (response.data?.success) {
        const units = response.data.data || [];
        const descriptions = [...new Set(units.map(unit => unit.unit_desc).filter(Boolean))];
        setUnitDescriptions(descriptions.map(desc => ({ label: desc, value: desc })));
      } else {
        setUnitDescriptions([]);
      }
    } catch (error) {
      console.error('Error fetching unit descriptions:', error);
      setUnitDescriptions([]);
    } finally {
      setDescLoading(false);
    }
  };

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedProjectId) params.project_id = selectedProjectId;
      if (selectedUnitDesc) params.unit_desc = selectedUnitDesc;
      if (selectedUnitStatus) params.unit_status = selectedUnitStatus;

      const response = await api.get('/api/report/stock', { params });
      if (response.data?.success) {
        const stockData = response.data.data || [];
        console.log('Stock data received:', stockData);
        
        // If a project is selected, get individual units for that project
        if (selectedProjectId && stockData.length > 0) {
          const selectedProject = stockData.find(p => p.project_id === parseInt(selectedProjectId));
          if (selectedProject && selectedProject.units) {
            // Use the units from the stock data
            setStockData(selectedProject.units);
            setFilteredStockData(selectedProject.units);
          } else {
            // Fetch units separately if not included in stock data
            await fetchUnitsForProject(selectedProjectId);
          }
        } else {
          // Show project-level data when no specific project is selected
          setStockData(stockData);
          setFilteredStockData(stockData);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch stock data');
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError(error.message || 'Failed to load stock data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsForProject = async (projectId) => {
    try {
      setLoading(true);
      const params = { project_id: projectId, limit: 1000 };
      if (selectedUnitDesc) params.unit_desc = selectedUnitDesc;
      if (selectedUnitStatus) params.unit_status = selectedUnitStatus;

      const response = await api.get('/api/report/units', { params });
      if (response.data?.success) {
        const units = response.data.data || [];
        console.log('Units fetched for project:', units.length);
        setStockData(units);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch units');
      }
    } catch (error) {
      console.error('Error fetching units for project:', error);
      setError(error.message || 'Failed to load units for project');
    } finally {
      setLoading(false);
    }
  };

  const filterStockData = () => {
    let filtered = [...stockData];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => {
        if (selectedProjectId) {
          // Unit-level search
          return (
            item.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.unit_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.unit_desc_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.unit_desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.status?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          // Project-level search
          return (
            item.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.project_id?.toString().includes(searchQuery.toLowerCase())
          );
        }
      });
    }

    setFilteredStockData(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProjects(),
      fetchUnitDescriptions(),
      fetchStockData()
    ]);
    setRefreshing(false);
  };

  const handleExportReport = async () => {
    try {
      if (filteredStockData.length === 0) {
        Alert.alert('No Data', 'No stock data available to export');
        return;
      }

      let csvContent = '';
      
      if (selectedProjectId) {
        // Export unit-level data
        const headers = ['Unit ID', 'Unit Name', 'Unit Type', 'Unit Description', 'Unit Size', 'BSP', 'Status'];
        csvContent = [
          headers.join(','),
          ...filteredStockData.map(item => [
            `"${item.unit_id || ''}"`,
            `"${item.unit_name || ''}"`,
            `"${item.unit_type || ''}"`,
            `"${item.unit_desc_name || item.unit_desc || ''}"`,
            `"${item.unit_size || ''}"`,
            `"${item.bsp || ''}"`,
            `"${item.status || ''}"`
          ].join(','))
        ].join('\n');
      } else {
        // Export project-level data
        const headers = ['Project ID', 'Project Name', 'Total Units', 'Free', 'Hold', 'Allotted', 'Booked'];
        csvContent = [
          headers.join(','),
          ...filteredStockData.map(item => [
            `"${item.project_id || ''}"`,
            `"${item.project_name || ''}"`,
            `"${item.total_units || 0}"`,
            `"${item.free_count || 0}"`,
            `"${item.hold_count || 0}"`,
            `"${item.allotted_count || 0}"`,
            `"${item.booked_count || 0}"`
          ].join(','))
        ].join('\n');
      }

      // Share the CSV file
      await Share.share({
        message: csvContent,
        title: 'Stock Report',
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        filename: `stock-report-${new Date().toISOString().split('T')[0]}.csv`
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Export Error', 'Failed to export report');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'free': return '#10B981';
      case 'hold': return '#F59E0B';
      case 'allotted': return '#3B82F6';
      case 'booked': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'free': return 'checkmark-circle';
      case 'hold': return 'pause-circle';
      case 'allotted': return 'person-circle';
      case 'booked': return 'lock-closed';
      default: return 'help-circle';
    }
  };

  const calculateSummary = () => {
    if (!filteredStockData.length) {
      return { total: 0, free: 0, hold: 0, allotted: 0, booked: 0 };
    }

    // Check if we have project-level data (aggregated) or unit-level data
    const firstItem = filteredStockData[0];
    const isProjectLevel = firstItem.hasOwnProperty('total_units') || firstItem.hasOwnProperty('free_count');
    
    if (isProjectLevel) {
      // Project-level aggregated data
      const total = filteredStockData.reduce((sum, project) => sum + (project.total_units || 0), 0);
      const free = filteredStockData.reduce((sum, project) => sum + (project.free_count || 0), 0);
      const hold = filteredStockData.reduce((sum, project) => sum + (project.hold_count || 0), 0);
      const allotted = filteredStockData.reduce((sum, project) => sum + (project.allotted_count || 0), 0);
      const booked = filteredStockData.reduce((sum, project) => sum + (project.booked_count || 0), 0);
      
      return { total, free, hold, allotted, booked };
    } else {
      // Unit-level data
      const total = filteredStockData.length;
      const free = filteredStockData.filter(item => item.status?.toLowerCase() === 'free').length;
      const hold = filteredStockData.filter(item => item.status?.toLowerCase() === 'hold').length;
      const allotted = filteredStockData.filter(item => item.status?.toLowerCase() === 'allotted').length;
      const booked = filteredStockData.filter(item => item.status?.toLowerCase() === 'booked').length;
      
      return { total, free, hold, allotted, booked };
    }
  };

  const summary = calculateSummary();

  if (loading && !refreshing) {
    return <LoadingIndicator />;
  }

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
            Stock Dashboard
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            View and manage stock information
          </Text>
        </View>

        {/* Search Panel */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Search
            </Text>
            <TextInput
              mode="outlined"
              placeholder={selectedProjectId ? "Search units by name, type, description, or status..." : "Search projects by name or ID..."}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              left={<TextInput.Icon icon="magnify" />}
              right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : null}
            />
          </Card.Content>
        </Card>

        {/* Filters */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Filters
            </Text>
            
            {/* Project Filter */}
            <View style={styles.filterGroup}>
              <Text variant="bodyMedium" style={styles.filterLabel}>Project</Text>
              <Dropdown
                items={[
                  { label: 'Select Project', value: '' },
                  ...projects.map(p => ({ label: p.project_name, value: p.project_id.toString() }))
                ]}
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                placeholder="Select Project"
                style={styles.dropdown}
              />
            </View>

            {/* Unit Description Filter */}
            <View style={styles.filterGroup}>
              <Text variant="bodyMedium" style={styles.filterLabel}>Unit Description</Text>
              <Dropdown
                items={[
                  { label: 'All Descriptions', value: '' },
                  ...unitDescriptions
                ]}
                value={selectedUnitDesc}
                onValueChange={setSelectedUnitDesc}
                placeholder={descLoading ? "Loading..." : "Select Unit Description"}
                style={styles.dropdown}
                disabled={descLoading || !selectedProjectId}
              />
            </View>

            {/* Unit Status Filter */}
            <View style={styles.filterGroup}>
              <Text variant="bodyMedium" style={styles.filterLabel}>Unit Status</Text>
              <Dropdown
                items={unitStatuses}
                value={selectedUnitStatus}
                onValueChange={setSelectedUnitStatus}
                placeholder="Select Unit Status"
                style={styles.dropdown}
              />
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

        {/* Summary Cards */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Summary
            </Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={styles.summaryValue}>
                  {summary.total}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Total Units
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#10B981' }]}>
                  {summary.free}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Free
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#F59E0B' }]}>
                  {summary.hold}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Hold
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#3B82F6' }]}>
                  {summary.allotted}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Allotted
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#EF4444' }]}>
                  {summary.booked}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Booked
                </Text>
              </View>
            </View>
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

        {/* Stock Data Cards */}
        <View style={styles.cardsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {selectedProjectId ? `Units for Selected Project (${filteredStockData.length})` : `Stock Overview (${filteredStockData.length} Projects)`}
          </Text>
          
          {filteredStockData.length > 0 ? (
            <View style={styles.cardsGrid}>
              {filteredStockData.map((item, index) => (
                <Card key={selectedProjectId ? item.unit_id || index : item.project_id || index} style={styles.dataCard}>
                  <Card.Content style={styles.cardContent}>
                    {selectedProjectId ? (
                      // Unit-level card
                      <>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardTitleContainer}>
                            <Text variant="titleMedium" style={styles.cardTitle}>
                              {item.unit_name || 'N/A'}
                            </Text>
                            <Text variant="bodySmall" style={styles.cardSubtitle}>
                              ID: {item.unit_id || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.statusBadge}>
                            <Ionicons 
                              name={getStatusIcon(item.status)} 
                              size={16} 
                              color={getStatusColor(item.status)} 
                            />
                            <Text 
                              variant="bodySmall" 
                              style={[styles.statusText, { color: getStatusColor(item.status) }]}
                            >
                              {item.status || 'N/A'}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.cardDetails}>
                          <View style={styles.detailRow}>
                            <Ionicons name="business" size={16} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailText}>
                              Type: {item.unit_type || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Ionicons name="document-text" size={16} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailText}>
                              Desc: {item.unit_desc_name || item.unit_desc || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Ionicons name="resize" size={16} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailText}>
                              Size: {item.unit_size || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Ionicons name="cash" size={16} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailText}>
                              BSP: {item.bsp ? formatCurrency(item.bsp) : 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </>
                    ) : (
                      // Project-level card
                      <>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardTitleContainer}>
                            <Text variant="titleMedium" style={styles.cardTitle}>
                              {item.project_name || 'N/A'}
                            </Text>
                            <Text variant="bodySmall" style={styles.cardSubtitle}>
                              Project ID: {item.project_id || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.totalUnitsBadge}>
                            <Text variant="titleMedium" style={styles.totalUnitsText}>
                              {item.total_units || 0}
                            </Text>
                            <Text variant="bodySmall" style={styles.totalUnitsLabel}>
                              Total Units
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.statusCountsContainer}>
                          <View style={styles.statusCount}>
                            <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
                            <Text variant="bodySmall" style={styles.statusCountText}>
                              Free: {item.free_count || 0}
                            </Text>
                          </View>
                          <View style={styles.statusCount}>
                            <View style={[styles.statusIndicator, { backgroundColor: '#F59E0B' }]} />
                            <Text variant="bodySmall" style={styles.statusCountText}>
                              Hold: {item.hold_count || 0}
                            </Text>
                          </View>
                          <View style={styles.statusCount}>
                            <View style={[styles.statusIndicator, { backgroundColor: '#3B82F6' }]} />
                            <Text variant="bodySmall" style={styles.statusCountText}>
                              Allotted: {item.allotted_count || 0}
                            </Text>
                          </View>
                          <View style={styles.statusCount}>
                            <View style={[styles.statusIndicator, { backgroundColor: '#EF4444' }]} />
                            <Text variant="bodySmall" style={styles.statusCountText}>
                              Booked: {item.booked_count || 0}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          ) : (
            <EmptyState
              title="No Stock Data Found"
              description={selectedProjectId ? 'No units available for the selected project' : 'Please select a project to view stock data'}
            />
          )}
        </View>
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
  searchCard: {
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
  filterCard: {
    margin: 20,
    marginTop: 20,
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
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
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
    minWidth: '18%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  summaryValue: {
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 24,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  cardsContainer: {
    margin: 20,
    marginTop: 0,
  },
  cardsGrid: {
    gap: 16,
    marginTop: 16,
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 16,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalUnitsBadge: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalUnitsText: {
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 18,
  },
  totalUnitsLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#64748B',
    fontSize: 13,
    flex: 1,
  },
  statusCountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  statusCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusCountText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default StockDashboardScreen;