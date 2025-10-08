import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { Dropdown } from '../../../components/common';
import { LoadingIndicator } from '../../../components';
import { 
  checkTransferCharge,
  markTransferChargeUsed,
  fetchUnitOwners,
  clearTransferChargeStatus,
  clearUnitOwners,
} from '../../../store/slices/unitTransfersSlice';
import { fetchCustomers } from '../../../store/slices/customersSlice';

const TransferTransactionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { 
    loading, 
    transferChargeStatus, 
    unitOwners 
  } = useSelector(state => state.unitTransfers);
  const { list: customers } = useSelector(state => state.customers);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');

  useEffect(() => {
    dispatch(fetchCustomers());
    return () => {
      dispatch(clearTransferChargeStatus());
      dispatch(clearUnitOwners());
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedCustomerId) {
      dispatch(checkTransferCharge(selectedCustomerId));
    }
  }, [selectedCustomerId, dispatch]);

  const handleCheckOwners = () => {
    if (!selectedUnitId) {
      Alert.alert('Error', 'Please select a unit first');
      return;
    }
    dispatch(fetchUnitOwners(selectedUnitId));
  };

  const handleProceedToTransfer = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    if (!transferChargeStatus?.hasTransferCharge) {
      Alert.alert('Error', 'Customer does not have a pending transfer charge payment');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      'Are you sure you want to proceed with this unit transfer? This will mark the transfer charge as used.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            try {
              await dispatch(markTransferChargeUsed(selectedCustomerId)).unwrap();
              Alert.alert('Success', 'Transfer charge marked as used. You can now proceed with the transfer registration.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error || 'Failed to mark transfer charge as used');
            }
          },
        },
      ]
    );
  };

  const customerOptions = customers.map(c => ({
    label: `${c.name} (${c.manual_application_id || c.customer_id})`,
    value: c.customer_id.toString(),
  }));

  // For unit selection, you would typically fetch units from a units slice
  // For now, using a placeholder
  const unitOptions = [
    { label: 'Select a unit', value: '' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Customer Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Select Customer</Text>
            
            <Dropdown
              label="Customer *"
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
              items={customerOptions}
              placeholder="Choose customer"
            />

            {transferChargeStatus && (
              <Card style={[styles.statusCard, { 
                backgroundColor: transferChargeStatus.hasTransferCharge ? '#D1FAE5' : '#FEE2E2' 
              }]}>
                <Card.Content>
                  <View style={styles.statusRow}>
                    <Text variant="bodyMedium" style={styles.statusText}>
                      {transferChargeStatus.hasTransferCharge 
                        ? `✓ Transfer charge paid (${transferChargeStatus.paymentCount} pending)`
                        : '✗ No pending transfer charge payment'}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          </Card.Content>
        </Card>

        {/* Unit Owners Check */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Check Unit Owners</Text>
            
            <Dropdown
              label="Unit"
              value={selectedUnitId}
              onValueChange={setSelectedUnitId}
              items={unitOptions}
              placeholder="Choose unit to check owners"
            />

            <Button
              mode="outlined"
              onPress={handleCheckOwners}
              disabled={!selectedUnitId}
              style={styles.checkButton}
            >
              Check Owners
            </Button>

            {unitOwners.length > 0 && (
              <View style={styles.ownersContainer}>
                <Text variant="titleSmall" style={styles.ownersTitle}>
                  Previous Owners ({unitOwners.length})
                </Text>
                {unitOwners.map((owner, index) => (
                  <Card key={owner.id} style={styles.ownerCard}>
                    <Card.Content>
                      <View style={styles.ownerHeader}>
                        <Text variant="bodyMedium" style={styles.ownerName}>
                          {owner.name}
                        </Text>
                        <Chip mode="flat" compact>
                          Owner #{owner.ownerNo}
                        </Chip>
                      </View>
                      <Text variant="bodySmall" style={styles.ownerDetail}>
                        Phone: {owner.phoneNo || 'N/A'}
                      </Text>
                      <Text variant="bodySmall" style={styles.ownerDetail}>
                        Date: {owner.date ? new Date(owner.date).toLocaleDateString('en-IN') : 'N/A'}
                      </Text>
                      {owner.address && (
                        <Text variant="bodySmall" style={styles.ownerDetail}>
                          Address: {owner.address}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={[styles.card, { backgroundColor: '#EFF6FF' }]}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.instructionsTitle}>
              Transfer Process
            </Text>
            <Text variant="bodySmall" style={styles.instructionsText}>
              1. Verify customer has paid transfer charges{'\n'}
              2. Check previous owners of the unit{'\n'}
              3. Proceed to mark transfer charge as used{'\n'}
              4. Complete the transfer registration process
            </Text>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleProceedToTransfer}
            disabled={!transferChargeStatus?.hasTransferCharge || loading}
            loading={loading}
            style={styles.actionButton}
          >
            Proceed to Transfer
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
  statusCard: { marginTop: 12, elevation: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontWeight: '500' },
  checkButton: { marginTop: 12 },
  ownersContainer: { marginTop: 16 },
  ownersTitle: { fontWeight: 'bold', marginBottom: 8 },
  ownerCard: { marginBottom: 8, backgroundColor: '#F9FAFB' },
  ownerHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerName: { fontWeight: '600', flex: 1 },
  ownerDetail: { color: '#6B7280', marginBottom: 4 },
  instructionsTitle: { fontWeight: 'bold', marginBottom: 8 },
  instructionsText: { color: '#1E40AF', lineHeight: 20 },
  actions: { 
    flexDirection: 'row', 
    gap: 8,
    marginTop: 8,
  },
  actionButton: { flex: 1 },
});

export default TransferTransactionScreen;
