import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context';
import { LoadingIndicator } from '../../components';
import { fetchPropertyById, updateProperty, clearCurrentProperty } from '../../store/slices/propertiesSlice';

const EditPropertyScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { currentProperty, loading } = useSelector(state => state.properties);
  const [formData, setFormData] = useState({
    unit_number: '',
    area_sqft: '',
    price: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchPropertyById(propertyId));
    return () => dispatch(clearCurrentProperty());
  }, [dispatch, propertyId]);

  useEffect(() => {
    if (currentProperty) {
      setFormData({
        unit_number: currentProperty.unit_number || '',
        area_sqft: currentProperty.area_sqft?.toString() || '',
        price: currentProperty.price?.toString() || '',
      });
    }
  }, [currentProperty]);

  const validate = () => {
    const newErrors = {};
    if (!formData.unit_number.trim()) newErrors.unit_number = 'Unit number is required';
    if (!formData.area_sqft || isNaN(formData.area_sqft)) newErrors.area_sqft = 'Valid area is required';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Valid price is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setSaving(true);
    try {
      await dispatch(updateProperty({
        id: propertyId,
        data: {
          ...formData,
          area_sqft: parseFloat(formData.area_sqft),
          price: parseFloat(formData.price),
        }
      })).unwrap();
      navigation.goBack();
    } catch (error) {
      setErrors({ form: error });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          <TextInput
            label="Unit Number *"
            value={formData.unit_number}
            onChangeText={(text) => setFormData({ ...formData, unit_number: text })}
            error={!!errors.unit_number}
            mode="outlined"
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.unit_number}>
            {errors.unit_number}
          </HelperText>

          <TextInput
            label="Area (sqft) *"
            value={formData.area_sqft}
            onChangeText={(text) => setFormData({ ...formData, area_sqft: text })}
            error={!!errors.area_sqft}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.area_sqft}>
            {errors.area_sqft}
          </HelperText>

          <TextInput
            label="Price *"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            error={!!errors.price}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.price}>
            {errors.price}
          </HelperText>

          <View style={styles.buttons}>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={saving}
              disabled={saving}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              Update
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
  input: { marginBottom: 8 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default EditPropertyScreen;
