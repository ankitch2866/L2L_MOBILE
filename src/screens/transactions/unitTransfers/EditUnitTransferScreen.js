import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { 
  fetchTransferById,
  updateTransfer,
  clearError 
} from '../../../store/slices/unitTransfersSlice';

const EditUnitTransferScreen = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading, error } = useSelector(state => state.unitTransfers);

  const [formData, setFormData] = useState({
    remarks: '',
  });

  useEffect(() => {
    if (transactionId) {
      dispatch(fetchTransferById(transactionId));
    }
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, transactionId]);

  useEffect(() => {
    if (current?.transfer_charge) {
      setFormData({
        remarks: current.transfer_charge.remarks || '',
      });
    }
  }, [current]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(updateTransfer({
        id: current.transfer_charge.id,
        data: formData,
      })).unwrap();
      
      Alert.alert('Success', 'Transfer updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err || 'Failed to update transfer');
    }
  };

  if (!current) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Transfer Information (Read-only) */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Transfer Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{current.customer?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Unit:</Text>
              <Text style={styles.value}>{current.unit?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Transfer Charges:</Text>
              <Text style={[styles.value, styles.amount]}>
                ₹{parseFloat(current.transfer_charge?.transfer_charges || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Transfer Date:</Text>
              <Text style={styles.value}>
                {current.transfer_charge?.transfer_date 
                  ? new Date(current.transfer_charge.transfer_date).toLocaleDateString('en-IN') 
                  : 'N/A'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Editable Fields */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Edit Details</Text>
            
            <TextInput
              label="Remarks"
              value={formData.remarks}
              onChangeText={(value) => handleInputChange('remarks', value)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Enter any remarks or notes"
            />
          </Card.Content>
        </Card>

        {error && (
          <Card style={[styles.card, { backgroundColor: '#FEE2E2' }]}>
            <Card.Content>
              <Text style={{ color: '#DC2626' }}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.actionButton}
          >
            Save Changes
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16, elevation: 2 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 16 },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: { color: '#6B7280', flex: 1 },
  value: { flex: 1, textAlign: 'right' },
  amount: { fontWeight: 'bold', color: '#059669' },
  input: { marginBottom: 12 },
  actions: { 
    flexDirection: 'row', 
    gap: 8,
    marginTop: 8,
  },
  actionButton: { flex: 1 },
});

export default EditUnitTransferScreen;
