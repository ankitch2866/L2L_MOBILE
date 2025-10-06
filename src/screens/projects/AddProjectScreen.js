import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, HelperText, Text, Divider, Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Icon as PaperIcon } from 'react-native-paper';
import { useTheme } from '../../context';
import { createProject, fetchProjects } from '../../store/slices/projectsSlice';

const AddProjectScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    project_name: '',
    company_name: '',
    address: '',
    landmark: '',
  });
  const [signImage, setSignImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const trimmedProjectName = formData.project_name.trim();
    const trimmedCompanyName = formData.company_name.trim();
    const trimmedAddress = formData.address.trim();

    if (!trimmedProjectName) {
      newErrors.project_name = 'Project name is required';
    } else if (trimmedProjectName.length < 2) {
      newErrors.project_name = 'Project name must be at least 2 characters long';
    }

    if (!trimmedCompanyName) {
      newErrors.company_name = 'Company name is required';
    } else if (trimmedCompanyName.length < 2) {
      newErrors.company_name = 'Company name must be at least 2 characters long';
    }

    if (!trimmedAddress) {
      newErrors.address = 'Address is required';
    } else if (trimmedAddress.length < 5) {
      newErrors.address = 'Address must be at least 5 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSignImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setSignImage(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const dataToSend = {
        project_name: formData.project_name.trim(),
        company_name: formData.company_name.trim(),
        address: formData.address.trim(),
        landmark: formData.landmark.trim(),
      };

      // Note: Image upload would need FormData and multipart/form-data
      // For now, we'll just send the text data
      // TODO: Implement image upload with FormData

      await dispatch(createProject(dataToSend)).unwrap();

      // Navigate back first
      navigation.goBack();

      // Then refresh the list in background
      dispatch(fetchProjects());

      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Success', 'Project created successfully!');
      }, 300);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Project Information Section */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Project Information
          </Text>
          <Divider style={styles.divider} />

          <TextInput
            label="Project Name *"
            value={formData.project_name}
            onChangeText={(text) => setFormData({ ...formData, project_name: text })}
            error={!!errors.project_name}
            mode="outlined"
            style={styles.input}
            placeholder="Enter project name..."
          />
          <HelperText type="error" visible={!!errors.project_name}>
            {errors.project_name}
          </HelperText>

          <TextInput
            label="Company Name *"
            value={formData.company_name}
            onChangeText={(text) => setFormData({ ...formData, company_name: text })}
            error={!!errors.company_name}
            mode="outlined"
            style={styles.input}
            placeholder="Enter company name..."
          />
          <HelperText type="error" visible={!!errors.company_name}>
            {errors.company_name}
          </HelperText>

          {/* Location Details Section */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>
            Location Details
          </Text>
          <Divider style={styles.divider} />

          <TextInput
            label="Address *"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            error={!!errors.address}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="Enter complete address..."
          />
          <HelperText type="error" visible={!!errors.address}>
            {errors.address}
          </HelperText>

          <TextInput
            label="Landmark"
            value={formData.landmark}
            onChangeText={(text) => setFormData({ ...formData, landmark: text })}
            mode="outlined"
            style={styles.input}
            placeholder="Enter nearby landmark..."
          />

          {/* Sign Image Upload Section */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>
            Sign Image Upload
          </Text>
          <Divider style={styles.divider} />

          <TouchableOpacity onPress={pickImage} style={styles.imageUploadContainer}>
            <Card style={styles.imageUploadCard}>
              <Card.Content style={styles.imageUploadContent}>
                {signImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: signImage.uri }} style={styles.imagePreview} />
                    <TouchableOpacity onPress={removeImage} style={styles.removeImageButton}>
                      <PaperIcon source="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <PaperIcon source="upload" size={48} color="#9CA3AF" />
                    <Text variant="bodyMedium" style={styles.uploadText}>
                      Tap to upload sign image
                    </Text>
                    <Text variant="bodySmall" style={styles.uploadHint}>
                      PNG, JPG, JPEG (Optional)
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <View style={styles.buttons}>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              Create Project
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  form: { padding: 16 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
  divider: { marginBottom: 16 },
  input: { marginBottom: 8 },
  imageUploadContainer: { marginBottom: 16 },
  imageUploadCard: { backgroundColor: '#F9FAFB' },
  imageUploadContent: { padding: 16 },
  uploadPlaceholder: { alignItems: 'center', padding: 24 },
  uploadText: { marginTop: 12, color: '#4B5563', fontWeight: '500' },
  uploadHint: { marginTop: 4, color: '#9CA3AF' },
  imagePreviewContainer: { position: 'relative', alignItems: 'center' },
  imagePreview: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'contain' },
  removeImageButton: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default AddProjectScreen;
