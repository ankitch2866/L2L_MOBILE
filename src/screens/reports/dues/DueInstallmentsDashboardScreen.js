import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  IconButton,
  Surface,
  Searchbar
} from 'react-native-paper';
import { useTheme } from '../../../context';
import api from '../../../config/api';

const { height } = Dimensions.get('window');

// Compact Project Picker Modal
const ProjectPickerModal = ({ visible, onClose, projects, onSelect, selectedId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  const filteredProjects = projects.filter(project =>
    project.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Surface style={[styles.pickerSurface, { backgroundColor: theme.colors.surface }]} elevation={5}>
            <View style={styles.pickerHeader}>
              <Text variant="titleLarge" style={styles.pickerTitle}>Select Project</Text>
              <IconButton icon="close" size={24} onPress={onClose} />
            </View>

            <Searchbar
              placeholder="Search projects..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.compactSearch}
              inputStyle={{ fontSize: 14 }}
            />

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={true}>
              <TouchableOpacity
                style={[styles.pickerItem, !selectedId && styles.selectedItem]}
                onPress={() => {
                  onSelect('');
                  onClose();
                  setSearchQuery('');
                }}
              >
                <Text variant="bodyLarge" style={!selectedId && styles.selectedText}>All Projects</Text>
              </TouchableOpacity>

              {filteredProjects.map((project) => (
                <TouchableOpacity
                  key={project.project_id}
                  style={[styles.pickerItem, selectedId === project.project_id && styles.selectedItem]}
                  onPress={() => {
                    onSelect(project.project_id);
                    onClose();
                    setSearchQuery('');
                  }}
                >
                  <Text variant="bodyLarge" style={selectedId === project.project_id && styles.selectedText}>
                    {project.project_name}
                  </Text>
                </TouchableOpacity>
              ))}

              {filteredProjects.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No projects found</Text>
                </View>
              )}
            </ScrollView>
          </Surface>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const DueInstallmentsDashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const [financialYear, setFinancialYear] = useState(currentYear.toString());
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [dueData, setDueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (financialYear && !isNaN(parseInt(financialYear, 10))) {
      fetchDueInstallments();
    } else {
      setError('Invalid financial year');
    }
  }, [financialYear, selectedProjectId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dueData, selectedProjectId]);

  const fetchDueInstallments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      let url = `/api/transaction/due-installments/financial-year/${financialYear}`;
      if (selectedProjectId) {
        url += `?project_id=${selectedProjectId}`;
      }

      const response = await api.get(url);

      if (response.data?.success && response.data.data) {
        setDueData(response.data.data);
      } else {
        setDueData(null);
        setError('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching due installments:', error);
      setDueData(null);
      setError(error.response?.data?.message || 'Failed to fetch due installments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchDueInstallments(true);
  };

  const formatCurrency = (amount) =>
    typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : '₹0';

  const paginateData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil((dueData?.customer_breakdown?.length || 0) / itemsPerPage);
  const selectedProject = dueData?.projects_list?.find(p => p.project_id === selectedProjectId);

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {/* Modern Header */}
          <View style={styles.modernHeader}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📊</Text>
            </View>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Due Dashboard
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              View due installments for financial year
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <Surface style={styles.errorCard} elevation={1}>
              <View style={styles.errorContent}>
                <View style={styles.errorIconContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                </View>
                <Text variant="bodyMedium" style={styles.errorText}>{error}</Text>
              </View>
            </Surface>
          )}

          {/* Filters Card */}
          <Surface style={styles.modernCard} elevation={1}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBadge, { backgroundColor: '#E3F2FD' }]}>
                  <Text style={{ fontSize: 18 }}>🔍</Text>
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>Filters</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text variant="bodyMedium" style={styles.inputLabel}>Financial Year *</Text>
              <TextInput
                mode="outlined"
                value={financialYear}
                onChangeText={setFinancialYear}
                placeholder="Enter year (e.g., 2025)"
                keyboardType="numeric"
                maxLength={4}
                style={styles.modernInput}
                outlineStyle={styles.inputOutline}
                left={<TextInput.Icon icon="calendar" />}
              />

              <Text variant="bodyMedium" style={[styles.inputLabel, { marginTop: 12 }]}>
                Project (Optional)
              </Text>
              <TouchableOpacity
                style={styles.modernSelect}
                onPress={() => setModalVisible(true)}
              >
                <Text style={selectedProject ? styles.selectText : styles.selectPlaceholder}>
                  {selectedProject ? selectedProject.project_name : 'All Projects'}
                </Text>
                <IconButton icon="chevron-down" size={20} style={styles.selectIcon} />
              </TouchableOpacity>
            </View>
          </Surface>

          {/* Summary Card */}
          {dueData && (
            <Surface style={styles.modernCard} elevation={1}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.iconBadge, { backgroundColor: '#F3E5F5' }]}>
                    <Text style={{ fontSize: 18 }}>📈</Text>
                  </View>
                  <Text variant="titleMedium" style={styles.cardTitle}>Summary</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.summaryGrid}>
                  <View style={[styles.summaryBox, { backgroundColor: '#FEF2F2' }]}>
                    <Text variant="bodyMedium" style={styles.summaryLabel}>Total Due Amount</Text>
                    <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#DC2626' }]}>
                      {formatCurrency(dueData.summary?.total_due_amount || 0)}
                    </Text>
                  </View>

                  <View style={[styles.summaryBox, { backgroundColor: '#F3E8FF' }]}>
                    <Text variant="bodyMedium" style={styles.summaryLabel}>Total Customers</Text>
                    <Text variant="headlineMedium" style={[styles.summaryValue, { color: '#7C3AED' }]}>
                      {dueData.summary?.total_customers || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </Surface>
          )}

          {/* Customer Breakdown */}
          {dueData && dueData.customer_breakdown && dueData.customer_breakdown.length > 0 && (
            <Surface style={styles.modernCard} elevation={1}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.iconBadge, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={{ fontSize: 18 }}>👥</Text>
                  </View>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Customer Breakdown ({dueData.customer_breakdown.length})
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                {paginateData(dueData.customer_breakdown).map((customer, index) => (
                  <View key={customer.customer_id} style={styles.customerCard}>
                    <View style={styles.customerHeader}>
                      <View style={styles.customerBadge}>
                        <Text style={styles.customerBadgeText}>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </Text>
                      </View>
                      <View style={styles.customerInfo}>
                        <Text variant="titleSmall" style={styles.customerName}>
                          {customer.customer_name}
                        </Text>
                        <Text variant="bodySmall" style={styles.customerMeta}>
                          ID: {customer.manual_application_id || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.customerAmount}>
                      <Text variant="bodySmall" style={styles.amountLabel}>Due Amount</Text>
                      <Text variant="titleLarge" style={styles.amountValue}>
                        {formatCurrency(customer.total_due_amount)}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <View style={styles.pagination}>
                    <Button
                      mode="outlined"
                      onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={styles.paginationButton}
                      compact
                    >
                      Previous
                    </Button>

                    <Text variant="bodyMedium" style={styles.paginationText}>
                      Page {currentPage} of {totalPages}
                    </Text>

                    <Button
                      mode="outlined"
                      onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={styles.paginationButton}
                      compact
                    >
                      Next
                    </Button>
                  </View>
                )}
              </View>
            </Surface>
          )}

          {/* Empty State */}
          {dueData && (!dueData.customer_breakdown || dueData.customer_breakdown.length === 0) && (
            <Surface style={styles.modernCard} elevation={1}>
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>📭</Text>
                <Text variant="titleMedium" style={styles.emptyStateTitle}>
                  No Due Installments
                </Text>
                <Text variant="bodyMedium" style={styles.emptyStateText}>
                  No due installments found for the selected financial year
                </Text>
              </View>
            </Surface>
          )}
        </View>
      </ScrollView>

      {/* Project Picker Modal */}
      <ProjectPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        projects={dueData?.projects_list || []}
        onSelect={setSelectedProjectId}
        selectedId={selectedProjectId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  // Modern Header
  modernHeader: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  headerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#667EEA', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerIconText: { fontSize: 32 },
  headerTitle: { fontWeight: '700', color: '#1A202C', marginBottom: 4 },
  headerSubtitle: { color: '#718096', textAlign: 'center' },

  // Error Card
  errorCard: { marginBottom: 16, borderRadius: 16, backgroundColor: '#FEF2F2', padding: 16, borderWidth: 1, borderColor: '#FEE2E2' },
  errorContent: { flexDirection: 'row', alignItems: 'center' },
  errorIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  errorIcon: { fontSize: 16 },
  errorText: { flex: 1, color: '#991B1B' },

  // Modern Card
  modernCard: { marginBottom: 16, borderRadius: 16, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontWeight: '600', color: '#2D3748' },
  cardContent: { padding: 16, paddingTop: 0 },

  // Input Styles
  inputLabel: { color: '#4B5563', fontWeight: '600', marginBottom: 8, fontSize: 14 },
  modernInput: { marginBottom: 12, backgroundColor: '#FFFFFF' },
  inputOutline: { borderRadius: 12, borderWidth: 1.5 },
  modernSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#CBD5E0', borderRadius: 12, paddingLeft: 16, paddingRight: 4, marginBottom: 12, backgroundColor: '#FFFFFF', minHeight: 56 },
  selectText: { flex: 1, fontSize: 16, color: '#2D3748' },
  selectPlaceholder: { flex: 1, fontSize: 16, color: '#A0AEC0' },
  selectIcon: { margin: 0 },

  // Summary Grid
  summaryGrid: { gap: 12 },
  summaryBox: { padding: 20, borderRadius: 12 },
  summaryLabel: { color: '#6B7280', marginBottom: 8, fontWeight: '600', fontSize: 13 },
  summaryValue: { fontWeight: '700' },

  // Customer Card
  customerCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  customerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  customerBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#667EEA', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  customerBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  customerInfo: { flex: 1 },
  customerName: { fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  customerMeta: { color: '#6B7280' },
  customerAmount: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  amountLabel: { color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  amountValue: { color: '#DC2626', fontWeight: '700' },

  // Pagination
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  paginationButton: { borderRadius: 8 },
  paginationText: { color: '#6B7280', fontWeight: '600' },

  // Empty State
  emptyStateContainer: { padding: 40, alignItems: 'center' },
  emptyStateIcon: { fontSize: 64, marginBottom: 16 },
  emptyStateTitle: { fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  emptyStateText: { color: '#6B7280', textAlign: 'center' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400 },
  pickerSurface: { borderRadius: 20, maxHeight: height * 0.6, overflow: 'hidden' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  pickerTitle: { fontWeight: '700', color: '#2D3748' },
  compactSearch: { margin: 12, borderRadius: 12, elevation: 0 },
  pickerList: { maxHeight: height * 0.4 },
  pickerItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  selectedItem: { backgroundColor: '#EEF2FF' },
  selectedText: { color: '#667EEA', fontWeight: '600' },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#A0AEC0', fontSize: 14 },
});

export default DueInstallmentsDashboardScreen;
