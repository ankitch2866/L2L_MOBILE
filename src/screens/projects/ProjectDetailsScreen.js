import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context';
import { LoadingIndicator } from '../../components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchProjectById, deleteProject, clearCurrentProject } from '../../store/slices/projectsSlice';

const ProjectDetailsScreen = ({ route, navigation }) => {
  const { projectId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { currentProject, loading } = useSelector(state => state.projects);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchProjectById(projectId));
    }, [dispatch, projectId])
  );

  useEffect(() => {
    return () => dispatch(clearCurrentProject());
  }, [dispatch]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${currentProject?.project_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteProject(projectId)).unwrap();
              Alert.alert('Success', 'Project deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) return <LoadingIndicator message="Loading project details..." />;
  if (!currentProject) return null;

  const InfoCard = ({ icon, label, value, iconColor }) => (
    <Card style={[styles.infoCard, { backgroundColor: '#FFFFFF' }]}>
      <Card.Content style={styles.infoCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Icon name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.infoTextContainer}>
          <Text variant="bodySmall" style={styles.infoLabel}>{label}</Text>
          <Text variant="bodyLarge" style={styles.infoValue}>{value || 'N/A'}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Card style={[styles.headerCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>
                  {currentProject.project_name?.charAt(0).toUpperCase() || 'P'}
                </Text>
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text variant="headlineSmall" style={[styles.projectName, { color: theme.colors.text }]}>
                {currentProject.project_name || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.companyName}>
                {currentProject.company_name || 'N/A'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Project Information Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Project Information
        </Text>
        <InfoCard 
          icon="office-building" 
          label="Project Name" 
          value={currentProject.project_name}
          iconColor="#3B82F6"
        />
        <InfoCard 
          icon="domain" 
          label="Company Name" 
          value={currentProject.company_name}
          iconColor="#8B5CF6"
        />
        <InfoCard 
          icon="calendar" 
          label="Created Date" 
          value={formatDate(currentProject.created_at)}
          iconColor="#10B981"
        />
      </View>

      {/* Location Details Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Location Details
        </Text>
        <InfoCard 
          icon="map-marker" 
          label="Address" 
          value={currentProject.address || 'N/A'}
          iconColor="#10B981"
        />
        <InfoCard 
          icon="map" 
          label="Landmark" 
          value={currentProject.landmark || 'N/A'}
          iconColor="#3B82F6"
        />
      </View>

      {/* Sign Image Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Project Signature
        </Text>
        <Card style={styles.imageCard}>
          <Card.Content style={styles.imageCardContent}>
            {currentProject.sign_image_name ? (
              <Image 
                source={{ uri: currentProject.sign_image_name }} 
                style={styles.signImage}
                resizeMode="contain"
                onError={(error) => {
                  console.log('Image load error:', error.nativeEvent.error);
                }}
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Icon name="image-off" size={48} color="#9CA3AF" />
                <Text variant="bodyMedium" style={styles.noImageText}>
                  No signature image available
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditProject', { projectId })}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          icon="pencil"
        >
          Edit Project
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.actionButton}
          textColor="#EF4444"
          icon="delete"
        >
          Delete
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { margin: 16, marginBottom: 8 },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: { marginRight: 16 },
  avatar: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  headerTextContainer: { flex: 1 },
  projectName: { fontWeight: 'bold', marginBottom: 4 },
  companyName: { color: '#6B7280' },
  editButton: { marginTop: 8 },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  infoCard: { marginBottom: 12, elevation: 2 },
  infoCardContent: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoTextContainer: { flex: 1 },
  infoLabel: { color: '#6B7280', marginBottom: 4 },
  infoValue: { color: '#111827', fontWeight: '600' },
  imageCard: { marginBottom: 12, elevation: 2 },
  imageCardContent: { padding: 16 },
  signImage: { width: '100%', height: 200, borderRadius: 8 },
  noImageContainer: { alignItems: 'center', padding: 32 },
  noImageText: { marginTop: 12, color: '#9CA3AF' },
  actionButtons: { marginHorizontal: 16, marginBottom: 24, gap: 12 },
  actionButton: { marginBottom: 8 },
});

export default ProjectDetailsScreen;
