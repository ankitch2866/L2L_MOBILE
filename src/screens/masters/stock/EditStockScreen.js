import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText, Menu, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchStockById, updateStock, fetchStocks } from '../../../store/slices/stocksSlice';

const EditStockScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading: stockLoading, brokers } = useSelector(state => state.stocks);
  
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [brokerMenuVisible, setBrokerMenuVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchStockById(id));
    dispatch(fetchStocks()); // To get brokers list
  }, [dispatch, id]);

  useEffect(() => {
    if (current) {
      setFormData({
        broker_id: current.broker_id || '',
        hold_till_date: current.hold_till_date ? current.hold_till_date.split('T')[0] : '',
        remarks: current.remarks || ''
      });
    }
  }, [current]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.broker_id) newErrors.broker_id = 'Broker is required';
    
    if (formData.hold_till_date) {
      const holdDate = new Date(formData.hold_till_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (holdDate < today) {
        newErrors.hold_till_date = 'Hold till date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await dispatch(updateStock({ id, data: formData })).unwrap();
      Alert.alert('Success', 'Stock updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  if (stockLoading || !formData) return <LoadingIndicator />;

  const getSelectedBrokerName = () => {
    const broker = (brokers || []).find(b => b.broker_id === formData.broker_id);
    return broker?.name || 'Select Broker';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <View style={styles.infoCard}>
          <TextInput
            label="Unit Name"
            value={current?.unit_name || ''}
            mode="outlined"
            disabled
            style={styles.input}
          />
          <TextInput
            label="Project Name"
            value={current?.project_name || ''}
            mode="outlined"
            disabled
            style={styles.input}
          />
        </View>

        <Text variant="bodySmall" style={styles.label}>Broker *</Text>
        <Menu
          visible={brokerMenuVisible}
          onDismiss={() => setBrokerMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setBrokerMenuVisible(true)}
              style={[styles.menuButton, errors.broker_id && styles.errorButton]}
              contentStyle={styles.menuButtonContent}
            >
              {getSelectedBrokerName()}
            </Button>
          }
        >
          {(brokers || []).map((broker) => (
            <Menu.Item
              key={broker.broker_id}
              onPress={() => {
                handleChange('broker_id', broker.broker_id);
                setBrokerMenuVisible(false);
              }}
              title={broker.name}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={!!errors.broker_id}>
          {errors.broker_id}
        </HelperText>

        <TextInput
          label="Hold Till Date"
          value={formData.hold_till_date}
          onChangeText={(text) => handleChange('hold_till_date', text)}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          error={!!errors.hold_till_date}
          style={styles.input}
        />
        <HelperText type="info" visible={!errors.hold_till_date}>
          Optional: Format YYYY-MM-DD (e.g., 2025-12-31)
        </HelperText>
        <HelperText type="error" visible={!!errors.hold_till_date}>
          {errors.hold_till_date}
        </HelperText>

        <TextInput
          label="Remarks"
          value={formData.remarks}
          onChangeText={(text) => handleChange('remarks', text)}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Update Stock
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
  infoCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  label: {
    marginBottom: 4,
    marginTop: 8,
    color: '#6B7280',
  },
  menuButton: {
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  menuButtonContent: {
    justifyContent: 'flex-start',
  },
  errorButton: {
    borderColor: '#EF4444',
  },
  input: { marginBottom: 8 },
  button: { marginTop: 24, marginBottom: 32 },
});

export default EditStockScreen;
