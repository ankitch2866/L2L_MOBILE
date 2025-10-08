import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText, Menu, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { createStock, fetchStocks } from '../../../store/slices/stocksSlice';

const AddStockScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { units, brokers } = useSelector(state => state.stocks);
  
  const [formData, setFormData] = useState({
    unit_id: '',
    broker_id: '',
    hold_till_date: '',
    remarks: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [brokerMenuVisible, setBrokerMenuVisible] = useState(false);

  useEffect(() => {
    // Fetch stocks to get units and brokers data
    dispatch(fetchStocks());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.unit_id) newErrors.unit_id = 'Unit is required';
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
      await dispatch(createStock(formData)).unwrap();
      Alert.alert('Success', 'Stock added successfully and unit status updated to hold');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  // Filter only free units
  const freeUnits = (units || []).filter(unit => unit.status === 'free');

  const getSelectedUnitName = () => {
    const unit = freeUnits.find(u => u.unit_id === formData.unit_id);
    return unit?.unit_name || 'Select Unit';
  };

  const getSelectedBrokerName = () => {
    const broker = (brokers || []).find(b => b.broker_id === formData.broker_id);
    return broker?.name || 'Select Broker';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <Text variant="bodySmall" style={styles.label}>Unit *</Text>
        <Menu
          visible={unitMenuVisible}
          onDismiss={() => setUnitMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setUnitMenuVisible(true)}
              style={[styles.menuButton, errors.unit_id && styles.errorButton]}
              contentStyle={styles.menuButtonContent}
            >
              {getSelectedUnitName()}
            </Button>
          }
        >
          {freeUnits.length === 0 ? (
            <Menu.Item title="No free units available" disabled />
          ) : (
            freeUnits.map((unit) => (
              <Menu.Item
                key={unit.unit_id}
                onPress={() => {
                  handleChange('unit_id', unit.unit_id);
                  setUnitMenuVisible(false);
                }}
                title={unit.unit_name}
              />
            ))
          )}
        </Menu>
        <HelperText type="error" visible={!!errors.unit_id}>
          {errors.unit_id}
        </HelperText>

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
          Add Stock
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
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

export default AddStockScreen;
