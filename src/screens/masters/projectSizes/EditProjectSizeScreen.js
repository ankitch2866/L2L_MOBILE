import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { Dropdown } from '../../../components/common';
import { LoadingIndicator } from '../../../components';
import { fetchProjectSizeById, updateProjectSize, deleteProjectSize, fetchProjectSizes } from '../../../store/slices/projectSizesSlice';
import { fetchProjects } from '../../../store/slices/projectsSlice';

const EditProjectSizeScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current } = useSelector(state => state.projectSizes);
  const { projects } = useSelector(state => state.projects || { projects: [] });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    size: '',
  });

  useEffect(() => {
    console.log('EditProjectSizeScreen: Loading projects and project size...');
    dispatch(fetchProjects());
    dispatch(fetchProjectSizeById(id));
  }, [dispatch, id]);

  useEffect(() => {
    console.log('EditProjectSizeScreen: Projects loaded:', projects);
    console.log('EditProjectSizeScreen: Project options:', projectOptions);
  }, [projects]);

  useEffect(() => {
    if (current) {
      setFormData({
        project_id: current.project_id?.toString() || '',
        size: current.size?.toString() || '',
      });
    }
  }, [current]);

  const handleSubmit = async () => {
    if (!formData.project_id) {
      Alert.alert('Validation Error', 'Please select a project');
      return;
    }

    if (!formData.size || isNaN(formData.size)) {
      Alert.alert('Validation Error', 'Valid size is required');
      return;
    }

    const numSize = parseFloat(formData.size);
    
    if (numSize <= 0) {
      Alert.alert('Validation Error', 'Size must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateProjectSize({
        id,
        data: {
          project_id: parseInt(formData.project_id),
          size: numSize,
        }
      })).unwrap();

      Alert.alert('Success', 'Project size updated successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchProjectSizes());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update project size');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this project size?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await dispatch(deleteProjectSize(id)).unwrap();
              Alert.alert('Success', 'Project size deleted successfully', [
                { text: 'OK', onPress: () => {
                  dispatch(fetchProjectSizes());
                  navigation.goBack();
                }}
              ]);
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete project size');
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (!current) return <LoadingIndicator />;

  const projectOptions = (projects || []).map(p => ({
    label: p.project_name,
    value: p.project_id.toString()
  }));

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
      <View style={styles.form}>
        {/* Section 1: Project Selection (Blue) */}
        <Card style={[styles.section, styles.blueSection]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🏗️ Project Selection
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Select the project for this size
            </Text>
            
            <Dropdown
              label="Project *"
              value={formData.project_id}
              onValueChange={(value) => setFormData({ ...formData, project_id: value })}
              items={projectOptions}
              disabled={loading || deleting}
            />
          </Card.Content>
        </Card>

        {/* Section 2: Size Configuration (Green) */}
        <Card style={[styles.section, styles.greenSection]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📏 Size Configuration
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Enter the unit size in square feet
            </Text>
            
            <TextInput
              label="Size (sq ft) *"
              value={formData.size}
              onChangeText={(text) => setFormData({ ...formData, size: text })}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              outlineColor="#D1FAE5"
              activeOutlineColor="#10B981"
              disabled={loading || deleting}
              right={<TextInput.Affix text="sq ft" />}
            />

            <View style={styles.infoBox}>
              <Text variant="bodySmall" style={styles.infoText}>
                💡 Note: Enter the size in square feet. This will be used for unit configurations.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || deleting}
          style={styles.button}
          buttonColor="#10B981"
          icon="content-save"
        >
          {loading ? 'Updating...' : 'Update Project Size'}
        </Button>

        <Button
          mode="outlined"
          onPress={handleDelete}
          loading={deleting}
          disabled={loading || deleting}
          style={styles.deleteButton}
          textColor="#EF4444"
          icon="delete"
        >
          {deleting ? 'Deleting...' : 'Delete Project Size'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  form: { 
    padding: 16,
  },
  section: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
  },
  blueSection: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  greenSection: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  sectionSubtitle: {
    color: '#6B7280',
    marginBottom: 16,
  },
  input: { 
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    color: '#1E40AF',
  },
  button: { 
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: '#EF4444',
    borderRadius: 12,
  },
});

export default EditProjectSizeScreen;
