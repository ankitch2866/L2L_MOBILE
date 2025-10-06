import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, HelperText, Menu, Text, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Icon as PaperIcon } from 'react-native-paper';
import { useTheme } from '../../context';
import { createProperty, fetchAllPropertiesData } from '../../store/slices/propertiesSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';
import axios from 'axios';

const UNIT_TYPE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const UNIT_DESC_OPTIONS = [
  { value: '2BHK Flat', label: '2BHK Flat' },
  { value: '3BHK Apt', label: '3BHK Apartment' },
  { value: '4BHK Pent', label: '4BHK Penthouse' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Row House', label: 'Row House' },
  { value: 'Duplex', label: 'Duplex' },
  { value: 'Studio', label: 'Studio' },
  { value: 'Shop Complex', label: 'Shop Complex' },
  { value: 'Office', label: 'Office' },
  { value: 'Co-work', label: 'Co-working Space' },
  { value: 'Warehouse', label: 'Warehouse' },
  { value: 'Farmhouse', label: 'Farmhouse' },
  { value: 'Resort', label: 'Resort' },
  { value: 'Service Apt', label: 'Service Apartment' },
  { value: 'Showroom', label: 'Showroom' },
  { value: 'Other', label: 'Other' }
];

const AddPropertyScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { projects } = useSelector(state => state.projects);

  // Form state matching web version
  const [formData, setFormData] = useState({
    project_id: '',
    count: '1',
    unit_type: '',
    unit_size: '',
    bsp: '',
    unit_desc: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [projectSizes, setProjectSizes] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(false);

  // Menu visibility states
  const [projectMenuVisible, setProjectMenuVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [sizeMenuVisible, setSizeMenuVisible] = useState(false);
  const [descMenuVisible, setDescMenuVisible] = useState(false);

  // Counter to force menu re-renders (prevents glitches)
  const [menuRenderKey, setMenuRenderKey] = useState(0);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Fetch project sizes when project changes
  useEffect(() => {
    if (formData.project_id) {
      fetchProjectSizes(formData.project_id);
    } else {
      setProjectSizes([]);
      setFormData(prev => ({ ...prev, unit_size: '' }));
    }
  }, [formData.project_id]);

  const fetchProjectSizes = async (projectId) => {
    setLoadingSizes(true);
    console.log('🔍 Fetching sizes for project ID:', projectId);
    try {
      // Get ALL project sizes and filter by project_id
      // This avoids the route conflict with /project-sizes/:id
      const response = await axios.get('/api/master/project-sizes');
      console.log('📦 Full Response:', JSON.stringify(response.data, null, 2));

      if (response.data?.success) {
        const allSizes = response.data.data || [];
        // Filter sizes for this specific project
        const projectSizes = allSizes.filter(size => size.project_id === parseInt(projectId));
        console.log('✅ Sizes found for project:', projectSizes.length, 'items');
        console.log('📋 Sizes data:', JSON.stringify(projectSizes, null, 2));
        setProjectSizes(Array.isArray(projectSizes) ? projectSizes : []);
      } else {
        console.log('❌ Response not successful:', response.data);
        setProjectSizes([]);
      }
    } catch (error) {
      console.log('🚨 Error fetching sizes:', error.message);
      console.log('🚨 Error details:', error.response?.data || error);
      setProjectSizes([]);
    } finally {
      setLoadingSizes(false);
    }
  };

  // Menu handlers with aggressive glitch prevention
  const handleProjectMenuOpen = () => {
    if (!projectMenuVisible && !loading) {
      setMenuRenderKey(prev => prev + 1); // Force re-render
      setProjectMenuVisible(true);
    }
  };

  const handleProjectMenuDismiss = () => {
    setProjectMenuVisible(false);
    setMenuRenderKey(prev => prev + 1); // Force re-render after close
  };

  const handleProjectSelect = (projectId) => {
    setProjectMenuVisible(false);
    setMenuRenderKey(prev => prev + 1); // Force re-render
    handleChange('project_id', projectId);
  };

  const handleTypeMenuOpen = () => {
    if (!typeMenuVisible && !loading) {
      setMenuRenderKey(prev => prev + 1);
      setTypeMenuVisible(true);
    }
  };

  const handleTypeMenuDismiss = () => {
    setTypeMenuVisible(false);
    setMenuRenderKey(prev => prev + 1);
  };

  const handleTypeSelect = (value) => {
    setTypeMenuVisible(false);
    setMenuRenderKey(prev => prev + 1);
    handleChange('unit_type', value);
  };

  const handleSizeMenuOpen = () => {
    if (!sizeMenuVisible && !loadingSizes && !loading) {
      setMenuRenderKey(prev => prev + 1);
      setSizeMenuVisible(true);
    }
  };

  const handleSizeMenuDismiss = () => {
    setSizeMenuVisible(false);
    setMenuRenderKey(prev => prev + 1);
  };

  const handleSizeSelect = (size) => {
    setSizeMenuVisible(false);
    setMenuRenderKey(prev => prev + 1);
    handleChange('unit_size', size.toString());
  };

  const handleDescMenuOpen = () => {
    if (!descMenuVisible && !loading) {
      setMenuRenderKey(prev => prev + 1);
      setDescMenuVisible(true);
    }
  };

  const handleDescMenuDismiss = () => {
    setDescMenuVisible(false);
    setMenuRenderKey(prev => prev + 1);
  };

  const handleDescSelect = (value) => {
    setDescMenuVisible(false);
    setMenuRenderKey(prev => prev + 1);
    handleChange('unit_desc', value);
  };

  const selectedProject = (projects || []).find(p => p.project_id === formData.project_id);
  const selectedType = UNIT_TYPE_OPTIONS.find(t => t.value === formData.unit_type);
  const selectedDesc = UNIT_DESC_OPTIONS.find(d => d.value === formData.unit_desc);
  const selectedSize = projectSizes.find(s => s.size.toString() === formData.unit_size);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.project_id) newErrors.project_id = 'Project is required';

    if (!formData.count) {
      newErrors.count = 'Number of units is required';
    } else if (isNaN(Number(formData.count))) {
      newErrors.count = 'Must be a valid number';
    } else if (Number(formData.count) <= 0) {
      newErrors.count = 'Must be greater than 0';
    } else if (Number(formData.count) > 999) {
      newErrors.count = 'Maximum 999 units at once';
    }

    if (!formData.unit_type) newErrors.unit_type = 'Unit type is required';

    if (!formData.unit_size) {
      newErrors.unit_size = 'Unit size is required';
    } else if (isNaN(parseFloat(formData.unit_size))) {
      newErrors.unit_size = 'Must be a valid number';
    } else if (parseFloat(formData.unit_size) <= 0) {
      newErrors.unit_size = 'Must be greater than 0';
    }

    if (!formData.bsp) {
      newErrors.bsp = 'BSP (Price) is required';
    } else if (isNaN(parseFloat(formData.bsp))) {
      newErrors.bsp = 'Must be a valid number';
    } else if (parseFloat(formData.bsp) < 0) {
      newErrors.bsp = 'Must be zero or positive value';
    }

    if (!formData.unit_desc) newErrors.unit_desc = 'Unit description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        project_id: formData.project_id,
        count: Number(formData.count),
        unit_type: formData.unit_type,
        unit_size: parseFloat(formData.unit_size),
        bsp: parseFloat(formData.bsp),
        unit_desc: formData.unit_desc
      };

      const response = await axios.post('/api/master/unit', payload);

      if (response.data?.success) {
        Alert.alert(
          'Success',
          `${formData.count} ${Number(formData.count) === 1 ? 'unit' : 'units'} added successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                dispatch(fetchAllPropertiesData());
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error(response.data?.message || 'Failed to add units');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to add units');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          {/* Section 1: Project Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <PaperIcon source="office-building" size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>Project Selection</Text>
            </View>

            <Text variant="labelLarge" style={styles.label}>Select Project *</Text>
            <Menu
              key={`project-${menuRenderKey}-${formData.project_id || 'none'}`}
              visible={projectMenuVisible}
              onDismiss={handleProjectMenuDismiss}
              anchor={
                <TouchableOpacity
                  onPress={handleProjectMenuOpen}
                  style={[
                    styles.menuButton,
                    { borderColor: errors.project_id ? '#EF4444' : '#ccc' }
                  ]}
                  disabled={loading}
                >
                  <Text style={styles.menuButtonText}>
                    {selectedProject ? selectedProject.project_name : 'Select Project'}
                  </Text>
                  <PaperIcon source="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              }
              contentStyle={styles.menuContent}
            >
              <ScrollView style={styles.menuScrollView} nestedScrollEnabled={true}>
                {(projects || []).map(p => (
                  <Menu.Item
                    key={p.project_id}
                    onPress={() => handleProjectSelect(p.project_id)}
                    title={p.project_name}
                    titleStyle={styles.menuItemTitle}
                  />
                ))}
              </ScrollView>
            </Menu>
            <HelperText type="error" visible={!!errors.project_id}>
              {errors.project_id}
            </HelperText>

            {/* Unit Size Dropdown - Only show when project is selected */}
            {formData.project_id && (
              <>
                <Text variant="labelLarge" style={styles.label}>Select Unit Size *</Text>
                <Menu
                  key={`size-${menuRenderKey}-${formData.unit_size || 'none'}`}
                  visible={sizeMenuVisible}
                  onDismiss={handleSizeMenuDismiss}
                  anchor={
                    <TouchableOpacity
                      onPress={handleSizeMenuOpen}
                      style={[
                        styles.menuButton,
                        { borderColor: errors.unit_size ? '#EF4444' : '#ccc' }
                      ]}
                      disabled={loadingSizes || loading}
                    >
                      <Text style={styles.menuButtonText}>
                        {loadingSizes ? 'Loading sizes...' :
                          selectedSize ? `${selectedSize.size} sq ft` : 'Select Size'}
                      </Text>
                      <PaperIcon source="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                  }
                  contentStyle={styles.menuContent}
                >
                  <ScrollView style={styles.menuScrollView} nestedScrollEnabled={true}>
                    {projectSizes.map(size => (
                      <Menu.Item
                        key={size.id}
                        onPress={() => handleSizeSelect(size.size)}
                        title={`${size.size} sq ft`}
                        titleStyle={styles.menuItemTitle}
                      />
                    ))}
                    {projectSizes.length === 0 && !loadingSizes && (
                      <Menu.Item title="No sizes available" disabled />
                    )}
                  </ScrollView>
                </Menu>
                <HelperText type="error" visible={!!errors.unit_size}>
                  {errors.unit_size}
                </HelperText>
              </>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Section 2: Unit Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <PaperIcon source="home-city" size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>Unit Details</Text>
            </View>

            <TextInput
              label="Number of Units to Add *"
              value={formData.count}
              onChangeText={(text) => handleChange('count', text.replace(/[^0-9]/g, ''))}
              error={!!errors.count}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
              left={<TextInput.Icon icon="counter" />}
            />
            <HelperText type="error" visible={!!errors.count}>
              {errors.count}
            </HelperText>

            <Text variant="labelLarge" style={styles.label}>Unit Type *</Text>
            <Menu
              key={`type-${menuRenderKey}-${formData.unit_type || 'none'}`}
              visible={typeMenuVisible}
              onDismiss={handleTypeMenuDismiss}
              anchor={
                <TouchableOpacity
                  onPress={handleTypeMenuOpen}
                  style={[
                    styles.menuButton,
                    { borderColor: errors.unit_type ? '#EF4444' : '#ccc' }
                  ]}
                  disabled={loading}
                >
                  <Text style={styles.menuButtonText}>
                    {selectedType ? selectedType.label : 'Select Unit Type'}
                  </Text>
                  <PaperIcon source="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              }
            >
              {UNIT_TYPE_OPTIONS.map(type => (
                <Menu.Item
                  key={type.value}
                  onPress={() => handleTypeSelect(type.value)}
                  title={type.label}
                />
              ))}
            </Menu>
            <HelperText type="error" visible={!!errors.unit_type}>
              {errors.unit_type}
            </HelperText>

            <TextInput
              label="BSP (Base Sale Price) *"
              value={formData.bsp}
              onChangeText={(text) => handleChange('bsp', text)}
              error={!!errors.bsp}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Icon icon="currency-inr" />}
            />
            <HelperText type="error" visible={!!errors.bsp}>
              {errors.bsp}
            </HelperText>
          </View>

          <Divider style={styles.divider} />

          {/* Section 3: Additional Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <PaperIcon source="information" size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>Additional Information</Text>
            </View>

            <Text variant="labelLarge" style={styles.label}>Unit Description *</Text>
            <Menu
              key={`desc-${menuRenderKey}-${formData.unit_desc || 'none'}`}
              visible={descMenuVisible}
              onDismiss={handleDescMenuDismiss}
              anchor={
                <TouchableOpacity
                  onPress={handleDescMenuOpen}
                  style={[
                    styles.menuButton,
                    { borderColor: errors.unit_desc ? '#EF4444' : '#ccc' }
                  ]}
                  disabled={loading}
                >
                  <Text style={styles.menuButtonText}>
                    {selectedDesc ? selectedDesc.label : 'Select Unit Description'}
                  </Text>
                  <PaperIcon source="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              }
              contentStyle={styles.menuContent}
            >
              <ScrollView style={styles.menuScrollView} nestedScrollEnabled={true}>
                {UNIT_DESC_OPTIONS.map(desc => (
                  <Menu.Item
                    key={desc.value}
                    onPress={() => handleDescSelect(desc.value)}
                    title={desc.label}
                    titleStyle={styles.menuItemTitle}
                  />
                ))}
              </ScrollView>
            </Menu>
            <HelperText type="error" visible={!!errors.unit_desc}>
              {errors.unit_desc}
            </HelperText>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              Add {formData.count || '1'} {Number(formData.count) === 1 ? 'Unit' : 'Units'}
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
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    marginVertical: 16,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
    fontWeight: '600',
  },
  menuButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  button: { flex: 1 },
  menuContent: {
    maxHeight: 400,
    maxWidth: 300,
  },
  menuScrollView: {
    maxHeight: 360, // Show ~8 items
  },
  menuItemTitle: {
    fontSize: 14,
  },
});

export default AddPropertyScreen;
