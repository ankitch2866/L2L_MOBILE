import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import ProjectSizeCard from '../../../components/masters/ProjectSizeCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchProjectSizes, fetchProjectSizesByProject, setProjectId } from '../../../store/slices/projectSizesSlice';
import { fetchProjects } from '../../../store/slices/projectsSlice';

const ProjectSizesListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, projectId } = useSelector(state => state.projectSizes);
  const { projects } = useSelector(state => state.projects || { projects: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSizes = (list || []).filter(size => {
    const matchesSearch = 
      size.size?.toString().includes(searchQuery) ||
      size.project_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  useEffect(() => {
    console.log('Loading projects and project sizes...');
    dispatch(fetchProjects());
    if (route.params?.projectId) {
      console.log('Loading project sizes for specific project:', route.params.projectId);
      dispatch(setProjectId(route.params.projectId));
      dispatch(fetchProjectSizesByProject(route.params.projectId));
    } else {
      console.log('Loading all project sizes');
      dispatch(fetchProjectSizes());
    }
  }, [dispatch, route.params?.projectId]);

  useEffect(() => {
    console.log('Projects loaded:', projects);
    console.log('Project sizes loaded:', list);
    console.log('Current project ID:', projectId);
  }, [projects, list, projectId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (projectId) {
      await dispatch(fetchProjectSizesByProject(projectId));
    } else {
      await dispatch(fetchProjectSizes());
    }
    setRefreshing(false);
  };

  const handleProjectFilter = (value) => {
    console.log('Project filter changed to:', value);
    const selectedProjectId = value === 'all' ? null : parseInt(value);
    console.log('Selected project ID:', selectedProjectId);
    dispatch(setProjectId(selectedProjectId));
    if (selectedProjectId) {
      console.log('Fetching project sizes for project:', selectedProjectId);
      dispatch(fetchProjectSizesByProject(selectedProjectId));
    } else {
      console.log('Fetching all project sizes');
      dispatch(fetchProjectSizes());
    }
  };

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search sizes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        {projects && projects.length > 0 && (
          <View style={styles.filterContainer}>
            <SegmentedButtons
              value={projectId ? projectId.toString() : 'all'}
              onValueChange={handleProjectFilter}
              buttons={[
                { value: 'all', label: 'All' },
                ...(projects.slice(0, 3).map(p => ({
                  value: p.project_id.toString(),
                  label: p.project_name.substring(0, 10)
                })) || [])
              ]}
              style={styles.segmentedButtons}
            />
          </View>
        )}
      </View>

      <FlatList
        data={filteredSizes}
        renderItem={({ item }) => (
          <ProjectSizeCard
            projectSize={item}
            onPress={() => {}} // Card click does nothing - only edit icon should navigate
            onEdit={(size) => navigation.navigate('EditProjectSize', { id: size.id })}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.id?.toString()}
        ListEmptyComponent={
          <EmptyState
            icon="ruler"
            title="No Project Sizes"
            message={searchQuery ? "No matching sizes" : "Add your first project size"}
            actionText="Add Size"
            onActionPress={() => navigation.navigate('AddProjectSize')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddProjectSize')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0, marginBottom: 12 },
  filterContainer: { marginTop: 8 },
  segmentedButtons: { marginBottom: 4 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default ProjectSizesListScreen;
