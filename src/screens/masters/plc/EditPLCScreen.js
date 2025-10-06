import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, RadioButton, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchPLCById, updatePLC, fetchPLCs } from '../../../store/slices/plcSlice';

const EditPLCScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.plc);
  const [saving, setSaving] = useState(false);
  const [valueType, setValueType] = useState('percentage');
  const [formData, setFormData] = useState({
    plc_name: '',
    percentage: '',
    amount: '',
    remark: '',
  });

  useEffect(() => {
    dispatch(fetchPLCById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current) {
      const isPercentage = current.is_percentage === 1 || current.is_percentage === true;
      setValueType(isPercentage ? 'percentage' : 'amount');
      setFormData({
        plc_name: current.plc_name || '',
        percentage: isPercentage ? current.value?.toString() || '' : '',
        amount: !isPercentage ? current.value?.toString() || '' : '',
        remark: current.remark || '',
      });
    }
  }, [current]);

  const handleSubmit = async () => {
    if (!formData.plc_name.trim()) {
      Alert.alert('Validation Error', 'PLC name is required');
      return;
    }

    const value = valueType === 'percentage' ? formData.percentage : formData.amount;
    
    if (!value || isNaN(value)) {
      Alert.alert('Validation Error', `Valid ${valueType} is required`);
      return;
    }

    const numValue = parseFloat(value);
    
    if (numValue < 0) {
      Alert.alert('Validation Error', `${valueType === 'percentage' ? 'Percentage' : 'Amount'} cannot be negative`);
      return;
    }

    if (valueType === 'percentage' && numValue > 100) {
      Alert.alert('Validation Error', 'Percentage cannot exceed 100%');
      return;
    }

    setSaving(true);
    try {
      await dispatch(updatePLC({
        id,
        data: {
          plc_name: formData.plc_name.trim(),
          value: numValue,
          is_percentage: valueType === 'percentage',
          remark: formData.remark.trim() || null,
        }
      })).unwrap();

      Alert.alert('Success', 'PLC updated successfully', [
        { text: 'OK', onPress: () => {
          dispatch(fetchPLCs());
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update PLC');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !current) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
      <View style={styles.form}>
        {/* Section 1: Basic Information (Green) */}
        <Card style={[styles.section, styles.greenSection]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📋 Basic Information
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Update the PLC name and details
            </Text>
            
            <TextInput
              label="PLC Name *"
              value={formData.plc_name}
              onChangeText={(text) => setFormData({ ...formData, plc_name: text })}
              mode="outlined"
              style={styles.input}
              outlineColor="#D1FAE5"
              activeOutlineColor="#10B981"
              disabled={saving}
            />
          </Card.Content>
        </Card>

        {/* Section 2: Value Configuration (Purple) */}
        <Card style={[styles.section, styles.purpleSection]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              💰 Value Configuration
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Choose either percentage or fixed amount
            </Text>

            <View style={styles.radioGroup}>
              <View style={styles.radioOption}>
                <RadioButton
                  value="percentage"
                  status={valueType === 'percentage' ? 'checked' : 'unchecked'}
                  onPress={() => setValueType('percentage')}
                  color="#9333EA"
                  disabled={saving}
                />
                <Text variant="bodyMedium" style={styles.radioLabel}>Percentage (%)</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton
                  value="amount"
                  status={valueType === 'amount' ? 'checked' : 'unchecked'}
                  onPress={() => setValueType('amount')}
                  color="#9333EA"
                  disabled={saving}
                />
                <Text variant="bodyMedium" style={styles.radioLabel}>Fixed Amount</Text>
              </View>
            </View>

            {valueType === 'percentage' ? (
              <TextInput
                label="Percentage (%) *"
                value={formData.percentage}
                onChangeText={(text) => setFormData({ ...formData, percentage: text, amount: '' })}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
                outlineColor="#F3E8FF"
                activeOutlineColor="#9333EA"
                disabled={saving}
                right={<TextInput.Affix text="%" />}
              />
            ) : (
              <TextInput
                label="Fixed Amount *"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text, percentage: '' })}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
                outlineColor="#F3E8FF"
                activeOutlineColor="#9333EA"
                disabled={saving}
                left={<TextInput.Affix text="₹" />}
              />
            )}

            <View style={styles.infoBox}>
              <Text variant="bodySmall" style={styles.infoText}>
                💡 Note: Choose either percentage or fixed amount. You cannot set both values simultaneously.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Section 3: Additional Information (Gray) */}
        <Card style={[styles.section, styles.graySection]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📝 Additional Information
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Optional remarks and notes
            </Text>
            
            <TextInput
              label="Remark (Optional)"
              value={formData.remark}
              onChangeText={(text) => setFormData({ ...formData, remark: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              outlineColor="#E5E7EB"
              activeOutlineColor="#6B7280"
              disabled={saving}
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={saving}
          disabled={saving}
          style={styles.button}
          buttonColor="#10B981"
          icon="content-save"
        >
          {saving ? 'Updating PLC...' : 'Update PLC'}
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
  greenSection: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  purpleSection: {
    backgroundColor: '#FAF5FF',
    borderLeftWidth: 4,
    borderLeftColor: '#9333EA',
  },
  graySection: {
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
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
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    marginLeft: 4,
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
  },
});

export default EditPLCScreen;
