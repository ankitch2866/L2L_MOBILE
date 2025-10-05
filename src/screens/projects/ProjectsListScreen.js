import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context';
import ProjectCard from '../../components/projects/ProjectCard';
import { LoadingIndicator, EmptyState } from '../../components';
import {
  fetchProjects,
  deleteProject,
  setSearchQuery,
  clearError,
} from '../../store/slices/projectsSlice';

const ProjectsListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { projects, loading, error, searchQuery } = useSelector(state => state.projects);
  const [refreshing, setRefreshing] = useState(false);

  const filteredProjects = (projects || []).filter(p =>
    p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Refresh list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProjects());
    }, [dispatch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProjects());
    setRefreshing(false);
  };

  const handleDelete = (project) => {
    Alert.alert(
      'Delete Project',
      `Delete "${project.project_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteProject(project.project_id)),
        },
      ]
    );
  };

  if (loading && projects.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search projects..."
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={(p) => navigation.navigate('ProjectDetails', { projectId: p.project_id })}
            onEdit={(p) => navigation.navigate('EditProject', { projectId: p.project_id })}
            onDelete={handleDelete}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.project_id?.toString()}
        ListEmptyComponent={
          <EmptyState
            icon="office-building"
            title="No Projects"
            message={searchQuery ? "No matching projects" : "Add your first project"}
            actionText="Add Project"
            onActionPress={() => navigation.navigate('AddProject')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddProject')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default ProjectsListScreen;
