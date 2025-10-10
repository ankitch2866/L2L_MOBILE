import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, FlatList } from 'react-native';
import { Text, Card, Button, TextInput, IconButton, Searchbar, FAB, Chip } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ProjectDashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: 'project_name',
    direction: 'ascending'
  });

  useEffect(() => {
    fetchProjects();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchProjects();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      const filtered = projects.filter(
        (project) =>
          project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
      setCurrentPage(1); // Reset to first page when filtering
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
      
      if (!response.data?.data || response.data.data.length === 0) {
        setProjects([]);
        setFilteredProjects([]);
        return;
      }
      
      setProjects(response.data.data);
      setFilteredProjects(response.data.data);
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    navigation.navigate('ProjectReports', { 
      screen: 'ProjectDetails', 
      params: { projectId: projectId } 
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProjects = useMemo(() => {
    let sortableProjects = [...filteredProjects];
    if (sortConfig.key) {
      sortableProjects.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  const handleAddProject = () => {
    navigation.navigate('ProjectsStack', { 
      screen: 'AddProject'
    });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor="#FFFFFF"
            style={styles.backButton}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Projects
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              size={20}
              onPress={fetchProjects}
              iconColor={theme.colors.primary}
            />
            <Button
              mode="contained"
              onPress={handleAddProject}
              style={styles.addButton}
              labelStyle={styles.addButtonLabel}
            >
              Add New Project
            </Button>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search projects..."
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

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
        </View>
      ) : filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="folder-open"
            title={searchQuery ? "No projects match your search criteria." : "No projects available. Add your first project!"}
            subtitle=""
          />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
      {/* Projects Cards Grid */}
      <View style={styles.projectsGrid}>
        {currentProjects.map((project) => (
          <TouchableOpacity
            key={project.project_id}
            style={styles.projectCard}
            onPress={() => handleProjectClick(project.project_id)}
            activeOpacity={0.8}
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                {/* Project Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.projectIcon}>
                    <IconButton
                      icon="home"
                      size={24}
                      iconColor="#EF4444"
                    />
                  </View>
                  <View style={styles.projectStatus}>
                    <Chip
                      mode="outlined"
                      compact
                      style={[
                        styles.statusChip,
                        project.status === 'active' && styles.activeStatus,
                        project.status === 'completed' && styles.completedStatus,
                        project.status === 'pending' && styles.pendingStatus
                      ]}
                      textStyle={styles.statusText}
                    >
                      {project.status || 'Active'}
                    </Chip>
                  </View>
                </View>

                {/* Project Information */}
                <View style={styles.projectInfo}>
                  <Text variant="titleMedium" style={styles.projectName} numberOfLines={2}>
                    {project.project_name}
                  </Text>
                  
                  <Text variant="bodyMedium" style={styles.companyName} numberOfLines={1}>
                    {project.company_name}
                  </Text>
                  
                  <Text variant="bodySmall" style={styles.projectAddress} numberOfLines={2}>
                    📍 {project.address}
                  </Text>

                  {/* Project Details */}
                  <View style={styles.projectDetails}>
                    {project.start_date && (
                      <View style={styles.detailItem}>
                        <Text variant="bodySmall" style={styles.detailLabel}>
                          Start Date
                        </Text>
                        <Text variant="bodySmall" style={styles.detailValue}>
                          {formatDate(project.start_date)}
                        </Text>
                      </View>
                    )}
                    
                    {project.end_date && (
                      <View style={styles.detailItem}>
                        <Text variant="bodySmall" style={styles.detailLabel}>
                          End Date
                        </Text>
                        <Text variant="bodySmall" style={styles.detailValue}>
                          {formatDate(project.end_date)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Button */}
                  <View style={styles.actionContainer}>
                    <IconButton
                      icon="arrow-right"
                      size={20}
                      iconColor="#EF4444"
                      style={styles.actionButton}
                    />
                    <Text variant="bodySmall" style={styles.actionText}>
                      View Details
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

          {/* Pagination */}
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, sortedProjects.length)} of {sortedProjects.length} projects
              </Text>
            </View>
            <View style={styles.paginationButtons}>
              <Button
                mode="outlined"
                onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                labelStyle={styles.paginationButtonLabel}
              >
                Previous
              </Button>
              <Button
                mode="outlined"
                onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                labelStyle={styles.paginationButtonLabel}
              >
                Next
              </Button>
            </View>
          </View>
        </ScrollView>
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
    fontSize: 24,
    lineHeight: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButton: {
    borderRadius: 8,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  addButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
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
  projectsGrid: {
    padding: 16,
    gap: 16,
  },
  projectCard: {
    marginBottom: 16,
  },
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardContent: {
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  projectIcon: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 4,
  },
  projectStatus: {
    // Status chip positioning
  },
  statusChip: {
    backgroundColor: '#F3F4F6',
  },
  activeStatus: {
    backgroundColor: '#D1FAE5',
  },
  completedStatus: {
    backgroundColor: '#DBEAFE',
  },
  pendingStatus: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  projectInfo: {
    padding: 16,
    paddingTop: 0,
  },
  projectName: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  companyName: {
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  projectAddress: {
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  projectDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    margin: 0,
  },
  actionText: {
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationInfo: {
    flex: 1,
  },
  paginationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationButton: {
    minWidth: 80,
  },
  paginationButtonLabel: {
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ProjectDashboardScreen;
