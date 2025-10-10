import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Searchbar, IconButton, FAB, Chip, Menu, Divider } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerProjectScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: 'project_name',
    direction: 'ascending'
  });
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      const filtered = projects.filter(project =>
        project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
      setCurrentPage(1);
    }
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/master/projects');
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch projects');
      }
      
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  const handleProjectClick = (projectId) => {
    navigation.navigate('CustomerProjectDetail', { projectId });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setShowSortMenu(false);
  };

  const sortedProjects = React.useMemo(() => {
    let sortableProjects = [...filteredProjects];
    if (sortConfig.key) {
      sortableProjects.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProjects;
  }, [filteredProjects, sortConfig]);

  // Calculate pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const exportToExcel = () => {
    if (projects.length === 0) return;

    const headers = [
      'Sr. No.',
      'Project Name',
      'Company Name',
      'Address',
      'Created Date'
    ];

    const excelData = projects.map((project, index) => [
      index + 1,
      project.project_name || 'N/A',
      project.company_name || 'N/A',
      project.address || 'N/A',
      project.created_at ? formatDate(project.created_at) : 'N/A'
    ]);

    // This would integrate with your Excel export utility
    Alert.alert('Export', 'Excel export functionality would be implemented here');
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      {/* Search and Sort */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search projects..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
        />
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={
            <IconButton
              icon="sort"
              size={24}
              iconColor={theme.colors.primary}
              onPress={() => setShowSortMenu(true)}
              style={styles.sortButton}
            />
          }
        >
          <Menu.Item
            title="Project Name (A-Z)"
            onPress={() => requestSort('project_name')}
          />
          <Menu.Item
            title="Project Name (Z-A)"
            onPress={() => requestSort('project_name')}
          />
          <Menu.Item
            title="Company Name (A-Z)"
            onPress={() => requestSort('company_name')}
          />
          <Menu.Item
            title="Company Name (Z-A)"
            onPress={() => requestSort('company_name')}
          />
        </Menu>
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
      {filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="home-search"
            title={searchQuery ? "No projects found" : "No projects available"}
            subtitle={searchQuery ? "Try adjusting your search criteria" : "Add your first project to get started"}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Projects List */}
          <View style={styles.projectsContainer}>
            {currentProjects.map((project) => (
              <Card key={project.project_id} style={styles.projectCard}>
                <TouchableOpacity onPress={() => handleProjectClick(project.project_id)}>
                  <Card.Content style={styles.projectContent}>
                    <View style={styles.projectHeader}>
                      <Text variant="titleMedium" style={styles.projectName} numberOfLines={2}>
                        {project.project_name}
                      </Text>
                      <IconButton
                        icon="chevron-right"
                        size={20}
                        iconColor={theme.colors.primary}
                        style={styles.arrowIcon}
                      />
                    </View>
                    
                    <View style={styles.projectDetails}>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.detailLabel}>Company:</Text>
                        <Text variant="bodySmall" style={styles.detailValue} numberOfLines={1}>
                          {project.company_name || 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.detailLabel}>Location:</Text>
                        <Text variant="bodySmall" style={styles.detailValue} numberOfLines={2}>
                          {project.address || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </TouchableOpacity>
              </Card>
            ))}
          </View>

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <View style={styles.paginationInfo}>
                <Text variant="bodySmall" style={styles.paginationText}>
                  Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, filteredProjects.length)} of {filteredProjects.length} projects
                </Text>
              </View>
              
              <View style={styles.paginationButtons}>
                <Button
                  mode="outlined"
                  onPress={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={styles.paginationButton}
                  labelStyle={styles.paginationButtonLabel}
                >
                  Previous
                </Button>
                
                <View style={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        mode={pageNum === currentPage ? "contained" : "outlined"}
                        onPress={() => goToPage(pageNum)}
                        style={[
                          styles.pageButton,
                          pageNum === currentPage && styles.activePageButton
                        ]}
                        labelStyle={[
                          styles.pageButtonLabel,
                          pageNum === currentPage && styles.activePageButtonLabel
                        ]}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </View>
                
                <Button
                  mode="outlined"
                  onPress={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={styles.paginationButton}
                  labelStyle={styles.paginationButtonLabel}
                >
                  Next
                </Button>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Add New Project FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('ProjectsStack', { screen: 'AddProject' })}
        label="Add Project"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  title: {
    color: '#1F2937',
    fontWeight: 'bold',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    margin: 0,
    marginRight: 4,
  },
  exportButton: {
    margin: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    elevation: 0,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    fontSize: 14,
  },
  sortButton: {
    margin: 0,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollView: {
    flex: 1,
  },
  projectsContainer: {
    padding: 16,
    gap: 12,
  },
  projectCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  projectContent: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  projectName: {
    color: '#1F2937',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  arrowIcon: {
    margin: 0,
  },
  projectDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#6B7280',
    fontWeight: '500',
    width: 80,
    marginRight: 8,
  },
  detailValue: {
    color: '#1F2937',
    flex: 1,
  },
  paginationContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationText: {
    color: '#6B7280',
    fontSize: 12,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationButton: {
    borderRadius: 8,
  },
  paginationButtonLabel: {
    fontSize: 12,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    borderRadius: 6,
  },
  activePageButton: {
    backgroundColor: '#3B82F6',
  },
  pageButtonLabel: {
    fontSize: 12,
  },
  activePageButtonLabel: {
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#DC2626',
  },
});

export default CustomerProjectScreen;
