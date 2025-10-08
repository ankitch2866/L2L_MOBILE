import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { fetchAllotmentById, updateAllotment } from '../../../store/slices/allotmentsSlice';
import { LoadingIndicator } from '../../../components';

const EditAllotmentScreen = ({ navigation, route }) => {
  const { allotmentId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: allotment, loading: fetchLoading } = useSelector(state => state.allotments);
  
  const [formData, setFormData] = useState({
    allotmentDate: '',
    remarks: '',
    status: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllotmentById(allotmentId));
  }, [dispatch, allotmentId]);

  useEffect(() => {
    if (allotment) {
      setFormData({
        allotmentDate: allotment.allotment_date?.split('T')[0] || '',
        remarks: allotment.remarks || '',
        status: allotment.status || 'active',
      });
    }
  }, [allotment]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.allotmentDate) newErrors.allotmentDate = 'Allotment date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        allotment_date: formData.allotmentDate,
        remarks: formData.remarks,
        status: formData.status,
      };

      await dispatch(updateAllotment({ id: allotmentId, data: payload })).unwrap();
      Alert.alert('Success', 'Allotment updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update allotment');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading || !allotment) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text variant="titleLarge" style={styles.title}>Edit Allotment</Text>
          
          <View style={styles.infoSection}>
            <Text variant="bodyMedium" style={styles.infoLabel}>Project:</Text>
            <Text variant="bodyLarge" style={styles.infoValue}>{allotment.project_name}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text variant="bodyMedium" style={styles.infoLabel}>Customer:</Text>
            <Text variant="bodyLarge" style={styles.infoValue}>{allotment.customer_name}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text variant="bodyMedium" style={styles.infoLabel}>Unit:</Text>
            <Text variant="bodyLarge" style={styles.infoValue}>{allotment.unit_name}</Text>
          </View>

          <TextInput
            label="Allotment Date *"
            value={formData.allotmentDate}
            onChangeText={(text) => {
              setFormData({ ...formData, allotmentDate: text });
              setErrors({ ...errors, allotmentDate: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.allotmentDate}
            placeholder="YYYY-MM-DD"
          />
          <HelperText type="error" visible={!!errors.allotmentDate}>
            {errors.allotmentDate}
          </HelperText>

          <TextInput
            label="Status"
            value={formData.status}
            onChangeText={(text) => setFormData({ ...formData, status: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Remarks"
            value={formData.remarks}
            onChangeText={(text) => setFormData({ ...formData, remarks: text })}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
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
  scrollContent: { padding: 16 },
  card: { padding: 16, borderRadius: 8, elevation: 2 },
  title: { marginBottom: 16, fontWeight: 'bold' },
  infoSection: { marginBottom: 12, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8 },
  infoLabel: { color: '#6B7280', marginBottom: 4 },
  infoValue: { fontWeight: '600', color: '#111827' },
  input: { marginBottom: 8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 8 },
  button: { flex: 1 },
});

export default EditAllotmentScreen;
