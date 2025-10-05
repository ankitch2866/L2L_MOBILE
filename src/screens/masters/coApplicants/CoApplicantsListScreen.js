import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Menu, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import CoApplicantCard from '../../../components/masters/CoApplicantCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchCoApplicants, setSearchQuery } from '../../../store/slices/coApplicantsSlice';
import { fetchProjects } from '../../../store/slices/projectsSlice';
import { fetchCustomers } from '../../../store/slices/customersSlice';

const CoApplicantsListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, searchQuery } = useSelector(state => state.coApplicants);
  const { projects } = useSelector(state => state.projects);
  const { customers } = useSelector(state => state.customers);
  const [refreshing, setRefreshing] = useState(false);
  const [projectMenuVisible, setProjectMenuVisible] = useState(false);
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCoApplicants = (list || []).filter(ca => {
    const matchesSearch = 
      ca.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ca.mobile?.includes(searchQuery) ||
      ca.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = !selectedProject || ca.project_id === selectedProject;
    const matchesCustomer = !selectedCustomer || ca.customer_id === selectedCustomer;
    
    return matchesSearch && matchesProject && matchesCustomer;
  });

  const filteredCustomers = selectedProject 
    ? customers.filter(c => c.project_id === selectedProject)
    : customers;

  useEffect(() => {
    dispatch(fetchCoApplicants());
    dispatch(fetchProjects());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCoApplicants());
    setRefreshing(false);
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
    setSelectedCustomer(null); // Reset customer when project changes
    setProjectMenuVisible(false);
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    setCustomerMenuVisible(false);
  };

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search co-applicants..."
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filterRow}>
          <Menu
            visible={projectMenuVisible}
            onDismiss={() => setProjectMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setProjectMenuVisible(true)}
                style={styles.filterButton}
              >
                {selectedProject 
                  ? (projects.find(p => p.project_id === selectedProject)?.project_name || 'Project')
                  : 'All Projects'}
              </Button>
            }
          >
            <Menu.Item onPress={() => handleProjectSelect(null)} title="All Projects" />
            {projects.map(project => (
              <Menu.Item
                key={project.project_id}
                onPress={() => handleProjectSelect(project.project_id)}
                title={project.project_name}
              />
            ))}
          </Menu>

          <Menu
            visible={customerMenuVisible}
            onDismiss={() => setCustomerMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setCustomerMenuVisible(true)}
                style={styles.filterButton}
                disabled={!selectedProject}
              >
                {(() => {
                  if (!selectedCustomer) return 'All Customers';
                  const customer = customers.find(c => c.customer_id === selectedCustomer);
                  return customer?.name || customer?.customer_name || 'Customer';
                })()}
              </Button>
            }
          >
            <Menu.Item onPress={() => handleCustomerSelect(null)} title="All Customers" />
            {filteredCustomers.map(customer => (
              <Menu.Item
                key={customer.customer_id}
                onPress={() => handleCustomerSelect(customer.customer_id)}
                title={customer.name || customer.customer_name || 'N/A'}
              />
            ))}
          </Menu>
        </View>
      </View>

      <FlatList
        data={filteredCoApplicants}
        renderItem={({ item }) => (
          <CoApplicantCard
            coApplicant={item}
            onPress={(ca) => navigation.navigate('CoApplicantDetails', { id: ca.co_applicant_id })}
            onEdit={(ca) => navigation.navigate('EditCoApplicant', { id: ca.co_applicant_id })}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.co_applicant_id?.toString()}
        ListEmptyComponent={
          <EmptyState
            icon="account-multiple"
            title="No Co-Applicants"
            message={searchQuery ? "No matching co-applicants" : "Add your first co-applicant"}
            actionText="Add Co-Applicant"
            onActionPress={() => navigation.navigate('AddCoApplicant')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddCoApplicant')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0, marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterButton: { flex: 1 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default CoApplicantsListScreen;
