import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, Button, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchTransferById } from '../../../store/slices/unitTransfersSlice';

const UnitTransferDetailsScreen = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.unitTransfers);

  useEffect(() => {
    if (transactionId) {
      dispatch(fetchTransferById(transactionId));
    }
  }, [dispatch, transactionId]);

  if (loading || !current) return <LoadingIndicator />;

  const { transaction, customer, transfer_charge, unit, owner, broker, payment_details } = current;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Status Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Text variant="headlineSmall" style={styles.title}>Transfer Details</Text>
              <Chip 
                mode="flat"
                style={[styles.statusChip, { 
                  backgroundColor: transaction?.is_verified ? '#D1FAE5' : '#FEF3C7' 
                }]}
              >
                {transaction?.is_verified ? 'Verified' : 'Pending'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Transaction Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Transaction Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>{transaction?.id || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={[styles.value, styles.amount]}>
                ₹{parseFloat(transaction?.amount || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>
                {transaction?.date ? new Date(transaction.date).toLocaleDateString('en-IN') : 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Payment Mode:</Text>
              <Text style={styles.value}>{transaction?.mode || 'N/A'}</Text>
            </View>

            {transaction?.verified_at && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Verified At:</Text>
                <Text style={styles.value}>
                  {new Date(transaction.verified_at).toLocaleString('en-IN')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Customer Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{customer?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Application ID:</Text>
              <Text style={styles.value}>{customer?.manual_application_id || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{customer?.phone || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{customer?.email || 'N/A'}</Text>
            </View>

            {customer?.address && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{customer.address}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Unit Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Unit Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Unit Name:</Text>
              <Text style={styles.value}>{unit?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Project:</Text>
              <Text style={styles.value}>{unit?.project_name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Unit Size:</Text>
              <Text style={styles.value}>{unit?.unit_size || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Unit Price:</Text>
              <Text style={[styles.value, styles.amount]}>
                ₹{parseFloat(unit?.unit_price || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* New Owner Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>New Owner Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Owner Name:</Text>
              <Text style={styles.value}>{owner?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Owner Number:</Text>
              <Text style={styles.value}>{owner?.number || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{owner?.phone || 'N/A'}</Text>
            </View>

            {owner?.address && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{owner.address}</Text>
              </View>
            )}

            {broker?.name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Broker:</Text>
                <Text style={styles.value}>{broker.name}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Transfer Charge Details */}
        {transfer_charge && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Transfer Charge Details</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Transfer Date:</Text>
                <Text style={styles.value}>
                  {transfer_charge.transfer_date 
                    ? new Date(transfer_charge.transfer_date).toLocaleDateString('en-IN') 
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Transfer Charges:</Text>
                <Text style={[styles.value, styles.amount]}>
                  ₹{parseFloat(transfer_charge.transfer_charges || 0).toLocaleString('en-IN')}
                </Text>
              </View>

              {transfer_charge.remarks && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Remarks:</Text>
                  <Text style={styles.value}>{transfer_charge.remarks}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Payment Details */}
        {payment_details && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Payment Details</Text>
              
              {payment_details.type === 'online' ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>UTR Number:</Text>
                    <Text style={styles.value}>{payment_details.utr_no || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Payment Method:</Text>
                    <Text style={styles.value}>{payment_details.payment_method || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Payment Date:</Text>
                    <Text style={styles.value}>
                      {payment_details.payment_date 
                        ? new Date(payment_details.payment_date).toLocaleDateString('en-IN') 
                        : 'N/A'}
                    </Text>
                  </View>

                  {payment_details.bank_name && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Bank Name:</Text>
                      <Text style={styles.value}>{payment_details.bank_name}</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Cheque Number:</Text>
                    <Text style={styles.value}>{payment_details.cheque_no || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Bank Name:</Text>
                    <Text style={styles.value}>{payment_details.bank_name || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Cheque Date:</Text>
                    <Text style={styles.value}>
                      {payment_details.cheque_date 
                        ? new Date(payment_details.cheque_date).toLocaleDateString('en-IN') 
                        : 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{payment_details.status || 'N/A'}</Text>
                  </View>

                  {payment_details.drawn_on && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Drawn On:</Text>
                      <Text style={styles.value}>{payment_details.drawn_on}</Text>
                    </View>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          >
            Back to List
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
  statusHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  title: { fontWeight: 'bold' },
  statusChip: { marginLeft: 8 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 16 },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  label: { 
    color: '#6B7280', 
    flex: 1,
    fontWeight: '500',
  },
  value: { 
    flex: 1.5,
    textAlign: 'right',
  },
  amount: { fontWeight: 'bold', color: '#059669' },
  actions: { 
    flexDirection: 'row', 
    gap: 8,
    marginTop: 8,
  },
  actionButton: { flex: 1 },
});

export default UnitTransferDetailsScreen;
