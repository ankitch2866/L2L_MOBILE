// CustomerQueryCard - Quick customer search widget for dashboard
import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Animated } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchProjects, fetchCustomersByProject } from '../../store/slices/customersSlice';

const CustomerQueryCard = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const { 
    projects, 
    customersByProject, 
    loadingProjects, 
    loadingCustomersByProject,
    projectsError 
  } = useSelector(state => state.customers);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Load projects on mount
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Load customers when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchCustomersByProject(selectedProjectId));
    }
  }, [selectedProjectId, dispatch]);

  // Get customers for selected project
  const customers = useMemo(() => {
    if (!selectedProjectId) return [];
    return customersByProject[selectedProjectId] || [];
  }, [selectedProjectId, customersByProject]);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers;
    return customers.filter(customer =>
      customer.manual_application_id?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.name?.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );
  }, [customers, customerSearchTerm]);

  // Get selected project name
  const selectedProjectName = useMemo(() => {
    if (!selectedProjectId) return null;
    const project = projects.find(p => p.project_id === selectedProjectId);
    return project?.project_name;
  }, [selectedProjectId, projects]);

  // Get selected customer name
  const selectedCustomerName = useMemo(() => {
    if (!selectedCustomerId) return null;
    const customer = customers.find(c => c.manual_application_id === selectedCustomerId);
    return customer?.name;
  }, [selectedCustomerId, customers]);

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setSelectedCustomerId('');
    setCustomerSearchTerm('');
    setShowProjectDropdown(false);
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomerId(customerId);
    setShowCustomerDropdown(false);
  };

  const handleGo = () => {
    if (selectedProjectId && selectedCustomerId) {
      // Navigate directly to EnhancedCustomerDetails screen (matches web frontend)
      const customer = customers.find(c => c.manual_application_id === selectedCustomerId);
      const numericCustomerId = customer?.customer_id || selectedCustomerId;
      
      // Add timestamp to force screen remount for each navigation
      navigation.navigate('EnhancedCustomerDetails', { 
        customerId: numericCustomerId,
        key: `customer-${numericCustomerId}-${Date.now()}` // Force remount
      });
    }
  };

  const styles = getStyles(theme);

  return (
    <>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.iconGradient}
              >
                <Icon name="account-search" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text variant="titleLarge" style={styles.title}>Customer Query</Text>
              <Text variant="bodySmall" style={styles.subtitle}>Search customers by project</Text>
            </View>
          </View>

          {projectsError && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{projectsError}</Text>
            </View>
          )}

          {/* Project Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Icon name="office-building" size={14} color={theme.colors.primary} /> Project
            </Text>
            <TouchableOpacity
              style={[styles.modernDropdown, !selectedProjectId && styles.dropdownPlaceholder]}
              onPress={() => setShowProjectDropdown(true)}
              disabled={loadingProjects}
            >
              <View style={styles.dropdownContent}>
                <Icon name="office-building" size={20} color={theme.colors.primary} />
                <Text style={[styles.dropdownText, !selectedProjectName && styles.placeholderText]}>
                  {loadingProjects ? 'Loading...' : (selectedProjectName || 'Select Project')}
                </Text>
              </View>
              <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Customer Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Icon name="account" size={14} color={theme.colors.primary} /> Customer
            </Text>
            <TouchableOpacity
              style={[
                styles.modernDropdown,
                (!selectedProjectId || loadingCustomersByProject) && styles.dropdownDisabled,
                !selectedCustomerId && styles.dropdownPlaceholder
              ]}
              onPress={() => setShowCustomerDropdown(true)}
              disabled={!selectedProjectId || loadingCustomersByProject}
            >
              <View style={styles.dropdownContent}>
                <Icon name="account" size={20} color={theme.colors.primary} />
                <Text style={[styles.dropdownText, !selectedCustomerName && styles.placeholderText]}>
                  {loadingCustomersByProject 
                    ? 'Loading...' 
                    : (selectedCustomerId || 'Select Customer')
                  }
                </Text>
              </View>
              <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Go Button */}
          <TouchableOpacity
            style={[
              styles.modernGoButton,
              (!selectedProjectId || !selectedCustomerId) && styles.goButtonDisabled
            ]}
            onPress={handleGo}
            disabled={!selectedProjectId || !selectedCustomerId}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!selectedProjectId || !selectedCustomerId) 
                ? ['#9CA3AF', '#6B7280'] 
                : ['#10B981', '#059669']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.goButtonGradient}
            >
              {loadingCustomersByProject ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.goButtonText}>View Customer Details</Text>
                  <Icon name="arrow-right-circle" size={22} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Project Modal */}
      <Modal
        visible={showProjectDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProjectDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowProjectDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Project</Text>
              <TouchableOpacity onPress={() => setShowProjectDropdown(false)}>
                <Icon name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.project_id}
                  style={[
                    styles.modalItem,
                    selectedProjectId === project.project_id && styles.modalItemSelected
                  ]}
                  onPress={() => handleProjectSelect(project.project_id)}
                >
                  <Icon 
                    name="office-building" 
                    size={20} 
                    color={selectedProjectId === project.project_id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                  <Text style={[
                    styles.modalItemText,
                    selectedProjectId === project.project_id && styles.modalItemTextSelected
                  ]}>
                    {project.project_name}
                  </Text>
                  {selectedProjectId === project.project_id && (
                    <Icon name="check-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Customer Modal */}
      <Modal
        visible={showCustomerDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomerDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowCustomerDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerDropdown(false)}>
                <Icon name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            
            {/* Search */}
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color={theme.colors.onSurfaceVariant} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by ID or name..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={customerSearchTerm}
                onChangeText={setCustomerSearchTerm}
              />
            </View>

            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TouchableOpacity
                    key={customer.customer_id}
                    style={[
                      styles.modalItem,
                      selectedCustomerId === customer.manual_application_id && styles.modalItemSelected
                    ]}
                    onPress={() => handleCustomerSelect(customer.manual_application_id)}
                  >
                    <Icon 
                      name="account" 
                      size={20} 
                      color={selectedCustomerId === customer.manual_application_id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                    />
                    <View style={styles.customerInfo}>
                      <Text style={[
                        styles.modalItemText,
                        selectedCustomerId === customer.manual_application_id && styles.modalItemTextSelected
                      ]}>
                        {customer.manual_application_id}
                      </Text>
                      <Text style={styles.customerSubtext}>{customer.name}</Text>
                    </View>
                    {selectedCustomerId === customer.manual_application_id && (
                      <Icon name="check-circle" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="account-off" size={48} color={theme.colors.onSurfaceVariant} />
                  <Text style={styles.emptyText}>
                    {customerSearchTerm ? 'No customers found' : 'No customers available'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const getStyles = (theme) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modernDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: theme.colors.outline,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownPlaceholder: {
    borderColor: theme.colors.outlineVariant,
  },
  dropdownDisabled: {
    opacity: 0.4,
    backgroundColor: '#F9FAFB',
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.onSurface,
    marginLeft: 10,
    fontWeight: '500',
  },
  placeholderText: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '400',
  },
  modernGoButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  goButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  goButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  goButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  modalList: {
    maxHeight: 400,
  },
  modalListContent: {
    paddingBottom: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  modalItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  modalItemText: {
    fontSize: 15,
    color: theme.colors.onSurface,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  modalItemTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerSubtext: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default CustomerQueryCard;
