import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, IconButton, FAB } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';

const CustomerProjectYearScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);

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
    navigation.navigate('CustomerProjectYearDetail', { projectId });
  };

  // Calculate pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search projects..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
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
      {filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="home-search"
            title={searchQuery ? "No projects found" : "No projects available"}
            subtitle={searchQuery ? "Try adjusting your search criteria" : "Add your first project to get started"}
          />
        </View>
      ) : (
        <>
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
                      <View style={styles.projectNameContainer}>
                        <Text variant="titleMedium" style={styles.projectName} numberOfLines={2}>
                          {project.project_name}
                        </Text>
                        <Text variant="bodySmall" style={styles.companyName}>
                          {project.company_name}
                        </Text>
                      </View>
                      <IconButton
                        icon="chevron-right"
                        size={20}
                        iconColor={theme.colors.primary}
                        style={styles.arrowIcon}
                      />
                    </View>
                    
                    <View style={styles.projectDetails}>
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
              <Text variant="bodySmall" style={styles.paginationInfo}>
                Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, filteredProjects.length)} of {filteredProjects.length} projects
              </Text>
              <View style={styles.paginationButtons}>
                <IconButton
                  icon="chevron-left"
                  size={20}
                  onPress={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  iconColor={currentPage === 1 ? '#9CA3AF' : theme.colors.primary}
                />
                <Text variant="bodyMedium" style={styles.pageNumber}>
                  {currentPage} / {totalPages}
                </Text>
                <IconButton
                  icon="chevron-right"
                  size={20}
                  onPress={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  iconColor={currentPage === totalPages ? '#9CA3AF' : theme.colors.primary}
                />
              </View>
            </View>
          )}
        </ScrollView>
        </>
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
    elevation: 0,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    fontSize: 14,
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
  projectNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  projectName: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  companyName: {
    color: '#6B7280',
    marginTop: 2,
  },
  arrowIcon: {
    margin: 0,
  },
  projectDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#6B7280',
    fontWeight: '500',
    width: 70,
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
    gap: 8,
  },
  paginationInfo: {
    textAlign: 'center',
    color: '#6B7280',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumber: {
    marginHorizontal: 16,
    color: '#1F2937',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#DC2626',
  },
});

export default CustomerProjectYearScreen;

